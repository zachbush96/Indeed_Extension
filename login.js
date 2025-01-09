document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('gsi-material-button').addEventListener('click', () => {
    const redirectURL = chrome.identity.getRedirectURL(); // https://epfkceglpfcajblagfffniigkafpcclc.chromiumapp.org/
    const clientId = '169810374201-adqdrbv5eqratspoj2tqr7rvf5ecokkc.apps.googleusercontent.com';
    const authURL = `https://accounts.google.com/o/oauth2/auth?` +
      `client_id=${clientId}` +
      `&response_type=token` +
      `&redirect_uri=${encodeURIComponent(redirectURL)}` +
      `&scope=email`; 

    chrome.identity.launchWebAuthFlow(
      {
        url: authURL,
        interactive: true
      },
      (redirectUri) => {
        if (chrome.runtime.lastError) {
          console.error('Login failed:', chrome.runtime.lastError.message);
        } else {
          const token = new URL(redirectUri).hash.split('&')[0].split('=')[1];
          console.log('Access Token:', token);

          // Fetch user info to verify login
          fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
            headers: { Authorization: `Bearer ${token}` },
          })
            .then((response) => response.json())
            .then((user) => {
              console.log('User Info:', user);
              const userInfo = {
                email: user.email,
                name: user.name,
                picture: user.picture
              };
              chrome.storage.local.set({ 
                userEmail: user.email,
                userInfo: userInfo 
              }, () => {
                console.log('User logged in:', user.email);
                window.location.href = 'popup.html';
              });
            })
            .catch((error) => console.error('Error fetching user info:', error));
        }
      }
    );
  });
});