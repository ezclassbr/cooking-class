const { chromium } = require('/opt/node-tools/node_modules/playwright');
const { pics, svg } = require('./pictos');
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const p = await b.newPage({ viewport: { width: 1100, height: 560 } });
  const cells = Object.keys(pics).map(k => `<div style="width:160px;height:160px;background:#fff;border-radius:20px;display:flex;align-items:center;justify-content:center;flex-direction:column;font:12px sans-serif">${svg(k).replace('width="120" height="120"','width="120" height="120"')}<span>${k}</span></div>`).join('');
  await p.setContent(`<body style="background:#EBF0F2;display:flex;flex-wrap:wrap;gap:16px;padding:16px">${cells}</body>`);
  await p.screenshot({ path: '/tmp/pictos.png' });
  await b.close();
})();
