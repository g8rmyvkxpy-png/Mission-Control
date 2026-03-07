const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function recordTaskDemo(taskId, taskTitle, agentName) {
  const videoDir = path.join(process.cwd(), 'public', 'videos');
  if (!fs.existsSync(videoDir)) {
    fs.mkdirSync(videoDir, { recursive: true });
  }

  let browser;
  let context;
  
  try {
    browser = await chromium.launch({ 
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    context = await browser.newContext({
      recordVideo: {
        dir: videoDir,
        size: { width: 1280, height: 720 }
      }
    });

    const page = await context.newPage();
    
    // Set a longer timeout for navigation
    page.setDefaultTimeout(30000);

    // Navigate to task board
    console.log(`[Video] Navigating to Task Board...`);
    await page.goto('http://localhost:3001/dashboard/board', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    // Look for the completed task and click it
    console.log(`[Video] Looking for task: ${taskTitle}`);
    
    // Try to find the task card by looking for the title in the DOM
    const taskSelector = `text="${taskTitle.substring(0, 30)}"`;
    
    try {
      await page.click(taskSelector, { timeout: 5000 });
      console.log(`[Video] Task clicked`);
      await page.waitForTimeout(5000);
    } catch (clickErr) {
      console.log(`[Video] Could not click task: ${clickErr.message}`);
      // Just navigate and take a screenshot instead
    }

    // Wait a bit more to capture the modal
    await page.waitForTimeout(3000);

    console.log(`[Video] Closing browser...`);
    
    // Close context - this saves the video
    await context.close();
    await browser.close();
    
    // Wait for file system to catch up
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Find the most recent video file
    const files = fs.readdirSync(videoDir)
      .filter(f => f.endsWith('.webm'))
      .map(f => ({
        name: f,
        path: path.join(videoDir, f),
        time: fs.statSync(path.join(videoDir, f)).mtime
      }))
      .sort((a, b) => b.time - a.time);

    if (files.length > 0) {
      console.log(`[Video] Recording saved: ${files[0].name}`);
      return files[0].path;
    }
    
    return null;
    
  } catch (err) {
    console.error(`[Video] Recording error: ${err.message}`);
    if (browser) await browser.close();
    throw err;
  }
}

module.exports = { recordTaskDemo };
