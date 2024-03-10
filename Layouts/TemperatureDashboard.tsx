import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from 'react-native';
import LottieView from 'lottie-react-native';
import { LineChart } from 'react-native-chart-kit';
import { useNavigation } from '@react-navigation/native';

const TemperatureDashboard = () => {
    const lottieSource = require('./src/temperature.json');
    const navigation = useNavigation();
    const [temperatura, setTemperatura] = useState(null);
    const [dataValues, setDataValues] = useState(Array(60).fill(0));

    useEffect(() => {
        const fetchTemperatura = () => {
            fetch('https://carinosaapi.onrender.com/api/arduino/devices')
                .then(response => response.json())
                .then(data => {
                    const deviceData = data.find(device => device.thing.device_name === 'Esp32');
                    if (deviceData) {
                        const temperaturaProperty = deviceData.thing.properties.find(prop => prop.name === 'temperatura');
                        if (temperaturaProperty) {
                            setTemperatura(parseFloat(temperaturaProperty.last_value));
                        }
                    }
                })
                .catch(error => console.error("Error fetching device data:", error));
        };
        const intervalId = setInterval(fetchTemperatura, 5000); 
        return () => clearInterval(intervalId);
    }, []);

    useEffect(() => {
        if (temperatura !== null) { 
            setDataValues(prevData => [...prevData.slice(1), temperatura]);
        }
    }, [temperatura]); 

    let estado = 'normal';
    if (temperatura < 36.0) estado = 'hipotermia';
    else if (temperatura > 37.5) estado = 'fiebre';

    const estadoColor = {
        normal: '#2ecc71',
        fiebre: '#e74c3c',
        hipotermia: '#3498db',
    };

    const handleBackButtonPress = () => navigation.goBack();

    const dataLabels = Array.from({ length: dataValues.length }, (_, i) => `Min ${i + 1}`);
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
            <Text style={styles.temperature}>Temperatura: {temperatura ? `${temperatura.toFixed(1)}°C` : 'Cargando...'}</Text>
            <Text style={[styles.status, { color: estadoColor[estado] }]}>Estado: {estado}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <LineChart data={data} width={chartWidth} height={300} chartConfig={chartConfig} yAxisSuffix="°C" bezier />
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
    temperature: {
        fontSize: 25,
        fontWeight: 'bold',
        marginVertical: 20,
        color: '#ff5b37',
    },
    status: {
        fontSize: 24,
        marginBottom: 20,
        color: '#ff5b37',
    },
    backButtonImage: {
        width: 30,
        height: 30,
        marginRight: 8,
    },
});

export default TemperatureDashboard;
