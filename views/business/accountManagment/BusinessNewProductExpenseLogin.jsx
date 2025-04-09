import { StyleSheet, Text, View, Image, TextInput, TouchableOpacity, Alert } from 'react-native';
import React, { useState } from 'react';
import { Divider } from 'react-native-elements';
import { useAuth } from '../../../src/auth/AuthContext';
import { validateField } from '../../InputValidator';

export default function BusinessNewProductExpenseLogin({ navigation }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [formErrors, setFormErrors] = useState({});
    const { login } = useAuth();

    const validateInputs = () => {
        const errors = {};
        const emailVal = validateField('email', username);
        const passwordVal = validateField('password', password);

        if (!emailVal.valid) errors.username = emailVal.message;
        if (!passwordVal.valid) errors.password = passwordVal.message;

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleLogin = async () => {
        if (!validateInputs()) return;

        try {
            await login(username.toLowerCase(), password, 'business-new-product-expense');
            Alert.alert('Success', 'Login successful');
        } catch (error) {
            Alert.alert('Error', error.message || 'Invalid email or password');
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>SGFPE</Text>
            <Image source={require('../../../assets/logo.png')} style={styles.image} />
            <Text style={styles.subtitle}>Empresarial Nueva Mercancía</Text>

            <TextInput
                style={styles.input}
                placeholder="Correo electrónico"
                value={username}
                onChangeText={(text) => {
                    setUsername(text);
                    const result = validateField('email', text);
                    setFormErrors(prev => ({ ...prev, username: result.valid ? null : result.message }));
                }}
                keyboardType='email-address'
                placeholderTextColor="#A9A9A9"
            />
            {formErrors.username && <Text style={styles.errorText}>{formErrors.username}</Text>}

            <TextInput
                style={styles.input}
                placeholder="Contraseña"
                value={password}
                onChangeText={(text) => {
                    setPassword(text);
                    const result = validateField('password', text);
                    setFormErrors(prev => ({ ...prev, password: result.valid ? null : result.message }));
                }}
                placeholderTextColor="#A9A9A9"
                secureTextEntry
            />
            {formErrors.password && <Text style={styles.errorText}>{formErrors.password}</Text>}

            <TouchableOpacity style={styles.primary_button} onPress={handleLogin}>
                <Text style={styles.button_text}>INGRESAR</Text>
            </TouchableOpacity>

            <Divider style={styles.divider} />

            <Text style={styles.orText}>or</Text>
            <Text style={styles.getStarted}>¿Aún no tienes una cuenta?</Text>

            <TouchableOpacity
                style={styles.secondary_button}
                onPress={() => navigation.navigate('BusinessNewProductExpenseSignUp')}
            >
                <Text style={styles.button_text}>REGISTRARSE</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate('ResetPassword')}>
                <Text style={styles.forgotPassword}>¿Olvidaste tu contraseña?</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: 'white',
        marginTop: -45,
    },
    image: {
        width: 130,
        height: 130,
        marginBottom: 30,
    },
    subtitle: {
        fontSize: 14,
        color: '#444',
        marginBottom: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#30437A',
        marginBottom: 20,
        marginTop: -40,
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
    primary_button: {
        width: '100%',
        backgroundColor: '#30437A',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 15,
        shadowColor: '#30387a',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.5,
        shadowRadius: 2,
    },
    divider: {
        width: '100%',
        height: 2,
        backgroundColor: '#EAEAEA',
        marginVertical: 15,
    },
    orText: {
        fontSize: 14,
        color: '#666',
        backgroundColor: 'white',
        top: -23,
    },
    getStarted: {
        color: '#666',
        fontSize: 14,
        marginBottom: 15,
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
    errorText: {
        color: 'red',
        alignSelf: 'flex-start',
        marginBottom: 10,
        marginLeft: 2,
    },
    forgotPassword: { alignSelf: 'flex-end', color: '#30437A', fontSize: 14, marginTop: 18, fontWeight: '500' }

});
