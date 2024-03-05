import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from './LoginScreen';
import HomeScreen from './HomeScreen';
import BottomTabNavigator from './Navigation'; 
const Stack = createNativeStackNavigator();

function AppNavigator({deviceToken}) {
  return (
    <Stack.Navigator initialRouteName="Login">
      <Stack.Screen 
        name="Login" 
        options={{ headerShown: false }}
        children={() => <LoginScreen deviceToken={deviceToken} />} 
      />
      <Stack.Screen 
        name="Main"
        component={BottomTabNavigator} 
        options={{ headerShown: false }} 
      />
    </Stack.Navigator>
  );
}

export default AppNavigator;
