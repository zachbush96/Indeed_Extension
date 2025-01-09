let selectionStep = 0;
const steps = ['Click the Job Title', 'Click the Company Name', 'Click the Job Description'];
const storedSelections = [];

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Message received in background.js:', message);

  if (message.action === 'storeSelection') {
    const { xpath, textContent } = message;
    console.log(`Storing selection for step ${selectionStep}:`, { xpath, textContent });

    storedSelections.push({ xpath, textContent });

    // Update popup fields dynamically
    chrome.runtime.sendMessage({
      action: 'updateField',
      step: selectionStep,
      xpath,
      textContent,
    });

    selectionStep++;
    if (selectionStep < steps.length) {
      // Prompt user for the next step
      chrome.runtime.sendMessage({ action: 'nextStep', stepMessage: steps[selectionStep] });
    } else {
      console.log('All selections completed:', storedSelections);
      selectionStep = 0; // Reset for next use
      chrome.storage.local.set({ selections: storedSelections }, () => {
        chrome.runtime.sendMessage({ action: 'allStepsCompleted' });
      });
    }
  }
});
