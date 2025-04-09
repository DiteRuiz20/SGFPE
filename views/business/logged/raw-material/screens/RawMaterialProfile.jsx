import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert } from 'react-native';
import { Divider } from 'react-native-elements';
import { useAuth } from '../../../../../src/auth/AuthContext';
import { getUserById, updateUser } from '../../../../../src/api/axios';
import { validateField } from '../../../../InputValidator';
import { ScrollView } from 'react-native-gesture-handler';

export default function RawMaterialProfile() {
    const { userId, logout } = useAuth();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [address, setAddress] = useState('');
    const [formErrors, setFormErrors] = useState({ name: '', phoneNumber: '' });

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const user = await getUserById(userId);
                setName(user.name || '');
                setEmail(user.email || '');
                setPhoneNumber(user.phoneNumber || '');
                setAddress(user.address || '');
            } catch (error) {
                Alert.alert('Error', 'No se pudo cargar el perfil');
            }
        };
        fetchUser();
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

    const handleUpdate = async () => {
        if (!validateInputs()) return;

        Alert.alert("Actualizar Perfil", "¿Deseas guardar los cambios?", [
            {
                text: "Sí",
                onPress: async () => {
                    try {
                        const prevUser = await getUserById(userId); // ⚠️ Trae todo el usuario actual

                        const updatedUser = {
                            ...prevUser, // mantiene todos los campos anteriores
                            name,
                            phoneNumber,
                            address
                        };

                        console.log("Datos de la petición:", updatedUser);

                        await updateUser(userId, updatedUser);
                        Alert.alert("Éxito", "Perfil actualizado");
                    } catch (error) {
                        Alert.alert("Error", "No se pudo actualizar el perfil");
                    }
                },
            },
            { text: "No", style: "cancel" },
        ]);
    };

    const handleLogout = () => {
        Alert.alert('Cerrar Sesión', '¿Estás seguro de cerrar sesión?', [
            {
                text: 'Sí',
                onPress: async () => {
                    try {
                        await logout();
                    } catch (error) {
                        Alert.alert('Error', 'No se pudo cerrar sesión');
                    }
                },
            },
            { text: 'No', style: 'cancel' },
        ]);
    };

    return (
        <ScrollView style={{ backgroundColor: '#fff' }} contentContainerStyle={{ flexGrow: 1 }}>
            <View style={styles.container}>
                <Text style={styles.title}>PERFIL EMPRESARIAL</Text>

                <Text style={styles.label}>Nombre</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Nombre"
                    value={name}
                    onChangeText={handleNameChange}
                    placeholderTextColor="#A9A9A9"
                />
                {formErrors.name && <Text style={styles.errorText}>{formErrors.name}</Text>}

                <Text style={styles.label}>Correo Electrónico</Text>
                <TextInput
                    style={[styles.input, { opacity: 0.6 }]}
                    placeholder="Correo"
                    value={email}
                    editable={false}
                    placeholderTextColor="#A9A9A9"
                />

                <Text style={styles.label}>Numero de Teléfono</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Teléfono"
                    value={phoneNumber}
                    keyboardType="phone-pad"
                    onChangeText={handlePhoneChange}
                    placeholderTextColor="#A9A9A9"
                />
                {formErrors.phoneNumber && <Text style={styles.errorText}>{formErrors.phoneNumber}</Text>}

                <Text style={styles.label}>Dirección (opcional)</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Dirección (opcional)"
                    value={address}
                    onChangeText={setAddress}
                    placeholderTextColor="#A9A9A9"
                />

                <TouchableOpacity style={styles.secondary_button} onPress={handleUpdate}>
                    <Text style={styles.button_text}>ACTUALIZAR PERFIL</Text>
                </TouchableOpacity>

                <Divider style={styles.divider} />

                <TouchableOpacity style={styles.logOut_button} onPress={handleLogout}>
                    <Text style={styles.button_text}>CERRAR SESIÓN</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: 'white' },
    title: { fontSize: 28, fontWeight: 'bold', color: '#30437A', marginBottom: 40 },
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
