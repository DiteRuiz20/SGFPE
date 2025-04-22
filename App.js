import React, { useState } from 'react';
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
import { AuthProvider } from './src/auth/AuthContext';

const Stack = createStackNavigator();

export default function App() {
  const [isAuthenticatedPersonal, setIsAuthenticatedPersonal] = useState(false);
  const [isAuthenticatedBusiness, setIsAuthenticatedBusiness] = useState(false);

  return (
    <PaperProvider>
      <ErrorProvider>
        <AuthProvider>
          <NavigationContainer>
            {isAuthenticatedPersonal ? (
              <PersonalLoggedStack onLogOut={() => setIsAuthenticatedPersonal(false)} />
            ) : isAuthenticatedBusiness ? (
              <BusinessLoggedStack onLogOut={() => setIsAuthenticatedBusiness(false)} />
            ) : (
              <Stack.Navigator screenOptions={{ headerShown: true }}>
                <Stack.Screen name="Account" component={ChooseAccount} />
                <Stack.Screen name="Business Type" component={BusinessType} />
                <Stack.Screen
                  name="Business"
                  component={(props) => <BusinessLogin {...props} onLoginBusiness={() => setIsAuthenticatedBusiness(true)} />}
                />
                <Stack.Screen name="Business Sign Up" component={BusinessSignUp} />
                <Stack.Screen
                  name="Personal"
                  component={(props) => <PersonalLogin {...props} onLoginPersonal={() => setIsAuthenticatedPersonal(true)} />}
                />
                <Stack.Screen name="PersonalSignUp" component={PersonalSignUp} />
              </Stack.Navigator>
            )}
          </NavigationContainer>
        </AuthProvider>
      </ErrorProvider>
    </PaperProvider>
  );
}
