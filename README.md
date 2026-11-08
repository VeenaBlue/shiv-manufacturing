# Shiv Manufacturing — React + Vite website

A responsive, frontend-only company website inspired by the supplied manufacturer profile reference. It includes a product catalogue with search and category filters, company/about sections, benefits, and an enquiry form.

## Run locally

```bash
npm install
npm run dev
```

Build for production:

```bash
npm run build
npm run preview
```

## Before publishing

Open `src/main.jsx` and update the `COMPANY` object near the top with the real phone number, email address, business address, and working hours. The enquiry form uses the visitor's email application (`mailto:`); it does not store or send enquiries to a server. For automatic enquiry delivery, connect a form service or backend later.

The catalogue is prefilled with the product groups and sample specifications visible in the supplied reference: exhaust fan blades, motor brackets, cooler motors, fan blades, cooler bodies, cooler leg sets, and cooler pumps. Edit the `products` array in `src/main.jsx` to add/remove products, change specifications, or update images. Product illustrations are local SVG assets in `public/products/` and can be replaced with actual product photographs.

## Deploy

Run `npm run build` and deploy the generated `dist/` folder to Netlify, Vercel, GitHub Pages, or any static hosting provider. No backend is required for the website itself.
