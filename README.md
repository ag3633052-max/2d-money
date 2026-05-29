# LeyDownlines

A minimal React + Vite app for the LeyDownlines MLM/RPG simulator.

## Run locally

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the app:
   ```bash
   npm start
   ```
3. Open the URL shown by Vite in your browser, usually `http://127.0.0.1:5173/`.

## Deploying to Vercel

1. Push your repository to GitHub (this project is ready on the `main` branch).
2. In Vercel (https://vercel.com), click "New Project" → "Import Git Repository" and select this repo.
3. Use the default settings — Vercel will run `npm run build` and publish the `dist` folder (configured via `vercel.json`).

Alternatively, deploy from the CLI:

```bash
# install vercel CLI if needed
npm install -g vercel

# from repo root
vercel --prod
```

The app is a static SPA; `vercel.json` rewrites all routes to `index.html` so client-side routing works.

