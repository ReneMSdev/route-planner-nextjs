# Live Deployment with Vercel
https://route-planner-nextjs.vercel.app

# Route Boss

**Route Boss** is a modern route planning web app built with Next.js 13 App Router and React 19. It is styled using Tailwind CSS and shadcn/ui. It lets users input delivery or travel destinations, optimize routes, visualize them on a map, and export them for use in the real world. 

## Features

Two Input Modes:
* Line-by-line manual address entry
* File impor via .csv, .xls, or .xlsx

Real-timme GeoLocation:
* Uses OpenCage Data for address-to-coordinates geocoding

Route Optimization:
* Leverages OpenRouteService to calculate the most efficient path

Interactive Mapping
* Uses Leaflet.js for map visualization
* Markers labeled form **A to Z**
* Optimized route is displayed as a polyline over roads

Export Options:
* Download a **PDF summary** with addresses in optimized order
* Generate and scan a **QR code** to open the route in Goolgle Mpaps on a mobile phone

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

