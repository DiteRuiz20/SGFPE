import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Divider } from '@mui/material';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAuth } from '../../../context/AuthContext';
import { getUser, updateUser } from '../../../services/UserService';
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
  const { userId, logout } = useAuth(); // Obtener userId y logout del contexto
  const [user, setUser] = useState(null);
  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: yupResolver(schema),
  });

  // Obtener datos del usuario al cargar el componente
  useEffect(() => {
    const fetchUser = async () => {
      if (!userId) {
        console.error('userId es undefined o null');
        return;
      }

      try {
        console.log('ID del usuario:', userId);
        const userInfo = await getUser(userId); // Obtener datos del usuario por ID
        console.log('Usuario obtenido:', userInfo);

        if (!userInfo) {
          console.error('No se encontraron datos para el usuario');
          return;
        }

        setUser(userInfo);
        reset(userInfo); // Inicializar el formulario con los datos del usuario
      } catch (error) {
        if (error.response) {
          console.error('Error en la respuesta del servidor:', error.response);
        } else if (error.request) {
          console.error('No se recibió respuesta del servidor:', error.request);
        } else {
          console.error('Error al realizar la solicitud:', error.message);
        }
      }
    };

    fetchUser();
  }, [userId, reset]);

  // Actualizar usuario
  const onSubmit = async (data) => {
    try {
        console.log('Datos enviados al backend:', { ...user, ...data }); // Inspecciona los datos
        const updatedUser = await updateUser({ ...user, ...data }); // Actualizar solo los campos modificados
        console.log('Usuario actualizado:', updatedUser);
        alert('Perfil actualizado exitosamente');
        setUser(updatedUser); // Actualizar el estado con los datos actualizados
    } catch (error) {
        console.error('Error al actualizar el perfil:', error);
        alert('Hubo un error al actualizar el perfil');
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