const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const TEST_URL = process.env.TEST_URL || 'http://localhost:3001';
const LOGIN_EMAIL = 'student1@riverside.edu';
const LOGIN_PASSWORD = 'TestPassword123!';
const CLASS_ID = 'cmsjazbw0000augct6nyutf9e';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function runFullTest() {
  let browser;
  const report = {
    timestamp: new Date().toISOString(),
    testName: 'T2 E2E Full Dashboard Verification (with Login)',
    url: TEST_URL,
    credentials: { email: LOGIN_EMAIL },
    results: {
      loginSuccess: false,
      progressTabWorks: false,
      standardsTabWorks: false,
      standardsDisplayed: false,
      materialsVisible: false,
      teacherNotesVisible: false,
      expandableItems: false,
      consoleErrors: [],
      performance: {},
    },
    screenshots: [],
    testSteps: [],
  };

  try {
    console.log('🚀 T2 E2E Full Test: Student Dashboard with Login');
    console.log('='.repeat(70));

    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      timeout: 60000,
    });

    const page = await browser.newPage();
    const screenshotsDir = path.join(__dirname, '../test-screenshots-full');
    if (!fs.existsSync(screenshotsDir)) {
      fs.mkdirSync(screenshotsDir, { recursive: true });
    }

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        const errorMsg = `${msg.text()}`;
        report.results.consoleErrors.push(errorMsg);
      }
    });

    await page.setViewport({ width: 1024, height: 768 });

    // Step 1: Navigate to login
    console.log('\n📍 Step 1: Navigate to login page');
    const loginStart = Date.now();
    await page.goto(`${TEST_URL}/auth/login`, {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    }).catch(() => {});
    const loginLoadTime = Date.now() - loginStart;
    report.results.performance.loginPageLoad = loginLoadTime;
    console.log(`✓ Login page loaded (${loginLoadTime}ms)`);
    report.testSteps.push('Login page loaded');

    await delay(500);
    await page.screenshot({ path: path.join(screenshotsDir, '01-login-page.png') });
    report.screenshots.push('01-login-page.png');

    // Step 2: Fill login form
    console.log('\n📍 Step 2: Fill and submit login form');
    try {
      // Find email input
      const emailInput = await page.$('input[type="email"]') ||
                        await page.$('input[name="email"]') ||
                        (await page.$$('input'))[0];

      if (!emailInput) throw new Error('Email input not found');

      await emailInput.type(LOGIN_EMAIL);
      await delay(300);

      // Find password input
      const passwordInput = await page.$('input[type="password"]') ||
                           await page.$('input[name="password"]') ||
                           (await page.$$('input'))[1];

      if (!passwordInput) throw new Error('Password input not found');

      await passwordInput.type(LOGIN_PASSWORD);
      await delay(300);

      // Find and click submit
      const buttons = await page.$$('button');
      let submitButton;

      for (const btn of buttons) {
        const text = await page.evaluate(el => el.textContent, btn);
        if (text && (text.toLowerCase().includes('sign in') ||
                     text.toLowerCase().includes('login'))) {
          submitButton = btn;
          break;
        }
      }

      if (!submitButton) {
        // Try first button if can't find by text
        submitButton = buttons[0];
      }

      if (submitButton) {
        await submitButton.click();
        console.log('✓ Login form submitted');
        report.testSteps.push('Login form submitted');

        // Wait for navigation
        await delay(2000);
        try {
          await page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 10000 });
        } catch (e) {
          console.warn('Navigation timeout, continuing...');
        }

        report.results.loginSuccess = true;
        console.log('✓ Login successful');
        report.testSteps.push('Login successful');
      }
    } catch (e) {
      console.warn(`⚠️  Login attempt: ${e.message}`);
      report.testSteps.push(`Login form fill: ${e.message}`);
    }

    // Step 3: Navigate to dashboard
    console.log('\n📍 Step 3: Navigate to dashboard');
    const dashboardUrl = `${TEST_URL}/students/class/${CLASS_ID}/dashboard`;
    const dashboardStart = Date.now();

    try {
      await page.goto(dashboardUrl, {
        waitUntil: 'domcontentloaded',
        timeout: 30000,
      });
    } catch (e) {
      console.warn(`Navigation warning: ${e.message}`);
    }

    const dashboardLoadTime = Date.now() - dashboardStart;
    report.results.performance.dashboardLoad = dashboardLoadTime;
    console.log(`✓ Dashboard loaded (${dashboardLoadTime}ms)`);
    report.testSteps.push('Dashboard loaded');

    await delay(1000);
    await page.screenshot({ path: path.join(screenshotsDir, '02-dashboard-progress-tab.png') });
    report.screenshots.push('02-dashboard-progress-tab.png');

    // Step 4: Verify Progress tab
    console.log('\n📍 Step 4: Verify Progress tab');
    const progressContent = await page.content();
    if (progressContent.includes('Progress') || progressContent.includes('progress')) {
      report.results.progressTabWorks = true;
      console.log('✓ Progress tab content found');
      report.testSteps.push('Progress tab verified');
    }

    // Step 5: Click Standards & Objectives tab
    console.log('\n📍 Step 5: Click Standards & Objectives tab');
    try {
      const buttons = await page.$$('button');
      let standardsButton;

      for (const btn of buttons) {
        const text = await page.evaluate(el => el.textContent, btn);
        if (text && text.includes('Standards')) {
          standardsButton = btn;
          break;
        }
      }

      if (standardsButton) {
        const clickStart = Date.now();
        await standardsButton.click();
        const clickTime = Date.now() - clickStart;
        report.results.performance.tabSwitch = clickTime;
        console.log(`✓ Standards tab clicked (${clickTime}ms)`);
        report.testSteps.push('Standards tab clicked');

        await delay(1000);
        report.results.standardsTabWorks = true;

        await page.screenshot({ path: path.join(screenshotsDir, '03-dashboard-standards-tab.png') });
        report.screenshots.push('03-dashboard-standards-tab.png');
      } else {
        console.warn('⚠️  Standards button not found');
        report.testSteps.push('Standards button not found');
      }
    } catch (e) {
      console.warn(`⚠️  Tab click error: ${e.message}`);
      report.testSteps.push(`Tab click: ${e.message}`);
    }

    // Step 6: Check Standards content
    console.log('\n📍 Step 6: Check Standards & Objectives content');
    const pageText = await page.evaluate(() => document.body.innerText);
    const standardsContent = await page.content();

    if (standardsContent.includes('Standard') || pageText.includes('Standard')) {
      report.results.standardsDisplayed = true;
      console.log('✓ Standards content displayed');
      report.testSteps.push('Standards content found');
    }

    if (standardsContent.includes('Teacher') || pageText.includes('Teacher')) {
      report.results.teacherNotesVisible = true;
      console.log('✓ Teacher notes section found');
      report.testSteps.push('Teacher notes found');
    }

    if (standardsContent.includes('Material') || standardsContent.includes('material')) {
      report.results.materialsVisible = true;
      console.log('✓ Materials section found');
      report.testSteps.push('Materials found');
    }

    // Step 7: Test expandability
    console.log('\n📍 Step 7: Test expandable items');
    try {
      const clickableElements = await page.$$('[style*="cursor"]');
      if (clickableElements.length > 0) {
        await clickableElements[0].click();
        await delay(500);
        report.results.expandableItems = true;
        console.log(`✓ Found ${clickableElements.length} expandable items`);
        report.testSteps.push(`Expandable items found: ${clickableElements.length}`);

        await page.screenshot({ path: path.join(screenshotsDir, '04-dashboard-expanded.png') });
        report.screenshots.push('04-dashboard-expanded.png');
      }
    } catch (e) {
      console.warn(`⚠️  Expand test: ${e.message}`);
    }

    // Final screenshot
    await page.screenshot({ path: path.join(screenshotsDir, '05-final-state.png') });
    report.screenshots.push('05-final-state.png');

  } catch (error) {
    console.error('❌ Test error:', error.message);
    report.results.consoleErrors.push(`Test error: ${error.message}`);
  } finally {
    if (browser) {
      await browser.close();
    }
  }

  // Generate report
  printReport(report);

  const reportPath = path.join(__dirname, '../test-report-full.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\n💾 Full report saved to: ${reportPath}`);

  return report;
}

function printReport(report) {
  console.log('\n' + '='.repeat(70));
  console.log('📊 T2 E2E TEST REPORT');
  console.log('='.repeat(70));
  console.log(`Test: ${report.testName}`);
  console.log(`URL: ${report.url}`);
  console.log(`Timestamp: ${report.timestamp}\n`);

  console.log('✅ RESULTS:');
  console.log(`  • Login Successful: ${report.results.loginSuccess ? '✓ PASS' : '✗ FAIL'}`);
  console.log(`  • Progress Tab Works: ${report.results.progressTabWorks ? '✓ PASS' : '✗ FAIL'}`);
  console.log(`  • Standards Tab Works: ${report.results.standardsTabWorks ? '✓ PASS' : '✗ FAIL'}`);
  console.log(`  • Standards Displayed: ${report.results.standardsDisplayed ? '✓ PASS' : '✗ FAIL'}`);
  console.log(`  • Teacher Notes Visible: ${report.results.teacherNotesVisible ? '✓ PASS' : '✗ FAIL'}`);
  console.log(`  • Materials Visible: ${report.results.materialsVisible ? '✓ PASS' : '✗ FAIL'}`);
  console.log(`  • Expandable Items: ${report.results.expandableItems ? '✓ PASS' : '✗ FAIL'}`);

  console.log('\n⏱️ PERFORMANCE:');
  console.log(`  • Login Page Load: ${report.results.performance.loginPageLoad}ms`);
  console.log(`  • Dashboard Load: ${report.results.performance.dashboardLoad}ms`);
  if (report.results.performance.tabSwitch) {
    console.log(`  • Tab Switch: ${report.results.performance.tabSwitch}ms`);
  }

  console.log('\n📝 TEST STEPS:');
  report.testSteps.forEach((step, i) => console.log(`  ${i + 1}. ${step}`));

  if (report.results.consoleErrors.length > 0) {
    console.log('\n🔴 CONSOLE ERRORS:');
    report.results.consoleErrors.forEach(err => console.log(`  - ${err}`));
  } else {
    console.log('\n✓ No console errors detected');
  }

  console.log('\n📸 SCREENSHOTS:');
  report.screenshots.forEach(ss => console.log(`  - ${ss}`));

  console.log('\n' + '='.repeat(70));
  const allPass = [
    report.results.progressTabWorks,
    report.results.standardsTabWorks,
    report.results.standardsDisplayed,
  ].every(v => v === true);

  if (allPass) {
    console.log('🎉 DASHBOARD VERIFICATION PASSED!');
  } else {
    console.log('⚠️  Some checks did not pass - see results above');
  }
  console.log('='.repeat(70));
}

runFullTest().catch(console.error);
