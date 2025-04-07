import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { sendResetCode, resetPassword } from '../src/api/axios';

export default function ResetPassword() {
    const [email, setEmail] = useState('');
    const [step, setStep] = useState(1);
    const [code, setCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const navigation = useNavigation();

    const handleSendCode = async () => {
        if (!email) return Alert.alert('Error', 'Ingresa tu correo electrónico');
        setLoading(true);
        try {
            await sendResetCode(email);
            setStep(2);
            Alert.alert('Código enviado', 'Revisa tu correo 📩');
        } catch (err) {
            Alert.alert('Error', err.response?.data?.error || 'No se pudo enviar el código');
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async () => {
        if (!code || !newPassword) return Alert.alert('Error', 'Completa todos los campos');
        setLoading(true);
        try {
            await resetPassword(email, code, newPassword);
            Alert.alert('Éxito', 'Contraseña actualizada con éxito');
            navigation.navigate('Account'); // o a donde redirijas
        } catch (err) {
            Alert.alert('Error', err.response?.data?.error || 'No se pudo cambiar la contraseña');
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (!email) return Alert.alert('Error', 'Primero ingresa tu correo');
        setLoading(true);
        try {
            await sendResetCode(email);
            Alert.alert('Código reenviado', 'Revisa tu correo nuevamente');
        } catch {
            Alert.alert('Error', 'No se pudo reenviar el código');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Recuperación de Contraseña</Text>

            {step === 1 && (
                <>
                    <Text style={styles.text}>Ingresa tu correo electrónico para recibir un código de recuperación.</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Correo electrónico"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        value={email}
                        onChangeText={setEmail}
                    />
                    <TouchableOpacity style={styles.button} onPress={handleSendCode} disabled={loading}>
                        <Text style={styles.buttonText}>{loading ? 'Enviando...' : 'Enviar código'}</Text>
                    </TouchableOpacity>
                </>
            )}

            {step === 2 && (
                <>
                    <TextInput
                        style={styles.input}
                        placeholder="Código de verificación"
                        keyboardType="number-pad"
                        value={code}
                        onChangeText={setCode}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Nueva contraseña"
                        secureTextEntry
                        value={newPassword}
                        onChangeText={setNewPassword}
                    />
                    <TouchableOpacity style={styles.button} onPress={handleResetPassword} disabled={loading}>
                        <Text style={styles.buttonText}>{loading ? 'Cambiando...' : 'Cambiar contraseña'}</Text>
                    </TouchableOpacity>

                    <Text style={styles.subtitle}>¿No recibiste el correo?</Text>
                    <TouchableOpacity style={styles.secondaryButton} onPress={handleResend} disabled={loading}>
                        <Text style={styles.secondaryButtonText}>Reenviar código</Text>
                    </TouchableOpacity>
                </>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FAFAFA',
        padding: 24,
        justifyContent: 'center',
    },
    title: {
        fontSize: 26,
        color: '#30437A',
        fontWeight: 'bold',
        marginBottom: 30,
        textAlign: 'center',
    },
    text: {
        fontSize: 16,
        color: '#555',
        marginBottom: 20,
        textAlign: 'center',
    },
    input: {
        backgroundColor: '#fff',
        borderColor: '#ddd',
        borderWidth: 1,
        borderRadius: 8,
        padding: 12,
        marginBottom: 15,
    },
    button: {
        backgroundColor: '#3DC9A7',
        borderRadius: 8,
        padding: 12,
        alignItems: 'center',
        marginBottom: 20,
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    subtitle: {
        textAlign: 'center',
        fontSize: 14,
        color: '#444',
        marginBottom: 10,
    },
    secondaryButton: {
        alignItems: 'center',
        padding: 10,
    },
    secondaryButtonText: {
        color: '#30437A',
        fontWeight: '600',
    },
});
