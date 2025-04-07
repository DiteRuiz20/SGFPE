import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Provider as PaperProvider } from 'react-native-paper';
import { ErrorProvider } from './src/context/ErrorContext';
import ChooseAccount from './views/ChooseAccount';
import BusinessType from './views/business/accountManagment/BusinessType';
import BusinessLogin from './views/business/accountManagment/BusinessLogin';
import BusinessSignUp from './views/business/accountManagment/BusinessSignUp';
import PersonalLogin from './views/personal/accountManagment/PersonalLogin';
import PersonalSignUp from './views/personal/accountManagment/PersonalSignUp';
import PersonalLoggedStack from './views/personal/logged/PersonalLoggedStack';
import BusinessLoggedStack from './views/business/logged/BusinessLoggedStack';
import RawMaterialLoggedStack from './views/business/logged/raw-material/RawMaterialLoggedStack';
import { AuthProvider, useAuth } from './src/auth/AuthContext';
import VerifyAccount from './views/VerifyAccount';
import BusinessNewProductExpenseLogin from './views/business/accountManagment/BusinessNewProductExpenseLogin';
import BusinessNewProductExpenseSignUp from './views/business/accountManagment/BusinessNewProductExpenseSignUp';

const Stack = createStackNavigator();

function NavigationContent() {
  const { isAuthenticated, accountType } = useAuth();

  if (isAuthenticated) {
    if (accountType === 'personal') {
      return <PersonalLoggedStack />;
    } else if (accountType === 'business-new-product-expense') {
      return <BusinessLoggedStack />;
    } else if (accountType === 'business-raw-material') {
      return <RawMaterialLoggedStack />; // 👈 agregado correctamente
    }
  }

return (
  <Stack.Navigator screenOptions={{ headerShown: true }}>
    <Stack.Screen name="Account" component={ChooseAccount} />
    <Stack.Screen name="Business Type" component={BusinessType} />
    <Stack.Screen name="Business Login" component={BusinessLogin} />
    <Stack.Screen name="Business Sign Up" component={BusinessSignUp} />
    <Stack.Screen name="Personal" component={PersonalLogin} />
    <Stack.Screen name="PersonalSignUp" component={PersonalSignUp} />
    <Stack.Screen name="VerifyAccount" component={VerifyAccount} />
    <Stack.Screen name="BusinessNewProductExpenseLogin" component={BusinessNewProductExpenseLogin} />
    <Stack.Screen name="BusinessNewProductExpenseSignUp" component={BusinessNewProductExpenseSignUp} />
  </Stack.Navigator>
);
}

export default function App() {
  return (
    <PaperProvider>
      <ErrorProvider>
        <AuthProvider>
          <NavigationContainer>
            <NavigationContent />
          </NavigationContainer>
        </AuthProvider>
      </ErrorProvider>
    </PaperProvider>
  );
}
