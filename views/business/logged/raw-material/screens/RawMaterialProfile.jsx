import { StyleSheet, Text, View, TouchableOpacity, Alert } from 'react-native';
import React from 'react';
import { Icon, Divider } from 'react-native-elements';
import { useAuth } from '../../../../../src/auth/AuthContext';
import { TextInput } from 'react-native-paper';

export default function RawMaterialProfile() {
    const { logout } = useAuth();

    const handleLogOut = () => {
        Alert.alert(
            'Cerrar sesi\u00f3n',
            '\u00bfEst\u00e1s seguro de que deseas cerrar sesi\u00f3n?',
            [
                {
                    text: 'Cancelar',
                    style: 'cancel',
                },
                {
                    text: 'Aceptar',
                    onPress: async () => {
                        try {
                            await logout();
                        } catch (error) {
                            Alert.alert('Error', 'No se pudo cerrar la sesi\u00f3n. Intenta de nuevo.');
                        }
                    },
                },
            ]
        );
    };

    const handleChangePassword = () => {
        Alert.alert(
            'Cambiar contrase\u00f1a',
            '\u00bfEst\u00e1s seguro de que deseas cambiar tu contrase\u00f1a?',
            [
                { text: 'Cancelar', style: 'cancel' },
                { text: 'Aceptar', onPress: () => console.log('Cambiando contrase\u00f1a') },
            ]
        );
    };

    const handleUpdateInfo = () => {
        Alert.alert(
            'Actualizar informaci\u00f3n',
            '\u00bfEst\u00e1s seguro de que deseas actualizar tu informaci\u00f3n?',
            [
                { text: 'Cancelar', style: 'cancel' },
                { text: 'Aceptar', onPress: () => console.log('Actualizando informaci\u00f3n') },
            ]
        );
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>PERFIL</Text>
            <Icon name="account-circle" type="material" size={130} color="#888" style={{ marginBottom: 20 }} />

            <TextInput style={styles.input} label="Nombre completo" mode="outlined" />
            <TextInput style={styles.input} label="Nombre de usuario" mode="outlined" />
            <TextInput style={styles.input} label="Tel\u00e9fono" mode="outlined" keyboardType="phone-pad" />
            <TextInput style={styles.input} label="Correo electr\u00f3nico" mode="outlined" keyboardType="email-address" />

            <View style={{ marginTop: 25, alignItems: 'center', width: '100%', gap: 10 }}>
                <TouchableOpacity style={styles.secondary_button} onPress={handleUpdateInfo}>
                    <Text style={styles.button_text}>ACTUALIZAR INFO</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.primary_button} onPress={handleChangePassword}>
                    <Text style={styles.button_text}>CAMBIAR CONTRASE\u00d1A</Text>
                </TouchableOpacity>
            </View>

            <Divider style={styles.divider} />

            <TouchableOpacity style={styles.logOut_button} onPress={handleLogOut}>
                <Text style={styles.button_text}>CERRAR SESI\u00d3N</Text>
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
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#30437A',
        marginBottom: 20,
    },
    input: {
        width: '100%',
        marginBottom: 10,
        backgroundColor: 'white',
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
});
