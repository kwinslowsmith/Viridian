const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const TEST_URL = process.env.TEST_URL || 'http://localhost:3001';
const CLASS_ID = 'cmsjazbw0000augct6nyutf9e';

// Simple delay helper
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function runSimpleTest() {
  let browser;
  const report = {
    timestamp: new Date().toISOString(),
    testName: 'T2 E2E Browser Verification (Simplified)',
    url: TEST_URL,
    results: {
      dashboardAccessible: false,
      standardsTabVisible: false,
      standardsDisplayed: false,
      expandableItems: false,
      consoleErrors: [],
    },
    screenshots: [],
    notes: [],
  };

  try {
    console.log('🚀 T2 E2E Test: Simplified Dashboard Verification');
    console.log('='.repeat(60));
    console.log(`Testing URL: ${TEST_URL}`);
    console.log(`Class ID: ${CLASS_ID}`);

    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      timeout: 60000,
    });

    const page = await browser.newPage();
    const screenshotsDir = path.join(__dirname, '../test-screenshots-simple');
    if (!fs.existsSync(screenshotsDir)) {
      fs.mkdirSync(screenshotsDir, { recursive: true });
    }

    // Capture console messages
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        const errorMsg = `[ERROR] ${msg.text()}`;
        report.results.consoleErrors.push(errorMsg);
        console.error('❌', errorMsg);
      }
    });

    page.on('error', (err) => {
      report.results.consoleErrors.push(`[PAGE ERROR] ${err.message}`);
    });

    page.on('pageerror', (err) => {
      report.results.consoleErrors.push(`[PAGE JS ERROR] ${err.message}`);
    });

    await page.setViewport({ width: 1024, height: 768 });

    // Step 1: Try to access the dashboard directly
    console.log('\n📍 Step 1: Accessing student dashboard...');
    const dashboardUrl = `${TEST_URL}/students/class/${CLASS_ID}/dashboard`;
    console.log(`URL: ${dashboardUrl}`);

    try {
      await page.goto(dashboardUrl, {
        waitUntil: 'domcontentloaded',
        timeout: 30000,
      });
      console.log('✓ Dashboard page loaded');
      report.results.dashboardAccessible = true;
      report.notes.push('Dashboard is accessible');
    } catch (e) {
      console.warn(`⚠️  Navigation issue: ${e.message}`);
      report.notes.push(`Navigation warning: ${e.message}`);
      // Continue anyway - page might have partially loaded
    }

    await delay(2000);
    await page.screenshot({ path: path.join(screenshotsDir, '01-dashboard-loaded.png') });
    report.screenshots.push('01-dashboard-loaded.png');

    // Step 2: Check page content
    console.log('\n📍 Step 2: Checking page content...');
    const pageContent = await page.content();
    const pageText = await page.evaluate(() => document.body.innerText);

    // Look for Standards & Objectives content
    if (pageContent.includes('Standards') || pageText.includes('Standards')) {
      report.results.standardsTabVisible = true;
      console.log('✓ Standards content found');
    } else {
      console.log('⚠️  Standards content not found (may need authentication)');
      report.notes.push('Standards content not visible - may require authentication');
    }

    // Look for expandable elements
    const expandButtons = await page.$$('[role="button"], div[style*="cursor"]');
    if (expandButtons.length > 0) {
      report.results.expandableItems = true;
      console.log(`✓ Found ${expandButtons.length} interactive elements`);
    }

    // Step 3: Verify page structure
    console.log('\n📍 Step 3: Checking page structure...');

    // Check for tab navigation
    const tabs = await page.$$('button');
    console.log(`Found ${tabs.length} buttons on page`);

    // Try to find Standards tab
    let tabsText = [];
    for (const tab of tabs) {
      try {
        const text = await page.evaluate(el => el.textContent, tab);
        tabsText.push(text);
        if (text && text.includes('Standards')) {
          report.results.standardsTabVisible = true;
          console.log(`✓ Found Standards tab: "${text}"`);
        }
      } catch (e) {
        // Ignore individual tab errors
      }
    }

    if (tabsText.length > 0) {
      console.log(`Available tabs/buttons: ${tabsText.slice(0, 5).join(', ')}`);
    }

    // Step 4: Check API endpoints
    console.log('\n📍 Step 4: Testing API endpoints...');
    const apiEndpoints = [
      `/api/k12/classes/${CLASS_ID}/student-progress`,
      `/api/k12/classes/${CLASS_ID}/standards-objectives-student`,
    ];

    for (const endpoint of apiEndpoints) {
      try {
        const response = await page.goto(`${TEST_URL}${endpoint}`, { waitUntil: 'domcontentloaded', timeout: 5000 });
        const statusCode = response.status();
        console.log(`${endpoint}: ${statusCode}`);
        if (statusCode === 200 || statusCode === 401) {
          report.notes.push(`API endpoint accessible: ${endpoint} (${statusCode})`);
        }
      } catch (e) {
        console.log(`${endpoint}: Not accessible (${e.message})`);
        report.notes.push(`API endpoint error: ${endpoint}`);
      }
    }

    // Return to dashboard for final screenshot
    await page.goto(dashboardUrl, { waitUntil: 'domcontentloaded', timeout: 30000 }).catch(() => {});
    await delay(1000);
    await page.screenshot({ path: path.join(screenshotsDir, '02-final-state.png') });
    report.screenshots.push('02-final-state.png');

  } catch (error) {
    console.error('❌ Test error:', error.message);
    report.results.consoleErrors.push(`Test execution error: ${error.message}`);
  } finally {
    if (browser) {
      await browser.close();
    }
  }

  // Write and display report
  const reportPath = path.join(__dirname, '../test-report-simple.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

  console.log('\n' + '='.repeat(60));
  console.log('📊 TEST REPORT');
  console.log('='.repeat(60));
  console.log(`Dashboard Accessible: ${report.results.dashboardAccessible ? '✓' : '✗'}`);
  console.log(`Standards Tab Visible: ${report.results.standardsTabVisible ? '✓' : '✗'}`);
  console.log(`Expandable Items Found: ${report.results.expandableItems ? '✓' : '✗'}`);
  console.log(`Console Errors: ${report.results.consoleErrors.length}`);
  console.log(`Screenshots: ${report.screenshots.length}`);

  if (report.notes.length > 0) {
    console.log('\n📝 Notes:');
    report.notes.forEach((note, i) => console.log(`  ${i + 1}. ${note}`));
  }

  if (report.results.consoleErrors.length > 0) {
    console.log('\n🔴 Console Errors:');
    report.results.consoleErrors.forEach((err) => console.log(`  - ${err}`));
  }

  console.log('\n📸 Screenshots saved to:');
  report.screenshots.forEach((ss) => console.log(`  - ${ss}`));

  console.log(`\n💾 Full report: ${reportPath}`);
  console.log('='.repeat(60));

  return report;
}

runSimpleTest().catch(console.error);
