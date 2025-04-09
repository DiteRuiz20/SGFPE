import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert } from 'react-native';
import React, { useEffect, useState } from 'react';
import { Divider } from 'react-native-elements';
import { useAuth } from '../../../../src/auth/AuthContext';
import { getUserById, updateUser } from '../../../../src/api/axios';
import { validateField } from '../../../InputValidator';
import { ScrollView } from 'react-native-gesture-handler';

export default function Profile() {
  const { userId, logout } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [formErrors, setFormErrors] = useState({ name: '', phoneNumber: '' });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user = await getUserById(userId);
        setName(user.name || '');
        setEmail(user.email || '');
        setPhoneNumber(user.phoneNumber || '');
      } catch (error) {
        Alert.alert('Error', 'Error al cargar el perfil');
      }
    };
    fetchUserData();
  }, [userId]);

  const handleNameChange = (text) => {
    setName(text);
    const result = validateField('nameOrDescription', text);
    setFormErrors((prev) => ({ ...prev, name: result.valid ? '' : result.message }));
  };

  const handlePhoneChange = (text) => {
    setPhoneNumber(text);
    const result = validateField('phoneNumber', text);
    setFormErrors((prev) => ({ ...prev, phoneNumber: result.valid ? '' : result.message }));
  };

  const validateInputs = () => {
    const nameValidation = validateField('nameOrDescription', name);
    const phoneValidation = validateField('phoneNumber', phoneNumber);

    const errors = {};
    if (!nameValidation.valid) errors.name = nameValidation.message;
    if (!phoneValidation.valid) errors.phoneNumber = phoneValidation.message;

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleUpdateInfo = async () => {
    if (!validateInputs()) return;

    Alert.alert(
      "Actualizar Perfil",
      "¿Estás seguro de que deseas actualizar tu perfil?",
      [
        {
          text: "Sí",
          onPress: async () => {
            try {
              // 1. Obtener datos actuales del usuario
              const currentData = await getUserById(userId);

              // 2. Crear un nuevo objeto con los campos actualizados y los demás intactos
              const updatedData = {
                ...currentData,
                name,
                phoneNumber
                // No tocamos: email, accountType, password, emailVerified, etc.
              };

              // 3. Enviar la actualización
              await updateUser(userId, updatedData);

              Alert.alert('Éxito', 'Perfil actualizado exitosamente');
            } catch (error) {
              Alert.alert('Error', 'Hubo un error al actualizar el perfil');
            }
          }
        },
        {
          text: "No"
        }
      ]
    );
  };

  const handleLogOut = () => {
    Alert.alert(
      "Cerrar Sesión",
      "¿Estás seguro de que deseas cerrar sesión?",
      [
        {
          text: "Sí",
          onPress: async () => {
            try {
              await logout();
            } catch (error) {
              Alert.alert('Error', 'No se pudo cerrar sesión');
            }
          }
        },
        {
          text: "No"
        }
      ]
    );
  };

  return (
    <ScrollView style={{ backgroundColor: '#fff' }} contentContainerStyle={{ flexGrow: 1 }}>
      <View style={styles.container}>
        <Text style={styles.title}>PERFIL</Text>

        <Text style={styles.label}>Nombre</Text>
        <TextInput
          style={styles.input}
          placeholder="Nombre"
          placeholderTextColor="#A9A9A9"
          value={name}
          onChangeText={handleNameChange}
        />
        {formErrors.name ? <Text style={styles.errorText}>{formErrors.name}</Text> : null}

        <Text style={styles.label}>Correo electrónico</Text>
        <TextInput
          style={[styles.input, { opacity: 0.6 }]}
          placeholder="Correo electrónico"
          placeholderTextColor="#A9A9A9"
          value={email}
          editable={false}
        />

        <Text style={styles.label}>Número telefónico</Text>
        <TextInput
          style={styles.input}
          placeholder="Número telefónico"
          placeholderTextColor="#A9A9A9"
          value={phoneNumber}
          onChangeText={handlePhoneChange}
          keyboardType='phone-pad'
        />
        {formErrors.phoneNumber ? <Text style={styles.errorText}>{formErrors.phoneNumber}</Text> : null}

        <View style={{ marginTop: 25, alignItems: 'center', width: '100%', gap: 10, marginBottom: 10 }}>
          <TouchableOpacity style={styles.secondary_button} onPress={handleUpdateInfo}>
            <Text style={styles.button_text}>ACTUALIZAR PERFIL</Text>
          </TouchableOpacity>
        </View>

        <Divider style={styles.divider} />

        <TouchableOpacity style={styles.logOut_button} onPress={handleLogOut}>
          <Text style={styles.button_text}>CERRAR SESION</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#30437A',
    marginBottom: 40,
  },
  input: {
    width: '100%',
    backgroundColor: '#EAEAEA',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: '#888',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 2,
  },
  errorText: {
    color: 'red',
    alignSelf: 'flex-start',
    marginBottom: 10
  },
  secondary_button: {
    width: '100%',
    backgroundColor: '#3DC9A7',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: '#3dc1ad',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 2,
  },
  button_text: {
    color: 'white',
    fontSize: 16,
  },
  divider: {
    width: '100%',
    height: 2,
    backgroundColor: '#EAEAEA',
    marginVertical: 15,
  },
  logOut_button: {
    width: '100%',
    backgroundColor: '#dd1e1e',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: '#d11717',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 2,
    marginTop: 15,
  },
  label: {
    fontSize: 14,
    color: '#41416e',
    marginBottom: 4,
    fontWeight: 'bold',
    textAlign: 'left', // importante
    width: '100%'
  }

});