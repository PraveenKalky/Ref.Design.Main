chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "scrape") {
    scrapeDribbbleViaTab(request.url)
      .then(data => sendResponse({ success: true, data }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true; // Keep channel open for async response
  }
});

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Injected page scraper function
function extractMetadataFromTab() {
  const challenge = document.getElementById('challenge-container') || 
                    document.querySelector('script[src*="awswaf"]') ||
                    document.title === "Dribbble - Show Us Your Dribbble";
  
  if (challenge) {
    return { status: "challenging" };
  }
  
  const ogImage = document.querySelector('meta[property="og:image"]')?.content ||
                  document.querySelector('meta[name="twitter:image"]')?.content;
                  
  const title = document.querySelector('title')?.innerText || "";
  const description = document.querySelector('meta[name="description"]')?.content ||
                      document.querySelector('meta[property="og:description"]')?.content || "";
                      
  if (!ogImage || !title || title.trim() === "" || title.trim() === "Dribbble") {
    return { status: "loading" };
  }

  // Ensure it's a valid shot image (not logo/avatar/placeholder)
  const cleanUrl = ogImage.trim();
  if (cleanUrl.includes('logo') || cleanUrl.includes('avatar') || cleanUrl.includes('assets/')) {
    return { status: "loading" };
  }

  return {
    status: "done",
    mediaUrl: cleanUrl,
    title: title.trim().replace(/\s*\|\s*Dribbble.*/i, ''),
    description: description.trim()
  };
}

async function scrapeDribbbleViaTab(url) {
  console.log(`[Extension Background] Spawning temporary tab for: ${url}`);
  
  // Create an inactive (background) tab
  const tab = await chrome.tabs.create({ url, active: false });
  const tabId = tab.id;

  try {
    let attempts = 100; // Max 15 seconds (100 * 150ms)
    let metadataResult = null;

    while (attempts > 0) {
      await delay(150);
      
      try {
        // Execute the extraction script in the tab context immediately during loading
        const results = await chrome.scripting.executeScript({
          target: { tabId },
          func: extractMetadataFromTab
        });
        
        const result = results?.[0]?.result;
        
        if (result) {
          if (result.status === "done") {
            metadataResult = {
              mediaUrl: result.mediaUrl,
              title: result.title,
              description: result.description || "Auto-saved via helper extension."
            };
            console.log(`[Extension Background] Extraction succeeded:`, metadataResult);
            break;
          } else {
            console.log(`[Extension Background] Tab is in state: ${result.status}, retrying...`);
          }
        }
      } catch (e) {
        // Script execution might fail if tab is not ready, ignore and retry next tick
        console.log(`[Extension Background] Execution tick error: ${e.message}`);
      }
      
      attempts--;
    }

    if (!metadataResult) {
      throw new Error("Scraper helper extension timed out solving the WAF challenge.");
    }

    return metadataResult;

  } finally {
    // Always clean up and close the tab
    console.log(`[Extension Background] Closing temporary tab: ${tabId}`);
    try {
      await chrome.tabs.remove(tabId);
    } catch (e) {
      console.warn("Failed to close tab:", e.message);
    }
  }
}
