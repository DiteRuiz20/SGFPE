import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { Divider } from '@mui/material';
import axios from 'axios';
import { Alert, Snackbar } from '@mui/material';

export default function VerifyAccount() {
    const location = useLocation();
    const navigate = useNavigate();
    const { login } = useAuth();
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [alert, setAlert] = useState({ open: false, message: '', severity: '' });
    const email = location.state?.email;
    const accountType = location.state?.accountType;

    const regexCode = /^[0-9]{6}$/;

    useEffect(() => {
        if (!email) {
            navigate('/');
        }
    }, [email, navigate]);

    const handleVerification = async () => {
        if (!code) {
            setAlert({ open: true, message: 'Por favor ingresa el código', severity: 'warning' });
            return;
        }

        if (!regexCode.test(code)) {
            setAlert({ open: true, message: 'El código debe tener exactamente 6 dígitos numéricos', severity: 'error' });
            return;
        }

        try {
            setLoading(true);
            const response = await axios.post('http://localhost:8080/auth/verify-code', {
                email,
                code
            });

            setSuccess(true);
            setAlert({ open: true, message: 'Cuenta verificada correctamente', severity: 'success' });
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
            setAlert({ open: true, message: 'Se ha enviado un nuevo código', severity: 'success' });
        } catch (err) {
            setAlert({ open: true, message: 'Error al enviar el código', severity: 'error' });
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
        alert: {
            position: 'fixed',
            top: 20,
            left: '50%',
            transform: 'translate(-50%, 0)'
        }
    };

    return (
        <div className="background-container align-content-center">
            <div className='container d-flex flex-column align-items-center justify-content-center'>
                <p style={styles.title}>VERIFICACIÓN DE CORREO</p>
                <p style={styles.text}>
                    Hemos enviado un código de 6 dígitos a tu correo. Ingresa el código para completar tu registro.
                </p>
                <div className='d-flex flex-column col-sm-6 col-lg-4 mt-3'>
                    <input
                        className='input'
                        type="text"
                        placeholder="Código de verificación"
                        value={code}
                        onChange={(e) => {
                            const value = e.target.value;
                            if (value === '' || /^[0-9]{0,6}$/.test(value)) {
                                setCode(value);
                                setError(''); // limpiar error al escribir bien
                            } else {
                                setError('El código debe tener 6 dígitos numéricos');
                            }
                        }}
                        maxLength={6}
                    />
                    {error && <p style={{ color: 'red', marginTop: '5px' }}>{error}</p>}
                    <button className='primary_button' onClick={handleVerification} disabled={loading}>
                        {loading ? 'VERIFICANDO...' : 'VERIFICAR CUENTA'}
                    </button>
                    <Divider style={styles.divider} />
                    <p style={styles.subtitle}>¿No recibiste el correo?</p>
                    <button className='secondary_button' onClick={handleResendCode} disabled={loading}>
                        REENVIAR CÓDIGO
                    </button>
                </div>
            </div>
            <Snackbar open={alert.open} autoHideDuration={3000} onClose={() => setAlert({ ...alert, open: false })}>
                <Alert className='col-md-4 col-12' onClose={() => setAlert({ ...alert, open: false })} severity={alert.severity} style={styles.alert}>
                    {alert.message}
                </Alert>
            </Snackbar>
        </div>
    );
}
