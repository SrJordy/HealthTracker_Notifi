import React from 'react';
import { useNotifications } from './Layouts/Notification';
import LoginScreen from './Layouts/LoginScreen';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet } from 'react-native';
const App = () => {
  const deviceToken = useNotifications();

  return (
    <SafeAreaView style={styles.container}>
      <LoginScreen deviceToken={deviceToken} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default App;