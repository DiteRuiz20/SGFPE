import React, { useState } from 'react';
import { sendResetCode, resetPassword } from '../../services/ForgotPassword';
import { useNavigate } from 'react-router-dom';

export default function ResetPassword() {
    const [email, setEmail] = useState('');
    const [step, setStep] = useState(1);
    const [code, setCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const handleSendCode = async () => {
        setLoading(true);
        try {
            await sendResetCode(email);
            setStep(2);
            setError('');
        } catch (err) {
            setError(err.response?.data?.error || 'Error al enviar el código');
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async () => {
        setLoading(true);
        try {
            await resetPassword(email, code, newPassword);
            setSuccess('Contraseña cambiada exitosamente ✅');
            setError('');
        } catch (err) {
            setError(err.response?.data?.error || 'Error al cambiar la contraseña');
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        setLoading(true);
        try {
            await sendResetCode(email);
            alert('Código reenviado 📩');
        } catch (err) {
            setError('No se pudo reenviar el código');
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
            height: '100vh',
            backgroundColor: 'white',
        },
        image: {
            width: 130,
            marginBottom: 20,
        },
        input: {
            width: 300,
            padding: 12,
            fontSize: 16,
            borderRadius: 8,
            border: '1px solid #ccc',
            marginBottom: 15,
        },
        button: {
            padding: 12,
            borderRadius: 8,
            backgroundColor: '#30437A',
            color: 'white',
            fontWeight: 'bold',
            cursor: 'pointer',
            marginBottom: 10,
            width: 300,
        },
        secondary: {
            backgroundColor: '#3DC9A7',
        },
        error: {
            color: 'red',
            marginBottom: 10,
        },
        success: {
            color: 'green',
            marginBottom: 10,
        },
    };

    return (
        <div style={styles.container}>
            <h2>Restablecer contraseña</h2>

            {error && <p style={styles.error}>{error}</p>}
            {success && <p style={styles.success}>{success}</p>}

            {step === 1 && (
                <>
                    <input
                        style={styles.input}
                        type="email"
                        placeholder="Correo electrónico"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <button
                        style={styles.button}
                        onClick={handleSendCode}
                        disabled={loading}
                    >
                        {loading ? 'Enviando...' : 'Enviar código'}
                    </button>
                </>
            )}

            {step === 2 && (
                <>
                    <input
                        style={styles.input}
                        type="text"
                        placeholder="Código de verificación"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                    />
                    <input
                        style={styles.input}
                        type="password"
                        placeholder="Nueva contraseña"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                    />
                    <button
                        style={styles.button}
                        onClick={handleResetPassword}
                        disabled={loading}
                    >
                        {loading ? 'Cambiando...' : 'Cambiar contraseña'}
                    </button>
                    <button
                        style={{ ...styles.button, ...styles.secondary }}
                        onClick={handleResend}
                        disabled={loading}
                    >
                        Reenviar código
                    </button>
                </>
            )}
        </div>
    );
}
