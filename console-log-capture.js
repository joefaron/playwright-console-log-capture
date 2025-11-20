/**
 * Browser Console Log Capture Module - Reusable console log capture for any Playwright test
 * 
 * MIT License - Copyright (c) 2025 Joe Faron
 * See LICENSE file for full license text
 * 
 * Author: Joe Faron
 * GitHub: https://github.com/joefaron
 * Twitter/X: https://x.com/joefaron
 * Playground: https://labs.kyd.net
 */

const fs = require('fs');
const path = require('path');

class ConsoleCapture {
  constructor(page, options = {}) {
    this.page = page;
    this.baseUrl = options.baseUrl || '';
    this.autoLog = options.autoLog !== false; // Default true
    this.verbose = options.verbose || false;
    this.saveToFile = options.saveToFile || false;
    this.filePrefix = options.filePrefix || 'console-capture';
    
    this.startTime = Date.now();
    this.messages = [];
    this.errors = 0;
    this.warnings = 0;
    this.reportedErrors = new Set();
    
    this._setupListeners();
  }
  
  _getTimestamp() {
    return `[${((Date.now() - this.startTime) / 1000).toFixed(2).padStart(5, '0')}]`;
  }
  
  _formatLocation(url, lineNum, colNum = null) {
    if (!url) return '';
    let file = this.baseUrl ? url.replace(this.baseUrl, '').replace(/^\//, '') : url;
    if (lineNum > 0) {
      return colNum ? `${file}:${lineNum}:${colNum}` : `${file}:${lineNum}`;
    }
    return file;
  }
  
  _logMessage(level, location, text) {
    const msg = {
      timestamp: this._getTimestamp(),
      level,
      location,
      text,
      time: Date.now()
    };
    
    this.messages.push(msg);
    
    if (this.autoLog) {
      const locStr = location ? `\t${location}` : '';
      const emoji = level === 'ERROR' ? '❌' : level === 'WARN' ? '⚠️' : 'ℹ️';
      console.log(`${emoji} ${msg.timestamp} ${level}:${locStr}\t${text}`);
    }
  }
  
  _setupListeners() {
    // Console messages
    this.page.on('console', msg => {
      const loc = msg.location();
      let level = 'INFO';
      
      if (msg.type().toUpperCase() === 'ERROR') {
        this.errors++;
        level = 'ERROR';
      } else if (msg.type().toUpperCase() === 'WARNING') {
        this.warnings++;
        level = 'WARN';
      }
      
      this._logMessage(
        level,
        this._formatLocation(loc.url, loc.lineNumber, loc.columnNumber),
        msg.text()
      );
    });
    
    // Page errors (uncaught exceptions)
    this.page.on('pageerror', error => {
      const match = (error.stack || error.message).match(/at (.*?):(\d+):(\d+)/);
      this.errors++;
      
      this._logMessage(
        'ERROR',
        match ? this._formatLocation(match[1], match[2], match[3]) : '',
        `Uncaught: ${error.message}`
      );
    });
    
    // Failed resource loads (404, 500, etc)
    this.page.on('response', response => {
      if (response.status() >= 400) {
        const urlPath = response.url();
        const displayUrl = this.baseUrl ? urlPath.replace(this.baseUrl, '') : urlPath;
        
        if (!this.reportedErrors.has(urlPath)) {
          this.reportedErrors.add(urlPath);
          this.errors++;
          
          this._logMessage(
            'ERROR',
            displayUrl,
            `HTTP ${response.status()} (${response.statusText()})`
          );
        }
      }
    });
    
    if (this.autoLog) {
      console.log(`\n🎬 Console capture started (autoLog: ${this.autoLog}, verbose: ${this.verbose})\n`);
    }
  }
  
  getOutput(title = 'Browser Console Log Capture') {
    const elapsed = ((Date.now() - this.startTime) / 1000).toFixed(1);
    const startStr = new Date(this.startTime).toISOString().slice(0, 19).replace('T', ' ');
    
    let output = `# ${title}\n`;
    output += `# Started: ${startStr} | Elapsed: ${elapsed}s\n`;
    output += `# Errors: ${this.errors} | Warnings: ${this.warnings} | Total Messages: ${this.messages.length}\n\n`;
    
    this.messages.sort((a, b) => a.time - b.time).forEach(msg => {
      output += `${msg.timestamp} ${msg.level}:${msg.location ? '\t' + msg.location : ''}\t${msg.text}\n`;
    });
    
    if (this.errors > 0) output += `\n❌ ERROR: ${this.errors} SEVERE logs detected!\n`;
    if (this.warnings > 0) output += `⚠️  WARNING: ${this.warnings} warning logs detected!\n`;
    
    const endTime = new Date();
    const dateStr = endTime.toISOString().slice(0, 10);
    const timeStr = endTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }).toLowerCase().replace(' ', '');
    output += `\n## Console capture complete on ${dateStr} @${timeStr} ##\n`;
    
    return output;
  }
  
  printSummary(title) {
    const output = this.getOutput(title);
    console.log('\n' + '='.repeat(80));
    console.log(output);
    console.log('='.repeat(80) + '\n');
    
    if (this.saveToFile) {
      this.saveOutput(title);
    }
  }
  
  saveOutput(title = 'console-capture') {
    const outputDir = path.join(process.cwd(), 'test-results');
    fs.mkdirSync(outputDir, { recursive: true });
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const filename = `${this.filePrefix}-${timestamp}.txt`;
    const filepath = path.join(outputDir, filename);
    
    fs.writeFileSync(filepath, this.getOutput(title));
    console.log(`📝 Console logs saved to: ${filepath}`);
    
    return filepath;
  }
  
  getSummary() {
    return {
      messages: this.messages.length,
      errors: this.errors,
      warnings: this.warnings,
      elapsed: ((Date.now() - this.startTime) / 1000).toFixed(1)
    };
  }
}

/**
 * Attach console capture to a Playwright page
 * Convention over configuration - just attach and it auto-logs everything
 * 
 * @param {Page} page - Playwright page object
 * @param {Object} options - Optional configuration (rarely needed)
 * @param {string} options.baseUrl - Base URL to strip from file paths (auto-detected)
 * @param {boolean} options.autoLog - Automatically log in real-time (default: true)
 * @returns {ConsoleCapture} Console capture instance
 */
function attachConsoleCapture(page, options = {}) {
  // Auto-detect baseUrl from first navigation if not provided
  if (!options.baseUrl) {
    page.once('framenavigated', frame => {
      if (frame === page.mainFrame()) {
        const url = frame.url();
        if (url && url.startsWith('http')) {
          const parsedUrl = new URL(url);
          options.baseUrl = `${parsedUrl.protocol}//${parsedUrl.host}`;
        }
      }
    });
  }
  
  return new ConsoleCapture(page, options);
}

/**
 * Simple helper - attach and forget
 * Just logs everything automatically, no configuration needed
 */
function captureConsole(page) {
  return attachConsoleCapture(page, { autoLog: true });
}

module.exports = {
  attachConsoleCapture,
  captureConsole,
  ConsoleCapture
};

