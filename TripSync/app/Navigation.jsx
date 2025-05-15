import * as React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import HomeScreen from "./Pages/HomeScreen";
import TripPage from "./Pages/TripPage";
import TripsPlanned from "./Pages/TripsPlanned";
import profilePage from "./Pages/profilePage";
import WelcomePage from "./Pages/WelcomePage";
import CreateGroupPage from "./Pages/CreateGroupPage";
import AuthScreen from "./Pages/AuthScreen";
import CommunityPage from "./Pages/communityPage";
const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Bottom Tab Navigator for the main app interface
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === "HomeScreen") {
            iconName = focused ? "home" : "home-outline";
          } else if (route.name === "TripPage") {
            iconName = focused ? "airplane" : "airplane-outline";
          } else if (route.name === "CommunityPage") {
            iconName = focused ? "person" : "person-outline";
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#007AFF",
        tabBarInactiveTintColor: "gray",
        tabBarStyle: {
          backgroundColor: "#fff",
          borderTopWidth: 0,
          elevation: 5,
          height: 60,
          paddingBottom: 5,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="HomeScreen" component={HomeScreen} />
      <Tab.Screen name="TripPage" component={TripPage} />
      <Tab.Screen name="CommunityPage" component={CommunityPage} />
    </Tab.Navigator>
  );
}

// Stack Navigator for the overall app navigation
export default function AppNavigation() {
  return (
    <Stack.Navigator initialRouteName="WelcomePage">
      <Stack.Screen
        name="AuthScreen"
        component={AuthScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="WelcomePage"
        component={WelcomePage}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="MainTabs"
        component={MainTabs}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="TripsPlanned"
        component={TripsPlanned}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="CreateGroupPage"
        component={CreateGroupPage}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="ProfilePage" 
        component={profilePage}
        options={{headerShown:false}}
      />    
    </Stack.Navigator>
  );
}