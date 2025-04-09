import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { getUsers, createUser } from '../../../services/UserService';
import logo from '../../../assets/logo.png';
import { useNavigate } from 'react-router-dom';
import { Alert, Snackbar } from '@mui/material';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

// Esquema de validación con Yup
const schema = yup.object().shape({
  name: yup.string().required('El nombre es obligatorio').matches(/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/, 'Solo se permiten letras y espacios'),
  email: yup.string()
    .transform(value => value?.toLowerCase())
    .email('Ingresa un correo válido').required('El correo es obligatorio').matches(/^[a-zA-Z0-9._]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 'Ingresa un correo válido'),
  phoneNumber: yup.string().matches(/^[0-9]+$/, 'Solo se permiten números').min(10, 'El número debe tener 10 dígitos').required('El número es obligatorio').max(10, 'El número debe tener 10 dígitos'),
  password: yup.string().min(6, 'La contraseña debe tener al menos 6 caracteres').required('La contraseña es obligatoria'),
});

export default function CreatePersonalAccount() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [alert, setAlert] = useState({ open: false, message: '', severity: '' });
  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: yupResolver(schema),
    mode: 'onChange',
    reValidateMode: 'onChange'
  });

  // Obtener usuarios al cargar el componente
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await getUsers();
        console.log('Usuarios obtenidos:', response);
        setUsers(response.map(user => ({ ...user, accountType: user.accountType || 'Desconocido' })));
      } catch (error) {
        console.error('Error al obtener los usuarios:', error);
      }
    };

    fetchUsers();

    const handleKeyDown = (event) => {
      if (event.key === 'Enter') {
        handleSubmit(onSubmit)();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Crear usuario
  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const newUser = await createUser({ ...data, accountType: 'personal' });
      console.log('Nuevo usuario creado:', newUser);

      setAlert({ open: true, message: '¡Cuenta creada exitosamente!', severity: 'success' });

      reset();
      setUsers((prevUsers) => [...prevUsers, newUser]);

      setTimeout(() => {
        navigate('/verify-account', { state: { email: data.email, accountType: 'personal' } });
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
        <div className='d-flex flex-column justify-content-center align-items-center mb-md-5'>
          <p style={{ fontSize: '18px', color: '#444' }}>¡Gracias por unirte a nosotros!</p>
          <p style={{ fontSize: '18px', color: '#444' }}>Por favor, llena los campos solicitados.</p>
        </div>

        <div className='row justify-content-center align-items-center col-12'>
          <div className='col-sm-6 d-flex flex-column justify-content-center align-items-center'>
            <div className="col-4 mb-4 d-flex justify-content-center">
              <img className='img-fluid' style={{ width: '70%', height: '70%' }} src={logo} alt="logo" />
            </div>
            <p style={{ fontSize: '18px', color: '#444' }}>Nota:</p>
            <p style={{ fontSize: '18px', color: '#444' }}>
              Se te enviará un código de confirmación por correo electrónico, para autenticar tu cuenta.
            </p>
            <button className='secondary_button col-md-8' type="button" onClick={handleSubmit(onSubmit)} disabled={isLoading}>
              {isLoading ? 'PROCESANDO...' : 'CREAR CUENTA'}
            </button>
          </div>

          <div className='col-sm-6'>
            <form>
              <div className='d-flex flex-column justify-content-center align-items-center'>
                <input className='input col-8' type="text" {...register('name')} placeholder="Nombre" />
                {errors.name && <p style={{ color: 'red' }}>{errors.name.message}</p>}
              </div>

              <div className='d-flex flex-column justify-content-center align-items-center'>
                <input className='input col-8' type="text" {...register('email')} placeholder="Correo electrónico" />
                {errors.email && <p style={{ color: 'red' }}>{errors.email.message}</p>}
              </div>

              <div className='d-flex flex-column justify-content-center align-items-center'>
                <input className='input col-8' type="text" {...register('phoneNumber')} placeholder="Número telefónico" />
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
                    paddingRight: '120px',
                    cursor: 'pointer',
                    color: '#555'
                  }}
                >
                  {showPassword ? <FaEye size={20} /> : <FaEyeSlash size={20} />}
                </span>
                {errors.password && <p style={{ color: 'red', marginTop: '30px', marginBottom: '-30px' }}>{errors.password.message}</p>}
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