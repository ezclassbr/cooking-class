// Gera apple-pie-cooking-class.pptx (16:9, objetos nativos e editáveis).
const path = require('path'); const fs = require('fs');
const { chromium } = require('/opt/node-tools/node_modules/playwright');
const PptxGenJS = require('/tmp/pg/node_modules/pptxgenjs');
const { svg } = require('./pictos');
const ART = path.resolve(__dirname, '..'); const OUT = __dirname; const AS = OUT + '/assets';
const K = 1 / 144, pt = (px) => px * 0.5; // slide 1920x1080 px -> 13.333x7.5 in
const NAVY = '00275B', SKY = '77ABD9', MIST = 'EBF0F2', YEL = 'F2D541', ORG = 'F27D16';

const CRINKLE = `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='600' height='600'><filter id='c' x='0' y='0' width='100%' height='100%'><feTurbulence type='fractalNoise' baseFrequency='.018 .026' numOctaves='5' seed='7' result='n'/><feDiffuseLighting in='n' lighting-color='%23ffffff' surfaceScale='5'><feDistantLight azimuth='235' elevation='48'/></feDiffuseLighting></filter><rect width='600' height='600' filter='url(%23c)'/></svg>")`;

(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  let n = 0;
  const shot = async (name, html, w, h) => {
    const f = `${AS}/_t${n++}.html`;
    fs.writeFileSync(f, `<!doctype html><meta charset="utf-8"><style>*{margin:0;padding:0;box-sizing:border-box}html,body{background:transparent}
      .crinkle{position:relative}.crinkle::after{content:"";position:absolute;inset:0;mix-blend-mode:soft-light;opacity:.95;background-image:${CRINKLE};background-size:600px 600px}</style>${html}`);
    const p = await browser.newPage({ viewport: { width: Math.ceil(w), height: Math.ceil(h) }, deviceScaleFactor: 2 });
    await p.goto('file://' + f); await p.waitForTimeout(500);
    await p.screenshot({ path: `${AS}/${name}.png`, omitBackground: true, clip: { x: 0, y: 0, width: w, height: h } });
    await p.close(); fs.rmSync(f);
    return `${AS}/${name}.png`;
  };
  // medir texto com Poppins
  const mp = await browser.newPage();
  fs.writeFileSync(`${AS}/_m.html`, `<!doctype html><meta charset="utf-8"><style>@import url('file://${ART}/fonts.css');</style><body>x</body>`);
  await mp.goto('file://' + AS + '/_m.html'); await mp.waitForTimeout(800);
  const measure = (text, px, weight, em = 0, family = 'Poppins', italic = false) => mp.evaluate(async ([t, px, w, em, fam, it]) => {
    await document.fonts.load(`${it ? 'italic ' : ''}${w} ${px}px ${fam}`, t);
    const c = document.createElement('canvas').getContext('2d'); c.font = `${it ? 'italic ' : ''}${w} ${px}px ${fam}`;
    return c.measureText(t).width + em * px * t.length;
  }, [text, px, weight, em, family, italic]);

  const pptx = new PptxGenJS();
  pptx.defineLayout({ name: 'W', width: 1920 * K, height: 1080 * K }); pptx.layout = 'W';
  pptx.title = "Cooking Class — McDonald's Apple Pie"; pptx.author = 'EZ Class';
  const shadow = { type: 'outer', color: NAVY, opacity: 0.2, blur: 12, offset: 5, angle: 90 };

  // ---------- helpers ----------
  const rot = (a) => (a ? (a + 360) % 360 : 0);
  const box = (cx, cy, w, h) => ({ x: (cx - w / 2) * K, y: (cy - h / 2) * K, w: w * K, h: h * K });
  const boxTL = (x, y, w, h) => ({ x: x * K, y: y * K, w: w * K, h: h * K });
  const pic = (s, file, cx, cy, w, h, a = 0, extra = {}) => s.addImage({ path: file, ...box(cx, cy, w, h), rotate: rot(a), ...extra });
  const rectC = (s, cx, cy, w, h, fill, a = 0, o = {}) => s.addShape(o.shape || pptx.ShapeType.roundRect, { ...box(cx, cy, w, h), rotate: rot(a), fill: { color: fill, transparency: o.tr || 0 }, line: { color: fill, width: 0 }, rectRadius: o.r ?? 0.12, shadow: o.sh ? shadow : undefined });
  const txt = (s, t, cx, cy, w, h, a, opt) => s.addText(t, { ...box(cx, cy, w, h), rotate: rot(a), margin: 0, ...opt });

  const gingham = async (name, w, h, size, color, op) => shot(name, `<div style="width:${w}px;height:${h}px;opacity:${op};background:conic-gradient(${color} 25%,transparent 0 50%,${color} 0 75%,transparent 0) 0 0/${size}px ${size}px"></div>`, w, h);
  const ghBlue = await gingham('gh-blue', 440, 264, 88, '#77ABD9', .85);
  const ghOrg = await gingham('gh-org', 44, 420, 56, '#F27D16', .9);
  const logoColor = await shot('logo', `<div style="width:118px;height:134px;position:relative;overflow:hidden"><img src="file://${ART}/logo-ezclass-full.png" style="position:absolute;width:150px;left:-17px;top:-14px"></div>`, 118, 134);
  const logoWhite = await shot('logo-white', `<div style="width:110px;height:110px;position:relative;overflow:hidden"><img src="file://${ART}/logo-ezclass-vazado.png" style="position:absolute;width:158px;left:-24px;top:-54px;filter:brightness(0) invert(1)"></div>`, 110, 110);
  const texCache = {};
  const tex = async (w, h, color) => { const k = `${Math.round(w)}x${Math.round(h)}-${color}`; if (!texCache[k]) texCache[k] = await shot(`tex-${k}`, `<div class="crinkle" style="width:${w}px;height:${h}px;background:#${color}"></div>`, w, h); return texCache[k]; };
  const photoRect = (name, src, w, h, pos, zoom = 1, round = false, border = 0) => shot(name, `<div style="width:${w}px;height:${h}px;overflow:hidden;${round ? `border-radius:50%;border:${border}px solid #fff;` : ''}position:relative"><img src="file://${ART}/${src}" style="width:100%;height:100%;object-fit:cover;object-position:${pos};transform:scale(${zoom})"></div>`, w, h);
  const photos = {};
  const getPhoto = async (key, src, w, h, pos, zoom, round, border) => (photos[key] ||= await photoRect(key, src, w, h, pos, zoom, round, border));

  // etiqueta de papel amassado com texto
  const label = async (s, text, x, y, px, fill, a, o = {}) => {
    const w = (await measure(text, px, 800, -0.03)) + (o.padX ?? 64), h = px * 1.28;
    pic(s, await tex(w, h, fill), x + w / 2, y + h / 2, w, h, a);
    txt(s, text, x + w / 2, y + h / 2, w + 20, h, a, { fontFace: 'Poppins', bold: true, fontSize: pt(px), color: o.color || 'FFFFFF', align: 'center', valign: 'middle', charSpacing: -0.03 * pt(px) });
    return { w, h };
  };
  const polaroid = async (s, key, src, cx, cy, w, ph, a, pos, zoom = 1, pad = 20, bottom = 60) => {
    const iw = w - pad * 2, h = ph + pad + bottom;
    rectC(s, cx, cy, w, h, 'FFFFFF', a, { shape: pptx.ShapeType.rect, sh: true });
    const dy = (-h / 2 + pad + ph / 2), r = a * Math.PI / 180;
    pic(s, await getPhoto(key, src, iw, ph, pos, zoom, false), cx - dy * Math.sin(r), cy + dy * Math.cos(r), iw, ph, a);
    return h;
  };
  const tape = (s, cx, cy, a, color = YEL, w = 150) => rectC(s, cx, cy, w, 44, color, a, { shape: pptx.ShapeType.rect, tr: 15 });
  const chrome = async (s, { gh = 'br', title, white = false }) => {
    s.background = { color: white ? NAVY : MIST };
    if (gh === 'br') pic(s, ghBlue, 1920 - 220, 1080 - 132, 440, 264);
    if (gh === 'l') pic(s, ghOrg, 22, 640, 44, 420);
    pic(s, white ? logoWhite : logoColor, 1920 - 140, white ? 90 : 105, white ? 110 : 118, white ? 110 : 134);
    txt(s, 'Created by @ezclass_', 190, 1030, 320, 30, 0, { fontFace: 'Montserrat', fontSize: pt(20), color: white ? MIST : '4E6A8F', align: 'left', valign: 'middle' });
    if (title) await label(s, title, 90, 56, 96, ORG, -2);
  };
  const chip = (s, x, y, w, h, num, en, ptt, o = {}) => {
    rectC(s, x + w / 2, y + h / 2, w, h, 'FFFFFF', 0, { r: 0.16, sh: true });
    if (num != null) { rectC(s, x + 8 + h * .34, y + h / 2, h * .68, h * .68, ORG, 0, { r: 0.1 }); txt(s, String(num), x + 8 + h * .34, y + h / 2, h * .68, h * .68, 0, { fontFace: 'Poppins', bold: true, fontSize: pt(h * .36), color: 'FFFFFF', align: 'center', valign: 'middle' }); }
    const tx = x + (num != null ? h * .68 + 26 : 24);
    if (ptt) {
      txt(s, en, tx + (w - (tx - x) - 12) / 2, y + h * .36, w - (tx - x) - 12, h * .5, 0, { fontFace: 'Poppins', bold: true, fontSize: pt(o.enPx || 32), color: NAVY, align: 'left', valign: 'middle' });
      txt(s, ptt, tx + (w - (tx - x) - 12) / 2, y + h * .74, w - (tx - x) - 12, h * .36, 0, { fontFace: 'Montserrat', fontSize: pt(o.ptPx || 21), color: '4E6A8F', align: 'left', valign: 'middle' });
    } else txt(s, en, tx + (w - (tx - x) - 12) / 2, y + h / 2, w - (tx - x) - 12, h, 0, { fontFace: 'Poppins', bold: true, fontSize: pt(o.enPx || 32), color: NAVY, align: 'left', valign: 'middle' });
  };
  const tile = async (s, x, y, size, num, key) => {
    rectC(s, x + size / 2, y + size / 2, size, size, 'FFFFFF', 0, { r: 0.18, sh: true });
    if (key) { const f = await shot(`pic-${key}`, svg(key).replace('width="120" height="120"', `width="${size * .72}" height="${size * .72}"`), size * .72, size * .72); pic(s, f, x + size / 2, y + size / 2 + 6, size * .72, size * .72); }
    rectC(s, x + 4, y + 4, 62, 62, ORG, 0, { r: 0.12 }); txt(s, String(num), x + 4, y + 4, 62, 62, 0, { fontFace: 'Poppins', bold: true, fontSize: pt(32), color: 'FFFFFF', align: 'center', valign: 'middle' });
  };
  const card = (s, x, y, w, h) => rectC(s, x + w / 2, y + h / 2, w, h, 'FFFFFF', 0, { r: 0.16, sh: true });

  // ====================== 1. CAPA ======================
  let s = pptx.addSlide();
  await chrome(s, { gh: 'br' });
  await polaroid(s, 'pw1', 'pie-whole.jpg', 520, 470, 880, 590, -3.2, '45% 55%', 1, 22, 64);
  tape(s, 190, 150, -35);
  await polaroid(s, 'po1', 'pie-open.webp', 760, 820, 540, 330, 4, '40% 62%', 1, 18, 56);
  tape(s, 1010, 650, 28, SKY, 120);
  const L = 1060;
  await label(s, 'COOKING', L, 150, 150, ORG, -3.5, { padX: 80 });
  await label(s, 'CLASS', L + 130, 330, 150, ORG, -3.5, { padX: 80 });
  const rw = (await measure("McDonald’s Apple Pie", 66, 800, -0.03)) + 90;
  pic(s, await tex(rw, 100, NAVY), L + rw / 2, 620, rw, 100, 1.2);
  txt(s, [{ text: 'McDonald’s ', options: { color: MIST } }, { text: 'Apple Pie', options: { color: YEL } }], L + rw / 2, 620, rw, 100, 1.2, { fontFace: 'Poppins', bold: true, fontSize: pt(66), align: 'center', valign: 'middle', charSpacing: -1 });
  rectC(s, L + 270, 790, 540, 150, 'F4DD58', -2, { shape: pptx.ShapeType.rect, sh: true });
  txt(s, 'Sweet Childhood Edition', L + 270, 790, 500, 120, -2, { fontFace: 'Poppins', bold: true, fontSize: pt(46), color: NAVY, align: 'center', valign: 'middle', charSpacing: -0.7 });
  s.addNotes('Capa da aula. Apresente o tema: celebração do Children’s Day e da nossa infância, preparando a receita McDonald’s Apple Pie na air fryer.');

  // ====================== 2. INGREDIENTS ======================
  const ING = [['dough', 'Thin pastel dough', 'Massa de pastel fina'], ['apple', '1 apple', '1 maçã'], ['sugar', '½ cup sugar', 'meia xícara de açúcar'], ['cornstarch', '½ cup cornstarch', 'meia xícara de amido de milho'], ['lime', '1 lime', '1 limão taiti'], ['egg', '1 egg', '1 ovo'], ['cinnamon', '½ cup cinnamon powder', 'meia xícara de canela em pó'], ['water', '½ cup water', 'meia xícara de água']];
  s = pptx.addSlide(); await chrome(s, { gh: 'br', title: 'Ingredients' });
  for (let i = 0; i < 8; i++) await tile(s, 90 + (i % 4) * 278, 250 + Math.floor(i / 4) * 278, 250, i + 1, ING[i][0]);
  await polaroid(s, 'po2', 'pie-open.webp', 760, 905, 340, 200, -3, '40% 62%', 1, 16, 46);
  tape(s, 760, 800, 6, YEL, 110);
  ING.forEach((r, i) => chip(s, 1230, 232 + i * 92, 590, 80, i + 1, r[1], r[2], { enPx: 29, ptPx: 19 }));
  s.addNotes('Antes de iniciar a cooking class, confira os ingredientes com seus alunos. Peça que repitam os nomes em voz alta, praticando a pronúncia. Relacione cada número da imagem com o nome na lista à direita.');

  // ====================== 3. KITCHEN UTENSILS ======================
  const UT = [['board', 'Cutting board', 'Tábua de cortar'], ['spoon', 'Spoon', 'Colher'], ['knife', 'Knife', 'Faca'], ['plate', 'Plate', 'Prato'], ['bowls', '2 small bowls', '2 tigelas pequenas (que possam ir ao micro-ondas)'], ['fork', 'Fork', 'Garfo'], ['brush', 'Pastry brush', 'Pincel de cozinha'], ['airfryer', 'Air fryer', 'Air fryer'], ['squeezer', 'Lemon squeezer', 'Espremedor de limão'], ['microwave', 'Microwave', 'Micro-ondas'], ['mitt', 'Oven mitt', 'Luva térmica de cozinha']];
  s = pptx.addSlide(); await chrome(s, { gh: 'l', title: 'Kitchen utensils' });
  UT.forEach((r, i) => chip(s, 90, 224 + i * 70, 640, 62, i + 1, r[1], null, { enPx: 28 }));
  for (let i = 0; i < 11; i++) await tile(s, 800 + (i % 4) * 258, 232 + Math.floor(i / 4) * 258, 232, i + 1, UT[i][0]);
  pic(s, await getPhoto('pc3', 'pie-whole.jpg', 232, 232, '40% 55%', 1.1, true, 8), 800 + 3 * 258 + 116, 232 + 2 * 258 + 116, 232, 232);
  s.addNotes('Agora é hora de apresentar os utensílios de cozinha que serão utilizados. Siga o mesmo procedimento dos ingredientes: peça que os alunos repitam os nomes em voz alta, praticando a pronúncia, e relacione cada número da imagem com o nome na lista à esquerda.');

  // ====================== 4. RECIPE VOCAB ======================
  s = pptx.addSlide(); await chrome(s, { gh: 'br', title: 'Recipe vocab' });
  const ACT = [['Cook', 'Cozinhar'], ['Let cool', 'Esfriar'], ['Cut', 'Cortar'], ['Fill', 'Rechear'], ['Fold', 'Dobrar'], ['Seal', 'Fechar'], ['Brush', 'Pincelar'], ['Sprinkle', 'Polvilhar'], ['Bake', 'Assar']];
  card(s, 90, 232, 1090, 410); await label(s, 'ACTIONS', 124, 202, 38, ORG, -2, { padX: 44 });
  ACT.forEach((r, i) => chip(s, 124 + (i % 3) * 342, 292 + Math.floor(i / 3) * 112, 322, 98, null, r[0], r[1], { enPx: 32, ptPx: 21 }));
  card(s, 90, 700, 520, 320); await label(s, 'NOUNS', 124, 670, 38, NAVY, -2, { padX: 44 });
  [['Filling', 'Recheio'], ['Edges', 'Bordas'], ['Cuts', 'Cortes']].forEach((r, i) => chip(s, 124, 736 + i * 88, 452, 78, null, r[0], r[1], { enPx: 30, ptPx: 20 }));
  card(s, 660, 700, 520, 320); await label(s, 'ADJECTIVES', 694, 670, 38, SKY, -2, { padX: 44, color: NAVY });
  [['Thick', 'Denso'], ['Cold', 'Frio'], ['Golden', 'Dourado'], ['Crispy', 'Crocante']].forEach((r, i) => chip(s, 694 + (i % 2) * 226, 736 + Math.floor(i / 2) * 120, 214, 106, null, r[0], r[1], { enPx: 27, ptPx: 19 }));
  pic(s, await getPhoto('pc4', 'pie-whole.jpg', 440, 440, '36% 60%', 1.15, true, 10), 1560, 420, 440, 440);
  await polaroid(s, 'po4', 'pie-open.webp', 1530, 830, 460, 280, 4, '40% 62%', 1, 18, 52);
  tape(s, 1500, 700, -8, YEL, 110);
  s.addNotes('Apresente os principais vocabulários que serão utilizados ao longo da receita: ações (actions), substantivos (nouns) e adjetivos (adjectives). Peça que os alunos repitam os termos em voz alta, praticando a pronúncia, e incentive-os a dar exemplos usando as palavras.');

  // ====================== 5. LET'S START ======================
  s = pptx.addSlide(); await chrome(s, { white: true, gh: 'br' });
  await polaroid(s, 'pw5', 'pie-whole.jpg', 400, 520, 560, 380, -4, '45% 55%', 1, 18, 56);
  tape(s, 210, 300, -35);
  await polaroid(s, 'po5', 'pie-open.webp', 1530, 560, 520, 330, 4, '40% 62%', 1, 18, 56);
  tape(s, 1760, 380, 32, SKY, 120);
  const l1 = await label(s, 'Let’s Start', 960 - (((await measure('Let’s Start', 118, 800, -0.03)) + 80) / 2), 330, 118, ORG, -3);
  await label(s, 'Our RECIPE!', 960 - (((await measure('Our RECIPE!', 118, 800, -0.03)) + 80) / 2) + 20, 500, 118, YEL, -3, { color: NAVY });
  s.addNotes('Vamos começar a receita! Convide os alunos a preparar os ingredientes e utensílios à mesa antes de iniciar.');

  // ====================== 6 e 7. RECIPE STEPS ======================
  const steps = async (s, heading, list, startNum, rowH, fontPx) => {
    txt(s, heading, 90 + 480, 232, 960, 50, 0, { fontFace: 'Poppins', bold: true, fontSize: pt(36), color: NAVY, align: 'left', valign: 'middle', underline: { style: 'sng' } });
    const cardH = list.reduce((a, t) => a + t[1] * rowH, 0) + 60;
    card(s, 90, 286, 1170, cardH);
    let y = 316;
    list.forEach((t, i) => {
      const h = t[1] * rowH;
      rectC(s, 130 + 26, y + 26 + 4, 52, 52, ORG, 0, { r: 0.12 });
      txt(s, String(startNum + i), 130 + 26, y + 30, 52, 52, 0, { fontFace: 'Poppins', bold: true, fontSize: pt(28), color: 'FFFFFF', align: 'center', valign: 'middle' });
      txt(s, t[0], 130 + 70 + (1070 - 80) / 2, y + 30, 1070 - 80, h - 8, 0, { fontFace: 'Montserrat', bold: false, fontSize: pt(fontPx), color: NAVY, align: 'left', valign: 'top' });
      y += h;
    });
  };
  s = pptx.addSlide(); await chrome(s, { gh: 'br', title: 'Recipe steps' });
  await steps(s, 'How to make the filling:', [
    ['Chop the apple into small pieces.', 1], ['Put the apple in a small bowl.', 1], ['Add the sugar, the cinnamon and the lime juice.', 1],
    ['Mix the cornstarch with the water in another small bowl.', 1], ['Add the cornstarch mixture to the apple.', 1],
    ['Cook in the microwave until the filling is thick and creamy.', 1], ['Let the filling cool completely.', 1]], 1, 84, 32);
  pic(s, await getPhoto('pc6', 'pie-whole.jpg', 440, 440, '36% 60%', 1.15, true, 10), 1560, 560, 440, 440);
  rectC(s, 1550, 950, 600, 76, ORG, 0, { r: 0.2, sh: true });
  s.addText([{ text: 'How to assemble and bake  →', options: { hyperlink: { slide: 7 } } }], { ...box(1550, 950, 600, 76), margin: 0, fontFace: 'Poppins', bold: true, fontSize: pt(30), color: 'FFFFFF', align: 'center', valign: 'middle' });
  s.addNotes('Agora temos o passo a passo da receita, começando pelo recheio. Se preferir, convide um aluno por vez para ler cada passo em voz alta. Lembre-se de que o recheio precisa esfriar completamente antes de montar as tortinhas.');

  s = pptx.addSlide(); await chrome(s, { gh: 'br', title: 'Recipe steps' });
  await steps(s, 'How to assemble and bake:', [
    ['Cut the pastry into rectangles.', 1], ['Put some cold filling on one half of each rectangle.', 1], ['Fold the pastry and press the edges with a fork.', 1],
    ['Make small cuts on top.', 1], ['Brush with the beaten egg.', 1], ['Sprinkle sugar and cinnamon on top.', 1],
    ['Put the pies in the air fryer basket. Leave some space between them.', 1],
    ['Bake at 180°C for 8 to 10 minutes (or at 160°C for 10 minutes on each side) until golden and crispy.', 1.6],
    ['Enjoy your apple pie!', 1]], 8, 66, 28);
  pic(s, await getPhoto('pc7', 'pie-whole.jpg', 440, 440, '36% 60%', 1.15, true, 10), 1560, 400, 440, 440);
  await polaroid(s, 'po7', 'pie-open.webp', 1550, 830, 500, 300, 4, '40% 62%', 1, 18, 52);
  tape(s, 1520, 700, -8, YEL, 110);
  s.addNotes('Esta parte é a continuação da receita. Siga o mesmo procedimento do slide anterior e, se quiser, peça para que os alunos leiam um passo por vez. Ao final, aproveitem a apple pie!');

  await pptx.writeFile({ fileName: `${OUT}/apple-pie-cooking-class.pptx` });
  await browser.close(); fs.rmSync(`${AS}/_m.html`, { force: true });
  console.log('ok');
})().catch((e) => { console.error(e); process.exit(1); });
