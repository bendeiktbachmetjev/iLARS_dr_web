# LARS Doctor Web Interface

Web interface for doctors to view patient information and analytics.

## Features

- Patient list with LARS and EQ-5D-5L scores
- Patient detail view with interactive charts
- Real-time data visualization
- Modern Apple-style UI with Liquid Glass effects
- Skeleton loader for smooth loading experience

## Live Deployment

**Production URL:** https://ilarsdrweb-production.up.railway.app

## Local Development

Simply open `index.html` in a browser or use a local server:

```bash
python server.py
```

The server will run on `http://localhost:8000`

## Railway Deployment

This project is configured for Railway deployment. The `server.py` file serves the static files.

**Deployment Configuration:**
- Port: 8000 (or Railway's PORT environment variable)
- Start Command: `python server.py`

## API Configuration

The API endpoint is configured in `js/api.js`. The backend is deployed at:
- **Backend URL:** https://larsbackend-production.up.railway.app

To update the API URL, edit `js/api.js` and change the `baseUrl` in the `ApiService` class.

