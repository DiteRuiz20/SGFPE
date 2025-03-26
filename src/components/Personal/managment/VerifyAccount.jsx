import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import logo from '../../../assets/logo.png';

export default function VerifyAccount() {
    const location = useLocation();
    const navigate = useNavigate();
    const { login } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const email = location.state?.email;

    useEffect(() => {
        // Si no hay email, redirigir al login
        if (!email) {
            navigate('/login-personal');
        }
    }, [email, navigate]);

    const handleReturnToLogin = () => {
        navigate('/login-personal');
    };

    const styles = {
        container: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'white',
            width: '100vw',
            height: '100vh',
        },
        image: {
            width: 130,
            height: 130,
            marginBottom: 30,
        },
        title: {
            fontSize: 28,
            fontWeight: 'bold',
            color: '#30437A',
            marginBottom: 20,
        },
        subtitle: {
            fontSize: 16,
            color: '#444',
            marginBottom: 20,
            textAlign: 'center',
            maxWidth: '600px',
            padding: '0 20px',
        },
        error: {
            color: 'red',
            marginBottom: 15,
        }
    };

    return (
        <div style={styles.container}>
            <img style={styles.image} src={logo} alt="logo" />
            <h1 style={styles.title}>Verificación de Cuenta</h1>
            <p style={styles.subtitle}>
                Este sistema de verificación está en mantenimiento. 
                Actualmente no se requiere verificación de cuenta. 
                Por favor, vuelva a la página de inicio de sesión.
            </p>
            {error && <p style={styles.error}>{error}</p>}
            <button className='secondary_button' onClick={handleReturnToLogin}>
                VOLVER AL LOGIN
            </button>
        </div>
    );
} 