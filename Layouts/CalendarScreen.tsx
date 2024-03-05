import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  SafeAreaView,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import DateTimePicker from '@react-native-community/datetimepicker';
import axios from 'axios';
import { useAuth } from './AuthContext';
import { useNavigation } from '@react-navigation/native';

const CalendarScreen = () => {
  const { user, pacie } = useAuth();
  const pacienteID = user.roles === 'paciente' ? user.Paciente.ID : pacie.ID;
  const navigation = useNavigation();
  const [showEventCreator, setShowEventCreator] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [events, setEvents] = useState({});
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [currentEvent, setCurrentEvent] = useState({ date: '', title: '', subject: '', time: new Date() });
  const [showTimePicker, setShowTimePicker] = useState(false);

  const loadEvents = useCallback(async () => {
    try {
      const response = await axios.get('https://carinosaapi.onrender.com/agenda/getAll');
      const data = response.data.filter(event => event.paciente_id === pacienteID); // Usar pacienteID
      setFilteredEvents(data);
    } catch (error) {
      console.error('Error al obtener los eventos:', error);
      Alert.alert("Error", "No se pudieron cargar los eventos.");
    }
  }, [pacienteID]); // Dependencia de pacienteID en useCallback



  useEffect(() => {
    loadEvents();

    const loadPacienteCuidadorRelation = async () => {
      try {
        const response = await axios.get('https://carinosaapi.onrender.com/pacientecuidador/getAll');
        const data = response.data;
        const userRelation = data.find(relation => relation.Paciente.User.ID === user.ID);
        if (userRelation) {
          console.log("Relación Paciente-Cuidador encontrada:", userRelation);
        } else {
          console.log("No se encontró una relación Paciente-Cuidador para el usuario.");
        }
      } catch (error) {
        console.error('Error al obtener la relación Paciente-Cuidador:', error);
      }
    };

    if (user.roles.includes('paciente')) {
      loadPacienteCuidadorRelation();
    }
  }, [pacienteID, user.ID, user.roles]);

  const openEventCreator = () => {
    setShowEventCreator(true);
    if (selectedDate === '') {
      setSelectedDate(new Date().toISOString().split('T')[0]);
    }
    setCurrentEvent({ date: selectedDate, title: '', subject: '', time: new Date() });
  };

  const onDayPress = (day) => {
    setSelectedDate(day.dateString);
    setCurrentEvent({ date: day.dateString, title: '', subject: '', time: new Date() });
  };

  const onChangeTime = (event, selectedTime) => {
    setShowTimePicker(false);
    if (selectedTime) {
      setCurrentEvent({ ...currentEvent, time: selectedTime });
    }
  };

  const handleSaveEvent = () => {
    if (!currentEvent.title || !currentEvent.subject) {
      Alert.alert("Error", "Por favor complete los campos requeridos.");
      return;
    }

    const fechaISO = new Date(currentEvent.date + 'T' + currentEvent.time.toISOString().split('T')[1]).toISOString();

    const eventToSave = {
      PacienteID: pacienteID, // Usar pacienteID aquí
      nombre: currentEvent.title,
      descripcion: currentEvent.subject,
      Fecha: fechaISO,
      Hora: fechaISO
    };

    axios.post('https://carinosaapi.onrender.com/agenda/insert', eventToSave)
      .then(response => {
        console.log('Evento guardado con éxito:', response.data);
        setCurrentEvent({ date: '', title: '', subject: '', time: new Date() });
        setShowEventCreator(false);
        loadEvents();
        Alert.alert("Éxito", "Evento guardado exitosamente");
      })
      .catch(error => {
        console.error('Error al guardar el evento:', error);
        Alert.alert("Error", "No se pudo guardar el evento. Intente nuevamente.");
      });
  };


  const handleCancelEvent = () => {
    setShowEventCreator(false);
  };

  const handleDeleteEvent = (id) => {
    /*if (user.roles.includes('cuidador')) {
      axios.delete(`https://carinosaapi.onrender.com/agenda/delete/${id}`)
        .then(response => {
          Alert.alert("Éxito", "Evento eliminado exitosamente.");
        })
        .catch(error => {
          console.error('Error al eliminar el evento:', error);
          Alert.alert("Error", "No se pudo eliminar el evento. Intente nuevamente.");
        });
    }*/
  };

  return (
    <SafeAreaView style={styles.container}>
      {user && user.roles.includes('cuidador') && (
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>Volver</Text>
        </TouchableOpacity>
      )}

      <Calendar onDayPress={onDayPress} markedDates={Object.keys(events).reduce((acc, cur) => {
        acc[cur.split("T")[0]] = { marked: true, dotColor: 'red' };
        return acc;
      }, {})} />

      {user && user.roles.includes('cuidador') && selectedDate && (
        <TouchableOpacity style={styles.addButton} onPress={openEventCreator}>
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      )}

      {showEventCreator && (
        <View style={styles.overlay}>
          <View style={styles.eventCreatorContainer}>
            <Text style={styles.fieldLabel}>Fecha: {currentEvent.date}</Text>
            <Text style={styles.fieldLabel}>Asunto: </Text>
            <TextInput
              style={styles.input}
              placeholder="Escribe el título aquí"
              value={currentEvent.title}
              onChangeText={(text) => setCurrentEvent({ ...currentEvent, title: text })}
            />
            <Text style={styles.fieldLabel}>Descripción:</Text>
            <TextInput
              style={[styles.input, styles.multilineInput]}
              placeholder="Escribe la descripción aquí"
              multiline
              value={currentEvent.subject}
              onChangeText={(text) => setCurrentEvent({ ...currentEvent, subject: text })}
            />
            <TouchableOpacity style={styles.timeInput} onPress={() => setShowTimePicker(true)}>
              <Text style={styles.timeText}>Hora: {currentEvent.time.toLocaleTimeString()}</Text>
            </TouchableOpacity>
            {showTimePicker && (
              <DateTimePicker
                value={currentEvent.time}
                mode="time"
                display="default"
                onChange={onChangeTime}
              />
            )}
            <View style={styles.buttonsContainer}>
              <TouchableOpacity style={styles.button} onPress={handleSaveEvent}>
                <Text style={styles.buttonText}>Guardar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={handleCancelEvent}>
                <Text style={styles.buttonText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      <ScrollView style={styles.eventsListContainer}>
        {filteredEvents.map((event) => {
          const fechaFormateada = event.fecha.split('T')[0];

          return (
            <View key={event.id} style={styles.eventItem}>
              <Text style={styles.eventDate}>Fecha: {fechaFormateada}</Text>
              <Text style={styles.eventTitle}>Nombre: {event.nombre}</Text>
              <Text style={styles.eventSubject}>Descripción: {event.descripcion}</Text>
              <Text style={styles.eventTime}>Hora: {new Date(event.hora).toLocaleTimeString()}</Text>
              {user && user.roles.includes('cuidador') && (
                <TouchableOpacity style={styles.deleteButton} onPress={() => handleDeleteEvent(event.id)}>
                  <Text style={styles.deleteButtonText}>Eliminar</Text>
                </TouchableOpacity>
              )}
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  backButton: {
    margin: 5,
    padding: 10,
    borderRadius: 5,
    backgroundColor: '#007bff',
  },
  backButtonText: {
    fontSize: 18,
    color: '#ffffff',
  },
  overlay: {
    position: 'absolute',
    backgroundColor: 'rgba(0,0,0,0.7)',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  eventCreatorContainer: {
    padding: 20,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    width: '90%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333333',
  },
  input: {
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#007bff',
    padding: 10,
    backgroundColor: '#ffffff',
    borderRadius: 5,
    color: '#333333',
  },
  multilineInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  timeInput: {
    padding: 10,
    marginBottom: 15,
    backgroundColor: '#eee',
    borderRadius: 5,
  },
  timeText: {
    color: '#333333',
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  button: {
    backgroundColor: '#28a745',
    padding: 10,
    borderRadius: 5,
    minWidth: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#dc3545',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
  addButton: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    backgroundColor: '#17a2b8',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  addButtonText: {
    fontSize: 24,
    color: 'white',
  },
  eventsListContainer: {
    marginTop: 20,
  },
  eventItem: {
    backgroundColor: '#ffffff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    marginHorizontal: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  eventDate: {
    fontSize: 16,
    color: '#333333',
  },
  eventTitle: {
    marginTop: 5,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007bff',
  },
  eventSubject: {
    fontSize: 16,
    color: '#666666',
  },
  eventTime: {
    fontSize: 14,
    color: '#555555',
    marginTop: 5,
  },
  deleteButton: {
    marginTop: 10,
    backgroundColor: '#dc3545',
    padding: 10,
    borderRadius: 5,
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
  },
});




export default CalendarScreen;
