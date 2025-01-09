document.addEventListener('DOMContentLoaded', () => {
  console.log('Popup loaded. Adding event listener to the "Begin Now" button.');

  const steps = ['Click the Job Title', 'Click the Company Name', 'Click the Job Description']; // Define steps here

  const startSelectionButton = document.getElementById('start-selection');
  const jobTitleInput = document.getElementById('job-title');
  const companyNameInput = document.getElementById('company-name');
  const jobDescriptionTextarea = document.getElementById('job-description');
  const jobTitleXPath = document.getElementById('job-title-xpath');
  const companyNameXPath = document.getElementById('company-name-xpath');
  const jobDescriptionXPath = document.getElementById('job-description-xpath');

  // Listen for updates from the background script
  chrome.runtime.onMessage.addListener((message) => {
    if (message.action === 'updateField') {
      if (message.step === 0) {
        jobTitleInput.value = message.textContent;
        jobTitleXPath.textContent = `XPath: ${message.xpath}`;
      } else if (message.step === 1) {
        companyNameInput.value = message.textContent;
        companyNameXPath.textContent = `XPath: ${message.xpath}`;
      } else if (message.step === 2) {
        jobDescriptionTextarea.value = message.textContent;
        jobDescriptionXPath.textContent = `XPath: ${message.xpath}`;
      }
    } else if (message.action === 'allStepsCompleted') {
      alert('All selections are saved. You can now proceed to generate your resume.');
    }
  });

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
              alert(steps[0]); // Start with the first step
            }
          }
        );
      });
    });
  } else {
    console.error('Start Selection button not found in the DOM.');
  }
});
