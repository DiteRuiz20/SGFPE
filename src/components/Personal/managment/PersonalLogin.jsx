import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import logo from '../../../assets/logo.png';
import { Divider } from '@mui/material';

const schema = yup.object().shape({
    email: yup.string().email('Ingresa un correo válido').required('El correo es obligatorio'),
    password: yup.string().required('La contraseña es obligatoria'),
});

export default function PersonalLogin() {
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();
    const [errorMessage, setErrorMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: yupResolver(schema),
    });

    const onSubmit = async (data) => {
        setErrorMessage('');
        setIsLoading(true);
        try {
            await login(data.email, data.password, 'personal');
            const from = location.state?.from?.pathname || '/personal-expenses';
            navigate(from, { replace: true });
        } catch (error) {
            setErrorMessage(error.message || 'Error al iniciar sesión');
        } finally {
            setIsLoading(false);
        }
    };

    const goToCreateAccount = () => navigate('/create-personal-account');

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
            marginTop: 20,
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
                <p style={styles.title}>LOGIN</p>
                <img style={styles.image} src={logo} alt="logo" />
                <p style={styles.subtitle}>Personal Finance Managment</p>
            </div>

            <div style={styles.containerLeft}>
                {errorMessage && (
                    <div style={{
                        backgroundColor: '#ffebee',
                        padding: '10px',
                        borderRadius: '4px',
                        marginBottom: '15px',
                        color: '#d32f2f',
                        width: '444px',
                    }}>
                        {errorMessage}
                    </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)}>
                    <div>
                        <input
                            style={styles.input}
                            type="email"
                            {...register('email')}
                            placeholder="Email"
                        />
                        {errors.email && <p style={{ color: 'red' }}>{errors.email.message}</p>}
                    </div>

                    <div>
                        <input
                            style={styles.input}
                            type="password"
                            {...register('password')}
                            placeholder="Password"
                        />
                        {errors.password && <p style={{ color: 'red' }}>{errors.password.message}</p>}
                    </div>

                    <button className='primary_button' type="submit" disabled={isLoading}>
                        {isLoading ? 'PROCESANDO...' : 'LOGIN'}
                    </button>
                </form>

                <Divider style={styles.divider} />
                <p style={styles.orText}>or</p>
                <p style={styles.getStarted}>Sign up to get started</p>

                <button className='secondary_button' onClick={goToCreateAccount} style={{ marginTop: '10px' }}>
                    SIGN UP
                </button>
            </div>
        </div>
    );
}
