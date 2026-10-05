const { chromium } = require('/opt/node-tools/node_modules/playwright');
(async()=>{
  const b = await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
  const p = await b.newPage({viewport:{width:1080,height:1350}});
  await p.goto('file://'+__dirname+'/cooking-class-back-to-childhood.html');
  await p.waitForTimeout(2500);
  await p.locator('.art').screenshot({path:'cooking-class-back-to-childhood.png'});
  await b.close();
})();
