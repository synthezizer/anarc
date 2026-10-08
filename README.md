# anarc.cc

Personal site. Astro (static) on Cloudflare Pages, edited in the browser at `/admin`.

## Editing without deploying

Go to **anarc.cc/admin**, sign in, change things, hit **Save**. The editor commits to
GitHub and Cloudflare rebuilds the site automatically. It's live in about 1–2 minutes.

What you can edit there:

| Section | What it changes |
|---|---|
| **Updates** | Status posts in the home feed |
| **Projects** | Work tab, projects panel (status: shipped / working / archived), featured panel, redirect links |
| **Beats** | The VAULT player: upload MP3s, set titles, order, cover art |
| **Profile** | Name, aliases, status quote, mood, location, about text, banner, Spotify, contact links |

Notes:
- Upload **MP3s, not WAVs**: Cloudflare rejects any file over 25 MB. Keep masters in `masters/` (not uploaded).
- Banners look best at **5:2, at least 1500×600**.

## One-time setup

1. **GitHub:** create an empty repo (e.g. `anarc`), then from this folder:
   ```bash
   git remote add origin https://github.com/synthezizer/anarc.git
   ```
   ```bash
   git push -u origin main
   ```
2. **Editor:** in `public/admin/config.yml`, set `repo: synthezizer/anarc`, commit, and push.
3. **Cloudflare Pages:** Workers & Pages → Create → Pages → Connect to Git → pick the repo.
   - Framework preset: **Astro**
   - Build command: `npm run build`
   - Build output directory: `dist`
   - Environment variable: `NODE_VERSION` = `22`
4. **Domain:** in the Pages project → Custom domains → add `anarc.cc`.
5. **Signing in to /admin:** choose **Sign In Using Access Token** and paste a GitHub
   fine-grained personal access token with **Contents: Read and write** on this repo only.
   (Or use **Work with Local Repository** in Chrome/Edge to edit the local folder directly.)

## Local development

```bash
npm install
```
```bash
npm run dev
```
Site at http://localhost:4321, editor at http://localhost:4321/admin/index.html.
