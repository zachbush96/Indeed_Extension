document.addEventListener('DOMContentLoaded', () => {
  console.log('Popup loaded. Adding event listener to the "Begin Now" button.');

  const startSelectionButton = document.getElementById('start-selection');

  if (startSelectionButton) {
    startSelectionButton.addEventListener('click', () => {
      console.log('Begin Now button clicked. Attempting to inject content script.');

      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const tabId = tabs[0].id;
        console.log('Injecting content script into tab:', tabId);

        chrome.scripting.executeScript(
          {
            target: { tabId: tabId },
            files: ['content.js'],
          },
          () => {
            if (chrome.runtime.lastError) {
              console.error('Failed to inject content script:', chrome.runtime.lastError.message);
            } else {
              console.log('Content script injected successfully.');
              chrome.tabs.sendMessage(tabId, { action: 'activateSelectionMode' });
            }
          }
        );
      });
    });
  } else {
    console.error('Start Selection button not found in the DOM.');
  }
});
