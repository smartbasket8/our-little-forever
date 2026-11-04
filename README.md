# Our Little Forever ❤️

A cinematic, responsive love-story experience built with **Vite**, **Three.js**, and **GSAP**. The nine chapters use the supplied story text, with procedurally-created 3D characters and environments (no external 3D model files required).

## Requirements

- Node.js 20.19+ or 22.12+
- npm

## Run locally

```bash
npm install
npm run dev
```

Open the local URL printed by Vite (usually http://localhost:5173).

## Production build

```bash
npm run build
npm run preview
```

The production site is generated in `dist/`.

## Deploy to GitHub Pages

1. Create a new GitHub repository, for example `our-little-forever`.
2. In `vite.config.js`, set `base` to `'/our-little-forever/'` (the project repo name, including both slashes). For a user/organization site repository named `yourname.github.io`, use `'/'`.
3. Push this project to the repository's `main` branch:

   ```bash
   git init
   git add .
   git commit -m "Create Our Little Forever"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/our-little-forever.git
   git push -u origin main
   ```

4. Install dependencies and deploy:

   ```bash
   npm install
   npm run deploy
   ```

   This publishes the contents of `dist/` to the `gh-pages` branch.

5. In GitHub, open **Settings → Pages**. Set the deployment source to **Deploy from a branch**, choose `gh-pages` and `/ (root)`, then save.
6. Wait for GitHub Pages to finish publishing. Your site will be available at:

   `https://YOUR_USERNAME.github.io/our-little-forever/`

   If you change the repository name, update `base` in `vite.config.js` and redeploy.

## Personalize

- Edit the nine chapter titles, side notes, and story paragraphs in `src/story.js`.
- Change character colors and materials in `src/main.js` (`mats` and `palettes`).
- The 3D people are built from Three.js primitives in `makePerson()`. Adjust the proportions, clothing, hair, or add accessories there.
- The optional sound button creates a quiet synthesized ambient tone in the browser. It does not load or play a copyrighted song.

## Controls

- **Next chapter / Previous** buttons
- Click any of the nine progress dots to jump directly to a chapter
- Keyboard: **←** and **→**
- **Sound off/on** toggles a soft generated ambient tone
- The final chapter reveals the closing screen; choose **Relive our story** to replay

## Notes

- The visuals are real-time Three.js geometry and lights, not a static background image.
- The couple are stylized, procedural 3D characters rather than scans or imported detailed character models. You can replace `makePerson()` with GLTF models later if you have custom `.glb` assets.
- Google Fonts are loaded from Google Fonts; the browser falls back to system sans-serif and serif fonts if unavailable.
