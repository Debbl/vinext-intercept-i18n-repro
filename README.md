# vinext: intercepting route 404s when the source page is reached through a proxy rewrite

Minimal reproduction for vinext 1.0.0. An intercepting route (`@modal/(.)items/[id]`) does not open when the page the client navigates **from** is served through a `proxy.ts` rewrite. This is the usual i18n setup where the default locale is unprefixed: `/items` is rewritten to `/en/items`.

The RSC request for the soft navigation returns 404, and the client falls back to a full page load of the target. Next.js 16 opens the modal in the same setup.

## Versions

- vinext 1.0.0
- vite 8.3.0, @vitejs/plugin-rsc 0.5.35, @vitejs/plugin-react 6.1.1
- react / react-dom / react-server-dom-webpack 19.3.0
- Node 24, `vite dev`. No Cloudflare plugin is involved.

## Setup

```text
proxy.ts                               rewrites /items -> /en/items (default locale is unprefixed)
app/[locale]/layout.tsx                renders {children} and {modal}
app/[locale]/items/page.tsx            list page with <Link href="/items/1">
app/[locale]/items/[id]/page.tsx       full page:  <h1 id="full-page">
app/[locale]/@modal/default.tsx        null
app/[locale]/@modal/(.)items/[id]/page.tsx   modal: <dialog id="modal" open>
app/[locale]/@modal/(.)items/[id]/close-button.tsx   router.back()
```

## Steps

```bash
pnpm install
pnpm dev          # http://localhost:3200
```

1. Open `http://localhost:3200/items` and wait for hydration.
2. Click **Open item 1**.

## Expected

The URL becomes `/items/1` through a soft navigation, the modal renders over the still-mounted list, and the RSC request returns 200.

## Actual

The page reloads fully and renders the full `/items/1` page with no modal. The dev server logs:

```text
GET /items/1?_rsc=VN8D6clwxUMsAvp8 404 in 4ms
GET /items/1 200 in 12ms
```

## Which navigations fail

Only the source page (the interception context) matters. The target is rewritten in every case below.

| Navigate from | Source rewritten by the proxy | Link target | Result |
| ------------- | ----------------------------- | ----------- | ------ |
| `/items`      | yes (`/en/items`)             | `/items/1`  | 404, full page load |
| `/en/items`   | no                            | `/items/1`  | modal opens |
| `/zh/items`   | no                            | `/zh/items/1` | modal opens |

## Cause

The client sends the public pathname it navigated from as `x-vinext-interception-context`, here `/items`. In `dist/server/app-rsc-handler.js`, vinext then does this:

1. It matches the intercepting route against the **raw** context. `/items` matches the `app/[locale]` page itself with `{ locale: "items" }`. This is `matchInterceptRoute(preActionRoutePathname, interceptionContextHeader, …)`.
2. It runs the proxy for that source pathname, which rewrites `/items` to `/en/items`.
3. It checks that the rewritten source matches the same route with the same params as step 1. `/en/items` matches `app/[locale]/items` with `{ locale: "en" }`, so `rewrittenSourceMatch?.route !== interceptionSourceMatch.route` is true and it returns `notFoundResponse()`.

So a source that the proxy rewrites to a different route can never pass step 3, because step 1 matched it before the rewrite.

## Possible fix

Resolve the interception source through the proxy **before** matching the intercepting route, and match against the rewritten source pathname. Step 3 would then compare a match with itself, or become unnecessary.

## Workaround

Rewrite the header before vinext reads it. On Cloudflare this goes in a custom Worker entry that wraps `vinext/server/fetch-handler`. Rewriting it in `proxy.ts` does not help, because the header is read before the proxy runs.

```ts
const context = request.headers.get('x-vinext-interception-context')
if (context && !/^\/(en|zh)(\/|$)/.test(context)) {
  const headers = new Headers(request.headers)
  headers.set('x-vinext-interception-context', context === '/' ? '/en' : `/en${context}`)
  request = new Request(request, { headers })
}
return handler.fetch(request, env, ctx)
```
