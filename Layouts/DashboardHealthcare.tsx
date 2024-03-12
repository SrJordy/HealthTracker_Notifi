import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from 'react-native';
import LottieView from 'lottie-react-native';
import { LineChart } from 'react-native-chart-kit';
import { useNavigation } from '@react-navigation/native';

const DashboardHealthcare = () => {
    const lottieSource = require('./src/healthanimation.json');
    const navigation = useNavigation();
    const [ritmoCardiaco, setRitmoCardiaco] = useState(null);
    const [estado, setEstado] = useState('normal');

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
                            setDataValues(prevData => {
                                const newData = [...prevData.slice(1), nuevoValorRitmoCardiaco];
                                return newData;
                            });
                            const newEstado = calcularEstado(nuevoValorRitmoCardiaco);
                            setEstado(newEstado);
                        }
                    }
                })
                .catch(error => console.error("Error fetching device data:", error));
        };
        const intervalId = setInterval(fetchRitmoCardiaco, 5000);
        return () => clearInterval(intervalId);
    }, []);

    useEffect(() => {
        const notificationTimer = setInterval(() => {
            if (estado !== 'normal') {
                enviarNotificacion();
            }
        }, 10000);

        return () => clearInterval(notificationTimer);
    }, [estado]);

    const calcularEstado = (ritmo) => {
        if (ritmo < 60) return 'bradicardia';
        else if (ritmo > 100) return 'taquicardia';
        else return 'normal';
    };

    const enviarNotificacion = () => {
        fetch('https://carinosaapi.onrender.com/api/sendp', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                title: 'Alerta de Ritmo Cardíaco',
                body: `El ritmo cardíaco es ${ritmoCardiaco} bpm, el paciente presenta un estado ${estado}. Por favor, revise el estado del paciente.`
            })

        })
        .then(response => {
            if (response.ok) {
                console.log('Notificación enviada con éxito');
            } else {
                console.error('Error al enviar la notificación');
            }
        })
        .catch(error => console.error('Error al enviar la notificación:', error));
    };

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
        decimalPlaces: 0,
    };

    const estadoColor = {
        normal: '#2ecc71',
        bradicardia: '#3498db',
        taquicardia: '#e74c3c',
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
