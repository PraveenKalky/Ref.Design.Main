// Expose extension presence to the web page
document.documentElement.dataset.refDesignExtension = "connected";

window.addEventListener("DOMContentLoaded", () => {
  document.documentElement.dataset.refDesignExtension = "connected";
  window.dispatchEvent(new CustomEvent("REF_DESIGN_EXT_CONNECTED"));
});

// Periodically dispatch to ensure React captures connection if loaded late
const interval = setInterval(() => {
  window.dispatchEvent(new CustomEvent("REF_DESIGN_EXT_CONNECTED"));
}, 1000);
setTimeout(() => clearInterval(interval), 10000);

// Listen for fetch requests from React page
window.addEventListener("REF_DESIGN_SCRAPE_REQUEST", (event) => {
  const { url, id, requestId } = event.detail;
  
  console.log(`[Extension Content] Received request to scrape: ${url}`);
  
  chrome.runtime.sendMessage({ action: "scrape", url }, (response) => {
    console.log(`[Extension Content] Scrape response for ${url}:`, response);
    
    window.dispatchEvent(new CustomEvent("REF_DESIGN_SCRAPE_RESPONSE", {
      detail: {
        requestId,
        id,
        url,
        success: response?.success || false,
        data: response?.data || null,
        error: response?.error || "Failed to fetch metadata from extension background."
      }
    }));
  });
});
