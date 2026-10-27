/**
 * @format
 */

import { AppRegistry } from 'react-native';
import App from './App';
import appJson from './app.json';
import { focusFirst, startSpatialNavigation } from './web/spatialNavigation';

const appName = appJson.name;

AppRegistry.registerComponent(appName, () => App);
AppRegistry.runApplication(appName, {
  rootTag: document.getElementById('root'),
  callback: focusFirst,
});

startSpatialNavigation();

// The remote's Back key on webOS; this app has a single screen, so exit.
const WEBOS_BACK = 461;
document.addEventListener('keydown', event => {
  if (event.keyCode === WEBOS_BACK) window.close();
});
