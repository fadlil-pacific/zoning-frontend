# Zoning & Spatial Planning (React + Material UI)

A front-end web app that helps urban planners and community members understand **zoning** (residential, commercial, industrial), visualize **land-use overlays**, and receive **recommendations** (e.g., new schools or parks).  
Built with **React + Material UI**. The map uses **Leaflet** by default (MapLibre optional). Backend integration is via an `axios` service layer with optional mock data.

---

## ✨ Features
- **Control Panel**: choose study area mode & radius, then **Run Analysis**.
- **Map View**: render GeoJSON overlays by land-use kind.
- **Recommendations Panel**: show suggested facilities with reasons.
- **Explanation Chat**: ask questions (e.g., “Why suggest new school here?”) linked to the current analysis.
- **API-ready architecture** + easy **mock mode** for local development.

---

## 🧱 Tech Stack
- React (Vite)
- Material UI (`@mui/material`)
- Axios
- Leaflet + React-Leaflet *(default map)*  
  *Optional: MapLibre GL + `react-map-gl`*

---

## 🚀 Getting Started
```bash
# 1) Install dependencies
npm install

# 2) Create .env in the project root
# Backend API base URL
VITE_API_BASE_URL=http://localhost:8000/api

# Use mock data while developing (true/false)
VITE_USE_MOCK=true

# Set VITE_USE_MOCK=false when backend is ready

# 3) Run in development mode
npm run dev

# 4) Build for production
npm run build

# 5) Preview production build
npm run preview
