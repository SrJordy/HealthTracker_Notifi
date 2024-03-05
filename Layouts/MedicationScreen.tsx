import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Button,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Modal,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from './AuthContext';
import { Picker } from '@react-native-picker/picker';

const MedicationReminderScreen = () => {
  const { user, pacie } = useAuth();
  const pacienteID = user.roles === 'paciente' ? user.Paciente.ID : pacie.ID;
  const navigation = useNavigation();
  const [medicationData, setMedicationData] = useState([]);

  const [medicamentos, setMedicamentos] = useState([]);
  const [medicamentoSeleccionado, setMedicamentoSeleccionado] = useState(null);
  const [cantidad, setCantidad] = useState('');

  const [frecuencia, setFrecuencia] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newMed, setNewMed] = useState({
    nombre: '',
    descripcion: '',
  });
  const [showOptions, setShowOptions] = useState(false);
  const [showScheduleForm, setShowScheduleForm] = useState(false);

  useEffect(() => {
    const pacienteId = user.roles === 'paciente' ? user.Paciente.ID : pacie.ID;

    fetch('https://carinosaapi.onrender.com/horariomedicamentos/getAll')
      .then((response) => response.json())
      .then((data) => {
        // Filtrar en el cliente los medicamentos por paciente_id
        const medicamentosFiltrados = data.filter(med => med.paciente_id === pacienteId);

        if (medicamentosFiltrados.length > 0) {
          // Procesar los medicamentos filtrados como antes
          const groupedMedications = medicamentosFiltrados.reduce((acc, medication) => {
            const { medicamento_id } = medication;
            if (!acc[medicamento_id]) {
              acc[medicamento_id] = [];
            }
            acc[medicamento_id].push(medication);
            return acc;
          }, {});

          const medicationsWithMaxDoses = Object.values(groupedMedications).map((medications) => {
            medications.sort((a, b) => b.dosis_restantes - a.dosis_restantes);
            const medicationWithMaxDose = medications[0];

            const calculatedTimes = [];
            for (let i = 0; i < medicationWithMaxDose.dosis_restantes; i++) {
              const time = new Date(new Date(medicationWithMaxDose.hora_inicial).getTime() + i * medicationWithMaxDose.frecuencia * 3600000);
              calculatedTimes.push(time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
            }

            return {
              ...medicationWithMaxDose,
              horasConsumo: calculatedTimes,
            };
          });

          setMedicationData(medicationsWithMaxDoses);
        } else {
          // Si no hay medicamentos para el paciente actual, puedes manejarlo como prefieras
          setMedicationData([]);
          Alert.alert("Información", "No hay medicamentos registrados para este paciente.");
        }
      })
      .catch((error) => {
        console.error('Error al obtener medicamentos:', error);
        Alert.alert('Error', 'Error al cargar los medicamentos. Por favor, intente más tarde.');
      });
  }, [user, pacie]); // Dependencias del useEffect


  //obtener los medicamentos generales
  useEffect(() => {
    const fetchMedicamentos = async () => {
      try {
        const response = await fetch('https://carinosaapi.onrender.com/medicamento/getAll');
        const data = await response.json();
        setMedicamentos(data);
      } catch (error) {
        console.error('Error al obtener los medicamentos:', error);
        Alert.alert('Error al cargar los medicamentos. Por favor, intente más tarde.');
      }
    };

    fetchMedicamentos();
  }, []);


  const handleAddNewMedication = async () => {
    if (!newMed.nombre.trim() || !newMed.descripcion.trim()) {
      Alert.alert('Por favor, complete todos los campos.');
      return;
    }

    try {
      const response = await fetch('https://carinosaapi.onrender.com/medicamento/insert', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nombre: newMed.nombre,
          descripcion: newMed.descripcion,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        Alert.alert('Medicamento guardado con éxito');
        setNewMed({ nombre: '', descripcion: '' });
        setShowAddForm(false);
        setShowOptions(false);
      } else {
        Alert.alert('Error al guardar el medicamento: ' + (result.message || 'Intente nuevamente'));
      }
    } catch (error) {
      console.error('Error al guardar el medicamento:', error);
      Alert.alert('Error al conectar con el servidor. Por favor, intente más tarde.');
    }
  };



  const handleCancel = () => {
    setNewMed({ nombre: '', descripcion: '' }); // Limpiar campos
    setShowAddForm(false);
    setShowOptions(false);
  };

  const openAddMedicationForm = () => {
    setShowOptions(false);
    setShowAddForm(true);
  };

  const openAddScheduleForm = () => {
    console.log('Abrir formulario de horarios');
    setShowOptions(false);
  };

  const guardarHorario = async () => {
    console.log("id del paciente", pacienteID);
    // Asegurarse de que medicamentoSeleccionado no sea null y contenga un id
    if (!medicamentoSeleccionado || !medicamentoSeleccionado.ID || !cantidad.trim() || !frecuencia.trim()) {
      Alert.alert('Por favor, complete todos los campos correctamente.');
      return;
    }

    // Asegurarse de que pacienteId esté definido
    if (!pacienteID) {
      Alert.alert('Error: El ID del paciente no está disponible.');
      return;
    }

    const dataParaEnviar = {
      pacienteID: pacienteID,
      medicamentoID: medicamentoSeleccionado.ID,
      dosisInicial: parseInt(cantidad, 10),
      frecuencia: parseInt(frecuencia, 10),
    };

    console.log('Datos a guardar:', dataParaEnviar);

    try {
      const response = await fetch('https://carinosaapi.onrender.com/horariomedicamentos/insert', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataParaEnviar),
      });

      if (response.ok) {
        Alert.alert('Horario guardado con éxito');
        setMedicamentoSeleccionado(null);
        setCantidad('');
        setFrecuencia('');
        setShowScheduleForm(false);
      } else {
        const errorData = await response.json();
        Alert.alert('Error al guardar el horario: ' + (errorData.message || 'Por favor, intente nuevamente'));
      }
    } catch (error) {
      console.error('Error al guardar el horario:', error);
      Alert.alert('Error al conectar con el servidor. Por favor, intente más tarde.');
    }
  };






  return (
    <SafeAreaView style={styles.container}>
      {user.roles === 'cuidador' && (
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>Volver</Text>
        </TouchableOpacity>
      )}

      <ScrollView contentContainerStyle={styles.contentContainer}>
        <Text style={styles.staticTitle}>Lista de Medicamentos</Text>
        {medicationData.map((medication, index) => (
          <View key={index} style={styles.medicationItem}>
            <Text style={styles.infoText}>{`Medicamento: ${medication.nombre}`}</Text>
            <Text style={styles.infoText}>{`Descripción: ${medication.descripcion}`}</Text>
            <Text style={styles.infoText}>{`Frecuencia: Cada ${medication.frecuencia} horas`}</Text>
            <Text style={styles.infoText}>Horas de consumo:</Text>
            {medication.horasConsumo.map((hora, idx) => (
              <Text key={idx} style={styles.infoText}>{`- ${hora}`}</Text>
            ))}
          </View>
        ))}
      </ScrollView>

      {user.roles === 'cuidador' && (
        <TouchableOpacity style={styles.addButton} onPress={() => setShowOptions(!showOptions)}>
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      )}

      {showOptions && (
        <View style={styles.floatingButtonsContainer}>
          <TouchableOpacity
            style={styles.floatingButton}
            onPress={() => {
              setShowOptions(false);
              setShowAddForm(true);
            }}
          >
            <Text style={styles.floatingButtonText}>Medicamentos</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.floatingButton}
            onPress={() => {
              setShowOptions(false); // Oculta los botones flotantes
              setShowScheduleForm(true); // Muestra el formulario de horarios
            }}
          >
            <Text style={styles.floatingButtonText}>Horarios</Text>
          </TouchableOpacity>

        </View>
      )}


      <Modal
        animationType="slide"
        transparent={true}
        visible={showAddForm}
        onRequestClose={handleCancel}
      >
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>Agregar Nuevo Medicamento</Text>

            <Text style={styles.fieldTitle}>Nombre del medicamento:</Text>
            <TextInput
              style={styles.input}
              onChangeText={(text) => setNewMed({ ...newMed, nombre: text })}
              value={newMed.nombre}
              placeholder="Nombre del medicamento"
            />

            <Text style={styles.fieldTitle}>Descripción:</Text>
            <TextInput
              style={[styles.input, styles.inputDescription]}
              onChangeText={(text) => setNewMed({ ...newMed, descripcion: text })}
              value={newMed.descripcion}
              placeholder="Descripción"
              multiline
            />

            <View style={styles.buttonGroup}>
              <TouchableOpacity style={styles.buttonCancel} onPress={handleCancel}>
                <Text style={styles.buttonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.buttonSave} onPress={handleAddNewMedication}>
                <Text style={styles.buttonText}>Guardar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <Modal
        animationType="slide"
        transparent={true}
        visible={showScheduleForm}
        onRequestClose={() => setShowScheduleForm(false)}
      >
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>Configurar Horario</Text>

            <Text style={styles.fieldTitle}>Medicamento:</Text>
            <Picker
              selectedValue={medicamentoSeleccionado}
              onValueChange={(itemValue, itemIndex) => setMedicamentoSeleccionado(medicamentos[itemIndex])}
              style={styles.input}
            >
              {medicamentos.map((medicamento, index) => (
                <Picker.Item key={index} label={medicamento.nombre} value={medicamento} />
              ))}
            </Picker>

            <Text style={styles.fieldTitle}>Cantidad:</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              onChangeText={setCantidad}
              value={cantidad}
              placeholder="Cantidad"
            />


            <Text style={styles.fieldTitle}>Frecuencia (horas):</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              onChangeText={setFrecuencia}
              value={frecuencia}
              placeholder="Cada cuántas horas"
            />

            <View style={styles.buttonGroup}>
              <TouchableOpacity style={styles.buttonCancel} onPress={() => setShowScheduleForm(false)}>
                <Text style={styles.buttonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.buttonSave} onPress={guardarHorario}>
                <Text style={styles.buttonText}>Guardar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f8ff', // Curious Blue 50
  },
  inputDescription: {
    height: 100,
    textAlignVertical: 'top',
  },
  floatingButtonsContainer: {
    position: 'absolute',
    right: 20,
    bottom: 90,
    alignItems: 'flex-end',
  },
  floatingButton: {
    backgroundColor: '#007bff',
    marginBottom: 10,
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  floatingButtonText: {
    color: 'white',
    fontSize: 16,
  },
  staticTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#f01706', // Pomegranate 600
    alignSelf: 'center',
    marginBottom: 20,
  },
  contentContainer: {
    padding: 20,
  },
  medicationItem: {
    borderWidth: 1,
    borderColor: '#9e0e11', // Pomegranate 800
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    backgroundColor: '#fff2ed', // Pomegranate 50, for contrast
  },
  infoText: {
    color: '#086567', // Java 800
    marginBottom: 5,
  },
  backButton: {
    margin: 10,
    alignSelf: 'flex-start',
  },
  backButtonText: {
    fontSize: 18,
    color: '#065d9e', // Curious Blue 700
  },
  addButton: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    backgroundColor: '#ff5b37', // Pomegranate 400
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: 24,
    color: 'white',
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white', // Maintained for readability
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    width: '80%',
  },
  modalTitle: {
    marginBottom: 15,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ff4122', // Pomegranate 500
  },
  fieldTitle: {
    alignSelf: 'flex-start',
    fontSize: 16,
    fontWeight: 'bold',
    color: '#086567', // Ajusta el color según tu paleta
    marginTop: 10,
  },
  input: {
    width: '100%',
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#ced4da',
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
    color: '#086567', // Asegúrate de que el color del texto sea visible
    backgroundColor: '#eefffc', // Ajusta según necesites para contraste
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  buttonSave: {
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#007bff',
    paddingVertical: 10,
    width: '48%', // Ajusta el ancho como necesites
    justifyContent: 'center',
    alignItems: 'center',
  },

  buttonCancel: {
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#6c757d',
    paddingVertical: 10,
    width: '48%', // Ajusta el ancho como necesites
    justifyContent: 'center',
    alignItems: 'center',
  },

  buttonText: {
    color: 'white',
    fontSize: 16,
  },

});


export default MedicationReminderScreen;
