> WARNING: This project is under active development.


<p align="center">
  <img src="assets/oja_icon.png" width="300" alt="Agbero Logo">
</p>




<p align="left">
  <img src="assets/oja_name.png" width="70" alt="Agbero Logo">
</p>

> *Oja* (Yoruba: *marketplace*) — a minimal, zero-build JavaScript framework for building multi-page SPAs.



No compiler. No virtual DOM. No node_modules. Drop files in, open a browser, it works.

---

## Why Oja exists

Most frameworks make you choose between **simplicity** and **capability**.

Alpine.js is simple but can't build a real SPA. React can build anything but requires a build step, a compiler, and forces HTML into JavaScript. Oja is the middle path — plain HTML files, plain JS files, one small framework layer.

The insight that shaped Oja: the real separation needed in a codebase is not just files — it is **people and roles**.

```
UI developer  →  opens .html and .css only, never touches .js
JS developer  →  opens .js only, never writes HTML strings
```

A component is a plain `.html` file a UI developer can open in a browser, edit, and see results. The JS only supplies data.

---

## What Oja does not do

- No build step — ever
- No virtual DOM
- No TypeScript (plain JS only)
- No CSS-in-JS
- No two-way data binding
- No bundling
- No server-side rendering

---

## Installation

No package manager required. Three ways to use Oja:

---

### Option 1 — CDN (recommended)

Include Oja directly from jsDelivr — no install, no build step.

```html
<!-- CSS -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@agberohq/oja@latest/build/oja.min.css">

<!-- ESM — recommended for modern apps -->
<script type="module">
    import { Router, Out, state, effect } from 'https://cdn.jsdelivr.net/npm/@agberohq/oja@latest/build/oja.core.esm.js';
</script>

<!-- IIFE — Oja available as window.Oja -->
<script src="https://cdn.jsdelivr.net/npm/@agberohq/oja@latest/build/oja.core.min.js"></script>
```

Pin to a specific version in production:

```html
<script type="module">
    import { Router, Out, state, effect } from 'https://cdn.jsdelivr.net/npm/@agberohq/oja@0.0.6/build/oja.core.esm.js';
</script>
```

For extensions (WebSocket, Worker, WASM, Canvas, drag-and-drop, etc.) use the full build:

```html
<script type="module">
    import { OjaSocket, OjaWorker, dragdrop, Channel } from 'https://cdn.jsdelivr.net/npm/@agberohq/oja@latest/build/oja.full.esm.js';
</script>
```

---

### Option 2 — Self-hosted (build from source)

Clone the repo and build once. Use this when you need to bundle Oja into your own build pipeline or want to ship without a CDN dependency.

**Requirements** (one-time setup):
```bash
npm install --save-dev esbuild clean-css-cli
```

**Build:**
```bash
make          # builds everything → build/oja.core.min.js + build/oja.min.css
make watch    # rebuild on save during development
make check    # show output sizes
make clean    # remove build/
```

**Include in your app:**
```html
<link rel="stylesheet" href="../oja/build/oja.min.css">

<!-- ESM -->
<script type="module">
    import { Router, Out, state, effect } from '../oja/build/oja.core.esm.js';
</script>

<!-- IIFE — Oja available as window.Oja -->
<script src="../oja/build/oja.core.min.js"></script>
```

```js
// IIFE — destructure from the global
const { Router, Out, auth, notify, component,
    state, effect, Channel, go } = Oja;
```

---

### Option 3 — Direct source imports (zero build, development friendly)

Copy the `src/` folder and import directly. No build step ever. This is how the example apps work — open `example/hello/index.html` or `example/twitter/index.html` in a browser and they run immediately.

```
my-project/
    index.html
    app.js
    oja/
        src/          ← copied from this repo
    pages/
    components/
    layouts/
```

```js
// app.js — import from the barrel
import { Router, Out, auth, notify, component } from '../oja/src/oja.js';

// Extensions (SSE, WebSocket, Worker, WASM, drag-and-drop, etc.)
import { OjaSSE, OjaWorker, dragdrop } from '../oja/src/oja.full.js';
```

---

## Grouped imports

When you want a clean namespace without listing every name, import a group object:

```js
import { Reactive, Event, DOM } from 'https://cdn.jsdelivr.net/npm/@agberohq/oja@latest/build/oja.core.esm.js';

// Reactivity
const [count, setCount] = Reactive.state(0);
Reactive.effect(() => console.log(count()));

// Events
Event.on('.btn', 'click', handler);
Event.emit('app:ready');
Event.debounce(search, 200);

// DOM helpers
const el = DOM.find('#app');
DOM.createEl('div', { class: 'card' });
```

Or import everything under the `Oja` namespace:

```js
import { Oja } from 'https://cdn.jsdelivr.net/npm/@agberohq/oja@latest/build/oja.core.esm.js';

Oja.state(0)
Oja.Router
Oja.notify.success('Done')
Oja.Event.on('.btn', 'click', handler)
```

---

## Core concepts

### 1. `Out` — the universal display primitive

`Out` is how Oja produces every piece of visible output. There are no raw HTML strings, no ad-hoc `innerHTML`, no inconsistent rendering paths. One primitive, composable everywhere.

```js
import { Out } from 'https://cdn.jsdelivr.net/npm/@agberohq/oja@latest/build/oja.core.esm.js';

// Render a component file with data
Out.component('pages/dashboard.html', { user, metrics })

// Raw HTML — no script execution (safe for user-generated content)
Out.raw('<p>User content</p>')

// HTML with script execution
Out.html('<div class="card"><script type="module">...</script></div>')

// Text — safely escaped
Out.text('Hello, world')

// Shorthands
Out.c('components/card.html', data)  // Out.component()
Out.h('<p>content</p>')              // Out.html()
Out.t('plain text')                  // Out.text()
```

#### Composition — conditional, list, async

```js
// Conditional rendering — condition evaluated at render time
Out.if(() => user.isAdmin, Out.c('admin.html'), Out.c('denied.html'))

// List rendering — one Out per item
Out.list(users, (user) => Out.c('components/user.html', user))

// With custom empty state
Out.list(users, (user) => Out.c('components/user.html', user), {
    empty: Out.c('states/no-users.html'),
})

// Async — loading → success → error states
Out.promise(fetchUser(id), {
    loading: Out.c('states/loading.html'),
    success: (user) => Out.c('pages/user.html', user),
    error:   Out.c('states/error.html'),
})

// Lazy async — called at render time
Out.fn(async (container, ctx) => {
    const host = await api.get(`/hosts/${ctx.params.id}`);
    return Out.c('pages/host-detail.html', host);
})
```

`Out` is accepted wherever Oja produces visible output: router, modal, notify, component, template `each()`.

### 2. Components are plain HTML files

```html
<!-- components/host-card.html -->
<div class="host-card" data-if-class="alive:host-alive">
    <strong>{{hostname}}</strong>
    <span class="badge {{if .tls}}badge-tls{{else}}badge-plain{{end}}">
        {{if .tls}}🔒 {{tlsMode}}{{else}}No TLS{{end}}
    </span>
    <div class="host-stats">
        <span>{{totalReqs | bytes}} reqs</span>
        <span>{{p99Ms}}ms p99</span>
    </div>
</div>
```

A UI developer can open this file in a browser. No JSX. No template compilation. Valid HTML.

### 3. Every component script gets `container`

When Oja mounts a component, the inline script automatically receives `container` — the exact DOM element it was mounted into. This enables true isolation: multiple instances of the same component never conflict.

```html
<!-- components/image.html -->
<img class="avatar">
<div class="spinner"></div>

<script type="module">
    // container is THIS instance — not the whole document
    const img     = container.querySelector('img');
    const spinner = container.querySelector('.spinner');

    const image = new Image();
    image.onload  = () => { img.src = image.src; spinner.remove(); };
    image.onerror = () => { spinner.textContent = '✗'; };
    image.src = img.dataset.src;
</script>
```

### 4. Reactive state — fine-grained, no virtual DOM

```js
import { state, effect, derived, batch, context } from 'https://cdn.jsdelivr.net/npm/@agberohq/oja@latest/build/oja.core.esm.js';

const [metrics, setMetrics] = state(null);
const [history, setHistory] = state([]);

const errorRate = derived(() => {
    const m = metrics();
    if (!m) return '0%';
    return ((m.errors / m.total) * 100).toFixed(2) + '%';
});

// Effect runs whenever metrics() changes — updates real DOM directly
effect(() => {
    const m = metrics();
    if (!m) return;
    document.getElementById('stat-rps').textContent = m.rps + ' req/s';
    document.getElementById('stat-errors').textContent = errorRate();
});

// Cross-component state — same value anywhere in the app
export const [isOnline, setOnline] = context('isOnline', true);
```

### 5. Router — Go-style middleware and groups

```js
import { Router, Out, auth } from 'https://cdn.jsdelivr.net/npm/@agberohq/oja@latest/build/oja.core.esm.js';

const router = new Router({
    mode    : 'hash',
    outlet  : '#app',
    loading : Out.html('<div class="spinner"></div>'),
});

// Global middleware
router.Use(async (ctx, next) => {
    const t = Date.now();
    await next();
    console.log(`${ctx.path} — ${Date.now() - t}ms`);
});

// Public route
router.Get('/login', Out.component('pages/login.html'));

// Protected group — auth checked automatically
const app = router.Group('/');
app.Use(auth.middleware('protected', '/login'));
app.Get('dashboard', Out.component('pages/dashboard.html'));
app.Get('hosts',     Out.component('pages/hosts.html'));

// URL params
app.Route('hosts/{id}', host => {
    host.Use(async (ctx, next) => {
        ctx.host = await api.get(`/api/hosts/${ctx.params.id}`);
        if (!ctx.host) return ctx.redirect('/hosts');
        await next();
    });
    host.Get('/', Out.fn(async (container, ctx) =>
        Out.component('pages/host-detail.html', ctx.host)
    ));
});

router.NotFound(Out.html(`
    <div class="error-page">
        <div class="error-code">404</div>
        <a href="#/dashboard">Dashboard</a>
    </div>
`));

router.start('/login');
```

### 6. Auth — declared once, never checked manually

```js
// Define levels once
auth.level('protected', () => auth.session.isActive());
auth.level('admin',     () => auth.session.isActive() && auth.hasRole('admin'));

// Hook into session lifecycle
auth.session.OnStart(async (token) => {
    api.setToken(token);
    const dest = auth.session.intendedPath() || '/dashboard';
    auth.session.clearIntendedPath();
    router.navigate(dest);
});

auth.session.OnExpiry(() => {
    notify.warn('Session expired');
    router.navigate('/login');
});

// Login — one line
await auth.session.start(responseToken);
```

### 7. Layout — persistent shell with slot injection

```js
import { layout } from 'https://cdn.jsdelivr.net/npm/@agberohq/oja@latest/build/oja.core.esm.js';

// Define a persistent shell — survives navigation, renders once
const shell = layout('components/nav.html', {
    outlet : '#page-content',
    data   : () => ({ user: auth.session.user() }),
});

// Use as router middleware — shell wraps all routes in the group
const app = router.Group('/');
app.Use(shell.middleware());
app.Get('dashboard', Out.component('pages/dashboard.html'));
```

### 8. Component lifecycle — automatic cleanup

```js
// In any page script — Oja cleans up automatically on navigate
component.interval(refresh, 3000);   // cleared on navigate away
component.timeout(showTip, 5000);    // cleared if user navigates first

component.onMount(() => {
    document.getElementById('search')?.focus();
});

component.onUnmount(() => {
    sse.close();
    notify.dismissBanner();
});
```

---

## Template syntax

Oja supports two styles — mix freely:

### Data attributes (UI developer friendly)

```html
<div data-if="user.admin">Admin panel</div>
<div data-if-not="user.active">Account suspended</div>
<div data-if-class="alive:dot-green,error:dot-red"></div>
<a data-bind="href:profile.url,title:profile.name">Profile</a>

<template data-each="hosts" data-as="h">
    <div>{{h.hostname}} — {{h.p99Ms}}ms</div>
</template>
<div data-empty="hosts">No hosts found</div>
```

### Go-style inline syntax (expressive, works in attributes)

```html
{{.user.name | upper}}

{{if .user.admin}}
<span class="badge badge-admin">Admin</span>
{{else}}
<span class="badge">User</span>
{{end}}

{{range .hosts}}
<div class="host {{if .alive}}online{{else}}offline{{end}}">
    {{.hostname}} — {{.totalReqs | bytes}} requests
</div>
{{else}}
<p>No hosts configured</p>
{{end}}
```

### Built-in filters

| Filter | Example | Output |
|--------|---------|--------|
| `upper` | `{{name \| upper}}` | `ALICE` |
| `lower` | `{{name \| lower}}` | `alice` |
| `bytes` | `{{size \| bytes}}` | `1.4 MB` |
| `date`  | `{{ts \| date}}` | `18/03/2026` |
| `ago`   | `{{ts \| ago}}` | `5m ago` |
| `default` | `{{val \| default "n/a"}}` | `n/a` |
| `trunc` | `{{text \| trunc 50}}` | `Long text…` |

---

## API reference

### Store — persistent state with cascade

```js
import { Store } from 'https://cdn.jsdelivr.net/npm/@agberohq/oja@latest/build/oja.core.esm.js';

const store  = new Store('myapp');                        // session storage
const secure = new Store('myapp', { encrypt: true });     // AES-GCM encrypted
const local  = new Store('myapp', { prefer: 'local' });  // local storage

// Sync API (plain store)
store.set('page', 'hosts');
store.get('page', 'dashboard');   // with fallback
store.has('page');
store.clear('page');
store.all();

// Async API — used automatically when encrypt:true
await secure.set('token', jwt);
await secure.get('token');

// Watch for changes
store.onChange('theme', (newVal, oldVal) => applyTheme(newVal));
```

Storage cascade: `sessionStorage → localStorage → memory`. Same code works on web, mobile webview, and private browsing.

### encrypt — standalone Web Crypto

```js
import { encrypt } from 'https://cdn.jsdelivr.net/npm/@agberohq/oja@latest/build/oja.core.esm.js';

// Encrypt / decrypt
const ct = await encrypt.seal('my secret', 'passphrase', 'salt');
const pt = await encrypt.open(ct, 'passphrase', 'salt');

// Sign / verify (HMAC-SHA256)
const sig = await encrypt.sign('message', 'secret');
const ok  = await encrypt.verify('message', sig, 'secret');

// Rotate key without exposing plaintext
const newCt = await encrypt.rotate(oldCt, 'old-pass', 'new-pass', 'salt');

// Check availability
if (encrypt.available()) { ... }
```

`encrypt` is separate from `Store` — import it anywhere: VFS, auth, your own modules.

### VFS — offline-first virtual filesystem

VFS stores your app's files in IndexedDB, backed by a background Worker. Components load from VFS first, network second. Works offline after the first visit.

```js
import { VFS, Out, Router } from 'https://cdn.jsdelivr.net/npm/@agberohq/oja@latest/build/oja.core.esm.js';

const vfs = new VFS('my-app');
await vfs.ready();

// Mount remote files into local IndexedDB
await vfs.mount('https://cdn.example.com/my-app/');

// Wire to router — all Out.component() calls check VFS first
const router = new Router({ outlet: '#app', vfs });
router.Get('/', Out.c('pages/home.html'));
router.start('/');
```

**Read / write:**
```js
vfs.write('pages/home.html', html);   // fire and forget
await vfs.flush();                     // guarantee durability
const html = await vfs.readText('pages/home.html');
const bin  = await vfs.read('logo.png');  // ArrayBuffer for binary
await vfs.rm('old.html');
const files = await vfs.ls('/');      // flat list
const tree  = await vfs.tree('/');    // nested tree
```

**Per-route VFS (multiple VFS instances):**
```js
// vfs.component() pins this VFS instance to the Out — no global side effect
router.Get('/', vfs.component('pages/home.html', { user }));
router.Get('/admin', adminVfs.component('pages/admin.html'));
```

**Change watchers:**
```js
const off = vfs.onChange('pages/', (path, content) => reloadPreview(path));
vfs.on('conflict', ({ path }) => showConflictBadge(path));
vfs.on('mounted',  ({ base, fetched }) => console.log('ready:', fetched.length, 'files'));
off(); // unsubscribe
```

**Conflict policy:**
```js
const vfs = new VFS('my-app', {
    onConflict: 'keep-local',                    // default — never lose local changes
    // onConflict: 'take-remote',                // always accept remote version
    // onConflict: (path, local, remote) => {    // decide per file
    //     return path.startsWith('data/') ? 'remote' : 'local';
    // },
});
```

**VFS manifest (`vfs.json`)** — place at your remote root:
```json
{
  "files": [
    "index.html",
    "app.js",
    "pages/home.html",
    "components/card.html"
  ]
}
```

### config — optional project configuration

`oja.config.json` is the optional single source of truth for an Oja project — like `package.json` is to Node. Everything works without it.

```json
{
  "version": "1.0.0",
  "name": "my-app",

  "vfs": {
    "manifest": "vfs.json",
    "conflict": "keep-local",
    "sync": { "auto": true, "interval": 60000 }
  },

  "routes": {
    "protected": ["/admin", "/settings"],
    "fallback":  "/index.html"
  },

  "auth": {
    "loginPath":   "/login",
    "defaultPath": "/dashboard"
  }
}
```

```js
import { config, VFS, Router } from 'https://cdn.jsdelivr.net/npm/@agberohq/oja@latest/build/oja.core.esm.js';

// Load once in app.js
await config.load();                  // looks for ./oja.config.json
await config.load('https://cdn.example.com/my-app/');  // or remote base

// Read any section
const vfsCfg = config.get('vfs');    // → object or null

// Apply to VFS — mounts, wires sync interval, sets conflict policy
const vfs = new VFS('my-app');
await vfs.ready();
await config.applyVFS(vfs, 'https://cdn.example.com/my-app/');

// Apply to Router — registers protected route middleware
const router = new Router({ outlet: '#app', vfs });
config.applyRouter(router, { auth });
router.start('/');
```

A complete `app.js` with config:
```js
import { config, VFS, Router, Out, auth } from './oja.core.esm.js';

await config.load();

const vfs    = new VFS('my-app');
const router = new Router({ outlet: '#app', vfs });

await vfs.ready();
await config.applyVFS(vfs, './');
config.applyRouter(router, { auth });

router.Get('/login',     Out.c('pages/login.html'));
router.Get('/dashboard', Out.c('pages/dashboard.html'));

router.start('/');
```

### Events — delegated, cross-component

```js
import { on, once, off, emit, listen, debounce, throttle, keys } from 'https://cdn.jsdelivr.net/npm/@agberohq/oja@latest/build/oja.core.esm.js';

// Or via the Event group:
import { Event } from 'https://cdn.jsdelivr.net/npm/@agberohq/oja@latest/build/oja.core.esm.js';

on('.btn-delete', 'click', (e, el) => deleteItem(el.dataset.id));
once('#confirm-ok', 'click', handleConfirm);
off('.btn-delete', 'click', handler);

emit('host:updated', { id: 'api-example-com' });
const unsub = listen('host:updated', ({ id }) => refresh(id));
unsub(); // stop listening

// Timing utilities
on('#search', 'input', debounce(search, 200));
on('#scroll', 'scroll', throttle(updateNav, 100));

// Keyboard shortcuts
keys({
    'ctrl+s': () => save(),
    'escape': () => modal.closeAll(),
    '/':      () => document.getElementById('search')?.focus(),
});

// Visibility and resize
onVisible('#lazy-section', () => loadContent());
onResize('#chart', ({ width, height }) => redraw(width, height));
```

### Drag and drop

```js
import { dragdrop } from 'https://cdn.jsdelivr.net/npm/@agberohq/oja@latest/build/oja.full.esm.js';

// Reorderable list
dragdrop.reorder('#host-list', {
    onReorder: (items) => api.post('/hosts/reorder', { order: items.map(el => el.dataset.id) }),
    handle:    '.drag-handle',
    animation: 150,
});

// File drop zone
dragdrop.dropZone('#upload-area', {
    onDrop:    (files) => files.forEach(uploadFile),
    accept:    ['.jpg', '.png', '.pdf'],
    maxSize:   10 * 1024 * 1024,
    onError:   (msg) => notify.error(msg),
});

// Custom drag source + drop target
dragdrop.draggable('.host-card', {
    data: (el) => ({ id: el.dataset.id }),
});

dragdrop.dropTarget('.folder', {
    accept: (el, data) => data.type === 'host',
    onDrop: (el, data) => moveHostToFolder(data.id, el.dataset.folderId),
});
```

### Forms

```js
import { form } from 'https://cdn.jsdelivr.net/npm/@agberohq/oja@latest/build/oja.core.esm.js';

form.on('#loginForm', {
    submit:  async (data) => api.post('/login', data),
    success: (res) => auth.session.start(res.token),
    error:   (err) => form.showError('#loginForm', 'password', err.message),
});

// Rich error — accepts Out
form.showError('#myForm', 'email', Out.html('Invalid — <a href="/help">see examples</a>'));

// Async validation
const ok = await form.validate('#firewallForm', {
    ip:     (v) => /^[\d.:/a-fA-F]+$/.test(v) || 'Enter a valid IP or CIDR',
    reason: (v) => v.trim().length >= 3 || 'Too short',
    ip:     async (v) => await api.get(`/check?ip=${v}`) || 'Already blocked',
});
if (!ok) return;

// Image upload + preview
form.image('#avatarInput', '#avatarPreview', {
    maxSizeMb : 2,
    accept    : ['image/jpeg', 'image/png'],
    onError   : (msg) => notify.error(msg),
});
```

### Notifications

```js
import { notify } from 'https://cdn.jsdelivr.net/npm/@agberohq/oja@latest/build/oja.core.esm.js';

notify.success('Host added');
notify.error('Connection failed', { duration: 8000 });
notify.warn('Session expires in 5 minutes', {
    action: { label: 'Renew', fn: () => auth.session.renew() }
});

// banner() accepts a string or Out
notify.banner('⚠️ Connection lost');
notify.banner(Out.html('⚠️ Outage: <a href="#/status">details</a>'), { type: 'warn' });
notify.dismissBanner();

notify.setPosition('top-right'); // top-right | top-left | top-center | bottom-*
```

### Modals

```js
import { modal } from 'https://cdn.jsdelivr.net/npm/@agberohq/oja@latest/build/oja.core.esm.js';

modal.open('confirmModal');
modal.close();
modal.closeAll();

// body and footer accept string or Out
modal.open('infoModal', {
    body:   Out.component('components/user-detail.html', user),
    footer: Out.html('<button data-action="modal-close">Done</button>'),
});

// Cascading drawers
modal.push('routeDrawer', { host: 'api.example.com' });
modal.pop();

// Promise-based confirm
const confirmed = await modal.confirm('Delete this rule?');
if (confirmed) await api.delete(`/api/firewall?ip=${ip}`);
```

### Real-time — SSE and WebSocket

```js
import { OjaSSE, OjaSocket } from 'https://cdn.jsdelivr.net/npm/@agberohq/oja@latest/build/oja.full.esm.js';

// Server-Sent Events
const sse = new OjaSSE('/api/events');
sse.on('metrics', (data) => setMetrics(data));
sse.onDisconnect(() => notify.banner('Connection lost', { type: 'warn' }));
sse.onConnect(()    => notify.dismissBanner());
component.onUnmount(() => sse.close());

// WebSocket
const ws = new OjaSocket('wss://api.example.com/live');
ws.on('connect',    () => ws.send({ type: 'subscribe', channel: 'hosts' }));
ws.on('message',    (data) => handleMessage(data));
ws.on('disconnect', () => notify.warn('Disconnected'));
component.onUnmount(() => ws.close());
```

Both reconnect automatically with exponential backoff.

---

## Concurrency

### Channel — Go-style coordination

```js
import { Channel, go, pipeline, fanOut, fanIn } from 'https://cdn.jsdelivr.net/npm/@agberohq/oja@latest/build/oja.full.esm.js';

const ch = new Channel({ buffer: 10, workers: true, name: 'images' });

await ch.send(imageBuffer);

go(async () => {
    for await (const buffer of ch) {
        const result = await worker.call('process', buffer);
        setResult(result);
    }
});

// Pipeline — chain processing stages
const output = pipeline([resize, compress, upload], inputChannel);

// Fan-out / fan-in
const [q1, q2, q3] = fanOut(inputChannel, 3);
const merged = fanIn([q1, q2, q3]);

component.onUnmount(() => ch.close());
```

### Runner — long-lived background worker

`Runner` is for infrastructure that needs to stay alive across the app lifetime — game loops, simulations, persistent connections. VFS uses it internally.

```js
import { Runner } from 'https://cdn.jsdelivr.net/npm/@agberohq/oja@latest/build/oja.core.esm.js';

const worker = new Runner((self) => {
    let count = 0;
    self.on('increment', (data) => { count += data.by ?? 1; });
    self.on('get',       ()     => { return { count }; });
});

worker.send('increment', { by: 5 });           // fire and forget
await worker.post('increment', { by: 1 });     // await receipt
const { count } = await worker.request('get'); // await response

worker.on('event', (data) => console.log(data));
worker.close();
```

---

## Multi-app architecture

Multiple apps share the same Oja framework:

```
oja/src/          ← framework (shared)
dashboard/        ← admin panel
  index.html
  app.js
  pages/
  components/
portal/           ← user portal
  index.html
  app.js
  pages/
  components/
```

The boundary rule: **Would another app ever need this?** Yes → it belongs in `oja/src/`. No → it stays in the app folder.

---

## Logging and debugging

```js
import { logger, debug } from 'https://cdn.jsdelivr.net/npm/@agberohq/oja@latest/build/oja.core.esm.js';

logger.info('auth', 'User logged in', { userId: 42 });
logger.warn('api', 'Slow response', { ms: 1240, path: '/config' });
logger.error('component', 'Load failed', { url: 'hosts.html' });
logger.setLevel('WARN'); // ERROR | WARN | INFO | DEBUG

// Forward errors to server
logger.onLog((entry) => {
    if (entry.level === 'ERROR') api.post('/logs', entry);
});

// Framework internals — development only
debug.enable('router,auth,api'); // or '*' for everything
debug.dump();   // prints full timeline to console
window._debug = debug; // access from browser console
```

---

## Design decisions

| Decision | Choice | Reason |
|----------|--------|--------|
| Build step | None | Drop-in simplicity, no node_modules |
| Virtual DOM | No | Direct DOM + targeted `effect()` |
| Display primitive | `Out` everywhere | One type for all visible output — composable, typed, no raw strings |
| URL strategy | Hash default, path opt-in | Hash works everywhere without server config |
| CSS ownership | App owns all styles | Oja only owns lifecycle animation classes |
| Auth | Declared at route | Never check `isActive()` manually |
| Token security | Encrypted cascade | Web Crypto API, no plaintext tokens |
| Encryption | `encrypt.js` standalone | `Store`, `auth`, `VFS`, and third parties all import the same module |
| Offline | VFS optional | Progressive enhancement — start without VFS, add it when needed |
| Config | `oja.config.json` optional | Like `package.json` — everything works without it |
| Worker pattern | `Runner` + `Channel` separate | `Runner` stays alive; `Channel` moves data — single responsibility |
| WASM | Component Model aligned | Same API today and when native support lands |
| Third-party | `adapter.js` bridge | D3, GSAP, Chart.js registered once, used anywhere |

---

## Known limitations

- **Nested `{{range}}` loops**: inner `Index`/`First`/`Last` are list-absolute in chunked renders — access the outer loop variable by its `data-as` name.
- **`OjaWasm` worker mode**: JS import callbacks are stubbed in the worker thread. For WASM modules that need JS callbacks, use non-worker mode.
- **`OjaWorker` scope isolation**: worker functions are serialised as strings and run in a separate thread — they cannot close over variables from the outer scope.
- **`webrtc.js` `connect()`**: WebRTC signaling is application-specific. Wire your own signaling server using `createPeer()`, `createOffer()`, `setLocalDescription()`.
- **No DevTools browser extension yet**.

---

## License

MIT