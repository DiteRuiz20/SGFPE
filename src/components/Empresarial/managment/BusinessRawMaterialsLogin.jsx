import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import logo from '../../../assets/logo.png';
import { Divider } from '@mui/material';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const schema = yup.object().shape({
    email: yup.string()
        .transform(value => value?.toLowerCase())
        .email('Ingresa un correo válido').required('El correo es obligatorio')
        .matches(/^[a-zA-Z0-9._]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 'Ingresa un correo válido'),
    password: yup.string().required('La contraseña es obligatoria'),
});

export default function BusinessRawMaterialsLogin() {
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();
    const [errorMessage, setErrorMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [accountType] = useState('business-raw-material'); // Tipo de cuenta fijo

    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: yupResolver(schema),
        mode: 'onChange',
        reValidateMode: 'onChange'
    });

    const onSubmit = async (data) => {
        setErrorMessage('');
        setIsLoading(true);
        try {
            await login(data.email, data.password, accountType);
            const from = location.state?.from?.pathname || '/raw-materials-tracker';
            navigate(from, { replace: true });
        } catch (error) {
            setErrorMessage(error.message || 'Error al iniciar sesión');
        } finally {
            setIsLoading(false);
        }
    };

    const goToCreateAccount = () => navigate('/create-business-raw-material-account');

    const styles = {
        image: {
            width: '75%',
            height: '75%',
        },
        subtitle: {
            fontSize: 20,
            color: '#444',
        },
        title: {
            fontSize: 34,
            fontWeight: 'bold',
            color: '#30437A',
            marginBottom: 25,
        },
        getStarted: {
            color: '#222',
            fontSize: 16,
            marginBottom: 10,
        },
        divider: {
            width: '65%',
            height: '2px',
            backgroundColor: '#999',
            marginTop: 20,
        },
    };

    return (
        <div className="background-container align-content-center">
            <div className="container">
                <div className='row d-flex justify-content-center align-items-center'>
                    <div className='col-sm-6 d-flex justify-content-center align-items-center flex-column'>
                        <p style={styles.title}>INICIO DE SESIÓN</p>
                        <div className="col-4 mb-4 d-flex justify-content-center">
                            <img className='img-fluid' style={styles.image} src={logo} alt="logo" />
                        </div>
                        <div className="d-flex justify-content-center mt-2">
                            <p style={styles.subtitle}>Gestión Financiera Empresarial</p>
                        </div>
                    </div>

                    <div className='col-sm-6 d-flex justify-content-center align-items-center flex-column'>
                        {errorMessage && (
                            <div style={{
                                backgroundColor: '#ffebee',
                                padding: '10px',
                                borderRadius: '4px',
                                marginBottom: '15px',
                                color: '#d32f2f',
                                width: '66%',
                            }}>
                                {errorMessage}
                            </div>
                        )}

                        <form className='col-12 d-flex justify-content-center flex-column' onSubmit={handleSubmit(onSubmit)}>
                            <div className='d-flex flex-column justify-content-center align-items-center'>
                                <input className='input col-8'
                                    style={styles.input}
                                    type="email"
                                    {...register('email')}
                                    placeholder="Correo electrónico"
                                />
                                {errors.email && <p style={{ color: 'red' }}>{errors.email.message}</p>}
                            </div>

                            <div className='d-flex flex-column justify-content-center align-items-center'>
                                <input className='input col-8'
                                    type={showPassword ? "text" : "password"}
                                    {...register('password')}
                                    placeholder="Contraseña"
                                />
                                <span
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{
                                        alignSelf: 'flex-end',
                                        marginTop: '-53px',
                                        paddingRight: '120px',
                                        cursor: 'pointer',
                                        color: '#555'
                                    }}
                                >
                                    {showPassword ? <FaEye size={20} /> : <FaEyeSlash size={20} />}
                                </span>
                                {errors.password && <p style={{ color: 'red', marginTop: '30px', marginBottom: '-30px' }}>{errors.password.message}</p>}
                            </div>

                            <div className="d-flex justify-content-center">
                                <button className='primary_button col-md-8' type="submit" style={{ marginTop: '53px' }} disabled={isLoading}>
                                    {isLoading ? 'PROCESANDO...' : 'INICIAR SESIÓN'}
                                </button>
                            </div>
                            <div className="d-flex justify-content-center align-items-center my-2">
                                <Divider style={styles.divider} />
                            </div>
                        </form>

                        <div className="d-flex flex-column justify-content-center align-items-center col-12 mt-3">
                            <p style={styles.getStarted}>¿No tienes una cuenta?</p>
                            <button className='secondary_button col-8' onClick={goToCreateAccount} style={{ marginTop: '10px' }}>
                                REGISTRARSE
                            </button>
                            <a className='col-8' href='/forgotten-password'>¿Olvidaste tu contraseña?</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
} 