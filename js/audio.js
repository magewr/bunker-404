/* ============================================================================
 * BUNKER 404 — procedural audio engine (WebAudio only, zero samples)
 *
 *   Sound.init()                      idempotent; call on first user gesture
 *   Sound.play(name, {vol,pitch,pan}) one-shot SFX (unknown names are ignored)
 *   Sound.gun({power,kind,pitch,suppressed,pan})
 *   Sound.music('title'|'base'|'combat'|'boss'|'none')
 *   Sound.setVolume(kind, v) / Sound.getVolume(kind) / Sound.toggleMute()
 *   Sound.muted (getter)
 *
 * Nothing here ever throws; everything is a no-op until init() succeeds.
 * ========================================================================== */
(function (root) {
  'use strict';

  var AC = root.AudioContext || root.webkitAudioContext;
  var ctx = null, master = null, comp = null, sfxBus = null, musBus = null;
  var noiseBuf = null, distCurve = null;
  var vols = { master: 0.8, sfx: 0.9, music: 0.6 };
  var muted = false;
  var MAXV = 28;              // concurrent sfx voice cap
  var live = [];              // flat [start, end, start, end, ...] of sfx voices
  var lastAt = {};            // per-name throttle
  var KEY = 'b404_audio';
  var lastError = null;
  var has = Object.prototype.hasOwnProperty;

  function fail(e) { lastError = e; if (root.B404_AUDIO_DEBUG && root.console) root.console.warn('[Sound]', e); }
  function clamp01(v) { v = +v; return v !== v ? 0 : v < 0 ? 0 : v > 1 ? 1 : v; }
  function rnd(a, b) { return a + Math.random() * (b - a); }
  function hz(m) { return 440 * Math.pow(2, (m - 69) / 12); }
  function F(f) { return f < 8 ? 8 : f > 18000 ? 18000 : f; }   // keep freqs legal for exp ramps

  /* ---------------------------------------------------------------- persist */
  (function load() {
    try {
      var s = JSON.parse(root.localStorage.getItem(KEY) || 'null');
      if (s && typeof s === 'object') {
        ['master', 'sfx', 'music'].forEach(function (k) {
          if (typeof s[k] === 'number' && isFinite(s[k])) vols[k] = clamp01(s[k]);
        });
        muted = !!s.muted;
      }
    } catch (e) { /* private mode / file:// quirks — ignore */ }
  })();
  function save() {
    try {
      root.localStorage.setItem(KEY, JSON.stringify({ master: vols.master, sfx: vols.sfx, music: vols.music, muted: muted }));
    } catch (e) { /* ignore */ }
  }
  function gv(k) { var v = vols[k]; return v * v; }             // perceptual slider curve
  function applyVol() {
    if (!ctx) return;
    var t = ctx.currentTime;
    master.gain.setTargetAtTime(muted ? 0 : gv('master'), t, 0.02);
    sfxBus.gain.setTargetAtTime(gv('sfx'), t, 0.02);
    musBus.gain.setTargetAtTime(gv('music'), t, 0.02);
  }

  /* ------------------------------------------------------------------- init */
  function init() {
    if (ctx || !AC) return;
    var c = null;
    try {
      c = new AC();
      master = c.createGain();
      comp = c.createDynamicsCompressor();
      comp.threshold.value = -14; comp.knee.value = 10; comp.ratio.value = 4;
      comp.attack.value = 0.002; comp.release.value = 0.12;
      sfxBus = c.createGain(); musBus = c.createGain();
      sfxBus.connect(master); musBus.connect(master);
      master.connect(comp); comp.connect(c.destination);
      master.gain.value = muted ? 0 : gv('master');
      sfxBus.gain.value = gv('sfx'); musBus.gain.value = gv('music');
      var len = Math.floor(c.sampleRate * 2), i;
      noiseBuf = c.createBuffer(1, len, c.sampleRate);
      var d = noiseBuf.getChannelData(0);
      for (i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
      distCurve = new Float32Array(1024);
      for (i = 0; i < 1024; i++) { var x = i * 2 / 1023 - 1; distCurve[i] = Math.tanh(x * 6); }
      ctx = c;
    } catch (e) {
      fail(e); ctx = null;
      try { if (c && c.close) c.close(); } catch (e2) { /* ignore */ }
      return;
    }
    resume();
    if (mus.want && mus.want !== 'none') setMusic(mus.want);
  }
  function resume() {
    if (ctx && ctx.state === 'suspended' && ctx.resume) {
      try { var p = ctx.resume(); if (p && p.catch) p.catch(function () {}); } catch (e) { /* ignore */ }
    }
  }

  /* ------------------------------------------------------- sfx voice engine */
  // An "event" (E) is one play()/gun() call; it owns an optional panner and
  // carries the volume/pitch multipliers that every primitive applies.
  function mkEvent(key, o, prio) {
    var now = ctx.currentTime, la = lastAt[key], i, j = 0, n = 0;
    if (la !== undefined && now - la < 0.025) return null;          // same-name throttle
    for (i = 0; i < live.length; i += 2) {
      if (live[i + 1] > now) { live[j++] = live[i]; live[j++] = live[i + 1]; if (live[i] <= now + 0.03) n++; }
    }
    live.length = j;
    if (prio === 0 && n >= MAXV) return null;
    if (prio === 1 && n >= MAXV + 8) return null;                   // guns get a little headroom
    var vol = o && o.vol != null ? +o.vol : 1, pitch = o && o.pitch != null ? +o.pitch : 1, pan = o && o.pan ? +o.pan : 0;
    if (!(vol >= 0)) vol = 1;
    if (vol === 0) return null;
    if (vol > 3) vol = 3;
    if (!(pitch > 0)) pitch = 1;
    pitch = pitch < 0.25 ? 0.25 : pitch > 4 ? 4 : pitch;
    if (pan !== pan) pan = 0;
    pan = pan < -1 ? -1 : pan > 1 ? 1 : pan;
    lastAt[key] = now;
    var E = { t: now + 0.006, vol: vol, pitch: pitch, out: sfxBus, pan: null, n: 0 };
    if (pan && ctx.createStereoPanner) {
      var p = ctx.createStereoPanner();
      p.pan.value = pan; p.connect(sfxBus);
      E.out = p; E.pan = p;
    }
    return E;
  }
  function endEvent(E) { if (E.pan && E.n === 0) { try { E.pan.disconnect(); } catch (e) { /* ignore */ } E.pan = null; } }

  function fin(E, src, nodes, t0, t1) {
    live.push(t0, t1);
    E.n++;
    src.onended = function () {
      for (var i = 0; i < nodes.length; i++) { try { nodes[i].disconnect(); } catch (e) { /* ignore */ } }
      if (--E.n <= 0 && E.pan) { try { E.pan.disconnect(); } catch (e2) { /* ignore */ } E.pan = null; }
    };
  }
  function env(g, t0, d, v, a, s) {
    if (v < 0.0002) v = 0.0002;
    a = a == null ? 0.003 : a;
    if (a > d * 0.6) a = d * 0.6;
    g.setValueAtTime(0.0001, t0);
    g.linearRampToValueAtTime(v, t0 + a);
    if (s) { if (s > d - a - 0.01) s = Math.max(0, d - a - 0.01); g.setValueAtTime(v, t0 + a + s); }
    g.exponentialRampToValueAtTime(0.0001, t0 + d);
  }
  // optional filter: lp|bp|hp = start freq, lp2|bp2|hp2 = end freq, fs = [frac, freq, ...], q
  function addFilter(p, t0, d, k, nodes, last) {
    var f1 = p.lp || p.bp || p.hp;
    if (!f1) return last;
    var fl = ctx.createBiquadFilter(), fq = fl.frequency, i;
    fl.type = p.lp ? 'lowpass' : p.bp ? 'bandpass' : 'highpass';
    fq.setValueAtTime(F(f1 * k), t0);
    if (p.fs) { for (i = 0; i < p.fs.length; i += 2) fq.exponentialRampToValueAtTime(F(p.fs[i + 1] * k), t0 + p.fs[i] * d); }
    else { var f2 = p.lp2 || p.bp2 || p.hp2; if (f2) fq.exponentialRampToValueAtTime(F(f2 * k), t0 + d); }
    fl.Q.value = p.q || 0.8;
    last.connect(fl); nodes.push(fl);
    return fl;
  }
  // Tone: {w:wave, f, f2 | fp:[frac,freq,...], t, d, v, a, s:sustain sec, det, vib, vd, dist, +filter}
  function T(E, p) {
    var t0 = E.t + (p.t || 0), d = p.d || 0.1, k = E.pitch, i;
    var o = ctx.createOscillator(), g = ctx.createGain(), nodes = [o, g], last = o;
    o.type = p.w || 'sine';
    o.frequency.setValueAtTime(F(p.f * k), t0);
    if (p.fp) { for (i = 0; i < p.fp.length; i += 2) o.frequency.exponentialRampToValueAtTime(F(p.fp[i + 1] * k), t0 + p.fp[i] * d); }
    else if (p.f2) o.frequency.exponentialRampToValueAtTime(F(p.f2 * k), t0 + d);
    if (p.det) o.detune.value = p.det;
    if (p.vib) {
      var l = ctx.createOscillator(), lg = ctx.createGain();
      l.frequency.value = p.vib; lg.gain.value = p.vd || 10;
      l.connect(lg); lg.connect(o.frequency);
      l.start(t0); l.stop(t0 + d + 0.04);
      nodes.push(l, lg);
    }
    last = addFilter(p, t0, d, k, nodes, last);
    if (p.dist) { var ws = ctx.createWaveShaper(); ws.curve = distCurve; last.connect(ws); nodes.push(ws); last = ws; }
    last.connect(g); g.connect(E.out);
    env(g.gain, t0, d, (p.v == null ? 0.3 : p.v) * E.vol, p.a, p.s);
    o.start(t0); o.stop(t0 + d + 0.03);
    fin(E, o, nodes, t0, t0 + d);
  }
  // Noise: {t, d, v, a, s, rate, +filter}
  function N(E, p) {
    var t0 = E.t + (p.t || 0), d = p.d || 0.1;
    var s = ctx.createBufferSource(), g = ctx.createGain(), nodes = [s, g];
    s.buffer = noiseBuf; s.loop = true;
    if (p.rate) s.playbackRate.value = p.rate;
    var last = addFilter(p, t0, d, E.pitch, nodes, s);
    last.connect(g); g.connect(E.out);
    env(g.gain, t0, d, (p.v == null ? 0.3 : p.v) * E.vol, p.a, p.s);
    s.start(t0, Math.random() * 1.8); s.stop(t0 + d + 0.03);
    fin(E, s, nodes, t0, t0 + d);
  }

  /* ----------------------------------------------------------- sfx helpers */
  function bell(E, f, t, d, v) {
    T(E, { f: f, t: t, d: d, v: v });
    T(E, { f: f * 2.76, t: t, d: d * 0.5, v: v * 0.22 });
    T(E, { w: 'triangle', f: f * 2, t: t, d: d * 0.25, v: v * 0.15 });
  }
  function chord(E, notes, t, d, v, w, s) {
    for (var i = 0; i < notes.length; i++) T(E, { w: w || 'square', f: hz(notes[i]), t: t, d: d, v: v, lp: 3200, s: s || 0, a: 0.006 });
  }
  function clank(E, t, f, v) {
    N(E, { bp: 3200, q: 1.5, t: t, d: 0.05, v: v });
    T(E, { w: 'square', f: f, t: t, d: 0.11, v: v * 0.35, hp: 400 });
    T(E, { f: f * 2.41, t: t, d: 0.16, v: v * 0.3 });
    T(E, { f: f * 3.58, t: t, d: 0.09, v: v * 0.18 });
  }
  function rack(E, t, v) {                                         // slide "shk-chk"
    N(E, { bp: 1900, bp2: 1200, q: 1.6, t: t, d: 0.055, v: v });
    N(E, { bp: 2600, bp2: 3400, q: 2, t: t + 0.075, d: 0.04, v: v * 1.1 });
    T(E, { w: 'square', f: 230, f2: 160, t: t + 0.075, d: 0.03, v: v * 0.35 });
  }
  function growl(E, f, fp, d, fa, fb, v, vib) {                    // two moving formants + grit
    T(E, { w: 'sawtooth', f: f, fp: fp, d: d, v: v, bp: fa[0], bp2: fa[1], q: 4, dist: 1, a: 0.03, s: d * 0.5, vib: vib, vd: f * 0.12 });
    T(E, { w: 'sawtooth', f: f * 1.005, fp: fp, d: d, v: v * 0.6, bp: fb[0], bp2: fb[1], q: 5, dist: 1, a: 0.03, s: d * 0.45, vib: vib, vd: f * 0.12 });
    N(E, { bp: fa[0] * 1.5, q: 1, d: d * 0.9, v: v * 0.15, a: 0.04 });
  }
  function horn(E, t, d, f, v) {                                   // three detuned saws, clipped
    var r = [1, 1.26, 1.498];
    for (var i = 0; i < 3; i++) {
      T(E, { w: 'sawtooth', f: f * r[i] * 0.97, fp: [0.08, f * r[i], 0.85, f * r[i], 1, f * r[i] * 0.94], det: (i - 1) * 9,
        t: t, d: d, v: v, lp: 2600, q: 1.5, dist: 1, a: 0.008, s: d * 0.8 });
    }
  }

  /* ------------------------------------------------------------- sfx table */
  var S = {};

  // --- UI
  S.ui_click = function (E) { T(E, { w: 'square', f: 900, f2: 620, d: 0.045, v: 0.09, lp: 3500 }); N(E, { hp: 4000, d: 0.012, v: 0.07 }); };
  S.ui_hover = function (E) { T(E, { f: 1900, d: 0.018, v: 0.03 }); };
  S.ui_error = function (E) {
    T(E, { w: 'sawtooth', f: 150, d: 0.09, v: 0.16, lp: 900, s: 0.05 });
    T(E, { w: 'sawtooth', f: 120, t: 0.11, d: 0.14, v: 0.16, lp: 900, s: 0.08 });
  };
  S.ui_tab = function (E) { T(E, { w: 'triangle', f: 620, d: 0.04, v: 0.12 }); T(E, { w: 'triangle', f: 930, t: 0.045, d: 0.06, v: 0.12 }); };

  // --- economy / workshop
  S.buy = function (E) {
    N(E, { bp: 2200, q: 2, d: 0.03, v: 0.2 });
    T(E, { w: 'square', f: 220, f2: 150, d: 0.04, v: 0.1 });
    bell(E, 1568, 0.07, 0.35, 0.16); bell(E, 2093, 0.15, 0.5, 0.18);
    N(E, { hp: 7000, t: 0.15, d: 0.25, v: 0.04 });
  };
  S.sell = function (E) {
    var f = [2637, 2093, 3136, 2349];
    for (var i = 0; i < 4; i++) T(E, { f: f[i] * rnd(0.97, 1.03), t: i * 0.045, d: 0.12, v: 0.1 });
    T(E, { w: 'triangle', f: 180, f2: 110, t: 0.02, d: 0.08, v: 0.15 });
  };
  S.craft = function (E) { clank(E, 0, 520, 0.3); clank(E, 0.17, 560, 0.26); clank(E, 0.33, 640, 0.34); };
  S.equip = function (E) {
    N(E, { hp: 2500, d: 0.02, v: 0.22 }); T(E, { w: 'square', f: 340, d: 0.025, v: 0.1 });
    N(E, { bp: 1300, q: 2, t: 0.075, d: 0.04, v: 0.3 }); T(E, { w: 'triangle', f: 190, f2: 120, t: 0.075, d: 0.06, v: 0.22 });
  };
  S.unequip = function (E) {
    N(E, { bp: 1100, q: 2, d: 0.04, v: 0.26 }); T(E, { w: 'triangle', f: 170, f2: 110, d: 0.05, v: 0.18 });
    N(E, { hp: 3000, t: 0.07, d: 0.018, v: 0.16 }); T(E, { w: 'square', f: 260, t: 0.07, d: 0.02, v: 0.07 });
  };
  S.upgrade_ok = function (E) {
    var n = [84, 88, 91, 96];
    for (var i = 0; i < 4; i++) {
      T(E, { f: hz(n[i]), t: i * 0.055, d: 0.3, v: 0.13 });
      T(E, { w: 'triangle', f: hz(n[i] + 12), t: i * 0.055, d: 0.12, v: 0.04 });
    }
    N(E, { hp: 7000, t: 0.1, d: 0.35, v: 0.035, a: 0.05 });
  };
  S.upgrade_fail = function (E) {
    T(E, { w: 'sawtooth', f: 320, f2: 150, d: 0.28, v: 0.2, lp: 1200, lp2: 300, s: 0.1 });
    T(E, { w: 'sawtooth', f: 200, f2: 62, t: 0.26, d: 0.5, v: 0.22, lp: 900, lp2: 180, s: 0.2 });
    N(E, { lp: 400, t: 0.26, d: 0.12, v: 0.12 });
  };
  S.upgrade_great = function (E) {
    chord(E, [72, 76, 79], 0, 0.13, 0.055, 'square', 0.07);
    chord(E, [76, 79, 84], 0.15, 0.6, 0.06, 'square', 0.3);
    T(E, { w: 'triangle', f: hz(48), t: 0.15, d: 0.5, v: 0.2 });
    var n = [96, 100, 103, 108];
    for (var i = 0; i < 4; i++) T(E, { f: hz(n[i]), t: 0.22 + i * 0.06, d: 0.3, v: 0.07 });
    N(E, { hp: 7000, t: 0.15, d: 0.6, v: 0.04, a: 0.08 });
  };
  S.dismantle = function (E) {
    var i, t;
    for (i = 0; i < 6; i++) N(E, { bp: 2400 + i * 120, q: 3, t: i * 0.036, d: 0.016, v: 0.2 });
    for (i = 0; i < 4; i++) {
      t = 0.24 + i * rnd(0.035, 0.06);
      T(E, { f: rnd(900, 2600), t: t, d: 0.09, v: 0.1 }); N(E, { hp: 3000, t: t, d: 0.02, v: 0.12 });
    }
    N(E, { lp: 700, t: 0.24, d: 0.12, v: 0.22 });
  };
  S.coin = function (E) {
    T(E, { f: 2350, d: 0.16, v: 0.11 }); T(E, { f: 3530, d: 0.1, v: 0.06 });
    T(E, { f: 5280, d: 0.06, v: 0.03 }); N(E, { hp: 6000, d: 0.01, v: 0.06 });
  };
  S.pickup = function (E) { T(E, { f: 520, f2: 800, d: 0.09, v: 0.13 }); T(E, { w: 'triangle', f: 1040, f2: 1600, d: 0.06, v: 0.04 }); };

  // --- weapon handling
  S.reload_start = function (E) {
    N(E, { bp: 1800, q: 2.5, d: 0.03, v: 0.25 }); T(E, { w: 'triangle', f: 150, f2: 90, d: 0.07, v: 0.16 });
    N(E, { hp: 3500, t: 0.03, d: 0.09, v: 0.05, a: 0.02 });
  };
  S.reload_end = function (E) {
    N(E, { lp: 900, d: 0.05, v: 0.3 }); T(E, { f: 120, f2: 80, d: 0.07, v: 0.25 }); N(E, { hp: 2800, d: 0.015, v: 0.12 });
    rack(E, 0.13, 0.26);
  };
  S.dry = function (E) { N(E, { hp: 4500, d: 0.012, v: 0.14 }); T(E, { w: 'square', f: 1250, d: 0.012, v: 0.05 }); };
  S.jam = function (E) {
    N(E, { lp: 650, d: 0.07, v: 0.35 }); T(E, { w: 'square', f: 98, f2: 66, d: 0.1, v: 0.2, lp: 700 });
    T(E, { w: 'triangle', f: 415, det: 30, d: 0.07, v: 0.09 }); N(E, { hp: 3000, t: 0.05, d: 0.02, v: 0.1 });
  };
  S.jam_clear = function (E) { rack(E, 0, 0.24); rack(E, 0.17, 0.28); };
  S.pump = function (E) {
    N(E, { bp: 1500, bp2: 900, q: 1.4, d: 0.07, v: 0.32 }); T(E, { w: 'triangle', f: 140, f2: 95, d: 0.05, v: 0.14 });
    N(E, { bp: 1700, bp2: 2600, q: 1.6, t: 0.14, d: 0.055, v: 0.34 }); T(E, { w: 'triangle', f: 120, f2: 170, t: 0.14, d: 0.05, v: 0.16 });
  };
  S.bolt = function (E) {
    N(E, { hp: 3200, d: 0.015, v: 0.18 });
    N(E, { bp: 1700, bp2: 1100, q: 2, t: 0.05, d: 0.07, v: 0.24 });
    N(E, { bp: 1100, bp2: 1900, q: 2, t: 0.18, d: 0.07, v: 0.24 });
    N(E, { hp: 2600, t: 0.27, d: 0.02, v: 0.22 }); T(E, { w: 'triangle', f: 160, f2: 100, t: 0.27, d: 0.05, v: 0.16 });
  };
  S.charge = function (E) {
    T(E, { w: 'sawtooth', f: 180, f2: 1500, d: 0.52, v: 0.1, lp: 900, lp2: 4500, a: 0.05, s: 0.4 });
    T(E, { f: 360, f2: 3000, d: 0.52, v: 0.05, a: 0.1, s: 0.38 });
  };
  S.charge_full = function (E) { T(E, { f: 1760, d: 0.35, v: 0.14 }); T(E, { f: 2640, d: 0.25, v: 0.07 }); T(E, { w: 'triangle', f: 880, d: 0.1, v: 0.06 }); };
  S.turret_fire = function (E) { N(E, { bp: 2600, q: 1.2, d: 0.05, v: 0.2 }); T(E, { w: 'square', f: 720, f2: 300, d: 0.045, v: 0.08 }); };

  // --- impacts
  S.hit_flesh = function (E) {
    N(E, { lp: 650, lp2: 160, d: 0.075, v: 0.32 }); T(E, { f: 170, f2: 62, d: 0.08, v: 0.28 });
    N(E, { bp: 950, q: 4, t: 0.01, d: 0.04, v: 0.1 });
  };
  S.hit_armor = function (E) {
    T(E, { f: rnd(2200, 2700), f2: 1900, d: 0.13, v: 0.12 }); T(E, { w: 'triangle', f: rnd(3200, 3700), d: 0.07, v: 0.07 });
    N(E, { hp: 5000, d: 0.02, v: 0.16 });
    if (Math.random() < 0.3) T(E, { f: 2000, f2: 850, t: 0.02, d: 0.22, v: 0.05, a: 0.02 });   // ricochet whine
  };
  S.hit_head = function (E) {
    T(E, { f: 2637, d: 0.24, v: 0.17 }); T(E, { f: 3951, d: 0.16, v: 0.09 });
    T(E, { w: 'triangle', f: 1318, f2: 900, d: 0.04, v: 0.1 }); N(E, { hp: 6500, d: 0.012, v: 0.12 });
  };
  S.hit_shield = function (E) {
    T(E, { w: 'triangle', f: 310, d: 0.2, v: 0.2, lp: 1300 }); T(E, { w: 'square', f: 467, d: 0.14, v: 0.07, lp: 1300 });
    N(E, { lp: 850, d: 0.05, v: 0.22 });
  };
  S.kill = function (E) {
    T(E, { f: 420, f2: 85, d: 0.1, v: 0.28 }); N(E, { bp: 750, bp2: 280, q: 3, d: 0.11, v: 0.25 });
    N(E, { lp: 2000, t: 0.02, d: 0.05, v: 0.1 });
  };
  S.splat = function (E) {
    N(E, { lp: 1500, lp2: 180, d: 0.24, v: 0.38 }); T(E, { f: 230, f2: 48, d: 0.2, v: 0.32 });
    for (var i = 0; i < 4; i++) T(E, { f: rnd(450, 800), f2: rnd(200, 320), t: rnd(0.04, 0.22), d: 0.05, v: 0.07 });
    N(E, { bp: 600, q: 5, t: 0.03, d: 0.12, v: 0.14 });
  };
  S.explode = function (E) {
    N(E, { hp: 900, d: 0.035, v: 0.4 }); N(E, { lp: 3200, lp2: 70, d: 0.65, v: 0.6 });
    T(E, { f: 115, f2: 30, d: 0.5, v: 0.7 }); N(E, { lp: 220, t: 0.05, d: 0.7, v: 0.3, a: 0.05 });
  };
  S.explode_big = function (E) {
    N(E, { hp: 700, d: 0.05, v: 0.5 }); N(E, { lp: 4200, lp2: 50, d: 1.5, v: 0.7, s: 0.08 });
    T(E, { f: 85, f2: 22, d: 1.25, v: 0.85, s: 0.05 }); T(E, { w: 'triangle', f: 52, f2: 26, t: 0.1, d: 1.3, v: 0.4 });
    N(E, { lp: 240, t: 0.1, d: 1.8, v: 0.4, a: 0.15, s: 0.3 });
    for (var i = 0; i < 6; i++) N(E, { bp: rnd(1500, 4000), q: 3, t: rnd(0.35, 1.3), d: 0.04, v: 0.06 });   // debris
  };
  S.burn = function (E) { N(E, { bp: 500, fs: [0.4, 1900, 1, 380], q: 0.9, d: 0.42, v: 0.3, a: 0.07 }); N(E, { lp: 300, d: 0.3, v: 0.18, a: 0.05 }); };
  S.shock = function (E) {
    var fp = [], i;
    for (i = 1; i <= 7; i++) fp.push(i / 7, rnd(250, 1900));
    T(E, { w: 'square', f: 1500, fp: fp, d: 0.16, v: 0.1, hp: 500 });
    for (i = 0; i < 3; i++) N(E, { hp: 3500, t: i * 0.045 + rnd(0, 0.02), d: 0.025, v: 0.16 });
    T(E, { w: 'sawtooth', f: 98, d: 0.14, v: 0.08, lp: 600 });
  };
  S.freeze = function (E) {
    for (var i = 0; i < 7; i++) T(E, { f: rnd(3000, 6500), t: rnd(0, 0.26), d: rnd(0.03, 0.09), v: 0.06 });
    N(E, { hp: 7000, d: 0.3, v: 0.07, a: 0.03 }); T(E, { w: 'triangle', f: 2100, f2: 1500, d: 0.3, v: 0.05, a: 0.04 });
  };
  S.shatter = function (E) {
    N(E, { hp: 3500, d: 0.28, v: 0.3 }); N(E, { bp: 1800, q: 1, d: 0.06, v: 0.25 });
    for (var i = 0; i < 7; i++) T(E, { f: rnd(2400, 7200), t: rnd(0, 0.2), d: rnd(0.05, 0.16), v: 0.055 });
  };
  S.acid = function (E) {
    var i;
    for (i = 0; i < 6; i++) N(E, { hp: rnd(3800, 6000), t: i * 0.06 + rnd(0, 0.03), d: rnd(0.05, 0.11), v: 0.09, a: 0.01 });
    for (i = 0; i < 3; i++) T(E, { f: rnd(200, 380), f2: rnd(420, 650), t: rnd(0, 0.3), d: 0.05, v: 0.07 });
  };
  S.gate_hit = function (E) {
    N(E, { lp: 1300, lp2: 200, d: 0.26, v: 0.55 }); T(E, { f: 92, f2: 44, d: 0.32, v: 0.6 });
    T(E, { w: 'square', f: 223, d: 0.4, v: 0.06, lp: 1500 }); T(E, { w: 'triangle', f: 371, d: 0.33, v: 0.07 }); T(E, { f: 517, d: 0.25, v: 0.05 });
  };
  S.gate_break = function (E) {
    var i;
    N(E, { lp: 5200, lp2: 90, d: 1.0, v: 0.65, s: 0.06 }); T(E, { f: 100, f2: 26, d: 0.8, v: 0.7 });
    T(E, { w: 'square', f: 197, f2: 150, d: 0.7, v: 0.07, lp: 1400 }); T(E, { w: 'triangle', f: 333, f2: 250, d: 0.6, v: 0.08 });
    for (i = 0; i < 5; i++) N(E, { bp: rnd(1200, 3500), q: 3, t: rnd(0.15, 0.8), d: 0.05, v: 0.1 });
    for (i = 0; i < 6; i++) T(E, { w: 'square', f: i % 2 ? 660 : 880, t: 0.4 + i * 0.16, d: 0.15, v: 0.09, lp: 2600, s: 0.11 });   // alarm
  };

  // --- mutants
  S.spit = function (E) { T(E, { f: 950, f2: 240, d: 0.13, v: 0.16 }); N(E, { bp: 1600, bp2: 480, q: 5, d: 0.11, v: 0.22 }); };
  S.flyer_bomb = function (E) {
    T(E, { f: 1900, f2: 620, d: 0.36, v: 0.09, a: 0.03, s: 0.25 });
    N(E, { lp: 1400, lp2: 200, t: 0.36, d: 0.2, v: 0.32 }); T(E, { f: 210, f2: 55, t: 0.36, d: 0.16, v: 0.28 });
  };
  S.growl1 = function (E) { growl(E, 92, [0.3, 104, 1, 68], 0.36, [620, 420], [1050, 800], 0.3, 22); };
  S.growl2 = function (E) { growl(E, 135, [0.35, 172, 1, 92], 0.3, [850, 1250], [1900, 1500], 0.24, 30); };
  S.growl3 = function (E) { growl(E, 62, [0.5, 56, 1, 48], 0.5, [360, 300], [720, 560], 0.32, 26); };
  S.squeak = function (E) {
    T(E, { w: 'triangle', f: 2200, fp: [0.3, 3300, 1, 1800], d: 0.13, v: 0.13, vib: 45, vd: 160 });
    T(E, { w: 'square', f: 4400, fp: [0.3, 6600, 1, 3600], d: 0.1, v: 0.02 });
  };
  S.boss_roar = function (E) {
    growl(E, 82, [0.15, 96, 0.6, 70, 1, 50], 1.4, [480, 300], [950, 600], 0.42, 17);
    T(E, { w: 'sawtooth', f: 41, fp: [0.15, 48, 1, 26], d: 1.4, v: 0.3, lp: 300, dist: 1, a: 0.05, s: 0.7 });
    N(E, { lp: 1600, lp2: 500, d: 1.3, v: 0.16, a: 0.12, s: 0.5 });
  };
  S.boss_stomp = function (E) { T(E, { f: 72, f2: 27, d: 0.42, v: 0.85 }); N(E, { lp: 320, d: 0.14, v: 0.4 }); N(E, { lp: 1800, lp2: 300, d: 0.08, v: 0.15 }); };

  // --- announcements / flow
  S.wave_start = function (E) {
    T(E, { w: 'sawtooth', f: 290, fp: [0.55, 640, 1, 470], d: 1.55, v: 0.11, lp: 1900, a: 0.18, s: 1.0 });
    T(E, { w: 'sawtooth', f: 293, fp: [0.55, 646, 1, 474], d: 1.55, v: 0.11, lp: 1900, a: 0.18, s: 1.0 });
    T(E, { w: 'square', f: 145, fp: [0.55, 320, 1, 235], d: 1.55, v: 0.04, lp: 900, a: 0.2, s: 1.0 });
  };
  S.wave_clear = function (E) {
    var n = [79, 84, 88, 91];
    for (var i = 0; i < 4; i++) {
      T(E, { w: 'square', f: hz(n[i]), t: i * 0.09, d: 0.12, v: 0.07, lp: 3500, s: 0.06 });
      T(E, { w: 'triangle', f: hz(n[i] - 12), t: i * 0.09, d: 0.12, v: 0.08 });
    }
    chord(E, [84, 88, 91, 96], 0.38, 0.65, 0.06, 'square', 0.25);
    T(E, { w: 'triangle', f: hz(48), t: 0.38, d: 0.6, v: 0.2 });
  };
  S.day_start = function (E) {
    T(E, { w: 'sawtooth', f: 620, fp: [0.12, 1050, 0.3, 880, 0.5, 1280, 0.8, 1180, 1, 640], d: 0.6, v: 0.09, bp: 1500, q: 2, vib: 38, vd: 40, a: 0.02, s: 0.4 });
    T(E, { w: 'square', f: 1240, fp: [0.12, 2100, 0.3, 1760, 0.5, 2560, 0.8, 2360, 1, 1280], d: 0.6, v: 0.02, a: 0.02, s: 0.4 });
    var n = [72, 76, 79, 84];
    for (var i = 0; i < 4; i++) bell(E, hz(n[i]), 0.7 + i * 0.3, i === 3 ? 0.9 : 0.5, 0.14);
  };
  S.broadcast = function (E) {
    T(E, { f: 2850, f2: 3150, d: 0.16, v: 0.035, a: 0.05, s: 0.08 }); N(E, { hp: 3000, d: 0.03, v: 0.05 });
    var n = [76, 79, 84];
    for (var i = 0; i < 3; i++) bell(E, hz(n[i]), 0.2 + i * 0.22, i === 2 ? 0.7 : 0.4, 0.13);
  };
  S.levelup = function (E) {
    var n = [72, 76, 79, 84, 88];
    for (var i = 0; i < 5; i++) T(E, { w: 'square', f: hz(n[i]), t: i * 0.06, d: i === 4 ? 0.35 : 0.09, v: 0.07, lp: 4000, s: 0.04 });
    T(E, { f: hz(100), t: 0.3, d: 0.3, v: 0.05 });
  };
  S.defeat = function (E) {
    var n = [64, 62, 60, 59], c = [45, 57, 60, 64], i;
    for (i = 0; i < 4; i++) {
      T(E, { w: 'sawtooth', f: hz(n[i]), t: i * 0.3, d: 0.34, v: 0.11, lp: 1400, s: 0.22, a: 0.03 });
      T(E, { w: 'triangle', f: hz(n[i] - 12), t: i * 0.3, d: 0.34, v: 0.1, s: 0.2 });
    }
    for (i = 0; i < 4; i++) T(E, { w: 'sawtooth', f: hz(c[i]), f2: hz(c[i] - 1), t: 1.2, d: 1.6, v: 0.08, lp: 1100, lp2: 400, s: 0.5, a: 0.04, vib: 4.5, vd: 3 });
    N(E, { lp: 300, t: 1.2, d: 1.2, v: 0.1, a: 0.1 });
  };
  S.victory = function (E) {
    var m = [72, 0, 0.12, 72, 0.13, 0.12, 79, 0.26, 0.24, 76, 0.52, 0.12, 79, 0.65, 0.12, 84, 0.78, 0.8], i, last;
    for (i = 0; i < m.length; i += 3) {
      last = i === m.length - 3;
      T(E, { w: 'square', f: hz(m[i]), t: m[i + 1], d: m[i + 2] + 0.04, v: 0.08, lp: 3600, s: m[i + 2] * 0.6, vib: last ? 5.5 : 0, vd: 7 });
      T(E, { w: 'sawtooth', f: hz(m[i] - 12), t: m[i + 1], d: m[i + 2] + 0.04, v: 0.05, lp: 2200, s: m[i + 2] * 0.6 });
    }
    chord(E, [76, 79], 0.78, 0.84, 0.05, 'square', 0.45);
    T(E, { w: 'triangle', f: hz(48), d: 0.3, v: 0.2, s: 0.15 });
    T(E, { w: 'triangle', f: hz(43), t: 0.52, d: 0.25, v: 0.2, s: 0.12 });
    T(E, { w: 'triangle', f: hz(48), t: 0.78, d: 0.9, v: 0.24, s: 0.4 });
    N(E, { hp: 6000, t: 0.78, d: 0.5, v: 0.07 });
    var sp = [96, 100, 103, 108, 103, 108];
    for (i = 0; i < sp.length; i++) T(E, { f: hz(sp[i]), t: 0.9 + i * 0.09, d: 0.2, v: 0.035 });
  };

  // --- gacha
  S.gacha_roll = function (E) {
    var t = 0, i = 0;
    while (t < 0.82) {
      N(E, { bp: 2000 + i * 70, q: 4, t: t, d: 0.018, v: 0.18 });
      if (!(i & 1)) T(E, { w: 'square', f: 420 + i * 28, t: t, d: 0.02, v: 0.05 });
      t += 0.085 - Math.min(0.055, i * 0.006); i++;
    }
  };
  S.gacha_common = function (E) { N(E, { lp: 520, d: 0.09, v: 0.35 }); T(E, { w: 'triangle', f: 135, f2: 80, d: 0.13, v: 0.25 }); N(E, { hp: 2500, d: 0.015, v: 0.1 }); };
  S.gacha_rare = function (E) {
    var n = [84, 88, 91, 95, 96];
    for (var i = 0; i < 5; i++) {
      T(E, { w: 'triangle', f: hz(n[i]), t: i * 0.06, d: 0.3, v: 0.1 });
      T(E, { f: hz(n[i] + 12), t: i * 0.06, d: 0.18, v: 0.04 });
    }
    N(E, { hp: 7500, t: 0.1, d: 0.4, v: 0.04, a: 0.06 });
  };
  S.gacha_legend = function (E) {
    var n = [72, 76, 79, 84, 88, 91, 96, 100, 103, 108], c = [84, 88, 91, 96], i;
    T(E, { f: 70, f2: 30, d: 0.6, v: 0.5 }); N(E, { lp: 2500, lp2: 150, d: 0.4, v: 0.2 });
    chord(E, [60, 64, 67], 0, 0.2, 0.06, 'sawtooth', 0.1);
    for (i = 0; i < n.length; i++) {
      T(E, { w: 'square', f: hz(n[i]), t: 0.12 + i * 0.065, d: 0.16, v: 0.05, lp: 4500 });
      T(E, { f: hz(n[i]), t: 0.12 + i * 0.065, d: 0.3, v: 0.06 });
    }
    for (i = 0; i < 4; i++) T(E, { w: 'square', f: hz(c[i]), t: 0.8, d: 1.2, v: 0.055, lp: 3800, s: 0.5, vib: 5.5, vd: 6, a: 0.02 });
    T(E, { w: 'triangle', f: hz(48), t: 0.8, d: 1.2, v: 0.22, s: 0.4 });
    N(E, { hp: 7000, t: 0.3, d: 1.7, v: 0.05, a: 0.4, s: 0.5 });
    for (i = 0; i < 8; i++) T(E, { f: rnd(3000, 7000), t: 0.85 + i * 0.1 + rnd(0, 0.04), d: 0.14, v: 0.03 });
  };

  // --- memes & gimmicks
  S.microwave_ding = function (E) {
    N(E, { hp: 5000, d: 0.008, v: 0.08 });
    T(E, { f: 2093, d: 1.3, v: 0.2 }); T(E, { f: 2096, d: 1.1, v: 0.08 });
    T(E, { f: 2093 * 2.76, d: 0.5, v: 0.05 }); T(E, { f: 2093 * 5.4, d: 0.2, v: 0.02 });
  };
  S.duck = function (E) {
    T(E, { w: 'sawtooth', f: 520, fp: [0.35, 1250, 1, 760], d: 0.17, v: 0.16, bp: 1700, q: 2.5, a: 0.01, s: 0.08 });
    T(E, { w: 'square', f: 1040, fp: [0.35, 2500, 1, 1520], d: 0.15, v: 0.03 });
    T(E, { w: 'sawtooth', f: 700, f2: 430, t: 0.2, d: 0.12, v: 0.07, bp: 1300, q: 2.5, a: 0.02 });
  };
  S.bonk = function (E) {
    T(E, { f: 540, f2: 170, d: 0.13, v: 0.4 }); T(E, { w: 'triangle', f: 810, f2: 260, d: 0.08, v: 0.12 });
    N(E, { bp: 420, q: 8, d: 0.09, v: 0.3 }); N(E, { hp: 3000, d: 0.01, v: 0.1 });
  };
  S.sad_trombone = function (E) {
    var n = [62, 61, 60, 59], t = 0, i, d, f, last;
    for (i = 0; i < 4; i++) {
      last = i === 3; d = last ? 1.1 : 0.36; f = hz(n[i]);
      T(E, { w: 'sawtooth', f: f * 1.02, fp: last ? [0.1, f, 0.6, f * 0.985, 1, f * 0.9] : [0.15, f, 1, f * 0.985],
        t: t, d: d, v: 0.17, lp: 380, fs: [0.25, 1500, 1, 480], q: 3, a: 0.03, s: d * 0.6, vib: last ? 5.5 : 0, vd: 7 });
      t += 0.4;
    }
  };
  S.airhorn = function (E) { horn(E, 0, 0.13, 466, 0.075); horn(E, 0.17, 0.13, 466, 0.075); horn(E, 0.34, 0.7, 466, 0.08); };
  S.meme_boom = function (E) {
    var e = [0, 1, 0.13, 0.35, 0.29, 0.18, 0.5, 0.09];             // dry hit + fake reverb taps
    N(E, { lp: 900, d: 0.05, v: 0.3 });
    for (var i = 0; i < e.length; i += 2) {
      T(E, { f: 64, f2: 28, t: e[i], d: 1.2 - e[i], v: 0.85 * e[i + 1] });
      N(E, { lp: 160, t: e[i], d: 0.9 - e[i] * 0.5, v: 0.3 * e[i + 1], a: 0.02 });
    }
  };
  S.washer_done = function (E) {                                    // original 8-note "laundry's done" ditty
    var m = [84, 0.18, 88, 0.18, 91, 0.36, 88, 0.18, 86, 0.18, 83, 0.18, 86, 0.18, 84, 0.7], t = 0;
    for (var i = 0; i < m.length; i += 2) {
      T(E, { f: hz(m[i]), t: t, d: m[i + 1] + 0.25, v: 0.13, a: 0.005 });
      T(E, { w: 'triangle', f: hz(m[i] + 12), t: t, d: m[i + 1], v: 0.035 });
      T(E, { w: 'triangle', f: hz(m[i] - 12), t: t, d: m[i + 1] + 0.1, v: 0.05 });
      t += m[i + 1];
    }
  };
  S.recorder_squeak = function (E) {
    T(E, { w: 'triangle', f: 1090, fp: [0.18, 1110, 0.22, 2390, 0.6, 2330, 1, 2440], d: 0.38, v: 0.16, a: 0.02, s: 0.25, vib: 9, vd: 30 });
    T(E, { f: 2180, fp: [0.18, 2220, 0.22, 4780, 1, 4880], d: 0.38, v: 0.03, a: 0.02, s: 0.25 });
    N(E, { bp: 3200, q: 0.8, d: 0.36, v: 0.045, a: 0.02, s: 0.2 });
  };
  S.bark = function (E) {
    T(E, { w: 'sawtooth', f: 230, fp: [0.25, 360, 1, 130], d: 0.13, v: 0.3, bp: 750, bp2: 500, q: 2, dist: 1, a: 0.008, s: 0.04 });
    T(E, { w: 'sawtooth', f: 232, fp: [0.25, 364, 1, 132], d: 0.13, v: 0.16, bp: 1500, bp2: 1000, q: 3, dist: 1, a: 0.008, s: 0.04 });
    N(E, { lp: 1300, d: 0.06, v: 0.14 });
  };
  S.pet = function (E) { T(E, { f: 880, d: 0.07, v: 0.12 }); T(E, { f: 1320, t: 0.08, d: 0.11, v: 0.12 }); T(E, { w: 'triangle', f: 2640, t: 0.08, d: 0.05, v: 0.03 }); };
  S.combo = function (E) { T(E, { w: 'triangle', f: 660, f2: 990, d: 0.08, v: 0.14 }); T(E, { f: 1320, f2: 1980, d: 0.06, v: 0.05 }); };
  S.alarm = function (E) {
    T(E, { w: 'square', f: 440, d: 0.1, v: 0.09, lp: 1600, s: 0.07 });
    T(E, { w: 'square', f: 440, t: 0.16, d: 0.1, v: 0.09, lp: 1600, s: 0.07 });
  };
  S.sonic_wave = function (E) {
    T(E, { f: 190, f2: 44, d: 0.32, v: 0.5, a: 0.03 }); N(E, { bp: 320, bp2: 90, q: 1.2, d: 0.32, v: 0.3, a: 0.04 });
    T(E, { w: 'triangle', f: 380, f2: 88, d: 0.2, v: 0.08, a: 0.03 });
  };
  S.blackhole = function (E) {
    T(E, { w: 'sawtooth', f: 420, f2: 24, d: 1.05, v: 0.2, lp: 900, lp2: 90, a: 0.04, s: 0.3, vib: 11, vd: 14 });
    T(E, { f: 210, f2: 20, d: 1.05, v: 0.45, a: 0.04, s: 0.3 }); N(E, { lp: 700, lp2: 60, d: 1.0, v: 0.2, a: 0.1, s: 0.3 });
  };
  S.pop = function (E) { T(E, { f: rnd(820, 1050), f2: 300, d: 0.035, v: 0.22 }); N(E, { hp: 2200, d: 0.015, v: 0.14 }); };
  S.heal = function (E) {
    var n = [81, 85, 88, 93];
    for (var i = 0; i < 4; i++) {
      T(E, { f: hz(n[i]), t: i * 0.07, d: 0.42, v: 0.1, a: 0.02 });
      T(E, { w: 'triangle', f: hz(n[i] - 12), t: i * 0.07, d: 0.3, v: 0.04, a: 0.02 });
    }
  };
  S.whoosh = function (E) { N(E, { bp: 420, fs: [0.5, 2600, 1, 620], q: 1.1, d: 0.32, v: 0.3, a: 0.1 }); };
  S.thunder = function (E) {
    N(E, { hp: 900, d: 0.09, v: 0.45 }); N(E, { lp: 2500, lp2: 200, d: 0.5, v: 0.4 });
    N(E, { lp: 320, lp2: 60, t: 0.05, d: 2.2, v: 0.5, a: 0.1, s: 0.5 }); T(E, { f: 52, f2: 28, t: 0.05, d: 1.6, v: 0.4, a: 0.05, s: 0.3 });
    for (var i = 0; i < 4; i++) N(E, { lp: rnd(200, 420), t: rnd(0.3, 1.5), d: rnd(0.25, 0.5), v: 0.22, a: 0.04 });
  };

  // stingers that must never be dropped by the voice cap
  var PRIO = {};
  ('wave_start wave_clear day_start broadcast levelup defeat victory gacha_roll gacha_common gacha_rare gacha_legend ' +
   'boss_roar gate_break explode_big sad_trombone airhorn meme_boom washer_done microwave_ding recorder_squeak thunder ' +
   'upgrade_ok upgrade_fail upgrade_great buy craft').split(' ').forEach(function (n) { PRIO[n] = 1; });

  function play(name, opts) {
    if (!ctx || !has.call(S, name)) return;
    resume();
    var E = mkEvent(name, opts, PRIO[name] ? 2 : 0);
    if (!E) return;
    try { S[name](E); } finally { endEvent(E); }
  }

  /* ------------------------------------------------------------------ guns */
  var G = {};
  G.bullet = function (E, p, sup) {
    if (sup) {                                                      // "pfft"
      N(E, { bp: 950, bp2: 500, q: 1.1, d: 0.07 + 0.05 * p, v: 0.2 + 0.12 * p });
      N(E, { lp: 1600, lp2: 220, d: 0.09 + 0.08 * p, v: 0.14 + 0.1 * p });
      T(E, { f: 150 - 50 * p, f2: 55, d: 0.06 + 0.06 * p, v: 0.12 + 0.2 * p });
      return;
    }
    N(E, { hp: 2200 - 900 * p, d: 0.022 + 0.015 * p, v: 0.26 + 0.2 * p });                              // crack
    N(E, { lp: 5200 - 2400 * p, lp2: 320 - 170 * p, d: 0.09 + 0.3 * p, v: 0.3 + 0.32 * p });             // body
    T(E, { f: 185 - 75 * p, f2: 62 - 26 * p, d: 0.07 + 0.2 * p, v: 0.24 + 0.55 * p });                   // thump
    if (p > 0.55) N(E, { lp: 900, lp2: 110, t: 0.03, d: 0.45 + 0.5 * p, v: 0.1 + 0.12 * p, a: 0.03 });   // tail
    if (p > 0.85) T(E, { w: 'triangle', f: 58, f2: 24, d: 0.5, v: 0.4 });                                // cannon sub
  };
  G.shotgun = function (E, p, sup) {
    var m = sup ? 0.5 : 1;
    if (!sup) N(E, { hp: 1500, d: 0.03, v: 0.35 + 0.15 * p });
    N(E, { lp: (sup ? 1800 : 3800) - 1200 * p, lp2: 180, d: 0.24 + 0.22 * p, v: (0.42 + 0.25 * p) * m });
    N(E, { bp: 850, q: 0.8, d: 0.12 + 0.1 * p, v: (0.25 + 0.15 * p) * m });
    T(E, { f: 150 - 50 * p, f2: 42 - 12 * p, d: 0.16 + 0.2 * p, v: (0.45 + 0.4 * p) * m });
    if (p > 0.6 && !sup) N(E, { lp: 700, lp2: 100, t: 0.04, d: 0.7, v: 0.16, a: 0.04 });
  };
  G.nail = function (E, p) {
    N(E, { hp: 5200, d: 0.014, v: 0.2 + 0.1 * p });
    T(E, { w: 'square', f: 2500 - 600 * p, f2: 1200, d: 0.022, v: 0.07 + 0.05 * p });
    N(E, { bp: 3000, q: 1.5, t: 0.01, d: 0.05, v: 0.06 + 0.04 * p, a: 0.008 });                          // pneumatic "pss"
    if (p > 0.25) T(E, { f: 200, f2: 90, d: 0.04 + 0.05 * p, v: 0.25 * p });
  };
  G.energy = function (E, p) {                                      // pew
    var f = 2100 - 1100 * p, d = 0.11 + 0.16 * p;
    T(E, { w: 'sawtooth', f: f, f2: f * 0.14, d: d, v: 0.1 + 0.06 * p, lp: 5000, lp2: 900 });
    T(E, { w: 'square', f: f * 1.5, f2: f * 0.21, d: d * 0.8, v: 0.04 + 0.03 * p });
    N(E, { hp: 5000, d: 0.02, v: 0.08 });
    if (p > 0.5) T(E, { f: 130, f2: 45, d: 0.18 + 0.2 * p, v: 0.5 * p });
  };
  G.beam = function (E, p) {                                        // called ~30x/s — keep it tiny
    T(E, { w: 'sawtooth', f: 170 + 60 * p, d: 0.07, v: 0.028 + 0.02 * p, a: 0.015 });
    if (Math.random() < 0.34) T(E, { f: rnd(1700, 2600), d: 0.05, v: 0.012, a: 0.01 });
  };
  G.flame = function (E, p) { N(E, { bp: rnd(450, 800) + 300 * p, q: 0.7, d: 0.15, v: 0.06 + 0.04 * p, a: 0.04 }); };
  G.launcher = function (E, p) {                                    // hollow "thoomp"
    T(E, { f: 230 - 60 * p, f2: 68, d: 0.13 + 0.06 * p, v: 0.45 + 0.2 * p });
    N(E, { bp: 520, q: 3, d: 0.08, v: 0.3 });
    N(E, { lp: 1300, lp2: 280, d: 0.17 + 0.1 * p, v: 0.2 + 0.1 * p, a: 0.012 });
    N(E, { hp: 3000, d: 0.012, v: 0.1 });
  };
  G.arc = function (E, p) {
    var fp = [], i;
    for (i = 1; i <= 6; i++) fp.push(i / 6, rnd(300, 2400));
    T(E, { w: 'square', f: 1800, fp: fp, d: 0.13 + 0.08 * p, v: 0.07 + 0.04 * p, hp: 600 });
    for (i = 0; i < 3; i++) N(E, { hp: 3200, t: i * 0.035 + rnd(0, 0.015), d: 0.022, v: 0.14 + 0.08 * p });
    T(E, { w: 'sawtooth', f: 100, d: 0.12 + 0.1 * p, v: 0.06 + 0.1 * p, lp: 700 });
  };
  G.sonic = function (E, p) {                                       // brass blat
    var f = 196 - 50 * p, d = 0.2 + 0.14 * p;
    T(E, { w: 'sawtooth', f: f * 0.9, fp: [0.12, f, 1, f * 0.97], d: d, v: 0.13 + 0.05 * p, lp: 700, fs: [0.2, 2200, 1, 900], q: 2, dist: 1, a: 0.01, s: d * 0.6 });
    T(E, { w: 'sawtooth', f: f * 1.35, fp: [0.12, f * 1.5, 1, f * 1.46], d: d, v: 0.08 + 0.04 * p, lp: 700, fs: [0.2, 2400, 1, 1000], q: 2, dist: 1, a: 0.01, s: d * 0.6 });
    N(E, { bp: 400, q: 1, d: 0.1, v: 0.12, a: 0.01 });
  };
  G.saw = function (E, p) {                                         // metallic zing
    T(E, { w: 'sawtooth', f: 950, f2: 2700, d: 0.09, v: 0.1, bp: 3500, q: 5 });
    N(E, { hp: 5200, d: 0.11, v: 0.12 + 0.06 * p });
    T(E, { f: 4250, d: 0.17, v: 0.04 }); T(E, { f: 5730, d: 0.1, v: 0.025 });
    if (p > 0.4) T(E, { f: 170, f2: 80, d: 0.06, v: 0.3 * p });
  };
  G.can = function (E, p) {                                         // pop + fizz
    T(E, { f: 720, f2: 190, d: 0.045, v: 0.3 + 0.1 * p });
    N(E, { bp: 1200, q: 2, d: 0.03, v: 0.2 });
    N(E, { hp: 4500, t: 0.01, d: 0.26, v: 0.1, a: 0.01 });
    T(E, { f: 150, f2: 70, d: 0.06, v: 0.2 + 0.3 * p });
  };

  function gun(pr) {
    if (!ctx) return;
    pr = pr || {};
    var kind = has.call(G, pr.kind) ? pr.kind : 'bullet';
    var sup = !!pr.suppressed, base = +pr.pitch;
    if (!(base > 0)) base = 1;
    var vol = pr.vol != null ? +pr.vol : 1;
    if (sup && kind !== 'bullet' && kind !== 'shotgun') vol *= 0.6;
    resume();
    var E = mkEvent('gun:' + kind, { vol: vol, pitch: base * rnd(0.95, 1.05), pan: pr.pan }, 1);
    if (!E) return;
    try { G[kind](E, clamp01(pr.power == null ? 0.4 : pr.power), sup); } finally { endEvent(E); }
  }

  /* ----------------------------------------------------------------- music */
  var mus = { want: 'none', mode: 'none', tr: null, timer: null };
  var M = {};

  function mOsc(dest, w, f, t, d, v, a, f2, gd) {
    var o = ctx.createOscillator(), g = ctx.createGain();
    o.type = w;
    if (f2) { o.frequency.setValueAtTime(F(f), t); o.frequency.exponentialRampToValueAtTime(F(f2), t + (gd || d)); }
    else o.frequency.value = F(f);
    a = a || 0.005; if (a > d * 0.6) a = d * 0.6;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(v, t + a);
    g.gain.exponentialRampToValueAtTime(0.0001, t + d);
    o.connect(g); g.connect(dest);
    o.start(t); o.stop(t + d + 0.02);
    o.onended = function () { try { o.disconnect(); g.disconnect(); } catch (e) { /* ignore */ } };
  }
  function mNz(dest, t, d, v, a) {
    var s = ctx.createBufferSource(), g = ctx.createGain();
    s.buffer = noiseBuf; s.loop = true;
    a = a || 0.002; if (a > d * 0.6) a = d * 0.6;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(v, t + a);
    g.gain.exponentialRampToValueAtTime(0.0001, t + d);
    s.connect(g); g.connect(dest);
    s.start(t, Math.random() * 1.8); s.stop(t + d + 0.02);
    s.onended = function () { try { s.disconnect(); g.disconnect(); } catch (e) { /* ignore */ } };
  }
  function mFilter(tr, type, f, q, dest) {
    var fl = ctx.createBiquadFilter();
    fl.type = type; fl.frequency.value = f; fl.Q.value = q || 0.7;
    fl.connect(dest || tr.g); tr.nodes.push(fl);
    return fl;
  }
  function mGain(tr, v, dest) {
    var g = ctx.createGain();
    g.gain.value = v; g.connect(dest || tr.g); tr.nodes.push(g);
    return g;
  }
  function mDelay(tr, time, fb, wet) {                              // feedback echo send
    var inp = ctx.createGain(), d = ctx.createDelay(1.5), f = ctx.createGain(), w = ctx.createGain();
    d.delayTime.value = time; f.gain.value = fb; w.gain.value = wet;
    inp.connect(d); d.connect(f); f.connect(d); d.connect(w); w.connect(tr.g);
    tr.nodes.push(inp, d, f, w);
    return inp;
  }
  function mDrone(tr, w, f, v, dest) {
    var o = ctx.createOscillator(), g = ctx.createGain();
    o.type = w; o.frequency.value = f; g.gain.value = v;
    o.connect(g); g.connect(dest); o.start();
    tr.srcs.push(o); tr.nodes.push(o, g);
    return o;
  }
  function mLfo(tr, rate, depth, param) {
    var l = ctx.createOscillator(), lg = ctx.createGain();
    l.frequency.value = rate; lg.gain.value = depth;
    l.connect(lg); lg.connect(param); l.start();
    tr.srcs.push(l); tr.nodes.push(l, lg);
  }
  function mKick(tr, t, v, f) { mOsc(tr.g, 'sine', f || 150, t, 0.16, v, 0.002, 40, 0.07); }

  // ---- title: eerie A-minor drone, slow pad swells, sparse lonely melody
  var TITLE_SCALE = [57, 59, 60, 62, 64, 65, 67, 69, 72, 74, 76];
  var TITLE_PADS = [[45, 57, 60, 64], [41, 53, 57, 60], [38, 50, 53, 57], [40, 52, 56, 59]];
  M.title = {
    bpm: 60, vol: 0.9,
    setup: function (tr) {
      var lp = mFilter(tr, 'lowpass', 240, 1.2);
      mDrone(tr, 'sawtooth', 55, 0.16, lp); mDrone(tr, 'sawtooth', 55.35, 0.14, lp); mDrone(tr, 'sine', 82.4, 0.09, tr.g);
      mLfo(tr, 0.07, 90, lp.frequency);
      var wind = mFilter(tr, 'bandpass', 520, 1.4, mGain(tr, 0.05));
      var ns = ctx.createBufferSource(); ns.buffer = noiseBuf; ns.loop = true; ns.connect(wind); ns.start();
      tr.srcs.push(ns); tr.nodes.push(ns);
      mLfo(tr, 0.11, 260, wind.frequency);
      tr.lead = mFilter(tr, 'lowpass', 2200, 0.7);
      tr.lead.connect(mDelay(tr, 0.375, 0.42, 0.35));
      tr.note = 4; tr.pat = {};
    },
    step: function (tr, i, t) {
      var s = i % 16, bar = (i / 16) | 0, k, n, ch, f;
      if (s === 0) {
        if (bar % 2 === 0) {
          ch = TITLE_PADS[(bar / 2) % 4];
          for (k = 0; k < ch.length; k++) mOsc(tr.g, 'sine', hz(ch[k]), t, 8.5, k === 0 ? 0.07 : 0.035, 2.2);
        }
        tr.pat = {};
        if (Math.random() < 0.8) {
          n = 2 + ((Math.random() * 3) | 0);
          for (k = 0; k < n; k++) tr.pat[[0, 3, 6, 8, 10, 12, 14][(Math.random() * 7) | 0]] = 1;
        }
      }
      if (tr.pat[s]) {
        tr.note = Math.max(0, Math.min(TITLE_SCALE.length - 1, tr.note + ((Math.random() * 5) | 0) - 2));
        f = hz(TITLE_SCALE[tr.note] + 12);
        mOsc(tr.lead, 'triangle', f, t, 2.6, 0.085, 0.02);
        mOsc(tr.lead, 'sine', f * 2, t, 1.2, 0.02, 0.02);
      }
    }
  };

  // ---- base: swung, dusty ii–V–I–VI shuffle with walking bass and plucky call/response
  var BASE_ROOTS = [38, 43, 36, 45];
  var BASE_CHORDS = [[62, 65, 69, 72], [59, 62, 65, 67], [60, 64, 67, 71], [61, 64, 67, 69]];
  var BASE_TPL = [[0, 3, 6, 10], [2, 4, 7, 11, 14], [0, 6, 8, 14], [4, 7, 10, 12], [0, 2, 3, 8, 11]];
  function basePhrase() {
    var ph = [], a = BASE_TPL[(Math.random() * BASE_TPL.length) | 0], b = BASE_TPL[(Math.random() * BASE_TPL.length) | 0], bar, k, pos, m;
    for (bar = 0; bar < 4; bar++) {
      pos = bar % 2 === 0 ? a : b; m = {};
      for (k = 0; k < pos.length; k++) m[pos[k]] = (Math.random() * 6) | 0;
      ph.push(m);
    }
    if (Math.random() < 0.6) ph[2] = ph[0];                         // call & response
    return ph;
  }
  M.base = {
    bpm: 85, vol: 0.9, swing: 0.28,
    setup: function (tr) {
      tr.bass = mFilter(tr, 'lowpass', 520, 1);
      tr.lead = mFilter(tr, 'lowpass', 1900, 0.8);
      tr.hat = mFilter(tr, 'highpass', 6500, 0.7);
      tr.snr = mFilter(tr, 'bandpass', 1700, 0.9);
      tr.lead.connect(mDelay(tr, 60 / 85 * 0.75, 0.3, 0.25));
      tr.phr = null; tr.r7 = false; tr.r11 = false;
    },
    step: function (tr, i, t) {
      var s = i % 16, bar = ((i / 16) | 0) % 4, r = BASE_ROOTS[bar], ch = BASE_CHORDS[bar], k, bn = -1, idx, note;
      if (s === 0) {
        tr.r7 = Math.random() < 0.5; tr.r11 = Math.random() < 0.4;
        if (bar === 0 && (!tr.phr || Math.random() < 0.5)) tr.phr = basePhrase();
      }
      // drums
      if (s === 0 || s === 10 || (s === 7 && tr.r7)) mKick(tr, t, s === 7 ? 0.2 : 0.34, 120);
      if (s === 4 || s === 12) { mNz(tr.snr, t, 0.09, 0.16); mOsc(tr.g, 'triangle', 330, t, 0.04, 0.06, 0.002, 200); }
      if (s % 2 === 0) mNz(tr.hat, t, 0.035, s % 4 === 2 ? 0.06 : 0.035);
      else if (Math.random() < 0.35) mNz(tr.hat, t, 0.02, 0.02);
      if (bar === 3 && (s === 13 || s === 15)) mOsc(tr.g, 'sine', s === 13 ? 900 : 700, t, 0.05, 0.09, 0.002, 480);   // "tok-tok"
      // walking bass
      if (s === 0 || s === 3) bn = r;
      else if (s === 6) bn = r + 7;
      else if (s === 8) bn = r + 12;
      else if (s === 11 && tr.r11) bn = r + 10;
      else if (s === 14) bn = BASE_ROOTS[(bar + 1) % 4] + (Math.random() < 0.5 ? -1 : 1);
      if (bn >= 0) {
        mOsc(tr.bass, 'triangle', hz(bn), t, s === 0 ? 0.42 : 0.24, 0.3, 0.008);
        mOsc(tr.bass, 'sawtooth', hz(bn), t, 0.16, 0.07, 0.008);
      }
      // soft keys
      if (s === 0 || s === 9) for (k = 0; k < 4; k++) mOsc(tr.lead, 'sine', hz(ch[k]), t, s === 0 ? 0.9 : 0.4, 0.03, 0.01);
      // plucks
      idx = tr.phr ? tr.phr[bar][s] : undefined;
      if (idx !== undefined) {
        note = idx < 4 ? ch[idx] + 12 : idx === 4 ? ch[0] + 24 : ch[2] + 14;
        if (Math.random() < 0.13) mOsc(tr.lead, 'triangle', hz(note - 2), t, 0.36, 0.1, 0.004, hz(note), 0.07);   // cheeky slide
        else mOsc(tr.lead, 'triangle', hz(note), t, 0.32, 0.1, 0.004);
        mOsc(tr.lead, 'square', hz(note), t, 0.09, 0.016, 0.004);
      }
    }
  };

  // ---- combat: 130bpm E-minor pulse, four-on-the-floor, acid-ish bass ostinato
  var CB_PAT = [0, 0, 12, 0, 0, 12, 0, 7, 0, 0, 12, 0, 3, 0, 7, 10];
  var CB_HA = [76, 0, 0, 79, 0, 0, 81, 0, 83, 0, 0, 81, 0, 0, 79, 0];
  var CB_HB = [76, 0, 0, 74, 0, 0, 76, 0, 71, 0, 0, 0, 74, 0, 76, 0];
  var CB_ARP = [0, 1, 2, 3, 2, 1, 2, 3];
  M.combat = {
    bpm: 130, vol: 0.85,
    setup: function (tr) {
      tr.bass = mFilter(tr, 'lowpass', 500, 4);
      tr.lead = mFilter(tr, 'lowpass', 2600, 0.8);
      tr.hat = mFilter(tr, 'highpass', 7500, 0.7);
      tr.snr = mFilter(tr, 'bandpass', 1900, 0.8);
    },
    step: function (tr, i, t) {
      var s = i % 16, barAbs = (i / 16) | 0, bar = barAbs % 4, cyc = (barAbs / 4) | 0, sd = tr.sd;
      var r = (cyc % 2 === 0 ? [40, 40, 36, 38] : [40, 40, 45, 47])[bar];
      var q = (r === 36 || r === 38 || r === 47) ? [0, 4, 7, 12] : [0, 3, 7, 12];
      var bf = hz(r + CB_PAT[s]), hn;
      // drums
      if (s % 4 === 0 || (bar === 3 && s === 14)) { mKick(tr, t, 0.5, 155); mNz(tr.snr, t, 0.012, 0.05); }
      if (barAbs >= 2 && (s === 4 || s === 12)) { mNz(tr.snr, t, 0.13, 0.2); mOsc(tr.g, 'triangle', 200, t, 0.06, 0.1, 0.002, 140); }
      if (barAbs >= 1) {
        if (s % 4 === 2) mNz(tr.hat, t, 0.05, 0.075);
        else if (s % 2 === 1) mNz(tr.hat, t, 0.02, 0.028);
      }
      // bass ostinato through a per-step filter pluck
      tr.bass.frequency.setValueAtTime(1100, t);
      tr.bass.frequency.exponentialRampToValueAtTime(260, t + sd * 0.9);
      mOsc(tr.bass, 'sawtooth', bf, t, sd * 0.95, 0.2, 0.004);
      if (s % 4 === 0) mOsc(tr.g, 'sine', hz(r), t, sd * 1.8, 0.15, 0.005);
      // lead: hook on odd cycles, chord arps elsewhere
      if (cyc >= 1) {
        if (cyc % 2 === 1 && bar < 2) {
          hn = (bar === 0 ? CB_HA : CB_HB)[s];
          if (hn) { mOsc(tr.lead, 'square', hz(hn), t, sd * 2.6, 0.06, 0.005); mOsc(tr.lead, 'sawtooth', hz(hn - 12), t, sd * 2, 0.03, 0.005); }
        } else if (s % 2 === 0) {
          mOsc(tr.lead, 'square', hz(r + 36 + q[CB_ARP[s / 2]]), t, sd * 1.5, cyc % 2 === 1 ? 0.045 : 0.032, 0.004);
        }
      }
    }
  };

  // ---- boss: 156bpm gallop, distorted phrygian/tritone riff, alarm trills
  var BS_RIFF = [0, 0, 1, 0, 0, 6, 0, 5, 0, 0, 1, 0, 8, 7, 6, 1];
  M.boss = {
    bpm: 156, vol: 0.85,
    setup: function (tr) {
      var ws = ctx.createWaveShaper(); ws.curve = distCurve; ws.connect(mGain(tr, 0.2)); tr.nodes.push(ws);
      tr.bass = mFilter(tr, 'lowpass', 700, 3, ws);
      tr.lead = mFilter(tr, 'lowpass', 3000, 1);
      tr.hat = mFilter(tr, 'highpass', 7000, 0.7);
      tr.snr = mFilter(tr, 'bandpass', 1600, 0.7);
      var dl = mFilter(tr, 'lowpass', 300, 2);
      mDrone(tr, 'sawtooth', 82.41, 0.1, dl); mDrone(tr, 'sawtooth', 116.54, 0.05, dl);   // E + Bb: tritone bed
      mLfo(tr, 0.23, 110, dl.frequency);
    },
    step: function (tr, i, t) {
      var s = i % 16, barAbs = (i / 16) | 0, bar = barAbs % 4, cyc = (barAbs / 4) | 0, sd = tr.sd, k;
      var r = (cyc % 2 === 0 ? [40, 40, 43, 41] : [40, 40, 46, 45])[bar];
      var fill = bar === 3 && s >= 8, bf = hz(r + BS_RIFF[s]);
      // drums
      if (s === 0 || s === 3 || s === 6 || s === 8 || s === 11 || s === 14 || fill) { mKick(tr, t, 0.55, 170); mNz(tr.snr, t, 0.012, 0.07); }
      if (s === 4 || s === 12 || (fill && s % 2 === 1)) { mNz(tr.snr, t, 0.14, fill ? 0.14 : 0.24); mOsc(tr.g, 'triangle', 210, t, 0.07, 0.12, 0.002, 130); }
      mNz(tr.hat, t, s % 2 === 0 ? 0.03 : 0.018, s % 4 === 2 ? 0.07 : 0.03);
      if (bar === 0 && s === 0) mNz(tr.hat, t, 0.9, 0.09);          // crash
      // riff
      tr.bass.frequency.setValueAtTime(1500, t);
      tr.bass.frequency.exponentialRampToValueAtTime(320, t + sd * 0.9);
      mOsc(tr.bass, 'sawtooth', bf, t, sd * 0.95, 0.5, 0.003);
      mOsc(tr.bass, 'square', bf * 1.007, t, sd * 0.95, 0.3, 0.003);
      if (s % 4 === 0) mOsc(tr.g, 'sine', hz(r), t, sd * 1.6, 0.16, 0.004);
      // dissonant stabs, alarm trill, riff doubling
      if (s === 0 && bar % 2 === 0) { for (k = 0; k < 3; k++) mOsc(tr.lead, 'square', hz(r + [36, 42, 49][k]), t, 0.35, 0.045, 0.004); }
      if (bar === 3 && s < 8) mOsc(tr.lead, 'square', hz(r + 36 + (s % 2)), t, sd * 0.9, 0.05, 0.003);
      else if (cyc % 2 === 1 && bar < 3 && (s % 2 === 0 || BS_RIFF[s])) mOsc(tr.lead, 'sawtooth', hz(r + 24 + BS_RIFF[s]), t, sd * 0.9, 0.04, 0.003);
    }
  };

  function tick() {
    var tr = mus.tr;
    if (!ctx || !tr || ctx.state !== 'running') return;
    var now = ctx.currentTime, guard = 0, sw;
    if (tr.next < now - 0.05) tr.next = now + 0.05;                 // tab was throttled: skip ahead, no catch-up burst
    while (tr.next < now + 0.3 && guard++ < 32) {
      sw = tr.def.swing && (tr.i & 1) ? tr.def.swing * tr.sd : 0;
      try { tr.def.step(tr, tr.i, tr.next + sw); } catch (e) { fail(e); }
      tr.next += tr.sd; tr.i++;
    }
  }
  function killTrack(tr, now) {
    try {
      var g = tr.g.gain;
      g.cancelScheduledValues(now);
      g.setValueAtTime(Math.max(0.0001, g.value), now);
      g.linearRampToValueAtTime(0.0001, now + 1.0);
    } catch (e) { fail(e); }
    setTimeout(function () {
      var i;
      for (i = 0; i < tr.srcs.length; i++) { try { tr.srcs[i].stop(); } catch (e) { /* ignore */ } }
      for (i = 0; i < tr.nodes.length; i++) { try { tr.nodes[i].disconnect(); } catch (e2) { /* ignore */ } }
    }, 1300);
  }
  function setMusic(mode) {
    if (mode == null || mode === false) mode = 'none';
    if (mode !== 'none' && !has.call(M, mode)) return;
    mus.want = mode;
    if (!ctx) return;
    resume();
    if (mus.mode === mode) return;
    mus.mode = mode;
    var now = ctx.currentTime;
    if (mus.tr) { killTrack(mus.tr, now); mus.tr = null; }
    if (mode === 'none') { if (mus.timer) { clearInterval(mus.timer); mus.timer = null; } return; }
    var def = M[mode], g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, now);
    g.gain.linearRampToValueAtTime(def.vol, now + 1.0);
    g.connect(musBus);
    var tr = { def: def, g: g, i: 0, next: now + 0.1, sd: 60 / def.bpm / 4, nodes: [g], srcs: [] };
    try { def.setup(tr); } catch (e) { fail(e); }
    mus.tr = tr;
    if (!mus.timer) mus.timer = setInterval(tick, 100);
    tick();
  }

  /* ------------------------------------------------------------ public API */
  var Sound = {
    init: function () { try { init(); } catch (e) { fail(e); } },
    play: function (name, opts) { try { play(name, opts); } catch (e) { fail(e); } },
    gun: function (profile) { try { gun(profile); } catch (e) { fail(e); } },
    music: function (mode) { try { setMusic(mode); } catch (e) { fail(e); } },
    setVolume: function (kind, v) {
      try {
        if (!has.call(vols, kind)) return;
        vols[kind] = clamp01(v);
        applyVol(); save();
      } catch (e) { fail(e); }
    },
    getVolume: function (kind) { return has.call(vols, kind) ? vols[kind] : 0; },
    toggleMute: function () {
      muted = !muted;
      try { applyVol(); save(); } catch (e) { fail(e); }
      return muted;
    }
  };
  Object.defineProperty(Sound, 'muted', { enumerable: true, get: function () { return muted; } });
  Object.defineProperty(Sound, 'ready', { enumerable: true, get: function () { return !!ctx; } });
  Object.defineProperty(Sound, 'names', { get: function () { return Object.keys(S); } });
  Object.defineProperty(Sound, 'lastError', { get: function () { return lastError; } });

  // Browsers may suspend the context (autoplay policy, tab switches) — nudge it awake.
  try {
    if (root.document && root.document.addEventListener) {
      var wake = function () { if (ctx) resume(); };
      root.document.addEventListener('pointerdown', wake, true);
      root.document.addEventListener('keydown', wake, true);
      root.document.addEventListener('visibilitychange', function () { if (!root.document.hidden) wake(); });
    }
  } catch (e) { /* ignore */ }

  root.Sound = Sound;
})(typeof window !== 'undefined' ? window : this);
