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
  phoneNumber: yup.number().positive('Phone number must be positive').min(10, 'The phone number should be 10 digits').required('Phone number is required').transform((value, originalValue) => (originalValue === '' ? undefined : value)),
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
      navigate('/verify-account', { state: { email: data.email, accountType: 'personal' } });
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
    <div className="background-container align-content-center">
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
                  placeholder="Nombre"
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
                  placeholder="Numero telefónico"
                />
                {errors.phoneNumber && <p style={{ color: 'red' }}>{errors.phoneNumber.message}</p>}
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
    </div>
  );
}
