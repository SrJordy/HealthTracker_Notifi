import { useEffect, useState } from 'react';
import messaging from '@react-native-firebase/messaging';
import { Alert } from 'react-native';

export const useNotifications = () => {
  const [deviceToken, setDeviceToken] = useState('');

  useEffect(() => {
    const requestPermissionAndSetupChannel = async () => {
      const authorizationStatus = await messaging().requestPermission();
      if (authorizationStatus) {
        setupChannel();
        const token = await messaging().getToken();
        setDeviceToken(token);
      }
    };

    const setupChannel = () => {
      if (messaging().android) {
        const channel = new messaging.Android.Channel(
          'default_notification_channel',
          'General Notifications',
          messaging.Android.Importance.High
        ).setDescription('Used for general notifications');
        messaging().android.createChannel(channel);
      }
    };

    requestPermissionAndSetupChannel();

    const unsubscribe = messaging().onMessage(async remoteMessage => {
      Alert.alert('Notificación recibida', JSON.stringify(remoteMessage.notification));
    });

    return unsubscribe;
  }, []);

  return deviceToken;
};
