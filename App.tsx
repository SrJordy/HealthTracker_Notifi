import React, {useState, useEffect} from 'react';
import {SafeAreaView, TextInput, Button, StyleSheet, Alert} from 'react-native';
import messaging from '@react-native-firebase/messaging';

const App = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [deviceToken, setDeviceToken] = useState('');

  useEffect(() => {
    const requestPermissionAndSetupChannel = async () => {
      const authorizationStatus = await messaging().requestPermission();
      if (authorizationStatus) {
        if (messaging().android) {
          const channel = new messaging.Android.Channel(
            'default_notification_channel',
            'General Notifications',
            messaging.Android.Importance.High
          ).setDescription('Used for general notifications');
          messaging().android.createChannel(channel);
        }

        const token = await messaging().getToken();
        setDeviceToken(token);
      }
    };

    requestPermissionAndSetupChannel();

    const unsubscribe = messaging().onMessage(async remoteMessage => {
      Alert.alert('Notificación recibida', JSON.stringify(remoteMessage.notification));
    });

    return unsubscribe;
  }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }

    try {
      const response = await fetch(
        'https://carinosaapi.onrender.com/api/login',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            password,
            deviceToken,
          }),
        },
      );

      if (response.ok) {
        const data = await response.json();
        console.log(data);
        console.log("Device Token:", deviceToken);
        Alert.alert('Login Successful', `You are logged in! Device Token: ${deviceToken}`);
      } else {
        Alert.alert('Login Failed', 'Please check your credentials');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Network Error', 'Unable to connect to the server');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />
      <Button title="Login" onPress={handleLogin} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    width: '80%',
    margin: 10,
    borderWidth: 1,
    padding: 10,
  },
});

export default App;
