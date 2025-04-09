import React, { useState } from 'react';
import logo from '../../../assets/logo.png';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { createUser } from '../../../services/UserService';
import { useNavigate } from 'react-router-dom';
import { Alert, Snackbar } from '@mui/material';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const regexLettersSpaces = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/;
const regexLettersNumbers = /^[A-Za-z0-9ÁÉÍÓÚáéíóúÑñ\s]+$/;
const regexEmail = /^[a-zA-Z0-9._]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const regexPhone = /^[0-9]{10}$/;
const regexZip = /^[0-9]{5}$/;

const schema = yup.object().shape({
    name: yup.string().required('El nombre es obligatorio').matches(regexLettersSpaces, 'Solo se permiten letras y espacios'),
    email: yup
        .string()
        .transform(value => value?.toLowerCase())
        .email('Ingresa un correo válido')
        .required('El correo es obligatorio')
        .matches(regexEmail, 'Ingresa un correo válido'),
    phoneNumber: yup.string().matches(regexPhone, 'El número debe tener 10 dígitos').required('El número es obligatorio'),
    password: yup.string().min(6, 'La contraseña debe tener al menos 6 caracteres').required('La contraseña es obligatoria'),
    city: yup.string().optional().test('valid-city', 'Solo se permiten letras y espacios', value => !value || regexLettersSpaces.test(value)),
    street: yup.string().optional().test('valid-street', 'Solo se permiten letras y números', value => !value || regexLettersNumbers.test(value)),
    zip: yup.string()
        .nullable()
        .notRequired()
        .test('zip-code', 'El código postal debe tener 5 dígitos', value => {
            return !value || regexZip.test(value);
        }),
    state: yup.string().optional().test('valid-state', 'Solo se permiten letras y espacios', value => !value || regexLettersSpaces.test(value)),
});

export default function CreateBusinessNewProductExpenseAccount() {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [alert, setAlert] = useState({ open: false, message: '', severity: '' });
    const [showPassword, setShowPassword] = useState(false);
    const { register, handleSubmit, formState: { errors }, reset } = useForm({
        resolver: yupResolver(schema),
        mode: 'onChange',
        reValidateMode: 'onChange'
    });

    const customSubmit = () => {
        handleSubmit(onSubmit)();
    };

    const onSubmit = async (data) => {
        setIsLoading(true);
        try {
            const { city, street, zip, state } = data;
            const addressParts = [street, city, state, zip];
            const fullAddress = addressParts.join(', ');
            const newUser = { ...data, address: fullAddress, accountType: 'business-new-product-expense' };
            const createdUser = await createUser(newUser);
            console.log('Nuevo usuario creado:', createdUser);
            setAlert({ open: true, message: '¡Cuenta creada exitosamente!', severity: 'success' });
            reset();

            setTimeout(() => {
                navigate('/verify-account', { state: { email: data.email, accountType: 'business-new-product-expense' } });
            }, 3000);
        } catch (error) {
            console.error('Error al crear la cuenta:', error);

            let errorMessage = 'Hubo un error al crear la cuenta. Intenta de nuevo más tarde.';
            if (error.response) {
                switch (error.response.status) {
                    case 403:
                        errorMessage = 'Error de permisos: No tienes permisos para registrar una cuenta.';
                        break;
                    case 400:
                        errorMessage = 'El email ya está registrado.';
                        break;
                    default:
                        errorMessage = `Error del servidor (${error.response.status}): Contacta al administrador.`;
                }
            }

            setAlert({ open: true, message: errorMessage, severity: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    const styles = {
        image: {
            width: '70%',
            height: '70%',
        },
        subtitle: {
            fontSize: '18px',
            color: '#444',
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
            <div className='container'>
                <div className='row justify-content-center align-items-center col-12'>
                    <div className='col-sm-5 d-flex flex-column justify-content-center align-items-center'>
                        <p style={styles.subtitle}>¡Gracias por unirte a nosotros!</p>
                        <p style={styles.subtitle}>Por favor, llena los campos solicitados.</p>
                        <div className="col-4 mb-4 d-flex justify-content-center">
                            <img className='img-fluid' style={styles.image} src={logo} alt="logo" />
                        </div>
                        <div className='d-flex flex-column justify-content-center align-items-center text-center'>
                            <p style={styles.subtitle}>Nota:</p>
                            <p style={styles.subtitle}>Se te enviará un código de confirmación por correo electrónico, que se utilizará para autenticar tu cuenta.</p>
                        </div>
                        <button className='secondary_button col-md-8' type="button" onClick={handleSubmit(onSubmit)} disabled={isLoading}>
                            {isLoading ? 'PROCESANDO...' : 'CREAR CUENTA'}
                        </button>
                    </div>
                    <div className='col-sm-7'>
                        <form>
                            <div className='d-flex flex-column justify-content-center align-items-center'>
                                <input className='input col-8'
                                    type="text"
                                    {...register('name')}
                                    placeholder="Nombre de la empresa"
                                />
                                {errors.name && <p style={{ color: 'red' }}>{errors.name.message}</p>}
                            </div>

                            <div className='d-flex flex-column justify-content-center align-items-center'>
                                <input className='input col-8'
                                    type="email"
                                    {...register('email')}
                                    placeholder="Correo electrónico"
                                />
                                {errors.email && <p style={{ color: 'red' }}>{errors.email.message}</p>}
                            </div>

                            <div className='d-flex flex-column justify-content-center align-items-center'>
                                <input className='input col-8'
                                    type="text"
                                    {...register('phoneNumber')}
                                    placeholder="Número telefónico"
                                />
                                {errors.phoneNumber && <p style={{ color: 'red' }}>{errors.phoneNumber.message}</p>}
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
                                        paddingRight: '140px',
                                        cursor: 'pointer',
                                        color: '#555'
                                    }}
                                >
                                    {showPassword ? <FaEye size={20} /> : <FaEyeSlash size={20} />}
                                </span>
                                {errors.password && <p style={{ color: 'red', marginTop: '30px', marginBottom: '-30px' }}>{errors.password.message}</p>}
                            </div>

                            <div className='d-flex flex-column justify-content-center align-items-center' style={{ marginTop: '30px' }}>
                                <div className="row col-8 col-md-9 d-flex justify-content-center align-items-center">
                                    <input
                                        className='input mb-2 col-md-5 me-md-4'
                                        type="text"
                                        {...register('city')}
                                        placeholder="Ciudad (Opcional)"
                                    />
                                    {errors.city && <p style={{ color: 'red' }}>{errors.city.message}</p>}
                                    <input
                                        className='input mb-2 col-md-5'
                                        type="text"
                                        {...register('street')}
                                        placeholder="Calle (Opcional)"
                                    />
                                    {errors.street && <p style={{ color: 'red' }}>{errors.street.message}</p>}
                                </div>
                                <div className="row col-8 col-md-9 d-flex justify-content-center align-items-center">
                                    <input
                                        className='input mb-2 col-md-5 me-md-4'
                                        type="text"
                                        {...register('zip')}
                                        placeholder="Código Postal (Opcional)"
                                    />
                                    {errors.zip && <p style={{ color: 'red' }}>{errors.zip.message}</p>}
                                    <input
                                        className='input mb-2 col-md-5'
                                        type="text"
                                        {...register('state')}
                                        placeholder="Estado (Opcional)"
                                    />
                                    {errors.state && <p style={{ color: 'red' }}>{errors.state.message}</p>}
                                </div>
                            </div>
                        </form>
                    </div>
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