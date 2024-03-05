import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from './LoginScreen';
import DashboardHealthcare from './DashboardHealthcare';
import BottomTabNavigator from './Navigation'; 
import DashboardScreen from './DashboardScreen';

const Stack = createNativeStackNavigator();

function AppNavigator({deviceToken}) {
  return (
    <Stack.Navigator initialRouteName="Login"screenOptions={{ headerShown: false }}>
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
      <Stack.Screen name="Dashboard" component={DashboardScreen} />
      <Stack.Screen name="RitmoCardiaco" component={DashboardHealthcare} />
    </Stack.Navigator>
  );
}

export default AppNavigator;
