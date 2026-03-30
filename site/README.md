# Repotype Site

Simple static site assets for lightweight hosting (for example GitHub Pages).

## Local Preview

```bash
cd packages/repotype/site
python3 -m http.server 4173
```

Open `http://localhost:4173`.

## GitHub Pages

`.github/workflows/ci.yml` deploys Pages automatically on `push` to `main`.

It publishes this directory directly:

- `packages/repotype/site`

Repository setting to use:

- GitHub Pages source: `GitHub Actions`
