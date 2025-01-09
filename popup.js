document.addEventListener('DOMContentLoaded', () => {
  console.log('Popup loaded. Adding event listeners.');

  const steps = ['Click the Job Title', 'Click the Company Name', 'Click the Job Description'];
  
  const startSelectionButton = document.getElementById('start-selection');
  const createResumeButton = document.getElementById('create-resume');
  const jobTitleInput = document.getElementById('job-title');
  const companyNameInput = document.getElementById('company-name');
  const jobDescriptionTextarea = document.getElementById('job-description');
  const jobTitleXPath = document.getElementById('job-title-xpath');
  const companyNameXPath = document.getElementById('company-name-xpath');
  const jobDescriptionXPath = document.getElementById('job-description-xpath');

  const dimOverlay = document.getElementById('dim-overlay');

  const fields = [
    document.getElementById('spotlight-job-title'),
    document.getElementById('spotlight-company-name'),
    document.getElementById('spotlight-job-description'),
  ];

  let currentStep = 0;

  startSelectionButton.addEventListener('click', () => {
    console.log('Begin Now button clicked. Injecting content script.');
    dimOverlay.classList.remove('hidden');
    highlightField(currentStep);

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tabId = tabs[0].id;
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
      checkIfAllFieldsFilled();
    } else if (message.action === 'nextStep') {
      removeHighlight(currentStep);
      currentStep++;
      if (currentStep < fields.length) {
        highlightField(currentStep);
      } else {
        dimOverlay.classList.add('hidden');
      }
    } else if (message.action === 'allStepsCompleted') {
      console.log('All selections are saved. You can now generate your resume.');
      checkIfAllFieldsFilled();
    }
  });

  createResumeButton.addEventListener('click', () => {
    const data = {
      Title: jobTitleInput.value,
      Company: companyNameInput.value,
      Description: jobDescriptionTextarea.value,
    };

    console.log('Sending POST request with data:', data);

    fetch('https://resumegen.ai/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
      .then((response) => response.json())
      .then((result) => {
        console.log('Resume generated successfully:', result);
        alert('Resume generated! Check the console for details.');
      })
      .catch((error) => {
        console.error('Error generating resume:', error);
        alert('Failed to generate resume. Check the console for details.');
      });
  });

  function checkIfAllFieldsFilled() {
    if (jobTitleInput.value && companyNameInput.value && jobDescriptionTextarea.value) {
      startSelectionButton.disabled = true;
      createResumeButton.classList.remove('hidden');
    }
  }

  function highlightField(step) {
    fields.forEach((field, index) => {
      if (index === step) {
        field.classList.remove('hidden');
        field.classList.add('highlighted-field');
      } else {
        field.classList.add('hidden');
        field.classList.remove('highlighted-field');
      }
    });
  }

  function removeHighlight(step) {
    fields[step].classList.remove('highlighted-field');
    fields[step].classList.add('hidden');
  }
});
