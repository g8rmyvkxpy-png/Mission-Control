/**
 * PPVentures RPA Engine - Optimized with Connection Pooling
 */

const { chromium } = require('playwright');

class RPAEngine {
  constructor() {
    this.browser = null;
    this.pool = [];
    this.maxPoolSize = 3;
    this.sessionId = null;
    this.screenshots = [];
    this.page = null;
  }

  /**
   * Get browser from pool or create new one
   */
  async getBrowser() {
    if (this.pool.length > 0) {
      const pooled = this.pool.pop();
      if (pooled.browser && pooled.browser.isConnected()) {
        console.log('[RPA] Reusing pooled browser');
        return pooled;
      }
    }
    
    // Create new optimized browser
    const browser = await chromium.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--disable-web-security',
        '--disable-features=IsolateOrigins,site-per-process',
        '--disable-extensions',
        '--disable-background-networking',
        '--disable-default-apps',
        '--disable-sync',
        '--no-first-run',
        '--single-process'
      ]
    });
    
    return { browser, isNew: true };
  }

  /**
   * Return browser to pool
   */
  async returnToPool(browser) {
    if (this.pool.length < this.maxPoolSize) {
      this.pool.push({ browser, timestamp: Date.now() });
    } else {
      await browser.close();
    }
  }

  /**
   * Open browser with pooling
   */
  async openBrowser(options = {}) {
    try {
      const pooled = await this.getBrowser();
      this.browser = pooled.browser;
      
      this.context = await this.browser.newContext({
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      });
      
      this.page = await this.context.newPage();
      this.sessionId = Date.now().toString(36);
      this.screenshots = [];
      
      // Set default timeout
      this.page.setDefaultTimeout(15000);
      
      console.log(`[RPA] Browser ready (session: ${this.sessionId}, pooled: ${!pooled.isNew})`);
      return { success: true, sessionId: this.sessionId, pooled: !pooled.isNew };
    } catch (error) {
      console.error('[RPA] Failed to open browser:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Navigate to URL
   */
  async navigateTo(url) {
    if (!this.page) return { success: false, error: 'Browser not opened' };
    
    try {
      const response = await this.page.goto(url, { 
        waitUntil: 'domcontentloaded',
        timeout: 15000 
      });
      
      return { 
        success: true, 
        url: this.page.url(),
        status: response?.status()
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Click element
   */
  async clickElement(selector) {
    if (!this.page) return { success: false, error: 'Browser not opened' };
    
    try {
      await this.page.click(selector);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Fill form field
   */
  async fillForm(selector, value) {
    if (!this.page) return { success: false, error: 'Browser not opened' };
    
    try {
      await this.page.fill(selector, value);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Fill multiple fields
   */
  async fillForms(fields) {
    const results = {};
    for (const [selector, value] of Object.entries(fields)) {
      results[selector] = await this.fillForm(selector, value);
    }
    return results;
  }

  /**
   * Extract text
   */
  async scrapeText(selector) {
    if (!this.page) return { success: false, error: 'Browser not opened' };
    
    try {
      const text = await this.page.textContent(selector);
      return { success: true, text: text?.trim() };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Extract table
   */
  async scrapeTable(selector) {
    if (!this.page) return { success: false, error: 'Browser not opened' };
    
    try {
      const rows = await this.page.$$(`${selector} tr`);
      const table = [];
      
      for (const row of rows) {
        const cells = await row.$$('td, th');
        const rowData = await Promise.all(cells.map(c => c.textContent()));
        if (rowData.some(c => c?.trim())) {
          table.push(rowData.map(c => c?.trim()));
        }
      }
      
      return { success: true, table };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Take screenshot
   */
  async takeScreenshot(options = {}) {
    if (!this.page) return { success: false, error: 'Browser not opened' };
    
    try {
      const screenshot = await this.page.screenshot({ 
        path: options.path || null,
        fullPage: options.fullPage || false
      });
      
      const screenshotData = {
        timestamp: new Date().toISOString(),
        base64: screenshot.toString('base64')
      };
      
      this.screenshots.push(screenshotData);
      return { success: true, ...screenshotData };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Wait for element
   */
  async waitForElement(selector, timeout = 10000) {
    if (!this.page) return { success: false, error: 'Browser not opened' };
    
    try {
      await this.page.waitForSelector(selector, { timeout });
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Element not found' };
    }
  }

  /**
   * Scroll page
   */
  async scrollPage(direction = 'down', amount = 500) {
    if (!this.page) return { success: false, error: 'Browser not opened' };
    
    try {
      await this.page.evaluate(({ dir, amt }) => {
        window.scrollBy(0, dir === 'down' ? amt : -amt);
      }, { dir: direction, amt: amount });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Extract all links
   */
  async extractLinks(selector = 'a') {
    if (!this.page) return { success: false, error: 'Browser not opened' };
    
    try {
      const links = await this.page.$$eval(selector, els => 
        els.map(e => ({
          text: e.textContent?.trim(),
          href: e.href,
          title: e.title
        })).filter(l => l.href)
      );
      
      return { success: true, links };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Full page scrape
   */
  async scrapePage() {
    if (!this.page) return { success: false, error: 'Browser not opened' };
    
    try {
      const data = await this.page.evaluate(() => {
        return {
          title: document.title,
          url: window.location.href,
          headings: {
            h1: Array.from(document.querySelectorAll('h1')).map(h => h.textContent?.trim()).filter(Boolean),
            h2: Array.from(document.querySelectorAll('h2')).map(h => h.textContent?.trim()).filter(Boolean),
            h3: Array.from(document.querySelectorAll('h3')).map(h => h.textContent?.trim()).filter(Boolean)
          },
          links: Array.from(document.querySelectorAll('a')).map(a => ({
            text: a.textContent?.trim(),
            href: a.href
          })).filter(l => l.href && l.text),
          meta: {
            description: document.querySelector('meta[name="description"]')?.content,
            keywords: document.querySelector('meta[name="keywords"]')?.content
          }
        };
      });
      
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Quick scrape for speed - skip heavy evaluation
   */
  async quickScrape() {
    if (!this.page) return { success: false, error: 'Browser not opened' };
    
    try {
      const data = await this.page.evaluate(() => ({
        title: document.title,
        url: window.location.href,
        links: Array.from(document.querySelectorAll('a')).slice(0, 50).map(a => ({
          text: a.textContent?.trim().substring(0, 50),
          href: a.href
        })).filter(l => l.href)
      }));
      
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get current URL
   */
  async getUrl() {
    return this.page?.url() || null;
  }

  /**
   * Close browser - return to pool
   */
  async closeBrowser() {
    if (this.browser) {
      await this.returnToPool(this.browser);
      this.browser = null;
      this.context = null;
      this.page = null;
    }
    return { success: true };
  }

  /**
   * Force close all pooled browsers
   */
  async closeAll() {
    for (const pooled of this.pool) {
      try {
        await pooled.browser.close();
      } catch (e) {}
    }
    this.pool = [];
    
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
    
    return { success: true };
  }
}

module.exports = new RPAEngine();
