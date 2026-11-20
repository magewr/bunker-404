// BUNKER 404 — 총기 그래픽 (간이판). gunart.js 가 없거나 실패할 때의 대비책.
// gunart.js 가 정상 로드되면 window.GunArt 를 덮어쓴다.
'use strict';
(function () {
  const PAL = { junk: ['#9a6a44', '#6a4428', '#3a2414'], mil: ['#5a6a48', '#3a4630', '#1e2618'], kitchen: ['#c4ccd0', '#8a9498', '#4a5458'], pipe: ['#6a9f98', '#467068', '#243c38'], office: ['#c8c0aa', '#98907a', '#58523f'], tech: ['#4a5868', '#2c3644', '#141a22'], bio: ['#d98aa8', '#9a5674', '#5a2c40'], music: ['#e6c458', '#a8862c', '#5e4a12'], meme: ['#ff7fbf', '#c44888', '#6e2048'], none: ['#8a8a8a', '#5a5a5a', '#2a2a2a'] };
  const pal = p => PAL[(p && p.tags && p.tags[0]) || 'none'] || PAL.none;
  const BIG = { minigun: 1, lmg: 1, flamer: 1, gl: 1, railcannon: 1, kimchi: 1, microwave: 1, vending: 1, tuba: 1, blackhole: 1, potato: 1, sawgun: 1, gauss: 1, heartgun: 1, tesla: 1 };
  const SMALL = { pipe_pistol: 1, revolver: 1, slingshot: 1, nailgun: 1, stapler: 1 };
  const BLEN = { barrel_short: 14, barrel_pvc: 26, barrel_rust: 26, barrel_long: 42, barrel_double: 28, barrel_hose: 32, barrel_heavy: 30, barrel_rifled: 38, barrel_trumpet: 28, barrel_bone: 28, barrel_gatling: 32, barrel_coil: 36, barrel_lamp: 110, barrel_gold: 30, barrel_recorder: 30, barrel_straw: 36 };
  const BTHICK = { barrel_heavy: 6, barrel_gatling: 8, barrel_double: 8, barrel_lamp: 5, barrel_straw: 2, barrel_hose: 5, barrel_coil: 6, barrel_trumpet: 4 };
  function layout(parts) {
    const rc = parts.receiver, big = BIG[rc], small = SMALL[rc];
    const L = { bx0: small ? -6 : -10, bx1: small ? 16 : big ? 28 : 24, by0: big ? -18 : -12, by1: -2 };
    L.blen = parts.barrel ? (BLEN[parts.barrel] || 24) : 4;
    L.bth = parts.barrel ? (BTHICK[parts.barrel] || 4) : 4;
    L.by = Math.round((L.by0 + L.by1) / 2) - (big ? 2 : 1);
    L.mlen = parts.muzzle ? 9 : 0;
    L.tip = L.bx1 + L.blen + L.mlen;
    L.sx = parts.stock ? L.bx0 - 20 : L.bx0;
    return L;
  }
  function r(g, x, y, w, h, c) { g.fillStyle = c; g.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); }
  function box(g, x, y, w, h, p) { r(g, x - 1, y - 1, w + 2, h + 2, p[2]); r(g, x, y, w, h, p[1]); r(g, x, y, w, Math.max(1, Math.round(h * 0.35)), p[0]); }
  function drawParts(g, parts, o) {
    const P = id => (typeof PARTS !== 'undefined' && PARTS[id]) || null;
    const L = layout(parts), t = o.t || 0;
    const rp = pal(P(parts.receiver));
    if (parts.stock) {
      const sp = pal(P(parts.stock)), id = parts.stock;
      if (id === 'stock_pillow') { box(g, L.bx0 - 20, -15, 18, 13, ['#ffffff', '#dcdcdc', '#8a8a8a']); r(g, L.bx0 - 12, -16, 3, 15, '#b0a070'); }
      else if (id === 'stock_brick') { box(g, L.bx0 - 20, -12, 19, 9, ['#c8553a', '#9a3a26', '#4a1810']); r(g, L.bx0 - 11, -12, 1, 9, '#e0b090'); }
      else { box(g, L.bx0 - 8, -10, 8, 5, sp); box(g, L.bx0 - 20, -11, 12, 9, sp); }
    }
    if (parts.barrel) {
      const bp = pal(P(parts.barrel)), id = parts.barrel, y = L.by - Math.floor(L.bth / 2);
      box(g, L.bx1, y, L.blen, L.bth, id === 'barrel_gold' ? ['#ffe27a', '#d9a520', '#6e4c08'] : bp);
      if (id === 'barrel_double' || id === 'barrel_gatling') r(g, L.bx1, L.by, L.blen, 1, bp[2]);
      if (id === 'barrel_coil') for (let i = 4; i < L.blen - 2; i += 6) r(g, L.bx1 + i, y - 2, 3, L.bth + 4, '#6fe0ff');
      if (id === 'barrel_recorder') for (let i = 6; i < L.blen - 2; i += 5) r(g, L.bx1 + i, y + 1, 2, 2, '#3a2414');
      if (id === 'barrel_lamp') { box(g, L.bx1 + L.blen - 14, y - 9, 14, 5, bp); r(g, L.bx1 + L.blen - 12, y - 4, 10, 2, '#fff3a0'); }
      if (id === 'barrel_trumpet') { box(g, L.bx1 + L.blen - 6, y - 3, 6, L.bth + 6, bp); }
    } else r(g, L.bx1, L.by - 2, 4, 4, rp[2]);
    const mx = L.bx1 + L.blen;
    if (parts.muzzle) {
      const mp = pal(P(parts.muzzle)), id = parts.muzzle;
      if (id === 'muz_funnel' || id === 'muz_megaphone' || id === 'muz_shower') { box(g, mx, L.by - 3, 4, 6, mp); box(g, mx + 4, L.by - 6, 5, 12, mp); }
      else if (id === 'muz_fork') { r(g, mx, L.by - 3, 10, 1, '#d0d6da'); r(g, mx, L.by, 10, 1, '#d0d6da'); r(g, mx, L.by + 3, 10, 1, '#d0d6da'); r(g, mx, L.by - 3, 2, 7, '#a0a6aa'); }
      else box(g, mx, L.by - 3, 9, 6, mp);
    }
    // 몸통
    box(g, L.bx0, L.by0, L.bx1 - L.bx0, L.by1 - L.by0, rp);
    box(g, 0, -2, 6, 11, rp);
    r(g, 7, -2, 6, 1, rp[2]); r(g, 12, -2, 1, 5, rp[2]);
    if (parts.receiver === 'heartgun') r(g, L.bx0 + 4, L.by0 + 3, 10 + Math.round(Math.sin(t * 6) * 2), 6, '#ff5a7a');
    if (parts.receiver === 'microwave') { r(g, L.bx0 + 3, L.by0 + 3, 16, 9, '#1a1a1a'); r(g, L.bx0 + 5, L.by0 + 5, 12, 5, '#ffb347'); }
    if (parts.receiver === 'vending') { for (let i = 0; i < 3; i++) r(g, L.bx0 + 4 + i * 7, L.by0 + 3, 5, 6, ['#ff5050', '#50a0ff', '#7bd94a'][i]); }
    if (parts.receiver === 'blackhole') { r(g, L.bx1 - 12, L.by0 + 3, 9, 9, '#000'); r(g, L.bx1 - 10 + Math.round(Math.sin(t * 5) * 2), L.by0 + 5, 3, 3, '#c58bff'); }
    if (parts.receiver === 'keyboard') for (let i = 0; i < 6; i++) r(g, L.bx0 + 3 + i * 5, L.by0 + 2, 3, 3, '#f0ead8');
    if (o.charge > 0) r(g, L.bx1 - 6, L.by - 2, 4, 4, `rgba(127,233,255,${o.charge})`);
    if (parts.mag) {
      const mp = pal(P(parts.mag)), id = parts.mag;
      if (id === 'mag_drum' || id === 'mag_washer') { box(g, 9, -1, 15, 15, id === 'mag_washer' ? ['#ffffff', '#d8d8d8', '#707070'] : mp); r(g, 13, 3, 7, 7, id === 'mag_washer' ? '#6fb7ff' : mp[2]); }
      else if (id === 'mag_belt') { box(g, 10, -1, 10, 8, mp); for (let i = 0; i < 5; i++) r(g, 12 + i * 2, 8 + i, 2, 4, '#d9b84a'); }
      else box(g, 10, -1, 8, id === 'mag_ext' ? 18 : 13, mp);
    }
    if (parts.ammo) { const ap = pal(P(parts.ammo)); r(g, 11, 1, 6, 2, ap[0]); }
    if (parts.sight) {
      const sp = pal(P(parts.sight)), id = parts.sight, y = L.by0;
      if (id === 'sight_scope' || id === 'sight_sniper' || id === 'sight_tp' || id === 'sight_binoc' || id === 'sight_thermal') { const w = id === 'sight_sniper' ? 22 : 15; box(g, 2, y - 7, w, 5, id === 'sight_tp' ? ['#d9c8a0', '#b09a6a', '#5a4a2a'] : sp); r(g, 5, y - 2, 2, 2, sp[2]); r(g, w - 3, y - 2, 2, 2, sp[2]); r(g, w + 1, y - 6, 1, 3, '#7fe9ff'); }
      else { box(g, 6, y - 5, 6, 4, sp); r(g, 8, y - 4, 2, 2, id === 'sight_reddot' ? '#ff4040' : sp[0]); }
    }
    const acc = (id, x, y) => {
      if (!id) return;
      const ap = pal(P(id));
      if (id === 'acc_duck') { r(g, x, y - 5, 7, 5, '#ffe14a'); r(g, x + 4, y - 9, 5, 5, '#ffe14a'); r(g, x + 9, y - 7, 2, 2, '#ff8a3c'); r(g, x + 6, y - 8, 1, 1, '#000'); }
      else if (id === 'acc_rgb') { for (let i = 0; i < 8; i++) r(g, L.bx0 + 2 + i * 3, L.by1 - 2, 2, 2, `hsl(${(t * 200 + i * 45) % 360},100%,60%)`); }
      else if (id === 'acc_bipod') { r(g, x + 2, y, 2, 12, ap[2]); r(g, x + 6, y, 2, 12, ap[2]); }
      else box(g, x, y, 6, 6, ap);
    };
    acc(parts.acc1, L.bx1 + 3, L.by + 4);
    acc(parts.acc2, L.bx0 + 4, L.by0 - 1);
    if (o.flash > 0.05 && !(P(parts.muzzle) && P(parts.muzzle).suppressed)) {
      const f = o.flash, x = L.tip + 1, s = Math.round(4 + f * 8);
      r(g, x, L.by - s / 2, s * 1.4, s, '#ffb347'); r(g, x, L.by - s / 4, s, s / 2, '#fff3a0');
    }
    return L;
  }
  const mcache = {}, ucache = {};
  const Lite = {
    draw(ctx, parts, o) {
      o = o || {};
      ctx.save(); ctx.translate(o.x || 0, o.y || 0); ctx.scale(o.scale || 1, o.scale || 1); ctx.translate(-(o.recoil || 0), 0);
      try { drawParts(ctx, parts || {}, o); } catch (e) { /* noop */ }
      ctx.restore();
    },
    metrics(parts) {
      parts = parts || {};
      const key = SLOTS.map(s => parts[s.id] || '').join('|');
      if (mcache[key]) return mcache[key];
      const L = layout(parts);
      return (mcache[key] = { muzzleX: L.tip, muzzleY: L.by, minX: L.sx - 2, maxX: L.tip + 2, minY: L.by0 - 10, maxY: 16 });
    },
    iconURL(id) {
      if (ucache[id]) return ucache[id];
      try {
        const p = PARTS[id], c = document.createElement('canvas'); c.width = 56; c.height = 32;
        const g = c.getContext('2d'), parts = {};
        if (p.slot === 'receiver') parts.receiver = id; else { parts[p.slot === 'acc' ? 'acc1' : p.slot] = id; }
        g.save();
        if (p.slot === 'receiver') g.translate(22, 22);
        else if (p.slot === 'barrel') { g.translate(-22 + Math.max(0, 22 - (BLEN[id] || 24) / 2), 24); if ((BLEN[id] || 0) > 50) g.scale(0.45, 1); }
        else if (p.slot === 'stock') g.translate(40, 24); else if (p.slot === 'mag') g.translate(14, 10); else if (p.slot === 'sight') g.translate(18, 30);
        else if (p.slot === 'muzzle') g.translate(-6, 24); else if (p.slot === 'ammo') g.translate(14, 14); else g.translate(-6, 22);
        g.globalAlpha = 1;
        // 단독 아이콘: 몸통 없이 해당 파츠만
        const o = { t: 0 };
        if (p.slot === 'receiver') drawParts(g, parts, o);
        else {
          const real = drawParts;
          const ghost = Object.assign({}, parts);
          // 몸통을 그리지 않도록 클립
          g.beginPath();
          if (p.slot === 'barrel' || p.slot === 'muzzle') g.rect(24, -30, 200, 60);
          else if (p.slot === 'stock') g.rect(-40, -30, 29, 60);
          else if (p.slot === 'mag') g.rect(8, -2, 30, 30);
          else if (p.slot === 'sight') g.rect(0, -40, 40, 27);
          else if (p.slot === 'ammo') g.rect(10, 0, 8, 4);
          else g.rect(24, -6, 20, 26);
          g.clip();
          if (p.slot === 'ammo') { g.scale(3, 3); g.translate(-9, -1); }
          real(g, ghost, o);
        }
        g.restore();
        return (ucache[id] = c.toDataURL());
      } catch (e) { return 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=='; }
    },
    gunURL(parts, w, h) {
      try {
        const c = document.createElement('canvas'); c.width = w || 180; c.height = h || 80;
        const m = Lite.metrics(parts), g = c.getContext('2d');
        Lite.draw(g, parts, { x: c.width / 2 - (m.minX + m.maxX) / 2, y: c.height / 2 - (m.minY + m.maxY) / 2, scale: 1 });
        return c.toDataURL();
      } catch (e) { return ''; }
    },
  };
  window.GunArtLite = Lite;
  if (!window.GunArt) window.GunArt = Lite;
})();
