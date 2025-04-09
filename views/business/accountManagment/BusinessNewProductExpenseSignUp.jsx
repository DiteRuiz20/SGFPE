import { StyleSheet, Text, View, Image, TextInput, TouchableOpacity, Alert } from 'react-native';
import React, { useState } from 'react';
import { createUser } from '../../../src/api/axios';
import { useNavigation } from '@react-navigation/native';
import { validateField } from '../../InputValidator';

export default function BusinessNewProductExpenseSignUp() {
    const navigation = useNavigation();
    const [form, setForm] = useState({
        name: '',
        phoneNumber: '',
        email: '',
        password: '',
        address: ''
    });
    const [formErrors, setFormErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const handleChange = (field, value) => {
        setForm(prev => ({ ...prev, [field]: value }));

        const validatorKey = {
            name: 'nameOrDescription',
            phoneNumber: 'phoneNumber',
            email: 'email',
            password: 'password',
            address: 'address',
        }[field];

        if (field !== 'address' || value.trim() !== '') {
            const validation = validateField(validatorKey, value);
            setFormErrors(prev => ({
                ...prev,
                [field]: validation.valid ? '' : validation.message
            }));
        } else {
            setFormErrors(prev => ({ ...prev, address: '' }));
        }
    };

    const validateAll = () => {
        const errors = {};
        const requiredFields = ['name', 'phoneNumber', 'email', 'password'];

        for (const field of requiredFields) {
            const validatorKey = {
                name: 'nameOrDescription',
                phoneNumber: 'phoneNumber',
                email: 'email',
                password: 'password'
            }[field];

            const result = validateField(validatorKey, form[field]);
            if (!result.valid) errors[field] = result.message;
        }

        if (form.address.trim() !== '') {
            const addressValidation = validateField('address', form.address);
            if (!addressValidation.valid) errors.address = addressValidation.message;
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleRegister = async () => {
        if (!validateAll()) return;

        const { name, phoneNumber, email, password, address } = form;

        try {
            setLoading(true);
            await createUser({
                name,
                phoneNumber,
                email: email.toLowerCase(),
                password,
                address,
                accountType: 'business-new-product-expense'
            });

            navigation.navigate('VerifyAccount', {
                email: email.toLowerCase(),
                accountType: 'business-new-product-expense'
            });
        } catch (err) {
            console.error(err);
            Alert.alert('Error', err.response?.data?.error || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Image source={require('../../../assets/logo.png')} style={styles.image} />
            <View style={{ marginBottom: 20, alignItems: 'center' }}>
                <Text style={styles.subtitle}>Thanks for joining us!</Text>
                <Text style={styles.subtitle}>Please fill out the required data about your business.</Text>
            </View>

            <TextInput
                style={styles.input}
                placeholder="Business Name"
                placeholderTextColor="#A9A9A9"
                onChangeText={(text) => handleChange('name', text)}
            />
            {formErrors.name ? <Text style={styles.errorText}>{formErrors.name}</Text> : null}

            <TextInput
                style={styles.input}
                placeholder="Phone Number"
                placeholderTextColor="#A9A9A9"
                keyboardType='phone-pad'
                onChangeText={(text) => handleChange('phoneNumber', text)}
            />
            {formErrors.phoneNumber ? <Text style={styles.errorText}>{formErrors.phoneNumber}</Text> : null}

            <TextInput
                style={styles.input}
                placeholder="Email Address"
                placeholderTextColor="#A9A9A9"
                keyboardType='email-address'
                onChangeText={(text) => handleChange('email', text)}
            />
            {formErrors.email ? <Text style={styles.errorText}>{formErrors.email}</Text> : null}

            <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="#A9A9A9"
                secureTextEntry
                onChangeText={(text) => handleChange('password', text)}
            />
            {formErrors.password ? <Text style={styles.errorText}>{formErrors.password}</Text> : null}

            <TextInput
                style={styles.input}
                placeholder="Address (Optional)"
                placeholderTextColor="#A9A9A9"
                onChangeText={(text) => handleChange('address', text)}
            />
            {formErrors.address ? <Text style={styles.errorText}>{formErrors.address}</Text> : null}

            <TouchableOpacity style={styles.secondary_button} onPress={handleRegister} disabled={loading}>
                <Text style={styles.button_text}>{loading ? 'Registering...' : 'SIGN UP'}</Text>
            </TouchableOpacity>

            <View style={{ marginTop: 25, alignItems: 'center' }}>
                <Text style={styles.subtitle}>Note:</Text>
                <Text style={styles.subtitle}>You will be sent a confirmation code via email, which will be used to authenticate your account.</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: 'white', marginTop: -45 },
    image: { width: 130, height: 130, marginBottom: 30 },
    subtitle: { fontSize: 14, color: '#444', marginBottom: 6, textAlign: 'center' },
    input: { width: '100%', backgroundColor: '#EAEAEA', padding: 15, borderRadius: 8, marginBottom: 10 },
    secondary_button: { width: '100%', backgroundColor: '#3DC9A7', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 15 },
    button_text: { color: 'white', fontSize: 16 },
    errorText: { color: 'red', alignSelf: 'flex-start', marginBottom: 8 }
});
