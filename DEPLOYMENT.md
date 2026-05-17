# Deployment — customer site vs POS

**Do not mix these.** Wrong wiring is what caused `stllhaus.co` to show the POS app.

| Domain | Vercel project | GitHub repo | Purpose |
|--------|----------------|-------------|---------|
| `stllhaus.co`, `www.stllhaus.co` | **stllhaus** | **shaygail/stllhaus** (this repo) | Public menu, checkout, account |
| `stllhaus-pos-*.vercel.app` (or `pos.stllhaus.co` if you add it) | **stllhaus-pos** | **shaygail/stllhaus-pos** | Staff POS only |

## Before every production deploy

1. Confirm Vercel → **stllhaus** project → **Settings → Git** → connected to **`shaygail/stllhaus`**, not `stllhaus-pos`.
2. Run locally: `npm run build` (runs `assert-customer-site` first).
3. Production env on **stllhaus** project should include `NEXT_PUBLIC_APP_URL=https://www.stllhaus.co`.

## Deploy customer site

```bash
cd /path/to/stllhaus   # this repo
npx vercel link --project stllhaus
npx vercel --prod
```

Or push to `main` if Git integration is enabled on the **stllhaus** Vercel project.

## Deploy POS (never on stllhaus.co)

```bash
cd /path/to/stllhaus-pos
npx vercel link --project stllhaus-pos
npx vercel --prod
```

## Automated guard

- `scripts/assert-customer-site.mjs` runs on `npm run build` via `prebuild`.
- GitHub Actions runs the same check on pushes/PRs to `main`.

If the POS repo is linked to the **stllhaus** Vercel project, the site will break again — fix the Git connection in the Vercel dashboard, not in this codebase.
