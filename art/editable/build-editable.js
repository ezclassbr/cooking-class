// Gera flyer-ingredientes-editavel.pptx (objetos nativos: textos, formas e fotos separados)
// a partir do layout de ../flyer-ingredientes.html.
const path = require('path');
const fs = require('fs');
const { chromium } = require('/opt/node-tools/node_modules/playwright');
const PptxGenJS = require('/tmp/pg/node_modules/pptxgenjs');
const ART = path.resolve(__dirname, '..');
const OUT = __dirname;
const PX = 1 / 96; // px -> inch
const S = 3;       // escala dos PNGs

(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  await page.goto('file://' + ART + '/flyer-ingredientes.html');
  await page.waitForTimeout(1500);

  // ---------- 1. medidas do DOM ----------
  const geo = await page.evaluate(() => {
    const c = (r) => ({ cx: r.x + r.width / 2, cy: r.y + r.height / 2 });
    const one = (el, rot = 0) => {
      const r = el.getBoundingClientRect();
      return { ...c(r), w: el.offsetWidth, h: el.offsetHeight, rot, x: r.x, y: r.y, rw: r.width, rh: r.height };
    };
    const q = (s) => document.querySelector(s);
    const items = (sel) => [...document.querySelectorAll(sel + ' li')].map((li) => ({
      li: one(li), en: one(li.querySelector('.en')), pt: one(li.querySelector('.pt')),
      enT: li.querySelector('.en').textContent, ptT: li.querySelector('.pt').textContent }));
    // nós de texto da nota
    const note = q('.note');
    const rows = [...note.querySelectorAll('.row')].map((row) => {
      const parts = [];
      row.childNodes.forEach((n) => {
        if (n.nodeType === 3 && n.textContent.trim()) {
          const rg = document.createRange(); rg.selectNodeContents(n);
          const r = rg.getBoundingClientRect();
          parts.push({ t: 'text', text: n.textContent.trim(), ...c(r), w: r.width, h: r.height });
        } else if (n.nodeType === 1) {
          const r = n.getBoundingClientRect();
          if (n.tagName.toLowerCase() === 'svg') parts.push({ t: 'svg', html: n.outerHTML, ...c(r), w: n.clientWidth || 34, h: n.clientHeight || 34 });
          else parts.push({ t: 'text', text: n.textContent.trim(), ...c(r), w: r.width, h: r.height, sep: true });
        }
      });
      return { sm: row.classList.contains('sm'), parts };
    });
    return {
      b1: one(q('.tb.b1'), -3.5), b2: one(q('.tb.b2'), -3.5), recipe: one(q('.recipe'), 1.2),
      ing: one(q('#ing')), ute: one(q('#ute')),
      tabI: one(q('#ing .tab'), -2), tabU: one(q('#ute .tab'), -2),
      circle: one(q('.circle')), pola: one(q('.pola'), 4), tape: one(q('.tape'), -8),
      note: one(note, -1.6), logo: one(q('.logo')), gh: one(q('.gingham')), gh2: one(q('.gingham2')),
      ingItems: items('#ing'), uteItems: items('#ute'), rows,
    };
  });

  // ---------- 2. assets (PNG transparentes) ----------
  const shot = async (name, html, w, h) => {
    const p = await browser.newPage({ viewport: { width: Math.ceil(w), height: Math.ceil(h) }, deviceScaleFactor: S });
    const tmp = `${OUT}/assets/_tmp.html`;
    fs.writeFileSync(tmp, `<!doctype html><style>@import url('file://${ART}/fonts.css');*{margin:0;padding:0;box-sizing:border-box}html,body{background:transparent}
      .crinkle{position:relative}.crinkle::after{content:"";position:absolute;inset:0;mix-blend-mode:soft-light;opacity:.95;
      background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='600' height='600'><filter id='c' x='0' y='0' width='100%' height='100%'><feTurbulence type='fractalNoise' baseFrequency='.018 .026' numOctaves='5' seed='7' result='n'/><feDiffuseLighting in='n' lighting-color='%23ffffff' surfaceScale='5'><feDistantLight azimuth='235' elevation='48'/></feDiffuseLighting></filter><rect width='600' height='600' filter='url(%23c)'/></svg>");background-size:600px 600px}</style>${html}`);
    await p.goto('file://' + tmp);
    await p.waitForTimeout(700);
    await p.screenshot({ path: `${OUT}/assets/${name}.png`, omitBackground: true, clip: { x: 0, y: 0, width: w, height: h } });
    await p.close();
  };
  const tex = (name, o, color) => shot(name, `<div class="crinkle" style="width:${o.w}px;height:${o.h}px;background:${color}"></div>`, o.w, o.h);
  await tex('tex-orange-1', geo.b1, '#F27D16');
  await tex('tex-orange-2', geo.b2, '#F27D16');
  await tex('tex-orange-tab', geo.tabI, '#F27D16');
  await tex('tex-navy-recipe', geo.recipe, '#00275B');
  await tex('tex-navy-tab', geo.tabU, '#00275B');
  const g = (o, size) => `width:${o.w}px;height:${o.h}px;opacity:.85;background:conic-gradient(#77ABD9 25%,transparent 0 50%,#77ABD9 0 75%,transparent 0) 0 0/${size}px ${size}px`;
  await shot('gingham-blue', `<div style="${g(geo.gh, 84)}"></div>`, geo.gh.w, geo.gh.h);
  await shot('gingham-orange', `<div style="${g(geo.gh2, 56).replace('#77ABD9', '#F27D16').replace('#77ABD9', '#F27D16')};opacity:.9"></div>`, geo.gh2.w, geo.gh2.h);
  await shot('logo', `<div style="width:118px;height:134px;position:relative;overflow:hidden"><img src="file://${ART}/logo-ezclass-full.png" style="position:absolute;width:150px;left:-17px;top:-14px"></div>`, 118, 134);
  await shot('photo-circle', `<div style="width:300px;height:300px;overflow:hidden"><img src="file://${ART}/pie-whole.jpg" style="width:100%;height:100%;object-fit:cover;object-position:36% 60%;transform:scale(1.15)"></div>`, 300, 300);
  const pw = geo.pola.w - 24;
  await shot('photo-pola', `<div style="width:${pw}px;height:196px;overflow:hidden"><img src="file://${ART}/pie-open.webp" style="width:100%;height:196px;object-fit:cover;object-position:40% 62%"></div>`, pw, 196);
  for (const [i, r] of geo.rows.entries()) for (const [j, p] of r.parts.entries()) if (p.t === 'svg') {
    await shot(`icon-${i}-${j}`, `<div style="width:${p.w}px;height:${p.h}px">${p.html.replace('<svg', '<svg style="width:100%;height:100%;stroke:#00275B;fill:none;stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round"')}</div>`, p.w, p.h);
    p.file = `icon-${i}-${j}.png`;
  }
  await browser.close();
  fs.rmSync(`${OUT}/assets/_tmp.html`, { force: true });

  // ---------- 3. PPTX ----------
  const pptx = new PptxGenJS();
  pptx.defineLayout({ name: 'FLYER', width: 1080 * PX, height: 1920 * PX });
  pptx.layout = 'FLYER';
  pptx.title = 'EZ Class — Cooking Class: Ingredients and utensils';
  const s = pptx.addSlide();
  s.background = { color: 'EBF0F2' };
  const box = (o) => ({ x: (o.cx - o.w / 2) * PX, y: (o.cy - o.h / 2) * PX, w: o.w * PX, h: o.h * PX });
  const img = (file, o, extra = {}) => s.addImage({ path: `${OUT}/assets/${file}.png`, ...box(o), rotate: o.rot ? (o.rot + 360) % 360 : 0, ...extra });
  const pt = (px) => px * 0.75;
  const text = (txt, o, opt) => s.addText(txt, { ...box(o), margin: 0, rotate: o.rot ? (o.rot + 360) % 360 : 0, ...opt });
  const shadow = { type: 'outer', color: '00275B', opacity: 0.22, blur: 14, offset: 6, angle: 90 };

  img('gingham-blue', { ...geo.gh }); img('gingham-orange', { ...geo.gh2 });
  img('logo', geo.logo);

  img('tex-orange-1', geo.b1); img('tex-orange-2', geo.b2);
  const H = { fontFace: 'Poppins', bold: true, color: 'FFFFFF', align: 'center', valign: 'middle', charSpacing: -3 };
  text('COOKING', geo.b1, { ...H, fontSize: pt(118) });
  text('CLASS', geo.b2, { ...H, fontSize: pt(118) });

  img('tex-navy-recipe', geo.recipe);
  text([{ text: 'McDonald’s ', options: { color: 'EBF0F2' } }, { text: 'Apple Pie', options: { color: 'F2D541' } }], geo.recipe,
    { fontFace: 'Poppins', bold: true, fontSize: pt(62), align: 'center', valign: 'middle', charSpacing: -1.5 });

  const card = (o) => s.addShape(pptx.ShapeType.roundRect, { ...box(o), fill: { color: 'FFFFFF' }, line: { color: 'FFFFFF', width: 0 }, rectRadius: 0.25, shadow });
  const list = (items, dot) => items.forEach((it) => {
    s.addShape(pptx.ShapeType.roundRect, { x: it.li.x * PX, y: (it.li.y + 8) * PX, w: 22 * PX, h: 22 * PX, fill: { color: dot }, line: { color: dot, width: 0 }, rectRadius: 0.07 });
    s.addText('✓', { x: it.li.x * PX, y: (it.li.y + 8) * PX, w: 22 * PX, h: 22 * PX, margin: 0, align: 'center', valign: 'middle', fontFace: 'Arial', bold: true, fontSize: 13, color: 'FFFFFF' });
    s.addText(it.enT, { x: it.en.x * PX, y: it.en.y * PX, w: (it.en.w + 40) * PX, h: it.en.h * PX, margin: 0, valign: 'top', fontFace: 'Poppins', bold: true, fontSize: pt(30), color: '00275B', lineSpacing: pt(30 * 1.15), charSpacing: -0.3 });
    s.addText(it.ptT, { x: it.pt.x * PX, y: it.pt.y * PX, w: (it.pt.w + 40) * PX, h: it.pt.h * PX, margin: 0, valign: 'top', fontFace: 'Montserrat', fontSize: pt(22), color: '4E6A8F', lineSpacing: pt(22 * 1.25) });
  });
  card(geo.ing); card(geo.ute);
  list(geo.ingItems, 'F27D16'); list(geo.uteItems, '00275B');
  img('tex-orange-tab', geo.tabI); img('tex-navy-tab', geo.tabU);
  const T = { fontFace: 'Poppins', bold: true, color: 'FFFFFF', fontSize: pt(40), align: 'center', valign: 'middle', charSpacing: -0.5 };
  text('INGREDIENTS', geo.tabI, T); text('KITCHEN UTENSILS', geo.tabU, T);

  // fotos
  s.addShape(pptx.ShapeType.ellipse, { ...box({ ...geo.circle, w: geo.circle.w, h: geo.circle.h }), fill: { color: 'FFFFFF' }, line: { color: 'FFFFFF', width: 0 }, shadow });
  s.addImage({ path: `${OUT}/assets/photo-circle.png`, x: (geo.circle.cx - 140) * PX, y: (geo.circle.cy - 140) * PX, w: 280 * PX, h: 280 * PX, rounding: true });
  s.addShape(pptx.ShapeType.rect, { ...box(geo.pola), rotate: 4, fill: { color: 'FFFFFF' }, line: { color: 'FFFFFF', width: 0 }, shadow });
  // foto da polaroid: topo 12px, centro deslocado ao ângulo
  const a = 4 * Math.PI / 180, dy = (12 + 98) - geo.pola.h / 2;
  s.addImage({ path: `${OUT}/assets/photo-pola.png`, x: (geo.pola.cx - dy * Math.sin(a) - pw / 2) * PX, y: (geo.pola.cy + dy * Math.cos(a) - 98) * PX, w: pw * PX, h: 196 * PX, rotate: 4 });
  s.addShape(pptx.ShapeType.rect, { ...box(geo.tape), rotate: 352, fill: { color: 'F2D541', transparency: 15 }, line: { color: 'F2D541', width: 0 } });

  // nota amarela
  s.addShape(pptx.ShapeType.rect, { ...box(geo.note), rotate: 358.4, fill: { color: 'F4DD58' }, line: { color: 'F4DD58', width: 0 }, shadow });
  geo.rows.forEach((r, i) => r.parts.forEach((p) => {
    const o = { ...p, rot: -1.6 };
    if (p.t === 'svg') img(p.file.replace('.png', ''), o);
    else if (p.sep) text('|', o, { fontFace: 'Poppins', fontSize: pt(r.sm ? 28 : 40), color: '9A8A2E', align: 'center', valign: 'middle' });
    else text(p.text, { ...o, w: p.w + 40, cx: p.cx + 20 }, { fontFace: 'Poppins', bold: true, fontSize: pt(r.sm ? 28 : 40), color: '00275B', align: 'left', valign: 'middle', charSpacing: -0.8 });
  }));

  await pptx.writeFile({ fileName: `${OUT}/flyer-ingredientes-editavel.pptx` });
  console.log('ok');
})();
