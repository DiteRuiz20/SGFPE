import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import logo from '../../../assets/logo.png';
import axios from 'axios';

export default function VerifyAccount() {
    const location = useLocation();
    const navigate = useNavigate();
    const { login } = useAuth();
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const email = location.state?.email;

    useEffect(() => {
        if (!email) {
            navigate('/login-personal');
        }
    }, [email, navigate]);

    const handleVerification = async () => {
        if (!code) {
            setError('Por favor, ingresa el código de verificación.');
            return;
        }

        try {
            setLoading(true);
            const response = await axios.post('http://localhost:8080/auth/verify-code', {
                email,
                code
            });

            setSuccess(true);
            setError('');
            setTimeout(() => {
                navigate('/login-personal');
            }, 2500);
        } catch (err) {
            setError(err.response?.data?.error || 'Error al verificar el código');
        } finally {
            setLoading(false);
        }
    };

    const handleResendCode = async () => {
        try {
            setLoading(true);
            await axios.post('http://localhost:8080/auth/resend-code', { email });
            setError('');
            alert('Se ha enviado un nuevo código de verificación');
        } catch (err) {
            setError('Error al reenviar el código');
        } finally {
            setLoading(false);
        }
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
        input: {
            width: '300px',
            padding: '12px',
            fontSize: '16px',
            borderRadius: '8px',
            border: '1px solid #ccc',
            marginBottom: '20px',
        },
        error: {
            color: 'red',
            marginBottom: 15,
        },
        success: {
            color: 'green',
            marginBottom: 15,
        },
    };

    return (
        <div style={styles.container}>
            <img style={styles.image} src={logo} alt="logo" />
            <h1 style={styles.title}>Verificación de Cuenta</h1>
            <p style={styles.subtitle}>
                Hemos enviado un código de 6 dígitos a tu correo. Ingresa el código para completar tu registro.
            </p>
            <input
                type="text"
                placeholder="Código de verificación"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                style={styles.input}
            />
            {error && <p style={styles.error}>{error}</p>}
            {success && <p style={styles.success}>✅ Cuenta verificada correctamente</p>}
            <button className='primary_button' onClick={handleVerification} disabled={loading}>
                {loading ? 'Verificando...' : 'VERIFICAR CUENTA'}
            </button>
            <button className='secondary_button' onClick={handleResendCode} disabled={loading} style={{ marginTop: 15 }}>
                Reenviar código
            </button>
        </div>
    );
}
