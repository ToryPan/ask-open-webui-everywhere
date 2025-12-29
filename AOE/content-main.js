(function() {
  let OriginalFile = window.File;
  let textToUse = "";
  let textTitle = "";
  let isAskAi = false;

  // 1. replace the File func
  window.File = function(bits, name, options) {
    if (typeof name === 'string' && name.startsWith('Pasted_Text_') && isAskAi) {
      isAskAi=false;
      const cleanBlob = new Blob([textToUse], { type: 'text/plain' });
      return new OriginalFile([cleanBlob], name, options);
    }
    return new OriginalFile(bits, name, options);
  };

  async function dataURLtoFile(dataurl, filename) {
    const res = await fetch(dataurl);
    const blob = await res.blob();
    return new OriginalFile([blob], filename, { type: 'image/png' });
  }


  // 2. listen the event from content-bridge.js
  window.addEventListener('START_PASTE_PROCESS', async (e) => {
    const { contentType, data } = e.detail;
    const el = document.querySelector('#chat-input');
    if (!el) return;
    const dataTransfer = new DataTransfer();

    el.focus();

    if (contentType === 'text') {
      // text
      textToUse = data;
      isAskAi = true;
      const baitText = textToUse.substring(0, 5) + " ".repeat(1000);
      dataTransfer.setData('text/plain', baitText);
    } 
    else if (contentType === 'image') {
      // image
      const imageFile = await dataURLtoFile(data, `screenshot_${Date.now()}.png`);
      dataTransfer.items.add(imageFile);
    }


    const event = new ClipboardEvent('paste', {
      clipboardData: dataTransfer,
      bubbles: true,
      cancelable: true,
      composed: true
    });
    el.dispatchEvent(event);
  });
})();