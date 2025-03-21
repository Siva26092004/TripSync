import { Text, View } from "react-native";
import WelcomePage from "./Pages/WelcomePage";
import App from './app';  
import { registerRootComponent } from 'expo';

registerRootComponent(App);

export default function Index() {
  return (
    <WelcomePage />
  );
}
