# Repotype Site

Simple static site assets for lightweight hosting (for example GitHub Pages).

## Local Preview

```bash
cd packages/repotype/site
python3 -m http.server 4173
```

Open `http://localhost:4173`.

## GitHub Pages

`repotype.yml` deploys Pages automatically on `push` to `main`, using `.repotype/publish`.

If you need manual publishing instead, publish `.repotype/publish` as the Pages artifact content.

## Evidence Bundle

CI now prepares a publish-ready bundle in `.repotype/publish` with:

- static site files from `packages/repotype/site`
- generated compliance evidence in `.repotype/publish/reports`

Use this bundle as the source for Pages or any static host.
