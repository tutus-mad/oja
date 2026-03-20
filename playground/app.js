// Oja Playground — built with Oja
import { state, effect, context } from 'https://cdn.jsdelivr.net/npm/@agberohq/oja@latest/build/oja.core.esm.js';

const OJA_CDN = 'https://cdn.jsdelivr.net/npm/@agberohq/oja@latest/build/oja.core.esm.js';

// ─── Example registry — metadata only, HTML lives in examples/ ───────────────
// Each example is a directory with real files and a vfs.json manifest.
// loadExample() mounts the directory via VFS — no HTML in this file.

const EXAMPLES = [
    { name: 'Counter',          desc: 'state + effect',                        dir: 'starter'   },
    { name: 'Todo List',        desc: 'reactive array with add / remove',      dir: 'todo'      },
    { name: 'Router + Context', desc: 'multi-page SPA with shared state',      dir: 'router'    },
    { name: 'Guestbook',        desc: 'form.on + context + each()',            dir: 'guestbook' },
    { name: 'Channel Pipeline', desc: 'Go-style async pipeline',               dir: 'channel'   },
];

// Resolve example base URL relative to this file
function exampleBase(dir) {
    const base = new URL(`./examples/${dir}/`, import.meta.url).href;
    return base.endsWith('/') ? base : base + '/';
}

// ─── VFS — file persistence across sessions ───────────────────────────────────

let _vfs = null;

async function initVFS() {
    const { VFS } = await import('https://cdn.jsdelivr.net/npm/@agberohq/oja@latest/build/oja.core.esm.js');
    _vfs = new VFS('oja-playground');
    await _vfs.ready();

    const existing = await _vfs.ls('/');
    if (existing.length === 0) {
        // First load — seed with the starter example
        await _vfs.mount(exampleBase('starter'));
        const all = await _vfs.getAll();
        setFiles(all);
        addLog('info', 'Playground ready');
    } else {
        const all = await _vfs.getAll();
        setFiles(all);
        const firstPath = Object.keys(all).sort()[0];
        if (firstPath) { setActiveFile(firstPath); syncEditorContent(); }
        addLog('info', `Loaded ${existing.length} file${existing.length === 1 ? '' : 's'} from local storage`);
    }

    _vfs.onChange('/', async () => {
        const all = await _vfs.getAll();
        setFiles(all);
    });
}

function persistFile(path, content) {
    if (_vfs) _vfs.write(path, content);
}

// ─── App state ────────────────────────────────────────────────────────────────

const [files, setFiles]             = state({});
const [activeFile, setActiveFile]   = state('index.html');
const [openTabs, setOpenTabs]       = state([]);
const [consoleLogs, setConsoleLogs] = state([]);
const [consoleFilter, setFilter]    = state('all');
const [consolePaused, setPaused]    = state(false);
const [theme, setTheme]             = context('playground-theme', 'dark');

let editor      = null;
let updateTimer = null;
let blobUrls    = [];

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
        persistFile(path, editor.getValue());
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
    editor.setOption('mode',
        path.endsWith('.js')  ? 'javascript' :
            path.endsWith('.css') ? 'css'        : 'htmlmixed'
    );
    document.getElementById('fileType').textContent = path.split('.').pop().toUpperCase();
}

// ─── Effects — all UI driven by state ────────────────────────────────────────

effect(() => {
    const fileMap = files();
    const active  = activeFile();
    const list    = document.getElementById('fileTree');
    const paths   = Object.keys(fileMap).sort();

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

    document.getElementById('fileStats').textContent = `${paths.length} file${paths.length === 1 ? '' : 's'}`;
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
    if (_vfs) _vfs.rm(path);
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
    const body    = content || defaultContent(path);
    const updated = { ...files(), [path]: body };
    setFiles(updated);
    persistFile(path, body);
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
    Object.entries(files()).forEach(([path, content]) => {
        const mime = path.endsWith('.js') ? 'text/javascript' : path.endsWith('.css') ? 'text/css' : 'text/html';
        const blob = new Blob([content], { type: mime });
        const url  = URL.createObjectURL(blob);
        blobMap[path] = url;
        blobUrls.push(url);
    });

    let html = indexContent;

    html = html.replace(/(import\s+(?:[\w*{},\s]+from\s+)?['"])([^'"]+)(['"])/g, (m, pre, spec, post) => {
        if (spec.startsWith('http') || spec.startsWith('blob:')) return m;
        const resolved = spec.replace(/^\.\//, '');
        return blobMap[resolved] ? pre + blobMap[resolved] + post : m;
    });

    html = html.replace(/(src|href)=["']([^"']+)["']/g, (m, attr, val) => {
        if (val.startsWith('http') || val.startsWith('blob:') || val.startsWith('#') || val.startsWith('data:')) return m;
        return blobMap[val] ? `${attr}="${blobMap[val]}"` : m;
    });

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
    setConsoleLogs([...consoleLogs(), {
        id     : Date.now() + Math.random(),
        time   : new Date().toLocaleTimeString([], { hour12: false }),
        level,
        message: String(message),
    }].slice(-500));
}

window.addEventListener('message', (e) => {
    if (e.data?.type === 'console') addLog(e.data.level, e.data.args.join(' '));
});

// ─── Load example — mounts via VFS, no embedded HTML ─────────────────────────

async function loadExample(ex) {
    if (!_vfs) {
        addLog('warn', 'VFS not ready yet — try again in a moment');
        return;
    }

    // Clear current VFS namespace so example files don't mix with prior state
    await _vfs.clear();

    const base = exampleBase(ex.dir);
    const result = await _vfs.mount(base, { force: true });

    const all   = await _vfs.getAll();
    const paths = Object.keys(all).sort();

    setFiles(all);
    setOpenTabs(paths.slice(0, 4));
    setActiveFile(paths[0] || 'index.html');
    syncEditorContent();
    runPreview();
    addLog('info', `Loaded: ${ex.name} (${result.fetched.length} files)`);
}

// ─── Theme ────────────────────────────────────────────────────────────────────

function applyTheme(mode) {
    document.documentElement.setAttribute('data-theme', mode);
    setTheme(mode);
    if (editor) editor.setOption('theme', mode === 'dark' ? 'dracula' : 'default');
    localStorage.setItem('oja-playground-theme', mode);
    document.getElementById('themeToggleBtn').innerHTML = mode === 'dark' ? '<span>🌙</span>' : '<span>☀️</span>';
}

// ─── Panel resize ─────────────────────────────────────────────────────────────

function initPanelResize() {
    const sidebar     = document.querySelector('.sidebar');
    const editorPanel = document.querySelector('.editor-panel');
    const previewArea = document.querySelector('.preview-area');
    const mainSplit   = document.querySelector('.main-split');
    const bottomSplit = document.querySelector('.bottom-split');

    const sideHandle   = document.createElement('div');
    sideHandle.className = 'resize-handle resize-handle-x';
    mainSplit.insertBefore(sideHandle, editorPanel);

    const bottomHandle   = document.createElement('div');
    bottomHandle.className = 'resize-handle resize-handle-x';
    bottomSplit.insertBefore(bottomHandle, bottomSplit.children[1]);

    function makeDraggable(handleEl, targetEl) {
        handleEl.addEventListener('mousedown', (e) => {
            e.preventDefault();
            const startX    = e.clientX;
            const startSize = targetEl.offsetWidth;

            const onMove = (e) => {
                targetEl.style.width = Math.max(140, startSize + e.clientX - startX) + 'px';
                if (editor) editor.refresh();
            };
            const onUp = () => {
                document.removeEventListener('mousemove', onMove);
                document.removeEventListener('mouseup',   onUp);
            };
            document.addEventListener('mousemove', onMove);
            document.addEventListener('mouseup',   onUp);
        });
    }

    makeDraggable(sideHandle,   sidebar);
    makeDraggable(bottomHandle, previewArea);
}

// ─── Event wiring ─────────────────────────────────────────────────────────────

document.getElementById('runBtn').onclick = runPreview;

document.getElementById('themeToggleBtn').onclick = () => {
    applyTheme(theme() === 'dark' ? 'light' : 'dark');
};

document.getElementById('newFileBtn').onclick    = () => document.getElementById('newFileDialog').classList.add('open');
document.getElementById('addFileSidebar').onclick = () => document.getElementById('newFileDialog').classList.add('open');

const newDialog = document.getElementById('newFileDialog');
document.getElementById('cancelDialog').onclick  = () => newDialog.classList.remove('open');
document.getElementById('confirmDialog').onclick = () => {
    const name = document.getElementById('newFileName').value.trim();
    if (name) { createFile(name); newDialog.classList.remove('open'); document.getElementById('newFileName').value = ''; }
};
document.getElementById('newFileName').addEventListener('keydown', e => {
    if (e.key === 'Enter') document.getElementById('confirmDialog').click();
    if (e.key === 'Escape') newDialog.classList.remove('open');
});

const exDialog = document.getElementById('examplesDialog');
document.getElementById('examplesBtn').onclick = () => {
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

document.getElementById('clearConsoleBtn').onclick  = () => setConsoleLogs([]);
document.getElementById('pauseConsoleBtn').onclick  = () => {
    setPaused(!consolePaused());
    document.getElementById('pauseConsoleBtn').innerHTML = consolePaused() ? '▶' : '⏸';
};

document.querySelectorAll('.filter-chip').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-chip').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        setFilter(btn.dataset.level);
    });
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
        ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'": '&#39;' }[m])
    );
}

// ─── Boot ─────────────────────────────────────────────────────────────────────

function init() {
    const saved = localStorage.getItem('oja-playground-theme') || 'dark';
    applyTheme(saved);
    initEditor();
    initPanelResize();
    addLog('info', 'Welcome to Oja Playground! Ctrl+Enter to run · Ctrl+N for new file');
    initVFS()
        .then(() => runPreview())
        .catch(e => addLog('warn', 'VFS unavailable — files will not persist: ' + e.message));
}

init();