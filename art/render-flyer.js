const { chromium } = require('/opt/node-tools/node_modules/playwright');
(async()=>{
  const b = await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
  const p = await b.newPage({viewport:{width:1080,height:1920}});
  await p.goto('file://'+__dirname+'/flyer-ingredientes.html');
  await p.waitForTimeout(2500);
  await p.locator('.art').screenshot({path:'flyer-ingredientes.png'});
  await p.pdf({path:'flyer-ingredientes.pdf',width:'1080px',height:'1920px',printBackground:true,pageRanges:'1'});
  await b.close();
})();
