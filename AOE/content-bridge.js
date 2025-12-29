window.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'EXECUTE_PASTE') {
    // dispatch a event, content-main.js
    window.dispatchEvent(new CustomEvent('START_PASTE_PROCESS', { detail: {
      data: event.data.data ,
      contentType: event.data.contentType
        
      }}));
  }
});