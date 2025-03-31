import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Divider } from '@mui/material';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAuth } from '../../../context/AuthContext';
import TopNavBar from './TopNavBar';

// Esquema de validación con Yup
const schema = yup.object().shape({
    name: yup.string().required('El nombre es obligatorio'),
    email: yup.string().email('Ingresa un correo válido').required('El correo es obligatorio'),
    username: yup.string().required('El nombre de usuario es obligatorio'),
    phoneNumber : yup.number().positive('Phone number must be positive').min(10, 'The phone number should be 10 digits').required('Phone number is required').transform((value, originalValue) => (originalValue === '' ? undefined : value)),
    password: yup.string().min(6, 'La contraseña debe tener al menos 6 caracteres').required('La contraseña es obligatoria'),
});

export default function PersonalProfile() {
  const location = useLocation();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: yupResolver(schema),
  });
  const { logout } = useAuth();

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
            alert('Hubo un error al crear la cuenta');
        }
    };

    const customSubmit = () => {
        handleSubmit(onSubmit)();
    };
  
    const styles = {
      divider: {
        width: '100%',
        height: '2px',
        backgroundColor: '#999',
        marginTop: 20,
      },
      title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#30437A',
        marginBottom: 20,
      },
  };

  const handleLogout = () => {
    logout();
    navigate('/login-personal');
  };

  return (
    <div>
      <div className="row justify-content-center mb-5">
        <TopNavBar/>
        <Divider style={styles.divider} />
      </div>
    
      <div className='row mt-5'>
          <div className='col-sm-6 d-flex flex-column justify-content-center align-items-center'>
            <form className='d-flex flex-column col-8'>
              <div className='d-flex flex-column justify-content-center align-items-center'>
                <input className='input col-12'
                  type="text"
                  {...register('name')}
                  placeholder="Nombre"
                />
                {errors.name && <p style={{ color: 'red' }}>{errors.name.message}</p>}
              </div>

              <div className='d-flex flex-column justify-content-center align-items-center'>
                <input className='input col-12'
                  disabled
                  type="email"
                  {...register('email')}
                  placeholder="Correo electrónico"
                  />
                {errors.email && <p style={{ color: 'red' }}>{errors.email.message}</p>}
              </div>
    
              <div className='d-flex flex-column justify-content-center align-items-center'>
                <input className='input col-12'
                  type="text"
                  {...register('username')}
                  placeholder="Nombre de usuario"
                />
                {errors.username && <p style={{ color: 'red' }}>{errors.username.message}</p>}
              </div>

              <div className='d-flex flex-column justify-content-center align-items-center'>
                <input className='input col-12'
                  type="text"
                  {...register('phoneNumber')}
                  placeholder="Número telefónico"
                />
                {errors.phoneNumber && <p style={{ color: 'red' }}>{errors.phoneNumber.message}</p>}
              </div>
            </form>
          </div>
  
          <div className='col-sm-6 d-flex flex-column justify-content-center align-items-center'>
            <button className='secondary_button col-8' type="button" onClick={customSubmit}>EDITAR PERFIL</button>
            <button className='logOut_button col-8' type="button" onClick={handleLogout}>CERRAR SESIÓN</button>
          </div>
      </div>
    </div>
    );
}