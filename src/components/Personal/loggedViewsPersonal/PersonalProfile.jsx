import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import logo from '../../../assets/logo.png';
import { Divider } from '@mui/material';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAuth } from '../../../context/AuthContext';

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
      container: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'white',
        width: '100vw',
        height: '100vh',
      },
      bodyContainer: {
        marginTop: '150px',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'white',
        width: '70%',
      },
      divider: {
        width: '100%',
        height: 2,
        backgroundColor: '#EAEAEA',
        marginTop: 20,
      },
      menu: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '80%',
        marginBottom: '30px'
      },
      header: {
        position: 'fixed',
        marginTop: '30px',
        top: 0,
        display: 'flex',
        alignSelf: 'center',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        width: '100vw',
      },
      navLink: (path) => ({
        cursor: 'pointer',
        padding: '10px 20px',
        fontSize: '16px',
        color: location.pathname === path ? '#000' : '#888',
        borderBottom: location.pathname === path ? '4px solid #30437A' : '2px solid transparent',
        transition: 'border-color 0.3s',
      }),
      datePicker: {
        alignSelf: 'center',
        display: 'flex',
        justifyContent: 'center',
      },
      dateItem: {
        margin: '0 25px',
        color: '#B0B0B0',
        cursor: 'pointer',
      },
      activeDate: {
        color: '#000',
        borderBottom: '2px solid #4AD8C2',
      },
      title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#30437A',
        marginBottom: 20,
      },
      cardContainer: {
        marginTop: '50px',
        flexDirection: 'column',
        justifyContent: 'left',
      },
      pieContainer: {
        marginTop: '50px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      },
    image: {
      width: 130,
      height: 130,
      marginBottom: 30,
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
  };

  const paths = {
    'BUDGET PLANNING': '/personal-budget-planner',
    'DEBT TRACKER': '/personal-debt-tracker',
    'SAVINGS TRACKER': '/personal-saving-tracker',
    'EXPENSE TRACKER': '/personal-expenses',
    'GRAPHICS': '/personal-graphics',
    'PROFILE': '/personal-profile',
  };
  
  const handleNavigation = (text) => {
    navigate(paths[text] || '/personal-profile');
  };
  
  const handleLogout = () => {
    logout();
    navigate('/login-personal');
  };

  return (
      <div style={styles.container}>
        <div style={styles.header}>
          <div style={styles.menu}>
            <img src={logo} alt="Logo" style={{ width: '90px' }} />
            {['BUDGET PLANNING', 'DEBT TRACKER', 'SAVINGS TRACKER', 'EXPENSE TRACKER', 'GRAPHICS', 'PROFILE'].map((text, index) => (
              <span
                key={index}
                style={styles.navLink(paths[text])}
                onClick={() => handleNavigation(text)}
              >
                {text}
              </span>
            ))}
  
          </div>
  
          <Divider style={styles.divider} />
        </div>
  
        <div style={styles.bodyContainer}>
          <div style={styles.cardContainer}>
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
                  disabled
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
            </form>
          </div>
  
          <div style={styles.pieContainer}>
            <button className='secondary_button' type="button" onClick={customSubmit}>UPDATE PROFILE</button>
            
            <button className='logOut_button' type="button" onClick={handleLogout}>LOG OUT</button>
          </div>
        </div>
      </div>
    );
}