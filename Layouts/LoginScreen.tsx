import React, { useState } from 'react';
import { StyleSheet, TextInput, Button, Alert, View, Image, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useAuth } from './AuthContext';
import { useNavigation } from '@react-navigation/native';


const LoginScreen = ({ deviceToken }) => {
  const { setUser} = useAuth();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const logoImage = require('./src/IconoRedondo.png');
  const close_eye = require('./src/icons/closed_eye_icon_259685.png');
  const open_eye = require('./src/icons/eye_icon_259684.png');
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const navigation = useNavigation();

  const toggleSecureTextEntry = () => {
    setSecureTextEntry(!secureTextEntry);
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Por favor, ingresa tu email y contraseña');
      return;
    }

    setLoading(true);
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
        console.log("Login Success", data);
        Alert.alert('Inicio de sesión exitoso', `Has iniciado sesión! Token del dispositivo: ${deviceToken}`);
        setUser(data.user);
        navigation.navigate('Main');

      } else {
        Alert.alert('Fallo al iniciar sesión', 'Por favor, verifica tus credenciales');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error de red', 'No se pudo conectar al servidor');
    } finally {
      setLoading(false);
    }
  };
  return (
    <View style={styles.container}>
      <Image source={logoImage} style={styles.logo} />
      <Text style={styles.title}>Iniciar sesión</Text>

      <View style={styles.inputContainer}>
        <Icon name="user" size={24} color="#6e6869" />
        <TextInput
          style={styles.input}
          placeholder="Usuario"
          placeholderTextColor="gray"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />
      </View>

      <View style={styles.inputContainer}>
        <Icon name="lock" size={24} color="#6e6869" />
        <TextInput
          style={styles.input}
          placeholder="Contraseña"
          placeholderTextColor="gray"
          autoCapitalize="none"
          secureTextEntry={secureTextEntry}
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity onPress={toggleSecureTextEntry}>
          <Image source={secureTextEntry ? close_eye : open_eye} style={{ width: 30, height: 30 }} />
        </TouchableOpacity>
      </View>

      {
        loading ? (
          <ActivityIndicator size="large" color="#0000ff" />
        ) : (
          <TouchableOpacity style={styles.button} onPress={handleLogin}>
            <Text style={styles.buttonText}>Iniciar sesión</Text>
          </TouchableOpacity>
        )
      }

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#eefffc',
    padding: 20,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    color: '#065d9e',
    marginBottom: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    width: '100%',
    height: 56,
    backgroundColor: '#ffffff',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ff5b37',
    borderRadius: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#ff5b37',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 18,
    color: '#086567',
  },
  icon: {
    marginRight: 8,
  },
  button: {
    width: 150,
    height: 58,
    backgroundColor: '#ff4122',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    marginTop: 8,
    elevation: 3,
    shadowColor: '#ff4122',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  buttonText: {
    fontSize: 20,
    color: '#ffffff',
    fontWeight: 'bold',
  },
});

export default LoginScreen;
