import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, ScrollView, Dimensions } from 'react-native';
import LottieView from 'lottie-react-native';
import { useAuth } from './AuthContext';

const temperatura = require('./src/temperature.json');
const ritmoCardiacoAnimation = require('./src/healthanimation.json');
const Calendario = require('./src/icons/calendar.png');
const medicamento = require('./src/icons/medication.png');

const { width } = Dimensions.get('window');
const cardSize = (width - 60) * 0.45;
const imageSize = cardSize * 0.5;
const fontSizeTitle = cardSize * 0.1;
const fontSizeContent = cardSize * 0.08;

const DashboardScreen = ({ navigation }) => {
  const { user, pacie } = useAuth();
  const [ritmoCardiaco, setRitmoCardiaco] = useState(null);
  const [Temp, setTemperatura] = useState('');


  useEffect(() => {
    const intervalId = setInterval(() => {
      fetch('https://carinosaapi.onrender.com/api/arduino/devices')
        .then((response) => response.json())
        .then((data) => {
          const deviceData = data.find(device => device.thing.device_name === 'Esp32');
          if (deviceData) {
            const latidosProperty = deviceData.thing.properties.find(prop => prop.name === 'latidos');
            const temperaturaProperty = deviceData.thing.properties.find(prop => prop.name === 'temperatura');

            if (latidosProperty) {
              setRitmoCardiaco(latidosProperty.last_value);
              console.log(`Ritmo Cardíacoss: ${latidosProperty.last_value} bpm`);

            }

            if (temperaturaProperty) {
              setTemperatura(temperaturaProperty.last_value);
              console.log(`Temperatura: ${temperaturaProperty.last_value}°C`);

            }
          }
        })
        .catch((error) => console.error("Error fetching device data:", error));
    }, 5000);
    return () => clearInterval(intervalId);
  }, []);


  const pacienteId = user.roles === 'paciente' ? user.Paciente.ID : pacie.ID;
  console.log(`El ID del paciente es: ${pacienteId}`);

  return (
    <>
      {user.roles === 'cuidador' && (
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%', padding: 20 }}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backButtonText}>Volver</Text>
          </TouchableOpacity>
        </View>
      )}
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.row}>
          <TouchableOpacity style={[styles.card, { height: cardSize }]} onPress={() => navigation.navigate('RitmoCardiaco')}>
            <Text style={[styles.cardTitle, { fontSize: fontSizeTitle }]}>Ritmo Cardíaco</Text>
            <LottieView source={ritmoCardiacoAnimation} style={[styles.lottieAnimation, { width: imageSize, height: imageSize }]} autoPlay loop />
            <Text style={[styles.cardContent, { fontSize: fontSizeContent }]}>
              {ritmoCardiaco !== null ? `${ritmoCardiaco} bpm` : 'Cargando...'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.card, { height: cardSize }]} onPress={() => navigation.navigate('Temperatura')}>
            <Text style={[styles.cardTitle, { fontSize: fontSizeTitle }]}>Temperatura</Text>
            <LottieView source={temperatura} style={[styles.lottieAnimation, { width: imageSize, height: imageSize }]} autoPlay loop />
            <Text style={[styles.cardContent, { fontSize: fontSizeContent }]}>
              {Temp ? `${parseFloat(Temp).toFixed(2)}°C` : 'Cargando...'}
            </Text>
          </TouchableOpacity>
        </View>

        {user.roles === 'cuidador' && (
          <View style={styles.row}>
            <TouchableOpacity style={[styles.card, { height: cardSize }]} onPress={() => navigation.navigate('Calendario')}>
              <Text style={[styles.cardTitle, { fontSize: fontSizeTitle }]}>Agenda</Text>
              <Image source={Calendario} style={[styles.imageStyle, { width: imageSize, height: imageSize }]} />
              <Text style={[styles.cardContent, { fontSize: fontSizeContent }]}>Ver tu agenda</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.card, { height: cardSize }]} onPress={() => navigation.navigate('Medicina')}>
              <Text style={[styles.cardTitle, { fontSize: fontSizeTitle }]}>Medicamentos</Text>
              <Image source={medicamento} style={[styles.imageStyle, { width: imageSize, height: imageSize }]} />
              <Text style={[styles.cardContent, { fontSize: fontSizeContent }]}>Lista de medicamentos</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 20,
  },
  card: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff2ed',
    borderRadius: 10,
    shadowColor: '#450508',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    padding: 20,
    width: cardSize,
  },
  cardTitle: {
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#ff5b37',
  },
  cardContent: {
    color: '#00a4a3',
  },
  lottieAnimation: {
    marginBottom: 10,
  },
  imageStyle: {
    marginBottom: 10,
  },
  backButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    backgroundColor: 'lightgray',
  },
  backButtonText: {
    fontSize: 18,
    color: '#007bff',
  },
});

export default DashboardScreen;
