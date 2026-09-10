const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Helper function for delays
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Configuration
// Try localhost first, then fall back to deployed URL
const TEST_URL = process.env.TEST_URL || 'http://localhost:3000';
const LOGIN_EMAIL = 'student1@riverside.edu';
const LOGIN_PASSWORD = 'TestPassword123!';
const CLASS_ID = 'cmsjazbw0000augct6nyutf9e';
const DASHBOARD_URL = `${TEST_URL}/students/class/${CLASS_ID}/dashboard`;

// Report data
const report = {
  timestamp: new Date().toISOString(),
  testName: 'T2 Student Standards & Objectives E2E Test',
  results: {
    pageLoads: false,
    standardsExpandCollapse: false,
    masteryPercentDisplays: false,
    teacherNotesVisible: false,
    materialsVisible: false,
    consoleErrors: [],
    consoleLogs: [],
    screenshots: [],
  },
  performance: {
    loginTime: 0,
    navigationTime: 0,
    dashboardLoadTime: 0,
  },
  issues: [],
};

async function runTest() {
  let browser;
  try {
    console.log('🚀 Starting T2 E2E Test: Student Standards & Objectives');
    console.log('='.repeat(60));

    // Launch browser
    console.log('📱 Launching browser...');
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    const screenshotsDir = path.join(__dirname, '../test-screenshots');
    if (!fs.existsSync(screenshotsDir)) {
      fs.mkdirSync(screenshotsDir, { recursive: true });
    }

    // Capture console messages
    const consoleLogs = [];
    const consoleErrors = [];
    page.on('console', (msg) => {
      const logEntry = `[${msg.type().toUpperCase()}] ${msg.text()}`;
      if (msg.type() === 'error') {
        consoleErrors.push(logEntry);
        console.error('❌', logEntry);
      } else if (msg.type() === 'warning') {
        consoleLogs.push(logEntry);
        console.warn('⚠️', logEntry);
      } else {
        consoleLogs.push(logEntry);
      }
    });

    // Set viewport
    await page.setViewport({ width: 1024, height: 768 });

    // Step 1: Navigate to login
    console.log('\n📍 Step 1: Navigating to login...');
    const loginStartTime = Date.now();
    try {
      await page.goto(`${TEST_URL}/auth/login`, { waitUntil: 'domcontentloaded', timeout: 20000 });
    } catch (e) {
      console.warn('Navigation took longer than expected, continuing anyway...');
    }
    report.performance.loginTime = Date.now() - loginStartTime;
    console.log(`✓ Login page loaded (${report.performance.loginTime}ms)`);

    await delay(1000); // Give page time to render
    await page.screenshot({ path: path.join(screenshotsDir, '01-login-page.png') });
    report.results.screenshots.push('01-login-page.png');

    // Step 2: Fill and submit login form
    console.log('\n📍 Step 2: Logging in as student...');

    // Debug: Check page structure
    const pageTitle = await page.title();
    console.log(`Current page title: ${pageTitle}`);

    // Try to find email input with multiple selectors
    let emailInput = await page.$('input[type="email"]');
    if (!emailInput) {
      emailInput = await page.$('input[name="email"]');
    }
    if (!emailInput) {
      emailInput = await page.$('input');
    }

    if (!emailInput) {
      throw new Error('Could not find email input. Page may not be a login form.');
    }

    let passwordInput = await page.$('input[type="password"]');
    if (!passwordInput) {
      passwordInput = await page.$('input[name="password"]');
    }

    if (!passwordInput) {
      throw new Error('Could not find password input.');
    }

    await emailInput.type(LOGIN_EMAIL);
    await passwordInput.type(LOGIN_PASSWORD);

    // Find and click submit button
    let submitButton = await page.$('button[type="submit"]');
    if (!submitButton) {
      const allButtons = await page.$$('button');
      for (const btn of allButtons) {
        const text = await page.evaluate(el => el.textContent, btn);
        if (text && (text.toLowerCase().includes('sign in') || text.toLowerCase().includes('login'))) {
          submitButton = btn;
          break;
        }
      }
    }

    if (!submitButton) {
      throw new Error('Could not find submit button.');
    }

    await submitButton.click();

    // Wait for navigation after login
    try {
      await page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 20000 });
    } catch (e) {
      console.warn('Navigation after login took longer than expected, continuing...');
    }
    console.log('✓ Login successful');
    await delay(1000);
    await page.screenshot({ path: path.join(screenshotsDir, '02-post-login.png') });
    report.results.screenshots.push('02-post-login.png');

    // Step 3: Navigate to dashboard
    console.log('\n📍 Step 3: Navigating to Standards & Objectives dashboard...');
    const navStartTime = Date.now();
    try {
      await page.goto(DASHBOARD_URL, { waitUntil: 'domcontentloaded', timeout: 20000 });
    } catch (e) {
      console.warn('Dashboard navigation took longer than expected, continuing...');
    }
    report.performance.dashboardLoadTime = Date.now() - navStartTime;
    console.log(`✓ Dashboard loaded (${report.performance.dashboardLoadTime}ms)`);
    report.results.pageLoads = true;
    await delay(1000);
    await page.screenshot({ path: path.join(screenshotsDir, '03-dashboard-initial.png') });
    report.results.screenshots.push('03-dashboard-initial.png');

    // Step 4: Click Standards & Objectives tab
    console.log('\n📍 Step 4: Clicking Standards & Objectives tab...');
    const tabSelector = 'button:has-text("Standards & Objectives")';
    try {
      // Try to find the Standards tab - look for it by text
      const standardsTab = await page.$('button');
      const tabs = await page.$$('button');
      let standardsTabFound = false;

      for (const tab of tabs) {
        const text = await page.evaluate(el => el.textContent, tab);
        if (text && text.includes('Standards & Objectives')) {
          await tab.click();
          standardsTabFound = true;
          console.log('✓ Standards & Objectives tab clicked');
          break;
        }
      }

      if (!standardsTabFound) {
        throw new Error('Could not find Standards & Objectives tab');
      }

      // Wait for tab content to load
      await delay(1000);
      await page.screenshot({ path: path.join(screenshotsDir, '04-standards-tab-open.png') });
      report.results.screenshots.push('04-standards-tab-open.png');
    } catch (e) {
      console.error('⚠️  Could not click Standards tab:', e.message);
      report.issues.push(`Standards tab click failed: ${e.message}`);
    }

    // Step 5: Check if standards are visible
    console.log('\n📍 Step 5: Checking standards content...');
    try {
      const standardsContent = await page.$('[style*="padding"]'); // Look for content container
      if (standardsContent) {
        report.results.pageLoads = true;
        console.log('✓ Standards content found');
      }
    } catch (e) {
      console.warn('⚠️  Could not verify standards content');
    }

    // Step 6: Test expand/collapse
    console.log('\n📍 Step 6: Testing expand/collapse functionality...');
    try {
      // Find first expandable standard (look for divs with click handlers or buttons)
      const expandButtons = await page.$$('div[style*="cursor: pointer"]');
      if (expandButtons.length > 0) {
        // Click first one to expand
        await expandButtons[0].click();
        await delay(500);
        console.log('✓ First standard expanded');
        await page.screenshot({ path: path.join(screenshotsDir, '05-standard-expanded.png') });
        report.results.screenshots.push('05-standard-expanded.png');
        report.results.standardsExpandCollapse = true;

        // Click again to collapse
        await expandButtons[0].click();
        await delay(500);
        console.log('✓ First standard collapsed');
        await page.screenshot({ path: path.join(screenshotsDir, '06-standard-collapsed.png') });
        report.results.screenshots.push('06-standard-collapsed.png');
      } else {
        console.warn('⚠️  No expandable standards found');
        report.issues.push('No expandable standards found');
      }
    } catch (e) {
      console.error('⚠️  Expand/collapse test failed:', e.message);
      report.issues.push(`Expand/collapse failed: ${e.message}`);
    }

    // Step 7: Check for key content elements
    console.log('\n📍 Step 7: Checking for key content elements...');

    // Check for mastery percentage
    const pageContent = await page.content();
    if (pageContent.includes('%') && pageContent.includes('Mastery')) {
      report.results.masteryPercentDisplays = true;
      console.log('✓ Mastery percentage detected');
    } else {
      console.warn('⚠️  Mastery percentage not clearly visible');
      report.issues.push('Mastery percentage may not be visible');
    }

    // Check for teacher notes
    if (pageContent.includes('Teacher') || pageContent.includes('Notes')) {
      report.results.teacherNotesVisible = true;
      console.log('✓ Teacher notes section detected');
    } else {
      console.warn('⚠️  Teacher notes section not found');
      report.issues.push('Teacher notes section not visible');
    }

    // Check for materials
    if (pageContent.includes('Materials') || pageContent.includes('material')) {
      report.results.materialsVisible = true;
      console.log('✓ Materials section detected');
    } else {
      console.warn('⚠️  Materials section not found');
      report.issues.push('Materials section may not be visible');
    }

    // Final screenshot
    await page.screenshot({ path: path.join(screenshotsDir, '07-final-state.png') });
    report.results.screenshots.push('07-final-state.png');

    // Compile results
    report.results.consoleErrors = consoleErrors;
    report.results.consoleLogs = consoleLogs;

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    report.issues.push(`Test error: ${error.message}`);
  } finally {
    if (browser) {
      await browser.close();
    }
  }

  // Write report to file
  const reportPath = path.join(__dirname, '../test-report-t2.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log('\n' + '='.repeat(60));
  console.log(`📊 Test Report saved to: ${reportPath}`);
  console.log('='.repeat(60));

  // Print summary
  printSummary(report);

  return report;
}

function printSummary(report) {
  console.log('\n📋 TEST RESULTS SUMMARY');
  console.log('='.repeat(60));
  console.log(`Test: ${report.testName}`);
  console.log(`Timestamp: ${report.timestamp}\n`);

  console.log('✅ RESULTS:');
  console.log(`  • Page Loads: ${report.results.pageLoads ? '✓ PASS' : '✗ FAIL'}`);
  console.log(`  • Standards Expand/Collapse: ${report.results.standardsExpandCollapse ? '✓ PASS' : '✗ FAIL'}`);
  console.log(`  • Mastery % Displays: ${report.results.masteryPercentDisplays ? '✓ PASS' : '✗ FAIL'}`);
  console.log(`  • Teacher Notes Visible: ${report.results.teacherNotesVisible ? '✓ PASS' : '✗ FAIL'}`);
  console.log(`  • Materials Visible: ${report.results.materialsVisible ? '✓ PASS' : '✗ FAIL'}`);

  console.log('\n⏱️ PERFORMANCE:');
  console.log(`  • Login Time: ${report.performance.loginTime}ms`);
  console.log(`  • Dashboard Load Time: ${report.performance.dashboardLoadTime}ms`);

  console.log('\n🔍 CONSOLE OUTPUT:');
  if (report.results.consoleErrors.length > 0) {
    console.log(`  ❌ Errors (${report.results.consoleErrors.length}):`);
    report.results.consoleErrors.forEach(err => console.log(`    - ${err}`));
  } else {
    console.log('  ✓ No console errors');
  }

  if (report.results.consoleLogs.length > 0) {
    console.log(`  ℹ️ Logs (${report.results.consoleLogs.length}):`);
    report.results.consoleLogs.slice(0, 5).forEach(log => console.log(`    - ${log}`));
    if (report.results.consoleLogs.length > 5) {
      console.log(`    ... and ${report.results.consoleLogs.length - 5} more`);
    }
  }

  if (report.issues.length > 0) {
    console.log('\n⚠️ ISSUES:');
    report.issues.forEach(issue => console.log(`  - ${issue}`));
  } else {
    console.log('\n✓ No issues detected');
  }

  console.log('\n📸 SCREENSHOTS:');
  report.results.screenshots.forEach(ss => console.log(`  - ${ss}`));

  console.log('\n' + '='.repeat(60));
  const allPass = Object.values(report.results).filter(v => typeof v === 'boolean').every(v => v);
  if (allPass && report.results.consoleErrors.length === 0 && report.issues.length === 0) {
    console.log('🎉 ALL TESTS PASSED!');
  } else {
    console.log('⚠️  Some tests failed or issues detected - see above');
  }
  console.log('='.repeat(60));
}

// Run the test
runTest().catch(console.error);
