# Playwright Console Log Capture

**Capture browser console logs, errors, and exceptions in Playwright tests with just one line of code.**

## The Problem for AI Coding

When AI agents debug web applications, they often miss critical information:
- **JavaScript exceptions** that don't cause test failures but break functionality
- **Console logs** that reveal application state and variable values
- **Runtime errors** that only appear in the browser console, not in test output
- **Failed resource loads** (404s, 500s) that affect page behavior

AI typically can only see test pass/fail results or static code analysis. For JavaScript-heavy sites, this means AI can't see what's actually happening during page execution - the console logs, errors, and state changes that developers rely on for debugging.

## The Solution

This module automatically captures **all browser console output** and streams it to your terminal in real-time. Now AI can:
- See JavaScript exceptions as they happen
- View console.log statements showing variable values and application state
- Debug issues that don't cause test failures
- Self-debug JavaScript-heavy applications via terminal output

Perfect for AI agents running Playwright tests - automatically captures all JavaScript console output, uncaught exceptions, and failed resource loads, making it easy to debug E2E JavaScript issues.

## Quick Start

Add **one line** to any Playwright test:

```javascript
const { attachConsoleCapture } = require('./console-log-capture');

test('my test', async ({ page }) => {
  attachConsoleCapture(page); // ← That's it!
  
  // Your normal test code - logs automatically print in real-time
  await page.goto('https://example.com');
  await page.click('button');
});
```

## Installation

1. Copy `console-log-capture.js` to your Playwright tests directory
2. Install Playwright (if not already installed):
   ```bash
   npm install -D @playwright/test
   ```

## Running Tests

### PowerShell (Windows)

```powershell
# Run the example test
npx playwright test test-console-capture-interactive.spec.js

# Test with custom URL
$env:URL="https://example.com/dashboard"; npx playwright test test-console-capture-interactive.spec.js
```


### CMD (Windows Command Prompt)

```cmd
REM Run the example test
npx playwright test test-console-capture-interactive.spec.js

REM Test with custom URL
set URL=https://example.com/dashboard
npx playwright test test-console-capture-interactive.spec.js
```

### Terminal (macOS / Linux)

```bash
# Run the example test
npx playwright test test-console-capture-interactive.spec.js

# Test with custom URL
URL="https://example.com/dashboard" npx playwright test test-console-capture-interactive.spec.js
```

## Expected Output

When you run a test with console capture enabled, you'll see real-time console logs printed to your terminal:

```
🎬 Console capture started (autoLog: true, verbose: false)

❌ [00.04] ERROR:	nonexistent-script.js	HTTP 404 (Not Found)
❌ [00.04] ERROR:	nonexistent-script.js	Failed to load resource: the server responded with a status of 404 (Not Found)
ℹ️ [00.04] INFO:	console-demo.html:26:16	Console Demo: persistence-test - Testing cookie, localStorage, IndexedDB counters
ℹ️ [00.04] INFO:	console-demo.html:35:20	Console Demo: No URL parameters detected
ℹ️ [00.04] INFO:	console-demo.html:90:16	Console Demo: basic log message
⚠️ [00.04] WARN:	console-demo.html:91:16	Console Demo: warning message
❌ [00.04] ERROR:	console-demo.html:92:16	Console Demo: error message
ℹ️ [00.05] INFO:	console-demo.html:80:24	Console Demo: counters cookie=1 localStorage=1 indexeddb=1
📍 Step 2: Click "Test URL Params" link
❌ [01.61] ERROR:	nonexistent-script.js	Failed to load resource: the server responded with a status of 404 (Not Found)
ℹ️ [01.61] INFO:	console-demo.html?test-param=123&another=value:33:20	Console Demo: URL parameters detected: {"test-param":"123","another":"value"}
❌ [04.67] ERROR:	console-demo.html:110:13	Uncaught: undefinedVariable is not defined

✅ Test complete - all console logs were captured above
```

### Output Format

Each log entry includes:
- **Emoji indicator**: ❌ (error), ⚠️ (warning), ℹ️ (info)
- **Timestamp**: `[00.04]` - seconds since test started
- **Level**: ERROR, WARN, or INFO
- **Location**: `file:line:column` or URL path
- **Message**: The actual console log text

## What It Captures

✅ **Console messages**: `console.log()`, `console.warn()`, `console.error()`  
✅ **Uncaught exceptions**: JavaScript errors that aren't caught  
✅ **Failed resources**: HTTP 404, 500, and other failed requests  
✅ **File locations**: Exact `file:line:column` for each log  
✅ **Navigation events**: Works across page navigations, reloads, and clicks  

## Example Test File

The included `test-console-capture-interactive.spec.js` demonstrates:
- Basic console log capture
- URL parameter detection
- Page navigation and clicking
- Capturing uncaught exceptions

## Test HTML Example

The `console-demo.html` file is included as a demo page that:
- Generates various console logs (info, warn, error)
- Tests URL parameter detection
- Includes a missing script (404 error)
- Triggers an uncaught exception after 2 seconds
- Demonstrates persistence counters (cookies, localStorage, IndexedDB)

You can host this file and test against it, or use it as a reference for creating your own test pages.

### Key Features of console-demo.html

```html
<!-- Missing script - generates 404 error -->
<script src="nonexistent-script.js"></script>

<!-- URL parameter detection -->
<script>
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.toString()) {
    console.log('Console Demo: URL parameters detected:', JSON.stringify(params));
  }
</script>

<!-- Uncaught exception after 2 seconds -->
<script>
  setTimeout(() => {
    undefinedVariable.someMethod(); // This will throw
  }, 2000);
</script>
```

## Usage in Your Tests

### Basic Usage (Recommended)

```javascript
const { attachConsoleCapture } = require('./console-log-capture');

test('my test', async ({ page }) => {
  attachConsoleCapture(page);
  
  await page.goto('https://example.com');
  // All console logs automatically print as they happen
});
```

### With Custom Base URL

```javascript
const { attachConsoleCapture } = require('./console-log-capture');

test('my test', async ({ page }) => {
  attachConsoleCapture(page, {
    baseUrl: 'https://example.com' // Strip from file paths
  });
  
  await page.goto('https://example.com/dashboard');
});
```

### Silent Mode (No Auto-Logging)

```javascript
const { attachConsoleCapture } = require('./console-log-capture');

test('my test', async ({ page }) => {
  const capture = attachConsoleCapture(page, { autoLog: false });
  
  await page.goto('https://example.com');
  
  // Get summary programmatically
  const summary = capture.getSummary();
  console.log(`Captured ${summary.errors} errors`);
});
```

## API Reference

### `attachConsoleCapture(page, options)`

Attaches console log capture to a Playwright page.

**Parameters:**
- `page` (Page) - Playwright page object
- `options` (Object, optional) - Configuration
  - `baseUrl` (string) - Base URL to strip from file paths (auto-detected if not provided)
  - `autoLog` (boolean) - Automatically log to console in real-time (default: `true`)

**Returns:** `ConsoleCapture` instance

### `ConsoleCapture` Methods

#### `getSummary()`

Returns an object with capture statistics.

**Example:**
```javascript
const summary = capture.getSummary();
console.log(summary);
// {
//   messages: 8,
//   errors: 4,
//   warnings: 1,
//   elapsed: "10.6"
// }
```

#### `getOutput(title)`

Returns formatted output as a string.

**Example:**
```javascript
const output = capture.getOutput('My Test');
console.log(output);
// # My Test
// # Started: 2025-11-20 03:12:39 | Elapsed: 5.6s
// # Errors: 4 | Warnings: 1 | Total Messages: 8
//
// [00.03] ERROR:	nonexistent-script.js	HTTP 404 (Not Found)
// [00.04] INFO:	console-demo.html:26:16	Console Demo: persistence-test...
// ...
```

#### `printSummary(title)`

Prints formatted summary to console.

**Example:**
```javascript
capture.printSummary('Test Results');
// Prints:
// ================================================================================
// # Test Results
// # Started: 2025-11-20 03:12:39 | Elapsed: 5.6s
// # Errors: 4 | Warnings: 1 | Total Messages: 8
// ...
// ================================================================================
```

## Why This Is Useful for AI

When AI agents run Playwright tests, they need visibility into:
- **JavaScript errors** that might not cause test failures
- **Console warnings** that indicate potential issues
- **Failed resource loads** that could affect functionality
- **Uncaught exceptions** that happen asynchronously

This module provides all of that automatically, making it easy for AI to:
1. See what's happening in the browser console
2. Debug JavaScript issues during E2E tests
3. Identify problems that don't cause test failures
4. Get exact file locations for errors

## License

MIT License - Copyright (c) 2025 Joe Faron

Free to use, modify, and distribute.

## Author

**Joe Faron**  
GitHub: [@joefaron](https://github.com/joefaron)  
Twitter/X: [@joefaron](https://x.com/joefaron)  
Playground: [labs.kyd.net](https://labs.kyd.net)
