// Patient detail view with charts
class PatientDetailView {
    constructor(api) {
        this.api = api;
        this.charts = {};
    }

    async load(patientCode) {
        const loadingEl = document.getElementById('patient-detail-loading');
        const errorEl = document.getElementById('patient-detail-error');
        const contentEl = document.getElementById('patient-detail-content');
        const patientCodeEl = document.getElementById('patient-detail-code');

        if (patientCodeEl) {
            patientCodeEl.textContent = patientCode;
        }

        if (loadingEl) loadingEl.style.display = 'block';
        if (errorEl) errorEl.style.display = 'none';
        if (contentEl) contentEl.style.display = 'none';

        try {
            const data = await this.api.getPatientDetail(patientCode);

            if (loadingEl) loadingEl.style.display = 'none';
            if (errorEl) errorEl.style.display = 'none';
            if (contentEl) contentEl.style.display = 'block';

            if (data.status === 'ok') {
                this.renderCharts(data);
            } else {
                this.showError('Failed to load patient data: ' + (data.detail || 'Unknown error'));
            }
        } catch (error) {
            if (loadingEl) loadingEl.style.display = 'none';
            this.showError('Error loading patient data: ' + error.message);
            console.error('Full error:', error);
        }
    }

    renderCharts(data) {
        // Destroy existing charts
        Object.values(this.charts).forEach(chart => {
            if (chart) chart.destroy();
        });
        this.charts = {};

        // LARS Score Chart
        if (data.lars_scores && data.lars_scores.length > 0) {
            this.renderLarsChart(data.lars_scores);
        }

        // EQ-5D-5L Chart
        if (data.eq5d5l_scores && data.eq5d5l_scores.length > 0) {
            this.renderEq5d5lChart(data.eq5d5l_scores);
        }

        // Combined charts showing relationships
        if (data.lars_scores && data.daily_entries && data.lars_scores.length > 0 && data.daily_entries.length > 0) {
            this.renderLarsFoodChart(data.lars_scores, data.daily_entries);
            this.renderLarsSymptomsChart(data.lars_scores, data.daily_entries);
        }

        // Food Consumption Chart
        if (data.daily_entries && data.daily_entries.length > 0) {
            this.renderFoodChart(data.daily_entries);
        }

        // Drink Consumption Chart
        if (data.daily_entries && data.daily_entries.length > 0) {
            this.renderDrinkChart(data.daily_entries);
        }
    }

    renderLarsChart(data) {
        const ctx = document.getElementById('lars-chart');
        if (!ctx) return;

        const labels = data.map(d => this.formatDateShort(d.date));
        const scores = data.map(d => d.score);

        this.charts.lars = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'LARS Score',
                    data: scores,
                    borderColor: '#667eea',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 5,
                    pointHoverRadius: 7,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        labels: {
                            color: 'rgba(255, 255, 255, 0.9)',
                            font: { size: 14 }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 42,
                        ticks: {
                            color: 'rgba(255, 255, 255, 0.7)'
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        }
                    },
                    x: {
                        ticks: {
                            color: 'rgba(255, 255, 255, 0.7)'
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        }
                    }
                }
            }
        });
    }

    renderEq5d5lChart(data) {
        const ctx = document.getElementById('eq5d5l-chart');
        if (!ctx) return;

        const labels = data.map(d => this.formatDateShort(d.date));
        const scores = data.map(d => d.score);

        this.charts.eq5d5l = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'EQ-5D-5L Health VAS',
                    data: scores,
                    borderColor: '#f093fb',
                    backgroundColor: 'rgba(240, 147, 251, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 5,
                    pointHoverRadius: 7,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        labels: {
                            color: 'rgba(255, 255, 255, 0.9)',
                            font: { size: 14 }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                            color: 'rgba(255, 255, 255, 0.7)'
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        }
                    },
                    x: {
                        ticks: {
                            color: 'rgba(255, 255, 255, 0.7)'
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        }
                    }
                }
            }
        });
    }

    renderFoodChart(data) {
        const ctx = document.getElementById('food-chart');
        if (!ctx) return;

        // Aggregate food consumption by date
        const labels = data.map(d => this.formatDateShort(d.date));
        const vegetables = data.map(d => d.food.vegetables_all);
        const fruits = data.map(d => d.food.fruits_with_skin + d.food.berries);
        const grains = data.map(d => d.food.whole_grains + d.food.whole_grain_bread);

        this.charts.food = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Vegetables',
                        data: vegetables,
                        backgroundColor: 'rgba(76, 175, 80, 0.6)',
                        borderColor: '#4caf50',
                        borderWidth: 1
                    },
                    {
                        label: 'Fruits',
                        data: fruits,
                        backgroundColor: 'rgba(255, 152, 0, 0.6)',
                        borderColor: '#ff9800',
                        borderWidth: 1
                    },
                    {
                        label: 'Grains',
                        data: grains,
                        backgroundColor: 'rgba(156, 39, 176, 0.6)',
                        borderColor: '#9c27b0',
                        borderWidth: 1
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        labels: {
                            color: 'rgba(255, 255, 255, 0.9)',
                            font: { size: 14 }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            color: 'rgba(255, 255, 255, 0.7)'
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        }
                    },
                    x: {
                        ticks: {
                            color: 'rgba(255, 255, 255, 0.7)'
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        }
                    }
                }
            }
        });
    }

    renderDrinkChart(data) {
        const ctx = document.getElementById('drink-chart');
        if (!ctx) return;

        const labels = data.map(d => this.formatDateShort(d.date));
        const water = data.map(d => d.drink.water);
        const coffee = data.map(d => d.drink.coffee);
        const tea = data.map(d => d.drink.tea);

        this.charts.drink = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Water',
                        data: water,
                        backgroundColor: 'rgba(33, 150, 243, 0.6)',
                        borderColor: '#2196f3',
                        borderWidth: 1
                    },
                    {
                        label: 'Coffee',
                        data: coffee,
                        backgroundColor: 'rgba(121, 85, 72, 0.6)',
                        borderColor: '#795548',
                        borderWidth: 1
                    },
                    {
                        label: 'Tea',
                        data: tea,
                        backgroundColor: 'rgba(76, 175, 80, 0.6)',
                        borderColor: '#4caf50',
                        borderWidth: 1
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        labels: {
                            color: 'rgba(255, 255, 255, 0.9)',
                            font: { size: 14 }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            color: 'rgba(255, 255, 255, 0.7)'
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        }
                    },
                    x: {
                        ticks: {
                            color: 'rgba(255, 255, 255, 0.7)'
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        }
                    }
                }
            }
        });
    }

    renderDailyMetricsChart(data) {
        const ctx = document.getElementById('daily-metrics-chart');
        if (!ctx) return;

        const labels = data.map(d => this.formatDateShort(d.date));
        const stoolCount = data.map(d => d.stool_count);
        const bloating = data.map(d => d.bloating);
        const impactScore = data.map(d => d.impact_score);

        this.charts.dailyMetrics = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Stool Count',
                        data: stoolCount,
                        borderColor: '#ff9800',
                        backgroundColor: 'rgba(255, 152, 0, 0.1)',
                        borderWidth: 2,
                        yAxisID: 'y',
                    },
                    {
                        label: 'Bloating',
                        data: bloating,
                        borderColor: '#9c27b0',
                        backgroundColor: 'rgba(156, 39, 176, 0.1)',
                        borderWidth: 2,
                        yAxisID: 'y1',
                    },
                    {
                        label: 'Impact Score',
                        data: impactScore,
                        borderColor: '#f44336',
                        backgroundColor: 'rgba(244, 67, 54, 0.1)',
                        borderWidth: 2,
                        yAxisID: 'y1',
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    mode: 'index',
                    intersect: false,
                },
                plugins: {
                    legend: {
                        display: true,
                        labels: {
                            color: 'rgba(255, 255, 255, 0.9)',
                            font: { size: 14 }
                        }
                    }
                },
                scales: {
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        beginAtZero: true,
                        ticks: {
                            color: 'rgba(255, 255, 255, 0.7)'
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        }
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        beginAtZero: true,
                        ticks: {
                            color: 'rgba(255, 255, 255, 0.7)'
                        },
                        grid: {
                            drawOnChartArea: false,
                        },
                    },
                    x: {
                        ticks: {
                            color: 'rgba(255, 255, 255, 0.7)'
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        }
                    }
                }
            }
        });
    }

    renderLarsFoodChart(larsData, dailyData) {
        const ctx = document.getElementById('lars-food-chart');
        if (!ctx) return;

        // Create sorted LARS entries with timestamps
        const larsEntries = larsData
            .map(d => ({
                date: d.date ? d.date.split('T')[0] : null,
                timestamp: d.date ? new Date(d.date).getTime() : null,
                score: d.score
            }))
            .filter(d => d.date && d.timestamp)
            .sort((a, b) => a.timestamp - b.timestamp);

        // Helper function to find nearest LARS score for a given date
        const findNearestLarsScore = (targetDate) => {
            const targetTimestamp = new Date(targetDate).getTime();
            
            // Find the most recent LARS score that is <= target date
            let nearestScore = null;
            let nearestTimestamp = null;
            
            for (const larsEntry of larsEntries) {
                if (larsEntry.timestamp <= targetTimestamp) {
                    if (!nearestTimestamp || larsEntry.timestamp > nearestTimestamp) {
                        nearestScore = larsEntry.score;
                        nearestTimestamp = larsEntry.timestamp;
                    }
                }
            }
            
            return nearestScore;
        };

        // Aggregate food consumption by date and match with nearest LARS
        const combinedData = [];
        dailyData.forEach(d => {
            const dateKey = d.date ? d.date.split('T')[0] : null;
            if (dateKey) {
                const totalFood = Object.values(d.food || {}).reduce((sum, val) => sum + (val || 0), 0);
                const larsScore = findNearestLarsScore(dateKey);
                if (larsScore !== null) {
                    combinedData.push({
                        date: dateKey,
                        lars: larsScore,
                        food: totalFood
                    });
                }
            }
        });

        if (combinedData.length === 0) return;

        const labels = combinedData.map(d => this.formatDateShort(d.date));
        const larsScores = combinedData.map(d => d.lars);
        const foodValues = combinedData.map(d => d.food);

        this.charts.larsFood = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'LARS Score',
                        data: larsScores,
                        borderColor: '#667eea',
                        backgroundColor: 'rgba(102, 126, 234, 0.1)',
                        borderWidth: 3,
                        fill: false,
                        tension: 0.4,
                        yAxisID: 'y',
                    },
                    {
                        label: 'Total Food Consumption',
                        data: foodValues,
                        borderColor: '#4ade80',
                        backgroundColor: 'rgba(74, 222, 128, 0.1)',
                        borderWidth: 2,
                        fill: false,
                        tension: 0.4,
                        yAxisID: 'y1',
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    mode: 'index',
                    intersect: false,
                },
                plugins: {
                    legend: {
                        display: true,
                        labels: {
                            color: 'rgba(255, 255, 255, 0.9)',
                            font: { size: 14 }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                let label = context.dataset.label || '';
                                if (label) {
                                    label += ': ';
                                }
                                label += context.parsed.y;
                                return label;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        beginAtZero: true,
                        max: 42,
                        title: {
                            display: true,
                            text: 'LARS Score',
                            color: 'rgba(255, 255, 255, 0.9)'
                        },
                        ticks: {
                            color: 'rgba(255, 255, 255, 0.7)'
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        }
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Food Consumption',
                            color: 'rgba(255, 255, 255, 0.9)'
                        },
                        ticks: {
                            color: 'rgba(255, 255, 255, 0.7)'
                        },
                        grid: {
                            drawOnChartArea: false,
                        },
                    },
                    x: {
                        ticks: {
                            color: 'rgba(255, 255, 255, 0.7)'
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        }
                    }
                }
            }
        });
    }

    renderLarsSymptomsChart(larsData, dailyData) {
        const ctx = document.getElementById('lars-symptoms-chart');
        if (!ctx) return;

        // Create sorted LARS entries with timestamps
        const larsEntries = larsData
            .map(d => ({
                date: d.date ? d.date.split('T')[0] : null,
                timestamp: d.date ? new Date(d.date).getTime() : null,
                score: d.score
            }))
            .filter(d => d.date && d.timestamp)
            .sort((a, b) => a.timestamp - b.timestamp);

        // Helper function to find nearest LARS score for a given date
        const findNearestLarsScore = (targetDate) => {
            const targetTimestamp = new Date(targetDate).getTime();
            
            // Find the most recent LARS score that is <= target date
            let nearestScore = null;
            let nearestTimestamp = null;
            
            for (const larsEntry of larsEntries) {
                if (larsEntry.timestamp <= targetTimestamp) {
                    if (!nearestTimestamp || larsEntry.timestamp > nearestTimestamp) {
                        nearestScore = larsEntry.score;
                        nearestTimestamp = larsEntry.timestamp;
                    }
                }
            }
            
            return nearestScore;
        };

        // Match daily symptoms with nearest LARS
        const combinedData = [];
        dailyData.forEach(d => {
            const dateKey = d.date ? d.date.split('T')[0] : null;
            if (dateKey) {
                const larsScore = findNearestLarsScore(dateKey);
                if (larsScore !== null) {
                    combinedData.push({
                        date: dateKey,
                        lars: larsScore,
                        bloating: d.bloating || 0,
                        impactScore: d.impact_score || 0,
                        stoolCount: d.stool_count || 0
                    });
                }
            }
        });

        if (combinedData.length === 0) return;

        const labels = combinedData.map(d => this.formatDateShort(d.date));
        const larsScores = combinedData.map(d => d.lars);
        const bloating = combinedData.map(d => d.bloating);
        const impactScores = combinedData.map(d => d.impactScore);

        this.charts.larsSymptoms = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'LARS Score',
                        data: larsScores,
                        borderColor: '#667eea',
                        backgroundColor: 'rgba(102, 126, 234, 0.1)',
                        borderWidth: 3,
                        fill: false,
                        tension: 0.4,
                        yAxisID: 'y',
                    },
                    {
                        label: 'Bloating',
                        data: bloating,
                        borderColor: '#fbbf24',
                        backgroundColor: 'rgba(251, 191, 36, 0.1)',
                        borderWidth: 2,
                        fill: false,
                        tension: 0.4,
                        yAxisID: 'y1',
                    },
                    {
                        label: 'Impact Score',
                        data: impactScores,
                        borderColor: '#f87171',
                        backgroundColor: 'rgba(248, 113, 113, 0.1)',
                        borderWidth: 2,
                        fill: false,
                        tension: 0.4,
                        yAxisID: 'y1',
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    mode: 'index',
                    intersect: false,
                },
                plugins: {
                    legend: {
                        display: true,
                        labels: {
                            color: 'rgba(255, 255, 255, 0.9)',
                            font: { size: 14 }
                        }
                    }
                },
                scales: {
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        beginAtZero: true,
                        max: 42,
                        title: {
                            display: true,
                            text: 'LARS Score',
                            color: 'rgba(255, 255, 255, 0.9)'
                        },
                        ticks: {
                            color: 'rgba(255, 255, 255, 0.7)'
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        }
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        beginAtZero: true,
                        max: 10,
                        title: {
                            display: true,
                            text: 'Symptoms (0-10)',
                            color: 'rgba(255, 255, 255, 0.9)'
                        },
                        ticks: {
                            color: 'rgba(255, 255, 255, 0.7)'
                        },
                        grid: {
                            drawOnChartArea: false,
                        },
                    },
                    x: {
                        ticks: {
                            color: 'rgba(255, 255, 255, 0.7)'
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        }
                    }
                }
            }
        });
    }

    showError(message) {
        const errorEl = document.getElementById('patient-detail-error');
        if (errorEl) {
            errorEl.textContent = message;
            errorEl.style.display = 'block';
        }
    }

    formatDateShort(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
}

// PatientDetailView will be initialized by App when needed

