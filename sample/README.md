# South Cotabato Convergence Data Bank

A government transparency portal for tracking vulnerable communities and CATCH-UP project implementation in South Cotabato Province.

## Project Structure

```
capstone-preview/
├── admin/                  # Admin interface pages
│   ├── index.html         # Admin dashboard
│   ├── login.html         # Admin login
│   ├── sitio-list.html    # Sitio management list
│   ├── sitio-form.html    # Add/Edit sitio
│   ├── project-list.html  # Project management list
│   ├── project-form.html  # Add/Edit project
│   ├── import.html        # Bulk data import
│   └── users.html         # User management
│
├── public/                 # Public-facing pages
│   ├── index.html         # Public landing/dashboard
│   ├── map.html           # Interactive map view
│   ├── projects.html      # Project directory
│   ├── project-detail.html# Project details
│   ├── analytics.html     # Data visualizations
│   └── sitio-detail.html  # Sitio profile
│
├── assets/
│   ├── css/               # Stylesheets
│   │   ├── variables.css  # CSS custom properties
│   │   ├── base.css       # Base styles
│   │   ├── components.css # Component styles
│   │   ├── utilities.css  # Utility classes
│   │   ├── admin.css      # Admin-specific styles
│   │   └── public.css     # Public-specific styles
│   │
│   ├── js/                # JavaScript files
│   │   ├── main.js        # Core utilities
│   │   ├── icons.js       # Lucide icon init
│   │   ├── map.js         # Map functionality
│   │   ├── charts.js      # Chart rendering
│   │   ├── filters.js     # Filter/search logic
│   │   └── mock-data.js   # Sample data
│   │
│   └── images/            # Image assets
│       ├── logo.svg
│       └── placeholders/
│
├── components/             # HTML snippets (reference)
└── docs/                   # Documentation
    └── Project Overview.pdf
```

## Features

- **Admin Interface**: Data entry, sitio/project management, bulk import, user management
- **Public Interface**: Transparent project tracking, interactive maps, data visualizations
- **Interactive Map**: Leaflet.js-powered map with 200+ sitio markers
- **Data Visualizations**: Chart.js charts for demographics and project analytics
- **Responsive Design**: Mobile-first, government-themed design using shadcn-ui patterns

### Project Monitoring Tracker

- **Expanded Table Layout**: `admin/project-list.html` now mirrors the official 20% LDF monitoring form with grouped headers for financials, physical status, employment, contract timeline, status remarks, and catch-up plans.
- **Structured Monitoring Data**: Each project entry in `assets/js/mock-data.js` carries a `monitoring` object (fund source, allotment, expenditure, physical progress, employment, contract details, status summary, catch-up plan) so the tracker stays consistent with quarterly reports.
- **Status Enhancements**: Added the `suspended` workflow state, matching badge styles and filters across admin pages, including the dashboard status breakdown.
- **Horizontal Scrolling Support**: Wide monitoring tables remain readable on smaller screens through responsive `table-container` updates.
- **Sample Entries**: The tracker is pre-populated with Sitio Bangkalang, Sitio Paraiso, and Bukay Pal projects from the supplied document to demonstrate real-world encoding.
- **Compact Admin Grid**: `admin/project-list.html` now surfaces only high-level financial, progress, and status cues so staff can scan quickly, while the full monitoring breakdown lives on each project's detail page (`public/project-detail.html`).

## Technology Stack

- **Vanilla HTML/CSS/JavaScript**: No frameworks
- **Lucide Icons**: Icon library
- **Leaflet.js**: Interactive maps
- **Chart.js**: Data visualizations
- **shadcn-ui Design System**: Component patterns adapted for vanilla HTML
- **Government Blue Theme**: Professional, accessible color scheme

## Getting Started

Simply open any HTML file in a web browser. No build process or server required for this prototype.

### Admin Interface

Start at: `admin/login.html`

### Public Interface

Start at: `public/index.html`

## Data

All data is mocked in `assets/js/mock-data.js` for demonstration purposes. No backend required.
