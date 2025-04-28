import { Text, View } from "react-native";
import Toast from "react-native-toast-message";
import { NavigationContainer } from "@react-navigation/native";

import Navigation from "./Navigation";

export default function Index() {
  return (
    <>
      <Navigation />
      <Toast
        ref={(ref) => Toast.setRef(ref)}
        style={{ zIndex: 1 }}
        position="top"
        visibilityTime={3000}
        autoHide={true}
        topOffset={50}
        bottomOffset={40}
        onPress={() => Toast.hide()}
        onSwipeComplete={() => Toast.hide()}
        />   
    "
    </>
  );
}
