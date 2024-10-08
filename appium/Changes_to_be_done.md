## Appium Inspector Changes to work with Cometa
* ```app/common/renderer/actions/Session.js``` is the file which needs to be modified to load Appium Inspector with emulator automatically
* To start Appium Inspector in the development mode in the package.json change ```preview:browser``` command to ```"preview:browser": "npm run build:browser && vite preview --host --port 80"```
* Use Dockerfile with Docker compose

**Dockerfile**
<pre>
# Stage 1: This stage to download the appium inspector and build the code to get html files
FROM node:20

RUN apt install git
# Set the working directory inside the container
WORKDIR /app

COPY package.json package.json
# Install dependencies
RUN npm i
</pre>


**docker-compose.yml**
<pre>
services:
  # Use this command to have mutiple containers of ollama.ai
  # docker-compose -f docker-compose_ai.yml up --scale ollama.ai=3
  cometa.appium:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
    - "8089:80"
    volumes:
      - .:/app
    working_dir: /app 
    entrypoint: sleep infinity
    networks:
      - test
    restart: always

networks:
  test:
    driver: "bridge"
</pre>


* Create a button in the cometa_front which opens a new tab with this kind of url with url_encoded values, which is used by the which is changed in the Session.js 
<pre> http://prod.cometa.gpu:8089/?host=178.63.8.217&port=4723&path=/&ssl=false&autoStart=true&capabilities=%7B%27platformName%27%3A%20%27Android%27%2C%20%27appium%3AdeviceName%27%3A%20%27emulator-5554%27%2C%20%27appium%3AautomationName%27%3A%20%27UiAutomator2%27%2C%20%27appium%3AplatformVersion%27%3A%20%2712.0%27%7D
</pre>
* This URL consist below query parameter
    - host
    - port 
    - path
    - ssl (true/false)
    - capabilities <pre>{
    "platformName": "Android",
    "appium:deviceName": "emulator-5554",
    "appium:automationName": "UiAutomator2",
    "appium:platformVersion": "12.0"
    }</pre>
    - autoStart (true/false)

* Changes in the Session.js *If appium inspector have some new changes, which we want to update in the cometa then we again would need to modify Session.js again with these changes*
**git diff of Session.js**
    <pre>
    root@4c4644aa24a8:/app# git diff
    diff --git a/app/common/renderer/actions/Session.js b/app/common/renderer/actions/Session.js
    index bc21f07..51a46d2 100644
    --- a/app/common/renderer/actions/Session.js
    +++ b/app/common/renderer/actions/Session.js
    @@ -94,10 +94,17 @@ const NEW_COMMAND_TIMEOUT_SEC = 3600;
    
    let isFirstRun = true; // we only want to auto start a session on a first run
    
    -export const DEFAULT_SERVER_PATH = '/';
    -export const DEFAULT_SERVER_HOST = '127.0.0.1';
    -export const DEFAULT_SERVER_PORT = 4723;
    
    +// Function to get query parameters from the URL
    +function getQueryParam(param) {
    +  const params = new URLSearchParams(window.location.search);
    +  console.log(params)
    +  return params.get(param);
    +}
    +
    +export const DEFAULT_SERVER_PATH = getQueryParam('path') || '/';
    +export const DEFAULT_SERVER_HOST = getQueryParam('host') || '127.0.0.1';
    +export const DEFAULT_SERVER_PORT = getQueryParam('port') || 4723;
    const SAUCE_OPTIONS_CAP = 'sauce:options';
    
    const JSON_TYPES = ['object', 'number', 'boolean'];
    @@ -1009,12 +1016,22 @@ export function abortDesiredCapsEditor() {
    };
    }
    
    +function getCapabilitiesFromURL(){
    +  const params = new URLSearchParams(window.location.search);
    +  let capabilities = params.get('capabilities')
    +  console.log(capabilities);
    +  if (capabilities){
    +    return capabilities.replaceAll("'","\"");
    +  }
    +}
    +
    export function saveRawDesiredCaps() {
    return (dispatch, getState) => {
        const state = getState().session;
        const {rawDesiredCaps, caps: capsArray} = state;
    +    let capabilities = getCapabilitiesFromURL();
        try {
    -      const newCaps = JSON.parse(rawDesiredCaps);
    +      const newCaps = JSON.parse(capabilities || rawDesiredCaps);
    
        // Transform the current caps array to an object
        let caps = {};
    @@ -1186,3 +1203,67 @@ export function initFromQueryString(loadNewSession) {
        }
    };
    }
    +
    +// Function to wait for the textarea and perform the desired action
    +function waitForSaveButton(attempts = 0) {
    +  const saveButton = document.querySelector('button span[aria-label="save"]');
    +  if (saveButton) {
    +      saveButton.click();
    +      console.log('Save button clicked');
    +      const autoStart = getQueryParam("autoStart");
    +      // autoStart is true then only start the session otherwise let user click in the Start Session button
    +      if (autoStart==="true"){
    +          setTimeout(() => {
    +              const sessionButton = document.getElementById("btnStartSession");
    +              if (sessionButton) {
    +                  sessionButton.click();
    +                  console.log('Session button Clicked.');
    +              } else {
    +                  console.log('Session button not found.');
    +              }
    +          }, 100);
    +        }
    +  } else {
    +      console.log('Save button not found.');
    +      if (attempts < 10) {
    +          setTimeout(() => waitForTextAria(attempts + 1), 100); // Retry after 500ms
    +      }
    +  }
    +}
    +
    +// Function to wait for the edit button and trigger actions
    +function startInspector(attempts = 0) {
    +  // There are few changes done in the Session.js which checks for capabilities values in the query parameter
    +  // If capabilities exist in the query parameter then when save button is clicked it will load the value from query_parameter[capabilities]
    +  // to save capabilities first edit button should be clicked
    +  const editButton = document.querySelector('button span[aria-label="edit"]');
    +
    +  if (editButton) {
    +      // Edit button found, perform the action
    +      editButton.click();
    +      console.log('Edit button found.');
    +
    +      const sslEnabled = getQueryParam("ssl");
    +      console.log('SSL Enabled', sslEnabled);
    +      if (sslEnabled==='true') {
    +          document.getElementById('customServerSSL').click();
    +          console.log('SSL input checked');
    +      }
    +      // Wait for textarea actions after clicking edit
    +      setTimeout(() => waitForSaveButton(), 100);
    +  } else {
    +      // Edit button not found, retry if less than 10 attempts
    +      if (attempts < 10) {
    +          console.log('Edit button not found, retrying...');
    +          setTimeout(() => startInspector(attempts + 1), 100); // Retry after 500ms
    +      } else {
    +          console.log('Edit button not found after 10 attempts.');
    +      }
    +  }
    +}
    +
    +// Wait for the DOM to be fully loaded
    +document.addEventListener('DOMContentLoaded', () => {
    +  // Start waiting for the form elements to load
    +    startInspector();
    +});
    <pre>
