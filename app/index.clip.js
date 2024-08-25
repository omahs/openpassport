/**
 * @format
 */

import { AppRegistry, LogBox } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import { TamaguiProvider, createTamagui } from 'tamagui';
import { config } from '@tamagui/config/v2-native'
import { ToastProvider } from '@tamagui/toast';
const tamaguiConfig = createTamagui(config)

LogBox.ignoreLogs([
  /bad setState/,
  'Warning, duplicate ID for input',
  /Warning, duplicate ID for input/
])

const Root = () => (
  <TamaguiProvider config={tamaguiConfig}>
    <ToastProvider swipeDirection="up">
      <App />
    </ToastProvider>
  </TamaguiProvider>

);

AppRegistry.registerComponent(appName, () => Root);