import React from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert } from 'react-native';
import { Divider, Icon } from 'react-native-elements';
import { useAuth } from '../../../../../src/auth/AuthContext';

export default function RawMaterialProfile() {
    const { logout } = useAuth();

    const handleLogOut = () => {
        Alert.alert(
            "Log Out",
            "Are you sure you want to log out?",
            [
                {
                    text: "Yes",
                    onPress: async () => {
                        try {
                            await logout();
                        } catch (error) {
                            Alert.alert('Error', 'Failed to log out. Please try again.');
                        }
                    }
                },
                { text: "No", style: "cancel" }
            ]
        );
    };

    const handleChangePassword = () => {
        Alert.alert(
            "Change Password",
            "Are you sure you want to change your password?",
            [
                { text: "Yes", onPress: () => console.log("Changing password") },
                { text: "No", style: "cancel" }
            ]
        );
    };

    const handleUpdateInfo = () => {
        Alert.alert(
            "Update Info",
            "Are you sure you want to update your info?",
            [
                { text: "Yes", onPress: () => console.log("Updating info") },
                { text: "No", style: "cancel" }
            ]
        );
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>PROFILE</Text>
            <Icon name="account-circle" type="material" size={130} color="#888" style={{ marginBottom: 20 }} />

            <TextInput style={styles.input} placeholder="Full Name" placeholderTextColor="#A9A9A9" />
            <TextInput style={styles.input} placeholder="Username" placeholderTextColor="#A9A9A9" />
            <TextInput style={styles.input} placeholder="Phone Number" placeholderTextColor="#A9A9A9" keyboardType="phone-pad" />
            <TextInput style={styles.input} placeholder="Email Address" placeholderTextColor="#A9A9A9" keyboardType="email-address" />

            <View style={{ marginTop: 25, alignItems: 'center', width: '100%', gap: 10 }}>
                <TouchableOpacity style={styles.secondary_button} onPress={handleUpdateInfo}>
                    <Text style={styles.button_text}>UPDATE INFO</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.primary_button} onPress={handleChangePassword}>
                    <Text style={styles.button_text}>CHANGE PASSWORD</Text>
                </TouchableOpacity>
            </View>

            <Divider style={styles.divider} />

            <TouchableOpacity style={styles.logOut_button} onPress={handleLogOut}>
                <Text style={styles.button_text}>LOG OUT</Text>
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
