import { StyleSheet, Text, TouchableOpacity } from 'react-native'
import React from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Icon } from 'react-native-elements';
import BudgetPlanning from './screens/BudgetPlanning';
import IncomeTracker from './screens/IncomeTracker';
import ExpenseTracker from './screens/ExpenseTracker';
import Graphics from './screens/Graphics';
import Profile from './screens/Profile';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const getScreenTitle = (routeName) => {
  const titles = {
    Budget: "Budget Planning",
    Income: "Income Tracker",
    Expenses: "Expense Tracker",
    Graphics: "Graphics Overview",
  };
  return titles[routeName] || "App";
};

const BottomTabNavigator = ({ navigation }) => {
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
            <Text style={{ marginRight: 10, fontWeight: "bold" }}>MOSHIUR</Text>
            <Icon style={{marginRight:10}} name="account-circle" type="material" size={40} color="#888" />
          </TouchableOpacity>
        ),
      })}
    >
      <Tab.Screen name="Budget" component={BudgetPlanning} />
      <Tab.Screen name="Income" component={IncomeTracker} />
      <Tab.Screen name="Expenses" component={ExpenseTracker} />
      <Tab.Screen name="Graphics" component={Graphics} />
    </Tab.Navigator>
  );
};

const AppStack = ({ onLogOut }) => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Home" component={BottomTabNavigator} options={{ headerShown: false }} />
      <Stack.Screen 
        name="Profile" 
        component={(props) => <Profile {...props} onLogOut={onLogOut} />} 
        options={{ headerShown: true }} 
      />
    </Stack.Navigator>
  );
};

export default function BusinessLoggedStack({ onLogOut }) {
  return <AppStack onLogOut={onLogOut} />;
}

const getIconName = (routeName, focused) => {
  let iconName = "";
  let iconType = "material-community";

  switch (routeName) {
    case "Budget":
      iconName = focused ? "home" : "home-outline";
      break;
    case "Income":
      iconName = focused ? "bank" : "bank-outline";
      break;
    case "Expenses":
      iconName = focused ? "wallet" : "wallet-outline";
      break;
    case "Graphics":
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