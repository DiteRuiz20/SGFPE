import React from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

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

    return (
        <div>
            <h1>Iniciar Sesión</h1>
            <form onSubmit={handleSubmit(onSubmit)}>
                <div>
                    <label>Correo Electrónico:</label>
                    <input
                        type="email"
                        {...register('email')}
                        placeholder="Ingresa tu correo"
                    />
                    {errors.email && <p style={{ color: 'red' }}>{errors.email.message}</p>}
                </div>

                <div>
                    <label>Contraseña:</label>
                    <input
                        type="password"
                        {...register('password')}
                        placeholder="Ingresa tu contraseña"
                    />
                    {errors.password && <p style={{ color: 'red' }}>{errors.password.message}</p>}
                </div>

                <button type="submit">Iniciar Sesión</button>
            </form>

            <button onClick={goToCreateAccount} style={{ marginTop: '10px' }}>
                Crear Cuenta Personal
            </button>
        </div>
    );
}
