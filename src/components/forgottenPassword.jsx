import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { sendResetCode, resetPassword } from '../services/ForgotPassword';

export default function ForgottenPassword() {
  const [email, setEmail] = useState('');
  const [step, setStep] = useState(1);
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // Regex
  const regexEmail = /^[a-zA-Z0-9._]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const regexCode = /^[0-9]{6}$/;

  const handleSendCode = async () => {
    if (!regexEmail.test(email)) {
      setError('Ingresa un correo válido');
      return;
    }

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
    if (!regexCode.test(code)) {
      setError('El código debe tener exactamente 6 dígitos');
      return;
    }

    if (newPassword.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true);
    try {
      await resetPassword(email, code, newPassword);
      setSuccess('Contraseña cambiada exitosamente');
      setError('');
      navigate('/');
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
    subtitle: {
      marginTop: '20px',
      fontSize: 16,
      color: '#444',
    },
    error: {
      color: 'red',
      fontSize: '14px',
    },
    success: {
      color: 'green',
      fontSize: '14px',
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
              <input
                className='input'
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
            onClick={handleResend}
            disabled={loading}>
            VOLVER A ENVIAR
          </button>
        </div>
      </div>
    </div>
  );
}
