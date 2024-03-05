import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Dimensions } from 'react-native';
import axios from 'axios';
import { useAuth } from './AuthContext';

const numColumns = 2;
const size = Dimensions.get('window').width / numColumns - 20;

const CuidadorDashboard = ({navigation}) => {
  const { user, setPaci} = useAuth(); 
  const [pacientes, setPacientes] = useState([]);

  useEffect(() => {
    const fetchPacientes = async () => {
      try {
        const response = await axios.get('https://carinosaapi.onrender.com/pacientecuidador/getAll');
        const data = response.data;
        const pacientesFiltrados = data
          .filter(d => d.CuidadorID === user.Cuidador.ID)
          .map(item => item.Paciente);
        setPacientes(pacientesFiltrados);
      } catch (error) {
        console.error('Error al obtener los pacientes:', error);
      }
    };

    fetchPacientes();
  }, [user.Cuidador.ID]);

  const calculateAge = birthdate => {
    const birthday = new Date(birthdate);
    const today = new Date();
    let age = today.getFullYear() - birthday.getFullYear();
    const m = today.getMonth() - birthday.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthday.getDate())) {
      age--;
    }
    return age;
  };

  const handleCardPress = paciente => {
    setPaci(paciente);
    console.log('paciente seleciconado:', paciente)
    navigation.navigate('Dashboard');
  };

  const renderItem = ({ item }) => {
    const edad = calculateAge(item.User.birthdate);
    return (
      <TouchableOpacity
        style={[styles.card, { width: size, height: size }]}
        onPress={() => handleCardPress(item)}
      >
        <View style={styles.textContainer}>
          <Text style={styles.cardTitle}>{item.User.firstname} {item.User.lastname}</Text>
          <Text style={styles.cardText}>Género: {item.User.gender}</Text>
          <Text style={styles.cardText}>Edad: {edad} años</Text>
          <Text style={styles.cardText}>Cedula: {item.cedula}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <FlatList
      data={pacientes}
      renderItem={renderItem}
      keyExtractor={item => String(item.ID)}
      numColumns={numColumns}
      contentContainerStyle={styles.container}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 10,
  },
  card: {
    flex: 1,
    margin: 10,
    backgroundColor: '#fff2ed',
    borderRadius: 10,
    shadowColor: '#450508',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    padding: 10,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ff5b37',
    textAlign: 'center',
    marginBottom: 5,
  },
  cardText: {
    fontSize: 14,
    color: '#00a4a3',
    textAlign: 'center',
  },
});

export default CuidadorDashboard;
