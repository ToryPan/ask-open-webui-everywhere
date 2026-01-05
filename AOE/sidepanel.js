const webview = document.getElementById('targetFrame');
const refreshBtn = document.getElementById('refreshBtn');
const screenBtn = document.getElementById('screenBtn');
const pasteBtn = document.getElementById('pasteBtn');


// 1. Initial load URL
function loadIframe() {
  chrome.storage.local.get("savedIframeUrl", (data) => {
    if (data.savedIframeUrl) {
      console.log("Loading sidebar URL:", data.savedIframeUrl);
      webview.src = data.savedIframeUrl;
    } else {
      // If not configured, provide a default value or hint
      webview.srcdoc = "<h3>Please configure the URL in the extension options first.</h3>";
    }
  });
};

// Initial execution
loadIframe();

// 1. Refresh button logic
refreshBtn.addEventListener('click', () => {
  webview.src = webview.src;
});

pasteBtn.addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab) return;

  const results = await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: () => {
      const tagsToRemove = [
        'SCRIPT', 'STYLE', 'NOSCRIPT', 'IFRAME', 'CANVAS', 'SVG',
        'HEADER', 'FOOTER', 'NAV', 'TEXTAREA', 'SELECT', 'APPLET', 'MAP'
      ];
      const indentSymbol = "\t"; // Indentation symbol, can be changed to "\t" or "    "

      // 2. Function to check if an element is visible
      const isVisible = (el) => {
        const style = window.getComputedStyle(el);
        // css style
        if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') {
        return false;
    }
        // true region
        return el.getClientRects().length > 0;
      };

      // Recursive processing function
      function processNode(node, depth) {
        // 1. Filter out unwanted tags or invisible elements
        if ((node.nodeType === Node.ELEMENT_NODE && tagsToRemove.includes(node.tagName)) || !isVisible(node)) {
          return [];
        }

        let lines = [];

        // 2. Process direct text child nodes of the current node
        // Extract text belonging directly to the current element to avoid duplication
        let directText = "";
        node.childNodes.forEach(child => {
          if (child.nodeType === Node.TEXT_NODE) {
            const text = child.textContent.trim();
            if (text) directText += (directText ? " " : "") + text;
          }
        });

        // 3. If the current node has text, apply indentation rules and add to array
        if (directText) {
          // Clean up redundant spaces in text
          const cleanedText = directText.replace(/[ \t]{2,}/g, ' ');
          lines.push(cleanedText);
        }

        // 4. Recursively process child elements (excluding text nodes, handled above)
        node.childNodes.forEach(child => {
          if (child.nodeType === Node.ELEMENT_NODE) {
            lines.push(...processNode(child, depth + 1));
          }
        });

        return lines;
      }

      // Start recursion from body, body defined as depth 0
      const allLines = processNode(document.body, 0);

      // 5. Final merge
      return allLines.join('\n');
    }
  });

  const extractedText = results[0].result;
  // Send to the iframe inside the sidebar

  webview.contentWindow.postMessage({ type: 'EXECUTE_PASTE',contentType: 'text', data: extractedText }, '*');
});

// 2. Insert Screen
screenBtn.addEventListener('click', async () => {
  try {
    // capture screen
    const dataUrl = await chrome.tabs.captureVisibleTab(null, { format: 'png' });
    
    // send to iframe
    webview.contentWindow.postMessage({ 
      type: 'EXECUTE_PASTE', 
      contentType: 'image', 
      data: dataUrl 
    }, '*');
  } catch (e) {
    console.error("Screenshot failed", e);
  }
});