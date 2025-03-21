import React from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import api from '../../../services/api';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import logo from '../../../assets/logo.png';
import {Divider} from '@mui/material';

const schema = yup.object().shape({
    email: yup.string().email('Ingresa un correo válido').required('El correo es obligatorio'),
    password: yup.string().required('La contraseña es obligatoria'),
});

export default function PersonalLogin() {
    const navigate = useNavigate();
    const { login } = useAuth();

    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: yupResolver(schema),
    });

    const onSubmit = async (data) => {
        try {
            // Hacer la petición al backend para obtener el token y userId
            const response = await api.post('/auth/login', null, {
                params: {
                    email: data.email,
                    password: data.password,
                }
            });

            const token = response.data.token; // Asegúrate que tu backend regrese así el token
            const userId = response.data.userId; // Asegúrate que el backend lo regrese

            // Guardar token y userId en localStorage
            login(token);
            localStorage.setItem('token', token);
            localStorage.setItem('userId', userId);

            console.log('Token guardado:', token);
            console.log('User ID guardado:', userId);
            console.log('Redirigiendo a personal-expenses...');
            
            alert('Inicio de sesión exitoso');
            navigate('/personal-expenses');
        } catch (error) {
            console.error('Error al iniciar sesión:', error);
            alert('Correo o contraseña incorrectos');
        }
    };

    const goToCreateAccount = () => {
        navigate('/create-personal-account');
    };

    const styles = {
        fatherContainer: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'white',
            width: '100vw',
            height: '100vh',
        },
        container: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'white',
            width: '100vw',
            height: '100vh',
        },
        containerLeft: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'white',
            width: '100vw',
            height: '100vh',
            marginLeft: -50,
        },
        image: {
          width: 230,
          height: 230,
          marginBottom: 40,
        },
        subtitle: {
          fontSize: 17,
          color: '#444',
          marginBottom: 20,
        },
        title: {
          fontSize: 32,
          fontWeight: 'bold',
          color: '#30437A',
          marginBottom: 25,
        },
        input: {
            width: 444,
            height: 20,
            backgroundColor: '#EAEAEA',
            padding: 15,
            borderWidth: 0,
            borderRadius: 8,
            color: 'black',
            marginBottom: 15,
            boxShadow: '0px 2px 2px rgba(136, 136, 136, 0.5)',
        },
        divider: {
          width: '60%',
          height: 2,
          backgroundColor: '#EAEAEA',
          marginTop:20,
        },
        orText: {
          fontSize: 14,
          color: '#666',
          backgroundColor: 'white',
          marginTop: -13,
          marginBottom: 22,
        },
         getStarted: {
          color: '#666',
          fontSize: 14,
          marginBottom: 10,
        },
      };

    return (
        <div style={styles.fatherContainer}>
            <div style={styles.container}>
                <text style={styles.title}>LOGIN</text>
                <img style={styles.image} src={logo} alt="logo" />
                <text style={styles.subtitle}>Personal Finance Managment</text>
            </div>
            <div style={styles.containerLeft}>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div>
                        <input style={styles.input}
                            type="email"
                            {...register('email')}
                            placeholder="Email"
                        />
                        {errors.email && <p style={{ color: 'red' }}>{errors.email.message}</p>}
                    </div>

                    <div>
                        <input style={styles.input}
                            type="password"
                            {...register('password')}
                            placeholder="Password"
                        />
                        {errors.password && <p style={{ color: 'red' }}>{errors.password.message}</p>}
                    </div>

                    <button className='primary_button' type="submit">LOGIN</button>
                </form>
                <Divider style={styles.divider}/>
                <text style={styles.orText}>or</text>
                <text style={styles.getStarted}>Sign up to get started</text>
                <button className='secondary_button' onClick={goToCreateAccount} style={{ marginTop: '10px' }}>
                    SIGN UP
                </button>
            </div>
        </div>
    );
}
