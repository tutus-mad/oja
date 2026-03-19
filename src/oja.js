/**
 * oja.js — core barrel entry point
 *
 * Single import for apps that want everything in core:
 *   import { Router, Out, auth, notify, debounce, keys, context } from '../oja/src/oja.js';
 *
 * Namespace import — dot-access without listing every export:
 *   import { Oja } from '../oja/src/oja.js';
 *   Oja.Router   Oja.Out   Oja.notify   Oja.state
 *
 * Individual imports for zero-build / tree-shaking:
 *   import { Router }          from '../oja/src/js/core/router.js';
 *   import { Out }             from '../oja/src/js/core/out.js';
 *   import { context }         from '../oja/src/js/core/reactive.js';
 *   import { keys, debounce }  from '../oja/src/js/core/events.js';
 *   import { Channel, go }     from '../oja/src/js/core/channel.js';
 *
 * For extensions (socket, wasm, worker, canvas, etc.) import from oja.full.js:
 *   import { OjaSocket, OjaWorker, OjaWasm } from '../oja/src/oja.full.js';
 *
 * Shorthand aliases baked into Out:
 *   Out.c()  → Out.component()
 *   Out.h()  → Out.html()
 *   Out.t()  → Out.text()
 */

// ─── Kernel ───────────────────────────────────────────────────────────────────
export { Store }                                          from './js/core/store.js';
export { state, effect, derived, batch, context }         from './js/core/reactive.js';
export { render, renderRaw, fill, each, template }        from './js/core/template.js';
export { OjaHistory, history }                            from './js/core/history.js';

// ─── The display primitive ────────────────────────────────────────────────────
// Out is the universal output type. Everywhere Oja produces visible content,
// the answer is an Out. Responder is kept as a backwards-compatible alias.
export { Out, OutBase, Responder }                        from './js/core/out.js';

// ─── Network ──────────────────────────────────────────────────────────────────
export { Api }                                            from './js/core/api.js';

// ─── Codecs ───────────────────────────────────────────────────────────────────
export { JsonCodec, jsonCodec }                           from './js/core/codecs/json.js';
export { MsgPackCodec }                                   from './js/core/codecs/msgpack.js';

// ─── UI ───────────────────────────────────────────────────────────────────────
export { Router }                                         from './js/core/router.js';
export { component }                                      from './js/core/component.js';
export { layout }                                         from './js/core/layout.js';
export { modal }                                          from './js/core/modal.js';
export { notify }                                         from './js/core/notify.js';
export { animate }                                        from './js/core/animate.js';

// ui namespace + all named DOM helpers
export {
    ui,
    find, findAll, findAllIn,
    createEl, empty, removeEl,
    afterEl, beforeEl, toggleEl,
    matches, closest,
}                                                         from './js/core/ui.js';

// ─── Forms + Validation ───────────────────────────────────────────────────────
export { form }                                           from './js/core/form.js';
export { validate }                                       from './js/core/validate.js';

// ─── Events ───────────────────────────────────────────────────────────────────
export {
    on, once, off, emit, listen, listenOnce, waitFor,
    debounce, throttle, rafThrottle,
    keys,
    onScroll, onScrollDirection, isInViewport, getViewportPosition,
    onVisible, onceVisible, unobserve, createVisibilityObserver,
    onResize, onMutation,
}                                                         from './js/core/events.js';

// ─── Auth ─────────────────────────────────────────────────────────────────────
export { auth }                                           from './js/core/auth.js';

// ─── Concurrency (core — Go-style concurrency is idiomatic Oja) ──────────────
export { Channel, go, pipeline, fanOut, fanIn,
    merge, split }                                        from './js/core/channel.js';

// ─── Plugin system ────────────────────────────────────────────────────────────
// Single entry point for all Oja extension mechanisms.
// Wraps: component.hooks, ui.widget.register, adapter.register,
//        router.Use, api hooks, auth hooks, codec registry, named renderers.
export { plugin }                                         from './js/core/plugin.js';

// ─── Dev tools ────────────────────────────────────────────────────────────────
export { logger }                                         from './js/core/logger.js';
export { debug }                                          from './js/core/debug.js';
export { adapter }                                        from './js/core/adapter.js';

// ─── Version ──────────────────────────────────────────────────────────────────
export const VERSION = '0.0.1';
export const OJA = {
    version:     VERSION,
    name:        'Oja Framework',
    description: 'Zero-boilerplate SPA framework',
};

// ─── Oja namespace ────────────────────────────────────────────────────────────
// Dot-access alternative to named destructuring. Useful when you want all of
// Oja available under a single import without listing every export.
//   import { Oja } from '../../build/oja.core.min.js';
//   Oja.state   Oja.Router   Oja.notify
import { Store }                                          from './js/core/store.js';
import { state, effect, derived, batch, context }         from './js/core/reactive.js';
import { render, renderRaw, fill, each, template }        from './js/core/template.js';
import { OjaHistory, history }                            from './js/core/history.js';
import { Out, OutBase, Responder }                        from './js/core/out.js';
import { Api }                                            from './js/core/api.js';
import { JsonCodec, jsonCodec }                           from './js/core/codecs/json.js';
import { MsgPackCodec }                                   from './js/core/codecs/msgpack.js';
import { Router }                                         from './js/core/router.js';
import { component }                                      from './js/core/component.js';
import { layout }                                         from './js/core/layout.js';
import { modal }                                          from './js/core/modal.js';
import { notify }                                         from './js/core/notify.js';
import { animate }                                        from './js/core/animate.js';
import {
    ui,
    find, findAll, findAllIn,
    createEl, empty, removeEl,
    afterEl, beforeEl, toggleEl,
    matches, closest,
}                                                         from './js/core/ui.js';
import { form }                                           from './js/core/form.js';
import { validate }                                       from './js/core/validate.js';
import {
    on, once, off, emit, listen, listenOnce, waitFor,
    debounce, throttle, rafThrottle,
    keys,
    onScroll, onScrollDirection, isInViewport, getViewportPosition,
    onVisible, onceVisible, unobserve, createVisibilityObserver,
    onResize, onMutation,
}                                                         from './js/core/events.js';
import { auth }                                           from './js/core/auth.js';
import { Channel, go, pipeline, fanOut, fanIn,
    merge, split }                                        from './js/core/channel.js';
import { plugin }                                         from './js/core/plugin.js';
import { logger }                                         from './js/core/logger.js';
import { debug }                                          from './js/core/debug.js';
import { adapter }                                        from './js/core/adapter.js';

export const Oja = {
    // Kernel
    Store,
    state, effect, derived, batch, context,
    render, renderRaw, fill, each, template,
    OjaHistory, history,
    // Display
    Out, OutBase, Responder,
    // Network
    Api,
    // Codecs
    JsonCodec, jsonCodec, MsgPackCodec,
    // UI
    Router,
    component,
    layout,
    modal,
    notify,
    animate,
    ui,
    find, findAll, findAllIn,
    createEl, empty, removeEl,
    afterEl, beforeEl, toggleEl,
    matches, closest,
    // Forms
    form,
    validate,
    // Events
    on, once, off, emit, listen, listenOnce, waitFor,
    debounce, throttle, rafThrottle,
    keys,
    onScroll, onScrollDirection, isInViewport, getViewportPosition,
    onVisible, onceVisible, unobserve, createVisibilityObserver,
    onResize, onMutation,
    // Auth
    auth,
    // Concurrency
    Channel, go, pipeline, fanOut, fanIn, merge, split,
    // Plugin
    plugin,
    // Dev tools
    logger, debug, adapter,
    // Version
    version: VERSION,
};