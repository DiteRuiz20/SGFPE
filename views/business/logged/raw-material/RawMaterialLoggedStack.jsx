import { StyleSheet, Text, TouchableOpacity } from 'react-native'
import React, { useState, useEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Icon } from 'react-native-elements';
import MaterialUsageTracker from './screens/MaterialUsageTracker';
import RawMaterialTracker from './screens/RawMaterialTracker';
import RawMaterialOrder from './screens/RawMaterialOrder';
import RawMaterialProfile from './screens/RawMaterialProfile';
import RawMaterialGraphics from './screens/RawMaterialGraphics';
import { useAuth } from '../../../../src/auth/AuthContext';
import { getUserById } from '../../../../src/api/axios';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const getScreenTitle = (routeName) => {
    const titles = {
        "Materia prima": "Materia prima",
        "Insumos": "Insumos",
        "Pedidos": "Pedidos",
        "Graficos": "Gráficos",
    };
    return titles[routeName] || "App";
};

const BottomTabNavigator = ({ navigation }) => {
    const { userId } = useAuth();
    const [userName, setUserName] = useState('USER');

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                if (userId) {
                    const userData = await getUserById(userId);
                    

                    if (userData && userData.name) {
                        setUserName(userData.name.toUpperCase());
                    }
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        };

        fetchUserData();
    }, [userId]);

    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                    const { iconName, iconType } = getIconName(route.name, focused);
                    return <Icon name={iconName} type={iconType} size={size} color={color} />;
                },

                tabBarActiveTintColor: "#4abfa4",
                tabBarInactiveTintColor: "gray",
                headerTitle: getScreenTitle(route.name),
                headerTitleAlign: "left",
                headerTitleStyle: {
                    fontSize: 20,
                    fontWeight: "bold",
                    color: "#30437A",
                    textTransform: "uppercase",
                    width: "100%",
                },

                headerRight: () => (
                    <TouchableOpacity style={styles.headerRight} onPress={() => navigation.navigate("Profile")}>
                        <Text style={{ marginRight: 10, fontWeight: "bold" }}>{userName}</Text>
                    </TouchableOpacity>
                ),
            })}
        >
            <Tab.Screen name="Materia prima" component={RawMaterialTracker} />
            <Tab.Screen name="Insumos" component={MaterialUsageTracker} />
            <Tab.Screen name="Pedidos" component={RawMaterialOrder} />
            <Tab.Screen name="Graficos" component={RawMaterialGraphics} />
        </Tab.Navigator>
    );
};

const AppStack = () => {
    return (
        <Stack.Navigator>
            <Stack.Screen name="Home" component={BottomTabNavigator} options={{ headerShown: false }} />
            <Stack.Screen
                name="Profile"
                component={RawMaterialProfile}
                options={{ headerShown: true }}
            />
        </Stack.Navigator>
    );
};

export default function RawMaterialLoggedStack() {
    return <AppStack />;
}

const getIconName = (routeName, focused) => {
    let iconName = "";
    let iconType = "material-community";

    switch (routeName) {
        case "Materia prima":
            iconName = focused ? "home" : "home-outline";
            break;
        case "Insumos":
            iconName = focused ? "bank" : "bank-outline";
            break;
        case "Pedidos":
            iconName = focused ? "wallet" : "wallet-outline";
            break;
        case "Graficos":
            iconName = focused ? "chart-bar" : "chart-bar-stacked";
            break;
    }
    return { iconName, iconType };
};

const styles = StyleSheet.create({
    headerRight: {
        flexDirection: "row",
        alignItems: "center",
        marginRight: 10,
    },
});