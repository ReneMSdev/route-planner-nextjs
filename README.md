# Route Boss

**Route Boss** is a modern route planning web app built with Next.js 13 App Router and React 19. It is styled using Tailwind CSS and shadcn/ui. It lets users input delivery or travel destinations, optimize routes, visualize them on a map, and export them for use in the real world. 

## 🌐 Live Deployment with Vercel
https://route-planner-nextjs.vercel.app

## 💡 Features

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

## 📝 Tech Stack

| Layer        | Technology     |
| ------------- |:-------------:|
| Frontend     | Next.js 13 / App Router |
| Styling    | Tailwind CSS + shadcn/ui      |
|  Map Rendering | Leaflet.js     |
|  Geocoding | OpenCage Data   |
|  Routing API | OpenRouteService    |
|  File Handling | react-dropzone, xlsx, papaparse   |
|  PDF Generation | jsPDF, html2canvas     |
|  QR Code | next-qrcode   |

## ⚖️ Folder Structure
```bash
src
├── app                  # Next.js App Router structure
├── components           # Reusable UI and app logic
│   ├── AddressForm      # Line-by-line entry UI
│   ├── ImportForm       # Drag-and-drop + file import
│   ├── MapDisplay       # Leaflet map wrapper
│   ├── ExportModal      # PDF/QR export modal
│   └── ui               # shadcn/ui components
├── utils                # Geocoding, route logic, PDF & QR helpers
├── lib                  # General utility functions
```

## ⚙️ Getting Started

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

