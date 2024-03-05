import React, { useEffect } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, SafeAreaView, BackHandler } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from './AuthContext';

const HomeScreen = () => {
  const { user, setUser,setPaci } = useAuth();
  const navigation = useNavigation();
  useEffect(() => {
    const backAction = () => {
      return true;
    };
    BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => BackHandler.removeEventListener('hardwareBackPress', backAction);
  }, []);

  const handleLogout = () => {
    setUser(null);
    setPaci(null);
    navigation.replace('Login'); 
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Image source={require('./src/IconoRedondo.png')} style={styles.profilePic} />
        <Text style={styles.welcomeText}>¡Bienvenido, {user ? user.firstname : 'Usuario'}!</Text>
      </View>

      <View style={styles.userInfoSection}>
        <View style={styles.userInfoItem}>
          <Text style={styles.userInfoLabel}>Rol:</Text>
          <Text style={styles.userInfoText}>{user ? user.roles : 'N/A'}</Text>
        </View>
        <View style={styles.userInfoItem}>
          <Text style={styles.userInfoLabel}>Email:</Text>
          <Text style={styles.userInfoText}>{user ? user.email : 'N/A'}</Text>
        </View>
        <View style={styles.userInfoItem}>
          <Text style={styles.userInfoLabel}>Género:</Text>
          <Text style={styles.userInfoText}>{user ? user.gender : 'N/A'}</Text>
        </View>
        <View style={styles.userInfoItem}>
          <Text style={styles.userInfoLabel}>Fecha de nacimiento:</Text>
          <Text style={styles.userInfoText}>{user ? user.birthdate : 'N/A'}</Text>
        </View>
        <View style={styles.userInfoItem}>
          <Text style={styles.userInfoLabel}>Teléfono:</Text>
          <Text style={styles.userInfoText}>{user ? user.phone : 'N/A'}</Text>
        </View>
        <View style={styles.userInfoItem}>
          <Text style={styles.userInfoLabel}>Cédula:</Text>
          <Text style={styles.userInfoText}>{user ? user.cedula : 'N/A'}</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    backgroundColor: '#F0F8FF',
    padding: 20,
  },
  header: {
    alignItems: 'center',
  },
  profilePic: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: '#ffffff',
  },
  welcomeText: {
    marginTop: 10,
    fontSize: 20,
    color: '#ff4122', // Nuevo color
    fontWeight: 'bold',
  },
  userInfoSection: {
    marginTop: 30,
    backgroundColor: '#ffffff',
    borderRadius: 15,
    padding: 20,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  userInfoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  userInfoLabel: {
    fontSize: 16,
    color: '#1290de', // Nuevo color
    fontWeight: 'bold',
  },
  userInfoText: {
    fontSize: 16,
    color: '#0675c3', // Nuevo color
  },
  logoutButton: {
    marginTop: 20,
    backgroundColor: '#ff4500',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    elevation: 2,
    alignSelf: 'center',
  },
  logoutButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default HomeScreen;
