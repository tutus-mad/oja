// app.js
// Oja Playground — built with Oja
import { state, effect, context } from 'https://cdn.jsdelivr.net/npm/@agberohq/oja@latest/build/oja.core.esm.js';

const OJA_CDN = 'https://cdn.jsdelivr.net/npm/@agberohq/oja@latest/build/oja.core.esm.js';
const OJA_FULL_CDN = 'https://cdn.jsdelivr.net/npm/@agberohq/oja@latest/build/oja.full.esm.js';

// ─── Default files ────────────────────────────────────────────────────────────

const DEFAULT_FILES = {
    'index.html': `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>My Oja App</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@agberohq/oja@latest/build/oja.min.css">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      background: #0f0f0f;
      font-family: system-ui, sans-serif;
      min-height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
    }
    .card {
      background: #141414;
      border: 1px solid #1e1e1e;
      border-radius: 24px;
      padding: 48px;
      text-align: center;
      min-width: 300px;
    }
    h1 { font-size: 1.5rem; font-weight: 700; color: #e8e8e8; margin-bottom: 8px; }
    .count { font-size: 6rem; font-weight: 800; color: #e8e8e8; margin: 24px 0; line-height: 1; }
    .btn-row { display: flex; gap: 10px; justify-content: center; }
    button {
      padding: 10px 24px;
      border-radius: 8px;
      border: none;
      cursor: pointer;
      font-size: 14px;
      font-weight: 600;
      transition: opacity 0.15s;
    }
    button:hover { opacity: 0.85; }
    .btn-primary { background: #e8e8e8; color: #0f0f0f; }
    .btn-secondary { background: #1a1a1a; color: #e8e8e8; border: 1px solid #2a2a2a; }
    .hint { margin-top: 20px; font-size: 12px; color: #444; }
  </style>
</head>
<body>
  <div class="card">
    <h1>Counter</h1>
    <div class="count" id="count">0</div>
    <div class="btn-row">
      <button class="btn-secondary" id="reset">Reset</button>
      <button class="btn-primary" id="inc">+ Increment</button>
    </div>
    <p class="hint" id="hint">Click increment to begin</p>
  </div>
  <script type="module">
    import { state, effect, on } from 'https://cdn.jsdelivr.net/npm/@agberohq/oja@latest/build/oja.core.esm.js';

    const MAX = 10;
    const [count, setCount] = state(0);

    const countEl = document.getElementById('count');
    const hintEl  = document.getElementById('hint');
    const incBtn  = document.getElementById('inc');

    effect(() => {
      const n = count();
      countEl.textContent = n;
      incBtn.disabled     = n >= MAX;
      if (n === 0)      hintEl.textContent = 'Click increment to begin';
      else if (n < MAX) hintEl.textContent = \`\${MAX - n} to go…\`;
      else              hintEl.textContent = '🎉 You made it!';
    });

    document.getElementById('inc').addEventListener('click', () => setCount(n => n + 1));
    document.getElementById('reset').addEventListener('click', () => setCount(0));
  <\/script>
</body>
</html>`,

    'app.js': `// app.js — multi-page Oja app
import { Router, Out, context } from 'https://cdn.jsdelivr.net/npm/@agberohq/oja@latest/build/oja.core.esm.js';

export const [count, setCount] = context('count', 0);

const router = new Router({ mode: 'hash', outlet: '#app' });

router.Get('/',      Out.component('pages/home.html'));
router.Get('/about', Out.component('pages/about.html'));

router.NotFound(Out.html(\`
  <div style="text-align:center;padding:48px;color:#666">
    <div style="font-size:48px;margin-bottom:16px">404</div>
    <a href="#/" style="color:#888;font-size:13px">← Back home</a>
  </div>
\`));

router.start('/');`,

    'pages/home.html': `<div style="padding:40px;max-width:480px;margin:0 auto;color:#e8e8e8">
  <h1 style="font-size:24px;margin-bottom:8px">Home</h1>
  <p style="color:#888;margin-bottom:24px;font-size:14px">Shared counter persists across navigation.</p>

  <div id="count" style="font-size:64px;font-weight:800;margin-bottom:24px">0</div>

  <div style="display:flex;gap:8px;margin-bottom:32px">
    <button id="dec" style="padding:10px 20px;border-radius:8px;border:1px solid #2a2a2a;background:#1a1a1a;color:#e8e8e8;cursor:pointer">−</button>
    <button id="inc" style="padding:10px 20px;border-radius:8px;border:none;background:#e8e8e8;color:#0f0f0f;font-weight:600;cursor:pointer">+</button>
  </div>

  <a href="#/about" style="color:#888;font-size:13px;text-decoration:none">About →</a>
</div>

<script type="module">
  import { context, effect } from 'https://cdn.jsdelivr.net/npm/@agberohq/oja@latest/build/oja.core.esm.js';
  const [count, setCount] = context('count', 0);
  const el = find('#count');
  effect(() => { el.textContent = count(); });
  find('#inc').addEventListener('click', () => setCount(n => n + 1));
  find('#dec').addEventListener('click', () => setCount(n => n - 1));
<\/script>`,

    'pages/about.html': `<div style="padding:40px;max-width:480px;margin:0 auto;color:#e8e8e8">
  <h1 style="font-size:24px;margin-bottom:16px">About</h1>
  <p style="color:#888;font-size:14px;line-height:1.7;margin-bottom:24px">
    Oja is a minimal, zero-build JavaScript framework.<br>
    Write HTML. Add state. Done.
  </p>
  <p style="color:#555;font-size:13px;margin-bottom:32px">
    The counter on the home page uses <code style="color:#888">context()</code> —
    navigate back and it keeps its value.
  </p>
  <a href="#/" style="color:#888;font-size:13px;text-decoration:none">← Back home</a>
</div>`,
};

// ─── App state (built with Oja) ───────────────────────────────────────────────

const [files, setFiles]             = state({ ...DEFAULT_FILES });
const [activeFile, setActiveFile]   = state('index.html');
const [openTabs, setOpenTabs]       = state(['index.html', 'app.js', 'pages/home.html', 'pages/about.html']);
const [consoleLogs, setConsoleLogs] = state([]);
const [consoleFilter, setFilter]    = state('all');
const [consolePaused, setPaused]    = state(false);
const [theme, setTheme]             = context('playground-theme', 'dark');

let editor       = null;
let updateTimer  = null;
let blobUrls     = [];

// ─── CodeMirror editor ────────────────────────────────────────────────────────

function initEditor() {
    const textarea = document.getElementById('editorTextarea');

    editor = CodeMirror.fromTextArea(textarea, {
        lineNumbers      : true,
        theme            : 'dracula',
        mode             : 'htmlmixed',
        indentUnit       : 2,
        tabSize          : 2,
        lineWrapping     : true,
        styleActiveLine  : true,
        foldGutter       : true,
        gutters          : ['CodeMirror-linenumbers', 'CodeMirror-foldgutter'],
        matchBrackets    : true,
        autoCloseBrackets: true,
        autoCloseTags    : true,
    });

    editor.on('change', () => {
        const path = activeFile();
        if (!path) return;
        const updated = { ...files() };
        updated[path] = editor.getValue();
        setFiles(updated);
        clearTimeout(updateTimer);
        updateTimer = setTimeout(runPreview, 400);
    });

    editor.on('cursorActivity', () => {
        const c = editor.getCursor();
        document.getElementById('cursorPosition').textContent = `Ln ${c.line + 1}, Col ${c.ch + 1}`;
    });

    syncEditorContent();
}

function syncEditorContent() {
    if (!editor) return;
    const path    = activeFile();
    const content = files()[path] || '';
    editor.setValue(content);
    editor.setOption('mode', path.endsWith('.js') ? 'javascript' : path.endsWith('.css') ? 'css' : 'htmlmixed');
    document.getElementById('fileType').textContent = path.split('.').pop().toUpperCase();
}

// ─── Effects — all UI driven by state ────────────────────────────────────────

effect(() => {
    const fileMap  = files();
    const active   = activeFile();
    const list     = document.getElementById('fileTree');
    const paths    = Object.keys(fileMap).sort();

    list.innerHTML = paths.map(p => `
        <div class="file-item ${p === active ? 'active' : ''}" data-path="${escHtml(p)}">
            <span class="file-icon">${iconFor(p)}</span>
            <span class="file-name">${escHtml(p)}</span>
            <span class="file-del" data-path="${escHtml(p)}">✕</span>
        </div>
    `).join('');

    list.querySelectorAll('.file-item').forEach(el => {
        el.addEventListener('click', (e) => {
            if (e.target.classList.contains('file-del')) return;
            openFile(el.dataset.path);
        });
        el.querySelector('.file-del')?.addEventListener('click', (e) => {
            e.stopPropagation();
            deleteFile(el.dataset.path);
        });
    });

    document.getElementById('fileStats').textContent = `${paths.length} files`;
});

effect(() => {
    const tabs   = openTabs();
    const active = activeFile();
    const bar    = document.getElementById('tabBar');

    bar.innerHTML = tabs.map(p => `
        <div class="tab ${p === active ? 'active' : ''}" data-path="${escHtml(p)}">
            <span>${escHtml(p.split('/').pop())}</span>
            <span class="tab-close" data-path="${escHtml(p)}">✕</span>
        </div>
    `).join('');

    bar.querySelectorAll('.tab').forEach(el => {
        el.addEventListener('click', (e) => {
            if (e.target.classList.contains('tab-close')) closeTab(el.dataset.path);
            else openFile(el.dataset.path);
        });
    });
});

effect(() => {
    const logs     = consoleLogs();
    const filter   = consoleFilter();
    const panel    = document.getElementById('consoleLogs');
    const filtered = filter === 'all' ? logs : logs.filter(l => l.level === filter);

    if (filtered.length === 0) {
        panel.innerHTML = '<div class="console-empty">✓ No logs — run your code to see output</div>';
        return;
    }

    panel.innerHTML = filtered.map(l => `
        <div class="log-line">
            <span class="log-time">${l.time}</span>
            <span class="log-level ${l.level}">${l.level}</span>
            <span class="log-message">${escHtml(l.message)}</span>
        </div>
    `).join('');

    panel.scrollTop = panel.scrollHeight;
});

// ─── File operations ──────────────────────────────────────────────────────────

function openFile(path) {
    if (!files()[path]) return;
    if (!openTabs().includes(path)) setOpenTabs([...openTabs(), path]);
    setActiveFile(path);
    syncEditorContent();
}

function closeTab(path) {
    const remaining = openTabs().filter(p => p !== path);
    setOpenTabs(remaining);
    if (activeFile() === path) {
        setActiveFile(remaining[0] || null);
        syncEditorContent();
    }
}

function deleteFile(path) {
    if (path === 'index.html') {
        addLog('error', 'Cannot delete index.html — it is the entry point');
        return;
    }
    if (!confirm(`Delete ${path}?`)) return;
    const updated = { ...files() };
    delete updated[path];
    setFiles(updated);
    closeTab(path);
    runPreview();
}

function createFile(path, content = '') {
    path = path.trim();
    if (!path) return;
    if (files()[path] !== undefined) {
        addLog('error', `File "${path}" already exists`);
        return;
    }
    const updated = { ...files(), [path]: content || defaultContent(path) };
    setFiles(updated);
    setOpenTabs([...openTabs(), path]);
    setActiveFile(path);
    syncEditorContent();
    runPreview();
}

function defaultContent(path) {
    if (path.endsWith('.html')) return `<!-- ${path} -->\n<div>\n\n</div>\n`;
    if (path.endsWith('.js'))   return `// ${path}\nimport { state, effect } from '${OJA_CDN}';\n\nconst [count, setCount] = state(0);\neffect(() => console.log('count:', count()));\n`;
    if (path.endsWith('.css'))  return `/* ${path} */\n`;
    return '';
}

// ─── Preview ──────────────────────────────────────────────────────────────────

function runPreview() {
    blobUrls.forEach(u => URL.revokeObjectURL(u));
    blobUrls = [];

    const indexContent = files()['index.html'];
    if (!indexContent) {
        document.getElementById('previewFrame').srcdoc = `
            <body style="background:#0a0a0a;color:#444;display:flex;align-items:center;justify-content:center;height:100vh;font-family:system-ui">
                <div style="text-align:center"><div style="font-size:32px;margin-bottom:12px">📄</div><p>No index.html found</p></div>
            </body>`;
        return;
    }

    const blobMap = {};
    Object.keys(files()).forEach(path => {
        const mime = path.endsWith('.js') ? 'text/javascript' : path.endsWith('.css') ? 'text/css' : 'text/html';
        const blob = new Blob([files()[path]], { type: mime });
        const url  = URL.createObjectURL(blob);
        blobMap[path] = url;
        blobUrls.push(url);
    });

    let html = indexContent;

    // Rewrite relative import paths to blob URLs
    html = html.replace(/(import\s+(?:[\w*{},\s]+from\s+)?['"])([^'"]+)(['"])/g, (m, pre, spec, post) => {
        if (spec.startsWith('http') || spec.startsWith('blob:')) return m;
        const resolved = spec.replace(/^\.\//, '');
        return blobMap[resolved] ? pre + blobMap[resolved] + post : m;
    });

    // Rewrite src/href attributes
    html = html.replace(/(src|href)=["']([^"']+)["']/g, (m, attr, val) => {
        if (val.startsWith('http') || val.startsWith('blob:') || val.startsWith('#') || val.startsWith('data:')) return m;
        return blobMap[val] ? `${attr}="${blobMap[val]}"` : m;
    });

    // Console bridge
    const bridge = `<script>
        (function() {
            ['log','warn','error','info'].forEach(m => {
                const orig = console[m];
                console[m] = function(...args) {
                    orig.apply(console, args);
                    window.parent.postMessage({ type: 'console', level: m,
                        args: args.map(a => { try { return typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a); } catch { return String(a); } })
                    }, '*');
                };
            });
            window.addEventListener('error', e => {
                window.parent.postMessage({ type: 'console', level: 'error',
                    args: [e.message + ' (' + (e.filename?.split('/').pop() || 'unknown') + ':' + e.lineno + ')']
                }, '*');
            });
        })();
    <\/script>`;

    html = html.replace('</head>', bridge + '</head>');
    document.getElementById('previewFrame').srcdoc = html;
    document.getElementById('previewStatus').innerHTML = '● running';
}

// ─── Console ──────────────────────────────────────────────────────────────────

function addLog(level, message) {
    if (consolePaused()) return;
    const log = {
        id     : Date.now() + Math.random(),
        time   : new Date().toLocaleTimeString([], { hour12: false }),
        level,
        message: String(message),
    };
    setConsoleLogs([...consoleLogs(), log].slice(-500));
}

window.addEventListener('message', (e) => {
    if (e.data?.type === 'console') {
        addLog(e.data.level, e.data.args.join(' '));
    }
});

// ─── Examples ─────────────────────────────────────────────────────────────────

const EXAMPLES = [
    {
        name: 'Counter',
        desc: 'state + effect',
        files: { 'index.html': DEFAULT_FILES['index.html'] },
    },
    {
        name: 'Todo List',
        desc: 'reactive array with add / remove',
        files: {
            'index.html': `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Todo</title>
  <link rel="stylesheet" href="${'https://cdn.jsdelivr.net/npm/@agberohq/oja@latest/build/oja.min.css'}">
  <style>
    * { margin:0;padding:0;box-sizing:border-box; }
    body { background:#0f0f0f;color:#e8e8e8;font-family:system-ui;display:flex;justify-content:center;padding:48px 20px; }
    .app { width:100%;max-width:480px; }
    h1 { font-size:22px;margin-bottom:24px; }
    .add-row { display:flex;gap:8px;margin-bottom:24px; }
    input { flex:1;background:#1a1a1a;border:1px solid #2a2a2a;border-radius:8px;color:#e8e8e8;padding:10px 14px;font-size:14px;outline:none; }
    input:focus { border-color:#555; }
    button { padding:10px 18px;border-radius:8px;border:none;background:#e8e8e8;color:#0f0f0f;font-weight:600;cursor:pointer;font-size:14px; }
    .task { display:flex;align-items:center;gap:12px;padding:12px 16px;background:#141414;border:1px solid #1e1e1e;border-radius:10px;margin-bottom:8px; }
    .task.done span { opacity:0.4;text-decoration:line-through; }
    .task span { flex:1;font-size:14px; }
    .task-del { background:transparent;border:none;color:#555;cursor:pointer;padding:4px 8px;border-radius:4px;font-size:12px; }
    .task-del:hover { color:#e8e8e8;background:#2a2a2a; }
    input[type=checkbox] { accent-color:#e8e8e8;width:16px;height:16px;cursor:pointer; }
    .empty { color:#444;font-size:13px;text-align:center;padding:32px 0; }
  </style>
</head>
<body>
  <div class="app">
    <h1>Tasks</h1>
    <div class="add-row">
      <input type="text" id="inp" placeholder="Add a task…">
      <button id="add">Add</button>
    </div>
    <div id="list"></div>
  </div>
  <script type="module">
    import { state, effect } from 'https://cdn.jsdelivr.net/npm/@agberohq/oja@latest/build/oja.core.esm.js';

    const [tasks, setTasks] = state([]);
    const inp  = document.getElementById('inp');
    const list = document.getElementById('list');

    effect(() => {
      const all = tasks();
      if (all.length === 0) { list.innerHTML = '<div class="empty">No tasks yet</div>'; return; }
      list.innerHTML = '';
      all.forEach((t, i) => {
        const div = document.createElement('div');
        div.className = 'task' + (t.done ? ' done' : '');
        div.innerHTML = \`<input type="checkbox" \${t.done ? 'checked' : ''} data-i="\${i}"><span>\${t.text}</span><button class="task-del" data-i="\${i}">✕</button>\`;
        list.appendChild(div);
      });
    });

    document.getElementById('add').onclick = () => {
      if (inp.value.trim()) { setTasks([...tasks(), { text: inp.value.trim(), done: false }]); inp.value = ''; }
    };
    inp.addEventListener('keydown', e => { if (e.key === 'Enter') document.getElementById('add').click(); });
    list.addEventListener('change', e => {
      if (e.target.dataset.i !== undefined) setTasks(tasks().map((t,i) => i == e.target.dataset.i ? {...t, done: !t.done} : t));
    });
    list.addEventListener('click', e => {
      if (e.target.classList.contains('task-del')) setTasks(tasks().filter((_,i) => i != e.target.dataset.i));
    });
  <\/script>
</body>
</html>`,
        },
    },
    {
        name: 'Router + Context',
        desc: 'multi-page SPA with shared state',
        files: {
            'index.html': `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Oja Router</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@agberohq/oja@latest/build/oja.min.css">
  <style>
    * { margin:0;padding:0;box-sizing:border-box; }
    body { background:#0f0f0f;color:#e8e8e8;font-family:system-ui;min-height:100vh; }
    nav { display:flex;gap:4px;padding:16px 24px;border-bottom:1px solid #1e1e1e;background:#141414; }
    nav a { padding:6px 16px;border-radius:6px;color:#666;text-decoration:none;font-size:13px;transition:all 0.15s; }
    nav a:hover { color:#e8e8e8;background:#1e1e1e; }
    nav a.oja-active { background:#e8e8e8;color:#0f0f0f;font-weight:600; }
    #app { padding:40px 24px; }
  </style>
</head>
<body>
  <nav>
    <a href="#/" data-page="/">Home</a>
    <a href="#/counter" data-page="/counter">Counter</a>
    <a href="#/about" data-page="/about">About</a>
  </nav>
  <div id="app"></div>
  <script type="module" src="app.js"><\/script>
</body>
</html>`,
            'app.js': DEFAULT_FILES['app.js'],
            'pages/home.html': DEFAULT_FILES['pages/home.html'],
            'pages/about.html': DEFAULT_FILES['pages/about.html'],
        },
    },
    {
        name: 'Guestbook',
        desc: 'form.on + context + each()',
        files: {
            'index.html': `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Guestbook</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@agberohq/oja@latest/build/oja.min.css">
  <style>
    * { margin:0;padding:0;box-sizing:border-box; }
    body { background:#0f0f0f;color:#e8e8e8;font-family:system-ui;display:flex;justify-content:center;padding:48px 20px; }
    .app { width:100%;max-width:520px; }
    h1 { font-size:22px;margin-bottom:24px; }
    .form-box { background:#141414;border:1px solid #1e1e1e;border-radius:16px;padding:28px;margin-bottom:24px; }
    .field { margin-bottom:14px; }
    label { display:block;font-size:11px;font-weight:600;letter-spacing:0.06em;text-transform:uppercase;color:#555;margin-bottom:6px; }
    input, textarea { width:100%;background:#0f0f0f;border:1px solid #2a2a2a;border-radius:8px;color:#e8e8e8;padding:10px 14px;font-size:14px;font-family:inherit;outline:none; }
    input:focus, textarea:focus { border-color:#555; }
    textarea { resize:vertical;min-height:80px; }
    .field-error { font-size:11px;color:#e05555;margin-top:4px;display:block; }
    button[type=submit] { width:100%;padding:11px;background:#e8e8e8;color:#0f0f0f;border:none;border-radius:8px;font-weight:600;cursor:pointer;font-size:14px;margin-top:4px; }
    .entry { display:flex;gap:14px;padding:18px;background:#141414;border:1px solid #1e1e1e;border-radius:12px;margin-bottom:10px; }
    .avatar { width:40px;height:40px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:16px;flex-shrink:0;color:#0f0f0f; }
    .entry-name { font-size:14px;font-weight:600;margin-bottom:4px; }
    .entry-msg { font-size:13px;color:#999;line-height:1.5; }
    .entry-time { font-size:11px;color:#444;margin-top:6px; }
    .empty { color:#444;font-size:13px;text-align:center;padding:32px 0; }
  </style>
</head>
<body>
  <div class="app">
    <h1>Guestbook</h1>
    <div class="form-box">
      <form id="gb-form">
        <div class="field">
          <label>Name</label>
          <input name="name" type="text" placeholder="Your name" autocomplete="off">
          <span class="field-error" data-field="name"></span>
        </div>
        <div class="field">
          <label>Message</label>
          <textarea name="message" placeholder="Say something nice…"></textarea>
          <span class="field-error" data-field="message"></span>
        </div>
        <button type="submit" data-loading="Signing…">Sign</button>
      </form>
    </div>
    <div id="entries">
      <template data-each="entries" data-as="e">
        <div class="entry">
          <div class="avatar" data-bind="style:e.color">{{e.initial}}</div>
          <div>
            <div class="entry-name">{{e.name}}</div>
            <div class="entry-msg">{{e.message}}</div>
            <div class="entry-time">{{e.time}}</div>
          </div>
        </div>
      </template>
      <div data-empty="entries" class="empty">No entries yet — be the first!</div>
    </div>
  </div>
  <script type="module">
    import { form, each, notify, context } from 'https://cdn.jsdelivr.net/npm/@agberohq/oja@latest/build/oja.core.esm.js';

    const COLORS = ['background:#f9a825','background:#66bb6a','background:#42a5f5','background:#ab47bc','background:#ef5350'];
    const [entries, setEntries] = context('entries', []);
    const listEl  = document.getElementById('entries');
    const formEl  = document.getElementById('gb-form');

    function render() { each(listEl, 'entries', entries()); }
    render();

    form.on(formEl, {
      submit: async (data) => {
        const ok = await form.validate(formEl, {
          name:    v => v.trim().length >= 2 || 'At least 2 characters',
          message: v => v.trim().length >= 5 || 'At least 5 characters',
        });
        if (!ok) throw new Error('validation');
        return data;
      },
      success: async (data) => {
        const idx   = entries().length;
        const entry = {
          name   : data.name.trim(),
          message: data.message.trim(),
          initial: data.name.trim()[0]?.toUpperCase() ?? '?',
          color  : COLORS[idx % COLORS.length],
          time   : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setEntries([entry, ...entries()]);
        render();
        form.reset(formEl);
        notify.success('Thanks for signing!');
      },
      error: err => { if (err.message !== 'validation') notify.error(err.message); },
    });
  <\/script>
</body>
</html>`,
        },
    },
    {
        name: 'Channel Pipeline',
        desc: 'Go-style async pipeline with Channel + go()',
        files: {
            'index.html': `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Channel Pipeline</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@agberohq/oja@latest/build/oja.min.css">
  <style>
    * { margin:0;padding:0;box-sizing:border-box; }
    body { background:#0f0f0f;color:#e8e8e8;font-family:system-ui;display:flex;justify-content:center;padding:48px 20px; }
    .app { width:100%;max-width:520px; }
    h1 { font-size:22px;margin-bottom:8px; }
    .sub { color:#555;font-size:13px;margin-bottom:32px; }
    .pipeline { display:flex;align-items:center;gap:8px;margin-bottom:32px;flex-wrap:wrap; }
    .stage { padding:8px 16px;border-radius:8px;border:1px solid #2a2a2a;background:#141414;font-size:13px;color:#888;transition:all 0.3s; }
    .stage.active { border-color:#4a9a4a;background:#0d1f0d;color:#4a9a4a; }
    .arrow { color:#333;font-size:18px; }
    .log { background:#141414;border:1px solid #1e1e1e;border-radius:12px;padding:16px;min-height:120px;font-family:monospace;font-size:12px;margin-bottom:24px; }
    .log-line { color:#888;margin-bottom:4px; }
    .log-line.done { color:#4a9a4a; }
    .log-line.err  { color:#e05555; }
    button { padding:12px 24px;border-radius:8px;border:none;background:#e8e8e8;color:#0f0f0f;font-weight:600;cursor:pointer;font-size:14px; }
    button:disabled { opacity:0.4;cursor:not-allowed; }
  </style>
</head>
<body>
  <div class="app">
    <h1>Channel Pipeline</h1>
    <p class="sub">producer → channel → process → result. Go-style, in the browser.</p>
    <div class="pipeline">
      <div class="stage" id="s1">📤 Send</div>
      <div class="arrow">→</div>
      <div class="stage" id="s2">⚙ Process</div>
      <div class="arrow">→</div>
      <div class="stage" id="s3">✅ Result</div>
    </div>
    <div class="log" id="log"><div class="log-line">Ready. Click Run to start the pipeline.</div></div>
    <button id="run">▶ Run Pipeline</button>
  </div>
  <script type="module">
    import { Channel, go, state, effect } from 'https://cdn.jsdelivr.net/npm/@agberohq/oja@latest/build/oja.core.esm.js';

    const btn  = document.getElementById('run');
    const logEl = document.getElementById('log');

    function log(msg, cls = '') {
      const line = document.createElement('div');
      line.className = 'log-line ' + cls;
      line.textContent = msg;
      logEl.appendChild(line);
      logEl.scrollTop = logEl.scrollHeight;
    }

    function activate(id) {
      document.querySelectorAll('.stage').forEach(s => s.classList.remove('active'));
      if (id) document.getElementById(id).classList.add('active');
    }

    btn.addEventListener('click', async () => {
      btn.disabled = true;
      logEl.innerHTML = '';
      activate(null);

      const jobs    = new Channel(3);
      const results = new Channel(3);

      go(async () => {
        for (let i = 1; i <= 5; i++) {
          activate('s1');
          log(\`→ sending job \${i}…\`);
          await jobs.send(i);
          await new Promise(r => setTimeout(r, 300));
        }
        jobs.close();
        log('✓ all jobs sent');
      });

      go(async () => {
        for await (const job of jobs) {
          activate('s2');
          log(\`⚙ processing job \${job}…\`);
          await new Promise(r => setTimeout(r, 400));
          await results.send({ job, result: job * job });
        }
        results.close();
      });

      go(async () => {
        for await (const { job, result } of results) {
          activate('s3');
          log(\`✅ job \${job} → \${result}\`, 'done');
        }
        activate(null);
        log('Pipeline complete.', 'done');
        btn.disabled = false;
      });
    });
  <\/script>
</body>
</html>`,
        },
    },
];

function loadExample(ex) {
    setFiles({ ...ex.files });
    const paths = Object.keys(ex.files);
    setOpenTabs(paths);
    setActiveFile(paths[0]);
    syncEditorContent();
    runPreview();
    addLog('info', `Loaded: ${ex.name}`);
}

// ─── Theme ────────────────────────────────────────────────────────────────────

function applyTheme(mode) {
    document.documentElement.setAttribute('data-theme', mode);
    setTheme(mode);
    if (editor) editor.setOption('theme', mode === 'dark' ? 'dracula' : 'default');
    localStorage.setItem('oja-playground-theme', mode);
    document.getElementById('themeToggleBtn').innerHTML = mode === 'dark' ? '<span>🌙</span>' : '<span>☀️</span>';
}

// ─── Event wiring ─────────────────────────────────────────────────────────────

document.getElementById('runBtn').onclick          = runPreview;
document.getElementById('clearConsoleBtn').onclick = () => setConsoleLogs([]);
document.getElementById('pauseConsoleBtn').onclick = () => {
    setPaused(!consolePaused());
    document.getElementById('pauseConsoleBtn').innerHTML = consolePaused() ? '▶' : '⏸';
};
document.getElementById('themeToggleBtn').onclick = () => applyTheme(theme() === 'dark' ? 'light' : 'dark');

document.querySelectorAll('.filter-chip').forEach(chip => {
    chip.onclick = () => {
        document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        setFilter(chip.dataset.level);
    };
});

const newDialog = document.getElementById('newFileDialog');
document.getElementById('newFileBtn').onclick    = () => newDialog.classList.add('open');
document.getElementById('addFileSidebar').onclick= () => newDialog.classList.add('open');
document.getElementById('cancelDialog').onclick  = () => newDialog.classList.remove('open');
document.getElementById('confirmDialog').onclick = () => {
    const name = document.getElementById('newFileName').value.trim();
    if (name) createFile(name);
    newDialog.classList.remove('open');
    document.getElementById('newFileName').value = '';
};
document.getElementById('newFileName').addEventListener('keydown', e => {
    if (e.key === 'Enter')  document.getElementById('confirmDialog').click();
    if (e.key === 'Escape') newDialog.classList.remove('open');
});

const exDialog = document.getElementById('examplesDialog');
document.getElementById('examplesBtn').onclick   = () => {
    const list = document.getElementById('exampleList');
    list.innerHTML = EXAMPLES.map(ex => `
        <div class="example-card" data-name="${escHtml(ex.name)}">
            <div class="example-name">${escHtml(ex.name)}</div>
            <div class="example-desc">${escHtml(ex.desc)}</div>
        </div>
    `).join('');
    list.querySelectorAll('.example-card').forEach(card => {
        card.onclick = () => {
            const ex = EXAMPLES.find(e => e.name === card.dataset.name);
            if (ex) loadExample(ex);
            exDialog.classList.remove('open');
        };
    });
    exDialog.classList.add('open');
};
document.getElementById('closeExamples').onclick = () => exDialog.classList.remove('open');

document.querySelectorAll('.dialog-overlay').forEach(el => {
    el.addEventListener('click', e => { if (e.target === el) el.classList.remove('open'); });
});

document.addEventListener('keydown', e => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); runPreview(); }
    if ((e.ctrlKey || e.metaKey) && e.key === 'n')     { e.preventDefault(); newDialog.classList.add('open'); }
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

function iconFor(path) {
    if (path.endsWith('.html')) return '📄';
    if (path.endsWith('.js'))   return '⚡';
    if (path.endsWith('.css'))  return '🎨';
    return '📁';
}

function escHtml(s) {
    return String(s).replace(/[&<>"']/g, m =>
        ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[m])
    );
}

// ─── Boot ─────────────────────────────────────────────────────────────────────

function init() {
    const saved = localStorage.getItem('oja-playground-theme') || 'dark';
    applyTheme(saved);
    initEditor();
    runPreview();
    addLog('info', 'Welcome to Oja Playground! Ctrl+Enter to run · Ctrl+N for new file');
}

init();