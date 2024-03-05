import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Image } from 'react-native';
import HomeScreen from './HomeScreen';
import DashboardScreen from './DashboardScreen';
import CuidadorDashboard from './PatientList';
import { useAuth } from './AuthContext';
import MedicationReminderScreen from './MedicationScreen';
import CalendarScreen from './CalendarScreen';

const Profile = require('./src/icons/user_person_profile_account_icon_259562.png');
const dashboardicon = require('./src/icons/analytic_dashboard_home_manage_user_interface_icon_123286.png');
const Calendario = require('./src/icons/calendar.png');
const medicamento = require('./src/icons/medication.png');
const listapaciente=require('./src/icons/patientlist.png')

const Tab = createBottomTabNavigator();

const BottomTabNavigator = () => {
  const { user } = useAuth();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color }) => {
          let icon;
          if (route.name === 'Perfil') {
            icon = <Image source={Profile} style={{ width: 35, height: 35, tintColor: color }} />;
          } else if (route.name === 'Datos') {
            icon = <Image source={dashboardicon} style={{ width: 30, height: 30, tintColor: color }} />;
          } else if (route.name === 'Calendario') {
            icon = <Image source={Calendario} style={{ width: 30, height: 30, tintColor: color }} />;
          } else if (route.name === 'Lista') {
            icon = <Image source={listapaciente} style={{ width: 30, height: 30, tintColor: color }} />;
          } else if (route.name === 'Medicamento') {
            icon = <Image source={medicamento} style={{ width: 30, height: 30, tintColor: color }} />;
          }
          return icon;
        },
        tabBarActiveTintColor: '#ff5b37', 
        tabBarInactiveTintColor: '#086567', 
        tabBarStyle: {
          backgroundColor: '#eefffc', 
          borderTopColor: 'transparent',
        },
        tabBarLabelStyle: {
          fontSize: 12,
        },
        headerShown: false,
      })}
    >

      <Tab.Screen name="Perfil" component={HomeScreen} />
      
      {user && user.roles === 'paciente' && (
        <>
          <Tab.Screen name="Datos" component={DashboardScreen} />
          <Tab.Screen name="Calendario" component={CalendarScreen} />
          <Tab.Screen name="Medicamento" component={MedicationReminderScreen} />
        </>
      )}

      {user && user.roles === 'cuidador' && (
        <>
          <Tab.Screen name="Lista" component={CuidadorDashboard} />
        </>
      )}
    </Tab.Navigator>
  );
};

export default BottomTabNavigator;
