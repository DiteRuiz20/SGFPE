import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { Divider } from '@mui/material';
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
    const accountType = location.state?.accountType;

    useEffect(() => {
        if (!email) {
            navigate('/');
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
            console.log("Tipo de cuenta recibido:", accountType);
            setTimeout(() => {
                switch (accountType) {
                    case 'personal':
                        navigate('/login-personal');
                        break;
                    case 'business-raw-material':
                        navigate('/business-raw-materials-login');
                        break;
                    case 'business-new-product-expense':
                        navigate('/business-new-products-expense-login');
                        break;
                    default:
                        navigate('/');
                        break;
                }
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
        image: {
            width: '150px',
            height: '150px',
            marginBottom: '40px',
        },
        subtitle: {
            marginTop: '20px',
            fontSize: 16,
            color: '#444',
        },
        title: {
            fontSize: 34,
            fontWeight: 'bold',
            color: '#30437A',
            marginBottom: 25,
        },
        text: {
            marginTop: '20px',
            fontSize: 20,
            color: '#444',
        },
        divider: {
            width: '100%',
            height: '2px',
            backgroundColor: '#999',
            marginTop: 20,
        },
    };

    return (
        <div className="background-container align-content-center">
            <div className='container d-flex flex-column align-items-center justify-content-center'>
                <p style={styles.title}>VERIFICACIÓN DE CORREO</p>
                <p style={styles.text}>
                    Hemos enviado un código de 6 dígitos a tu correo. Ingresa el código para completar tu registro.
                </p>
                <div className='d-flex flex-column col-sm-6 col-lg-4 mt-3'>
                    <input className='input'
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
                    <Divider style={styles.divider} />
                    <p style={styles.subtitle}>¿No recibiste el correo?</p>
                    <button className='secondary_button' onClick={handleResendCode} disabled={loading}>
                        REENVIAR CÓDIGO
                    </button>
                </div>
            </div>
        </div>
    );
}
