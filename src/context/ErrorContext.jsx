import React, { createContext, useContext, useState } from 'react';
import { Snackbar } from 'react-native-paper';

const ErrorContext = createContext();

export const ErrorProvider = ({ children }) => {
    const [error, setError] = useState(null);
    const [visible, setVisible] = useState(false);

    const handleError = (error) => {
        console.error('Error:', error);
        setError(error);
        setVisible(true);
    };

    const onDismissSnackBar = () => {
        setVisible(false);
        setError(null);
    };

    return (
        <ErrorContext.Provider value={{ handleError }}>
            {children}
            <Snackbar
                visible={visible}
                onDismiss={onDismissSnackBar}
                duration={3000}
                action={{
                    label: 'OK',
                    onPress: onDismissSnackBar,
                }}
            >
                {error?.message || 'Ha ocurrido un error'}
            </Snackbar>
        </ErrorContext.Provider>
    );
};

export const useError = () => {
    const context = useContext(ErrorContext);
    if (!context) {
        throw new Error('useError debe ser usado dentro de un ErrorProvider');
    }
    return context;
}; 