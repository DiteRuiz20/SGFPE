import React, { useState } from 'react';
import logo from '../../../assets/logo.png';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { createUser } from '../../../services/UserService';

const schema = yup.object().shape({
    name: yup.string().required('Name is required'),
    email: yup.string().email('Please enter a valid email').required('Email is required'),
    address: yup.string(),
    phoneNumber: yup.number().positive('Phone number must be positive').min(10, 'The phone number should be 10 digits').required('Phone number is required').transform((value, originalValue) => (originalValue === '' ? undefined : value)),
    password: yup.string().min(6, 'Password should be at least 6 characters').required('Password is required'),
    companyName: yup.string().required('Company name is required'),
});

export default function CreateBusinessRawMaterialAccount() {
    const [users, setUsers] = useState([]);
    const { register, handleSubmit, formState: { errors }, reset } = useForm({
        resolver: yupResolver(schema),
    });

    const customSubmit = () => {
        handleSubmit(onSubmit)();
    };

    const onSubmit = async (data) => {
        try {
            const newUser = { ...data, accountType: 'business-raw-material' };
            const createdUser = await createUser(newUser);
            console.log('Nuevo usuario creado:', createdUser);
            alert('Cuenta de negocio de materia prima creada exitosamente');
            reset();
        } catch (error) {
            console.error('Error al crear la cuenta:', error);
            alert('Hubo un error al crear la cuenta. Intenta de nuevo más tarde.');
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
          };
    
        return (
          <div className='container'>
                   <div className='d-flex flex-column justify-content-center align-items-center mb-md-5'>
                     <p style={styles.subtitle}>¡Gracias por unirte a nosotros!</p>
                     <p style={styles.subtitle}>Por favor, llena los campos solicitados.</p>
                   </div>
                   <div className='row justify-content-center align-items-center col-12'>
                       <div className='col-sm-6 d-flex flex-column justify-content-center align-items-center'>
                           <div className="col-4 mb-4 d-flex justify-content-center">
                             <img className='img-fluid' style={styles.image} src={logo} alt="logo" />
                           </div>
                           <div className='d-flex flex-column justify-content-center align-items-center text-center'>
                             <p style={styles.subtitle}>Nota:</p>
                             <p style={styles.subtitle}>Se te enviará un código de confirmación por correo electrónico, que se utilizará para autenticar tu cuenta.</p>
                           </div>
                           <button className='secondary_button col-8' type="button" onClick={customSubmit}>REGISTRARSE</button>
                       </div>
                       <div className='col-sm-6'>
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
                                    type="text"
                                    {...register('address')}
                                    placeholder="Dirección (Opcional)"
                                />
                                {errors.address && <p style={{ color: 'red' }}>{errors.address.message}</p>}
                            </div>
    
                            <div className='d-flex flex-column justify-content-center align-items-center'>
                                <input className='input col-8'
                                    type="password"
                                    {...register('password')}
                                    placeholder="Contraseña"
                                />
                                {errors.password && <p style={{ color: 'red' }}>{errors.password.message}</p>}
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        );
} 