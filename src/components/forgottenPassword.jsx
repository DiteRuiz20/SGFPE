import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { sendResetCode, resetPassword } from '../services/ForgotPassword';

export default function forgottenPassword() {
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
      setSuccess('Contraseña cambiada exitosamente');
      navigate('/');
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
  };
            
      return (
      <div className="background-container align-content-center">
        <div className='container d-flex flex-column align-items-center justify-content-center'>
            <p style={styles.title}>RECUPERACIÓN DE CONTRASEÑA</p>
            {step === 1 && (
              <p style={styles.text}>Ingresa tu correo electrónico para recibir un código de recuperación de contraseña.</p>
            )}
            <div className='d-flex flex-column col-sm-4'>
              {error && <p style={styles.error}>{error}</p>}
              {success && <p style={styles.success}>{success}</p>}

              {step === 1 && (
                <>
                  <input className='input'
                    type="email"
                    placeholder="Correo electrónico"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <button
                    className='primary_button'
                    onClick={handleSendCode}
                    disabled={loading}>
                      {loading ? 'Enviando...' : 'Enviar código'}
                  </button>
                </>
              )}

              {step === 2 && (
                <>
                  <input
                    className='input'
                    type="text"
                    placeholder="Código de verificación"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                  />
                  <input
                    className='input'
                    type="password"
                    placeholder="Nueva contraseña"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                  <button
                    className='primary_button'
                    onClick={handleResetPassword}
                    disabled={loading}
                  >
                    {loading ? 'Cambiando...' : 'Cambiar contraseña'}
                  </button>
                </>
              )}
              <p style={styles.subtitle}>¿No recibiste el correo?</p>
              <button
                className='secondary_button'
                style={{ ...styles.button, ...styles.secondary }}
                onClick={handleResend}
                disabled={loading}>
                    VOLVER A ENVIAR
              </button>
            </div>
        </div>
      </div>
    );
}