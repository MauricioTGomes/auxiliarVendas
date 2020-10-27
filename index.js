import {AppRegistry} from 'react-native';
import Navigator from './src/Navigator';
import {name as appName} from './app.json';
import { iniciaSincronismo } from './src/services/Functions'

AppRegistry.registerHeadlessTask('SomeTaskName', () => iniciaSincronismo());
AppRegistry.registerComponent(appName, () => Navigator);