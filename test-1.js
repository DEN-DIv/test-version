// Оновлення кольорів блоків у реальному часі
document.getElementById('color1').addEventListener('input', function () {
   document.getElementById('block1').style.background = this.value;
});

document.getElementById('color2').addEventListener('input', function () {
  document.getElementById('block2').style.background = this.value;
});

document.getElementById('color3').addEventListener('input', function () {
  document.getElementById('block3').style.background = this.value;
});

function downloadElement() {
  let color1 = document.getElementById('block1').style.background;
  let color2 = document.getElementById('block2').style.background;
  let color3 = document.getElementById('block3').style.background;

  let content = `
      <!DOCTYPE html>
      <html lang="uk">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Збережений елемент</title>
          <style>
             .container {
                  display: flex;
                  flex-direction: column; 
                  align-items: center; 
                  gap: 1px; 
                  justify-content: center;
                  margin-top: 10px;
              }
              .block {
                  width: 100px;
                  height: 100px;
                  border: 1px solid #000;
              }
          </style>
      </head>
      <body>
          <div class="container">
              <div class="block" style="background: ${color1};"></div>
              <div class="block" style="background: ${color2};"></div>
              <div class="block" style="background: ${color3};"></div>
          </div>
      </body>
      </html>
`;

  let blob = new Blob([content], { type: 'text/html' });
  let a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'унікальний_елемент.html';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

function insertSavedElement() {
  const fileInput = document.getElementById('fileInput');
  const container = document.getElementById('importedElementContainer');
  if (!fileInput.files || fileInput.files.length === 0) {
    alert('Будь ласка, виберіть файл.');
    return;
  }

  const file = fileInput.files[0];

  if (file.type !== "text/html") {
    alert('Файл повинен бути у форматі HTML.');
    return;
  }

  const reader = new FileReader();

  reader.onload = function (event) {
    const htmlContent = event.target.result;

    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;

    const savedBlocks = tempDiv.querySelectorAll('.block');

    if (savedBlocks.length > 0) {
      container.innerHTML = '';
      savedBlocks.forEach(block => {
        container.appendChild(block.cloneNode(true));
      });
    } else {
      alert('Не знайдено жодного блоку для вставки.');
    }
  };

  reader.readAsText(file);
}

const config = {
    domain: 'dev-denys.eu.auth0.com',  // e.g., 'myapp.auth0.com'
    clientId: 'OiS5FhNeYJ5fmDbUT7dCzbzKhPbxLRPr',
    authorizationParams: {
        redirect_uri: window.location.origin + '/test-1.html',
        scope: 'openid profile email'
    }
};

let auth0_client = null;

const login = async () => {
  const currentPage = window.location.href;

  await auth0_client.loginWithRedirect({
    authorizationParams: {
      connection: 'google-oauth2',
      redirect_uri: 'http://localhost:8000/test-1.html',
      state: btoa(JSON.stringify({ returnUrl: currentPage }))
    }
  });
};

const initializeAuth0 = async () => {
  console.log("Testing");
  auth0_client = await window.auth0.createAuth0Client(config);

  // Check if we're returning from a redirect
  const isAuthenticated = await auth0_client.isAuthenticated();
  console.log("Hello", isAuthenticated);

  if (window.location.search.includes('code=') && window.location.search.includes('state=')) {
    try {
      const { appState } = await auth0_client.handleRedirectCallback();
      console.log(appState);

      const isAuthenticated = await auth0_client.isAuthenticated();
      const user = await auth0_client.getUser();
      console.log("Hello 2", user);

      // Redirect to the page user was on before login
      if (appState && appState.returnUrl) {
        window.location.href = appState.returnUrl;
        return;
      } else {
        // Fallback to current page
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    } catch (error) {
      console.error('Error handling redirect callback:', error);
    }
  }
}

window.addEventListener('load', initializeAuth0);
document.getElementById('btn-login').addEventListener('click', login);
