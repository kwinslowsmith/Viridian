const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  try {
    console.log('🔍 Fetching Vercel deployment...');
    await page.goto('https://vercel.com/dashboard/kwinslowsmith/viridian/deployments', { 
      waitUntil: 'networkidle2',
      timeout: 60000 
    });
    
    // Wait for page to load
    await page.waitForTimeout(5000);
    
    // Screenshot
    await page.screenshot({ path: '/tmp/vercel_logs.png' });
    console.log('📸 Screenshot saved');
    
    // Try to extract logs text
    const logs = await page.evaluate(() => {
      const elements = document.querySelectorAll('[class*="log"], [class*="error"], code');
      return Array.from(elements).map(el => el.innerText).filter(text => text && text.length > 0);
    });
    
    if (logs.length > 0) {
      console.log('\n📋 Found logs:');
      logs.forEach((log, i) => {
        if (log.length > 500) {
          console.log(`[${i}]: ${log.substring(0, 500)}...`);
        } else {
          console.log(`[${i}]: ${log}`);
        }
      });
    } else {
      console.log('No logs found in page. Checking page content...');
      const content = await page.content();
      if (content.includes('error') || content.includes('Error') || content.includes('failed')) {
        console.log('✓ Page contains error-related content');
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await browser.close();
  }
})();
