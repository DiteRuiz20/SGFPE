import React from 'react'
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';

export default function forgottenPassword() {
  const navigate = useNavigate();

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
            <p style={styles.text}>Ingresa tu correo electrónico para recibir un código de recuperación de contraseña.</p>
            <div className='d-flex flex-column col-sm-4'>
                <input className='input'
                  type="email"
                  placeholder="Correo electrónico"
                />
                <button className='primary_button'>
                    ENVIAR
                </button>
                <p style={styles.subtitle}>¿No recibiste el correo?</p>
                <button className='secondary_button'>
                    VOLVER A ENVIAR
                </button>
            </div>
        </div>
      </div>
    );
}