<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Deployment (read before any Vercel/production change)

This repo is the **customer website** (`stllhaus.co`). The staff **POS** lives in **`shaygail/stllhaus-pos`** → Vercel project **`stllhaus-pos`**.

Never link `stllhaus-pos` to the Vercel project named **`stllhaus`**. Full mapping and commands: **`DEPLOYMENT.md`**.

`npm run build` runs `scripts/assert-customer-site.mjs` to block POS-only layouts from shipping from this repo.
