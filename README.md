# Portfolio — PS2 Edition

## Deploy to GitHub Pages (free, permanent)

1. **Create a GitHub account** at github.com if you don't have one.

2. **Create a new repo** named exactly: `yourusername.github.io`
   (replace `yourusername` with your GitHub username — this gives you a clean URL)

3. **Push these files:**
   ```bash
   cd portfolio
   git init
   git add .
   git commit -m "init portfolio"
   git branch -M main
   git remote add origin https://github.com/mrqwex10/mrqwex10.github.io.git
   git push -u origin main
   ```

4. **Enable GitHub Pages:**
   - Go to your repo → Settings → Pages
   - Source: Deploy from branch → main → / (root)
   - Click Save

5. **Your site is live** at `https://yourusername.github.io` within ~2 minutes.

---

## Customise

All `<!-- EDIT: ... -->` comments in `index.html` mark things to update:

| What | Where |
|------|-------|
| Your name | `<h1 class="hero-name glitch" data-text="YOUR NAME">YOUR NAME</h1>` |
| Your titles | `titles` array in `script.js` |
| About text | `#about` section |
| Stats numbers | `data-target` attributes |
| Skills | `.skill-card` blocks |
| Projects | `.proj-card` blocks |
| Contact links | `#contact` section |
| Footer name | `<p class="footer-name">` |
