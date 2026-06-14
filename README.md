# Ojasva Gupta Portfolio

Static portfolio website built from `assets/OjasvaGupta_RESUME.pdf`.

## Files

- `index.html` - page structure and portfolio content
- `styles.css` - responsive dark portfolio styling
- `script.js` - mobile navigation, scroll reveal, 3D visuals, and contact mailto
- `assets/OjasvaGupta_RESUME.pdf` - downloadable resume
- `assets/favicon.svg` - browser icon

## Run locally

From this folder:

```bash
python3 -m http.server 5500
```

Open `http://localhost:5500`.

## Publish on GitHub Pages

1. Create a public GitHub repository for the portfolio.
2. Upload these files to the repository root or push this folder with Git.
3. In GitHub, enable Pages from the `main` branch root if it is not enabled automatically.
4. The site will be available at the GitHub Pages link for that repository.

## Public hosting note

The webpage shows email, LinkedIn, GitHub, and resume download links. The phone
number is not printed directly on the page, which is safer for a public site,
but it remains inside the downloadable resume PDF.
