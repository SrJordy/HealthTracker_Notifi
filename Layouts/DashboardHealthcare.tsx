import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from 'react-native';
import LottieView from 'lottie-react-native';
import { LineChart } from 'react-native-chart-kit';
import { useNavigation } from '@react-navigation/native';

const DashboardHealthcare = () => {
    const lottieSource = require('./src/healthanimation.json');
    const navigation = useNavigation();
    const [ritmoCardiaco, setRitmoCardiaco] = useState(null);

    const [dataValues, setDataValues] = useState(Array(60).fill(0));

    useEffect(() => {
        const fetchRitmoCardiaco = () => {
            fetch('https://carinosaapi.onrender.com/api/arduino/devices')
                .then(response => response.json())
                .then(data => {
                    const deviceData = data.find(device => device.thing.device_name === 'Esp32');
                    if (deviceData) {
                        const latidosProperty = deviceData.thing.properties.find(prop => prop.name === 'latidos');
                        if (latidosProperty) {
                            const nuevoValorRitmoCardiaco = parseFloat(latidosProperty.last_value);
                            setRitmoCardiaco(nuevoValorRitmoCardiaco);
                            // Asegúrate de que la actualización de dataValues refleje los cambios en tiempo real
                            setDataValues(prevData => {
                                // Aquí creas un nuevo array que refleje el cambio, preservando la longitud deseada del array
                                const newData = [...prevData.slice(1), nuevoValorRitmoCardiaco];
                                return newData;
                            });
                        }
                    }
                })
                .catch(error => console.error("Error fetching device data:", error));
        };
        // Establece un intervalo para la actualización. Ajusta este intervalo según la frecuencia de actualización deseada.
        const intervalId = setInterval(fetchRitmoCardiaco, 5000);
        return () => clearInterval(intervalId);
    }, []);
    

    const estadoColor = {
        normal: '#2ecc71',
        bradicardia: '#3498db',
        taquicardia: '#e74c3c',
    };

    let estado = 'normal';
    if (ritmoCardiaco < 60) estado = 'bradicardia';
    else if (ritmoCardiaco > 100) estado = 'taquicardia';

    const handleBackButtonPress = () => navigation.goBack();

    const dataLabels = Array.from({ length: dataValues.length }, (_, i) => `${i + 1}`);
    const chartWidth = Math.max(700, dataLabels.length * 60);

    const data = {
        labels: dataLabels,
        datasets: [{
            data: dataValues,
            color: () => estadoColor[estado],
            strokeWidth: 2,
        }],
    };

    const chartConfig = {
        backgroundGradientFrom: '#ffffff',
        backgroundGradientTo: '#ffffff',
        color: () => `rgba(0, 0, 0, 1)`,
        strokeWidth: 2,
        propsForLabels: {
            fontSize: 10,
        },
        decimalPlaces: 0, // Muestra valores sin decimales para simular mejor un electrocardiograma
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.backButton} onPress={handleBackButtonPress}>
                <Image source={require('./src/icons/return.png')} style={styles.backButtonImage} />
                <Text style={styles.backButtonText}>Retroceder</Text>
            </TouchableOpacity>

            <View style={styles.lottieContainer}>
                <LottieView source={lottieSource} autoPlay loop style={styles.lottieLogo} />
            </View>

            <Text style={styles.heartRate}>Ritmo Cardíaco: {ritmoCardiaco !== null ? `${ritmoCardiaco} bpm` : 'Cargando...'} </Text>
            <Text style={[styles.status, { color: estadoColor[estado] }]}>Estado: {estado}</Text>

            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <LineChart
                    data={data}
                    width={chartWidth}
                    height={220}
                    chartConfig={chartConfig}
                    yAxisSuffix=" bpm"
                    bezier
                />
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        backgroundColor: '#eefffc',
    },
    backButton: {
        position: 'absolute',
        top: 40,
        left: 20,
        flexDirection: 'row',
        alignItems: 'center',
    },
    backButtonText: {
        fontSize: 20,
        color: '#086567',
    },
    lottieContainer: {
        marginTop: 60,
        alignItems: 'center',
        justifyContent: 'center',
    },
    lottieLogo: {
        width: 150,
        height: 150,
    },
    heartRate: {
        fontSize: 25,
        fontWeight: 'bold',
        marginVertical: 20,
        color: '#ff5b37',
    },
    status: {
        fontSize: 24,
        marginBottom: 20,
    },
    backButtonImage: {
        width: 30,
        height: 30,
        marginRight: 8,
    },
});

export default DashboardHealthcare;
