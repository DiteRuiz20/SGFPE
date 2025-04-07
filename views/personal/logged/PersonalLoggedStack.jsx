import { StyleSheet, Text, TouchableOpacity, } from 'react-native';
import React, { useState, useEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Icon } from 'react-native-elements';
import { useAuth } from '../../../src/auth/AuthContext';
import { getUserById } from '../../../src/api/axios';
import BudgetPlanning from './screens/BudgetPlanning';
import SavingTracker from './screens/SavingTracker';
import DebtTracker from './screens/DebtTracker';
import ExpenseTracker from './screens/ExpenseTracker';
import Graphics from './screens/Graphics';
import Profile from './screens/Profile';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const getScreenTitle = (routeName) => {
  const titles = {
    "Planeación": "Planeación",
    "Ahorros": "Ahorros",
    "Deudas": "Deudas",
    "Gastos": "Gastos",
    "Gráficos": "Gráficos",
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
            <Icon style={{marginRight:10}} name="account-circle" type="material" size={40} color="#888" />
          </TouchableOpacity>
        ),
      })}
    >
      <Tab.Screen name="Planeación" component={BudgetPlanning} />
      <Tab.Screen name="Ahorros" component={SavingTracker} />
      <Tab.Screen name="Deudas" component={DebtTracker} />
      <Tab.Screen name="Gastos" component={ExpenseTracker} />
      <Tab.Screen name="Gráficos" component={Graphics} />
    </Tab.Navigator>
  );
};

const AppStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Home" component={BottomTabNavigator} options={{ headerShown: false }} />
      <Stack.Screen 
        name="Profile" 
        component={Profile}
        options={{ headerShown: true }} 
      />
    </Stack.Navigator>
  );
};

export default function PersonalLoggedStack() {
  return <AppStack />;
}

const getIconName = (routeName, focused) => {
  let iconName = "";
  let iconType = "material-community";

  switch (routeName) {
    case "Planeación":
      iconName = focused ? "home" : "home-outline";
      break;
    case "Ahorros":
      iconName = focused ? "bank" : "bank-outline";
      break;
    case "Deudas":
      iconName = focused ? "currency-usd" : "currency-usd-off";
      break;
    case "Gastos":
      iconName = focused ? "wallet" : "wallet-outline";
      break;
    case "Gráficos":
      iconName = focused ? "chart-bar" : "chart-bar-stacked";
      break;
  }
  return { iconName, iconType };
};

const styles = StyleSheet.create({
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
});