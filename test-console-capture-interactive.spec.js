/**
 * Console Capture Test - Just include at top and it auto-logs everything
 * 
 * Usage:
 *   npx playwright test playwright-tests/test-console-capture-interactive.spec.js
 *   URL="https://stores.kyd.net/dashboard?c=admin" npx playwright test playwright-tests/test-console-capture-interactive.spec.js
 */

const { test, expect } = require('@playwright/test');
const { attachConsoleCapture } = require('./console-log-capture');

test('Console capture - Interactive test with navigation and URL params', async ({ page }) => {
  // Just add this one line - it auto-logs everything
  attachConsoleCapture(page);
  
  const baseUrl = process.env.URL || 'https://notepads.kyd.net/console-demo.html';
  
  console.log('\n🎬 Starting test with console capture...\n');
  
  // Navigate to test page
  console.log('📍 Step 1: Navigate to test page (no params)');
  await page.goto(baseUrl.split('?')[0]);
  await page.waitForTimeout(1500);
  
  // Click the URL params link
  console.log('📍 Step 2: Click "Test URL Params" link');
  await page.click('a:has-text("Test URL Params")');
  await page.waitForTimeout(1000);
  
  // Verify URL params are in the URL
  const currentUrl = page.url();
  console.log(`   Current URL: ${currentUrl}`);
  expect(currentUrl).toContain('test-param=123');
  
  // Click Clear Params
  console.log('📍 Step 3: Click "Clear Params" link');
  await page.click('a:has-text("Clear Params")');
  await page.waitForTimeout(1000);
  
  // Wait for uncaught exception (happens at 2s)
  console.log('📍 Step 4: Wait for uncaught exception');
  await page.waitForTimeout(2500);
  
  console.log('\n✅ Test complete - all console logs were captured above\n');
});

