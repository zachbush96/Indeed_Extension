(function () {
  console.log('%cContent script initialized.', 'color: green; font-weight: bold;');

  chrome.runtime.onMessage.addListener((message) => {
    console.log('Message received in content.js:', message);

    if (message.action === 'activateSelectionMode') {
      activateSelectionMode();
    } else if (message.action === 'nextStep') {
      console.log(message.stepMessage);
    }
  });

  function activateSelectionMode() {
    console.log('Selection mode activated.');
    //alert('Selection mode is active. Press Escape to stop.');

    document.body.style.backgroundColor = 'rgba(0, 0, 0, 0.15)';
    document.body.addEventListener('mouseover', highlightElement);
    document.body.addEventListener('mouseout', removeHighlight);
    document.body.addEventListener('click', handleElementClick);
    document.addEventListener('keydown', stopSelectionMode);
  }

  function highlightElement(event) {
    clearHighlights();
    const element = event.target;
    element.style.outline = '2px solid red';
    element.setAttribute('data-highlighted', 'true');
  }

  function removeHighlight(event) {
    const element = event.target;
    if (element.hasAttribute('data-highlighted')) {
      element.style.outline = '';
      element.removeAttribute('data-highlighted');
    }
  }

  function clearHighlights() {
    document.querySelectorAll('[data-highlighted]').forEach((el) => {
      el.style.outline = '';
      el.removeAttribute('data-highlighted');
    });
  }

  function handleElementClick(event) {
    event.preventDefault();
    const element = event.target;
    const xpath = generateXPath(element);
    const textContent = element.textContent.trim();
    console.log('Element selected:', { xpath, textContent });

    chrome.runtime.sendMessage({ action: 'storeSelection', xpath, textContent });
  }

  function stopSelectionMode(event) {
    if (event.key === 'Escape') {
      console.log('Selection mode deactivated.');
      document.body.style.backgroundColor = '';
      clearHighlights();
      document.body.removeEventListener('mouseover', highlightElement);
      document.body.removeEventListener('mouseout', removeHighlight);
      document.body.removeEventListener('click', handleElementClick);
      document.removeEventListener('keydown', stopSelectionMode);
    }
  }

  function generateXPath(element) {
    if (element.id) {
      return `//*[@id='${element.id}']`;
    }

    const parts = [];
    while (element && element.nodeType === Node.ELEMENT_NODE) {
      let index = 0;
      let sibling = element.previousSibling;
      while (sibling) {
        if (sibling.nodeType === Node.ELEMENT_NODE && sibling.nodeName === element.nodeName) {
          index++;
        }
        sibling = sibling.previousSibling;
      }

      const tagName = element.nodeName.toLowerCase();
      const pathIndex = index > 0 ? `[${index + 1}]` : '';
      parts.unshift(`${tagName}${pathIndex}`);
      element = element.parentNode;
    }

    return '/' + parts.join('/');
  }
})();
