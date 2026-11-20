// BUNKER 404 — 부팅
'use strict';
window.addEventListener('error', ev => { console.error('[BUNKER404]', ev.message, ev.filename + ':' + ev.lineno); });
window.addEventListener('DOMContentLoaded', () => { UI.init(); });
