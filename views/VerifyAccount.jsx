import React, { useEffect, useState } from 'react';
import { StyleSheet, View, ScrollView, Image, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard } from 'react-native';
import axios from 'axios';
import { useNavigation, useRoute } from '@react-navigation/native';
import { verifyCode, resendCode } from '../src/api/axios';

export default function VerifyAccount() {
    const navigation = useNavigation();
    const route = useRoute();
    const { email, accountType } = route.params || {};

    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (!email) {
            Alert.alert('Error', 'No hay correo asociado. Regresando al inicio.', [
                { text: 'OK', onPress: () => navigation.navigate('Home') },
            ]);
        }
    }, [email]);

    const handleVerification = async () => {
        if (!code) {
            setError('Por favor, ingresa el código de verificación.');
            return;
        }

        try {
            setLoading(true);
            await verifyCode({ email, code });
            setSuccessMessage('✅ Cuenta verificada correctamente');
            setError('');

            setTimeout(() => {
                switch (accountType) {
                    case 'personal':
                        navigation.navigate('Personal');
                        break;
                    case 'business-raw-material':
                        navigation.navigate('Business Login', { accountType: 'business-raw-material' });
                        break;
                    case 'business-new-product-expense':
                        navigation.navigate('BusinessNewProductExpenseLogin', { accountType: 'business-new-product-expense' });
                        break;
                    default:
                        navigation.navigate('Home');
                        break;
                }
            }, 2500);
        } catch (err) {
            console.error('Error al verificar:', err);
            setError(err.response?.data?.error || 'Error al verificar el código');
        } finally {
            setLoading(false);
        }
    };

    const handleResendCode = async () => {
        try {
            setLoading(true);
            await resendCode({ email });
            Alert.alert('Éxito', 'Se ha enviado un nuevo código de verificación.');
            setError('');
        } catch (err) {
            console.error('Error al reenviar código:', err);
            setError('Error al reenviar el código');
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <ScrollView
                    contentContainerStyle={styles.container}
                    keyboardShouldPersistTaps="handled"
                >
                    <Image source={require('../assets/logo.png')} style={styles.image} />

                    <Text style={styles.title}>VERIFICACIÓN DE CORREO</Text>
                    <Text style={styles.subtitle}>
                        Hemos enviado un código de 6 dígitos a tu correo. Ingresa el código para completar tu registro.
                    </Text>

                    <TextInput
                        style={styles.input}
                        placeholder="Código de verificación"
                        value={code}
                        onChangeText={setCode}
                        keyboardType="numeric"
                        placeholderTextColor="#A9A9A9"
                    />

                    {error ? <Text style={styles.error}>{error}</Text> : null}
                    {successMessage ? <Text style={styles.success}>{successMessage}</Text> : null}

                    <TouchableOpacity style={styles.primary_button} onPress={handleVerification} disabled={loading}>
                        <Text style={styles.button_text}>{loading ? 'Verificando...' : 'VERIFICAR CUENTA'}</Text>
                    </TouchableOpacity>

                    <Text style={styles.note}>¿No recibiste el correo?</Text>

                    <TouchableOpacity style={styles.secondary_button} onPress={handleResendCode} disabled={loading}>
                        <Text style={styles.button_text}>REENVIAR CÓDIGO</Text>
                    </TouchableOpacity>
                </ScrollView>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
    );
}

    const styles = StyleSheet.create({
        container: {
            flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: 'white',
        },
        image: {
            width: 130, height: 130, marginBottom: 30,
        },
        title: {
            fontSize: 28, fontWeight: 'bold', color: '#30437A', marginBottom: 20, textAlign: 'center',
        },
        subtitle: {
            fontSize: 14, color: '#444', marginBottom: 30, textAlign: 'center',
        },
        input: {
            width: '100%', backgroundColor: '#EAEAEA', padding: 15, borderRadius: 8,
            marginBottom: 10, shadowColor: '#888', shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.5, shadowRadius: 2,
        },
        primary_button: {
            width: '100%', backgroundColor: '#30437A', padding: 15, borderRadius: 8,
            alignItems: 'center', marginBottom: 15,
        },
        secondary_button: {
            width: '100%', backgroundColor: '#3DC9A7', padding: 15, borderRadius: 8,
            alignItems: 'center', marginTop: 10,
        },
        button_text: {
            color: 'white', fontSize: 16,
        },
        note: {
            marginTop: 20, fontSize: 14, color: '#444',
        },
        error: {
            color: 'red', marginBottom: 10, textAlign: 'center',
        },
        success: {
            color: 'green', marginBottom: 10, textAlign: 'center',
        },
    });
