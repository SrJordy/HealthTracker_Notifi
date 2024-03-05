// App.tsx

import React from 'react';
import { useNotifications } from './Layouts/Notification';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './Layouts/StackNav'; // Asegúrate de ajustar la ruta de importación
import { AuthProvider } from './Layouts/AuthContext';

const App = () => {
  const deviceToken = useNotifications();

  return (
    <NavigationContainer>
      <AuthProvider>
        <AppNavigator deviceToken={deviceToken} />
      </AuthProvider>
    </NavigationContainer>
  );
};

export default App;
