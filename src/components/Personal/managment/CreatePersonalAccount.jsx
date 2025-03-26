import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { getUsers, createUser } from '../../../services/UserService';
import logo from '../../../assets/logo.png';
import { useNavigate } from 'react-router-dom';

// Esquema de validación con Yup
const schema = yup.object().shape({
    name: yup.string().required('El nombre es obligatorio'),
    email: yup.string().email('Ingresa un correo válido').required('El correo es obligatorio'),
    username: yup.string().required('El nombre de usuario es obligatorio'),
    phoneNumber : yup.number().positive('Phone number must be positive').min(10, 'The phone number should be 10 digits').required('Phone number is required').transform((value, originalValue) => (originalValue === '' ? undefined : value)),
    password: yup.string().min(6, 'La contraseña debe tener al menos 6 caracteres').required('La contraseña es obligatoria'),
});

export default function CreatePersonalAccount() {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const { register, handleSubmit, formState: { errors }, reset } = useForm({
        resolver: yupResolver(schema),
    });

    // Obtener usuarios al cargar el componente
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await getUsers(); // Llamada a la función importada
                console.log('Usuarios obtenidos:', response);  // Verifica la respuesta de la API
                // Mapeamos la respuesta para asegurarnos de que cada usuario tenga un `accountType`
                const fetchedUsers = response.map(user => ({
                    ...user,
                    accountType: user.accountType || 'Desconocido',  // Asegúrate de que `accountType` esté presente
                }));
                setUsers(fetchedUsers);
            } catch (error) {
                console.error('Error al obtener los usuarios:', error);
            }
        };

        fetchUsers();
    }, []);

    // Crear usuario
    const onSubmit = async (data) => {
        try {
            // Asegúrate de que el `accountType` sea 'personal' al crear el nuevo usuario
            const newUser = await createUser({ ...data, accountType: 'personal' });
            console.log('Nuevo usuario creado:', newUser);  // Verifica los datos enviados y la respuesta
            alert('Cuenta personal creada exitosamente');
            reset();

            // Actualizar la lista de usuarios después de crear
            setUsers((prevUsers) => [...prevUsers, newUser]);
            navigate('/login-personal');
        } catch (error) {
            console.error('Error al crear la cuenta:', error);
            
            // Manejo de errores específicos
            if (error.response) {
                if (error.response.status === 403) {
                    alert('Error de permisos: No tienes permisos para registrar una cuenta');
                } else if (error.response.status === 400) {
                    alert('Datos inválidos: Verifica la información ingresada');
                } else if (error.response.status === 409) {
                    alert('El email o nombre de usuario ya está registrado');
                } else {
                    alert(`Error del servidor (${error.response.status}): Contacta al administrador`);
                }
            } else {
                alert('Hubo un error al crear la cuenta. Intenta de nuevo más tarde.');
            }
        }
    };

    const customSubmit = () => {
        handleSubmit(onSubmit)();
    };

    const styles = {
        fatherContainer: {
            marginTop: 40,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: 'white',
            width: '80vw',
        },
        upperContainer: {
            display: 'flex',
            flexDirection: 'column',
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
        },
        image: {
          width: 130,
          height: 130,
          marginBottom: 30,
        },
        subtitle: {
          alignSelf: 'center',
          fontSize: 16,
          color: '#444',
          marginBottom: 20,
        },
        title: {
          fontSize: 28,
          fontWeight: 'bold',
          color: '#30437A',
          marginBottom: 20,
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
        primary_button: {
          width: '100%',
          backgroundColor: '#30437A',
          padding: 15,
          borderRadius: 8,
          alignItems: 'center',
          marginBottom: 15,
          shadowColor: '#30387a',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.5,
          shadowRadius: 2,
        },
        orText: {
          fontSize: 14,
          color: '#666',
          backgroundColor: 'white',
          top: -23,
        },
        getStarted: {
          color: '#666',
          fontSize: 14,
          marginBottom: 15,
        },
        secondary_button: {
          width: '100%',
          backgroundColor: '#3DC9A7',
          padding: 15,
          borderRadius: 8,
          alignItems: 'center',
          shadowColor: '#3dc1ad',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.5,
          shadowRadius: 2,
        },
        button_text: {
          color: 'white',
          fontSize: 16,
        },
      };

      return (
        <div style={styles.upperContainer}>
          <p style={styles.subtitle}>Thanks for joining us!</p>
          <p style={styles.subtitle}>Please fill out the required data about you.</p>
          <div style={styles.fatherContainer}>
              <div style={styles.container}>
                <form>
                  <div>
                    <input style={styles.input}
                      type="text"
                      {...register('name')}
                      placeholder="Name"
                    />
                    {errors.name && <p style={{ color: 'red' }}>{errors.name.message}</p>}
                  </div>
  
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
                      type="text"
                      {...register('username')}
                      placeholder="Username"
                    />
                    {errors.username && <p style={{ color: 'red' }}>{errors.username.message}</p>}
                  </div>

                  <div>
                    <input style={styles.input}
                      type="text"
                      {...register('phoneNumber')}
                      placeholder="PhoneNumber"
                    />
                    {errors.phoneNumber && <p style={{ color: 'red' }}>{errors.phoneNumber.message}</p>}
                  </div>
  
                  <div>
                    <input style={styles.input}
                      type="password"
                      {...register('password')}
                      placeholder="Password"
                    />
                    {errors.password && <p style={{ color: 'red' }}>{errors.password.message}</p>}
                  </div>
                </form>
              </div>
              <div style={styles.container}>
                  <img style={styles.image} src={logo} alt="logo" />
                  <p style={styles.subtitle}>Note:</p>
                  <p style={styles.subtitle}>You will be sent a confirmation code via email, which will be used to authenticate your account.</p>
                  <button className='secondary_button' type="button" onClick={customSubmit}>SIGN UP</button>
              </div>
          </div>        
        </div>
      );
}
