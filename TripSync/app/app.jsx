import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import WelcomePage from './Pages/WelcomePage';
import HomeScreen from './Pages/HomeScreen';
import TripPage from './Pages/TripPage';
import CreateGroupPage from './Pages/CreateGroupPage';
import TripsPlanned from './Pages/TripsPlanned';
import UserProfile from './Pages/UserProfile';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="WelcomePage">
        <Stack.Screen
          name="WelcomePage"
          component={WelcomePage}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="HomeScreen"
          component={HomeScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="TripPage"
          component={TripPage}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="CreateGroupPage"
          component={CreateGroupPage}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="TripsPlanned"
          component={TripsPlanned}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="UserProfile"
          component={UserProfile}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}