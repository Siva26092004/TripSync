import { Text, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import 'react-native-get-random-values';

import Navigation from "./Navigation";

export default function Index() {
  return (
    <>
      <Navigation />
      <Toast
        style={{ zIndex: 1 }}
        position="top"
        topOffset={50}
        /> 
    </>
  );
}
