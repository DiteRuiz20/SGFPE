import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Divider } from '@mui/material';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAuth } from '../../../context/AuthContext';
import { getUser, updateUser } from '../../../services/UserService';
import TopNavBar from './TopNavBar';
import { Box, Modal } from '@mui/material';
import { Alert, Snackbar } from '@mui/material';

const schema = yup.object().shape({
  name: yup.string().required('El nombre es obligatorio').matches(/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/, 'Solo se permiten letras y espacios'),
  email: yup.string().email('Ingresa un correo válido').required('El correo es obligatorio').matches(/^[a-zA-Z0-9._]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 'Ingresa un correo válido'),
  phoneNumber: yup.string().matches(/^[0-9]+$/, 'Solo se permiten números').min(10, 'El número debe tener 10 dígitos').required('El número es obligatorio').max(10, 'El número debe tener 10 dígitos'),
});

export default function NewProductProfile() {
  const location = useLocation();
  const navigate = useNavigate();
  const { userId, logout } = useAuth(); // Obtener userId y logout del contexto
  const [user, setUser] = useState(null);
  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: yupResolver(schema),
    mode: 'onChange',
    reValidateMode: 'onChange'
  });
  const [openU, setIsOpenU] = React.useState(false);
  const openUpdateForm = () => setIsOpenU(true);
  const closeUpdateForm = () => setIsOpenU(false);
  const [openLO, setIsOpenLO] = React.useState(false);
  const openLogOutForm = () => setIsOpenLO(true);
  const closeLogOutForm = () => setIsOpenLO(false);
  const [alert, setAlert] = useState({ open: false, message: '', severity: '' });

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

      // Usar solo el Snackbar para mostrar el mensaje de éxito
      setAlert({ open: true, message: 'Perfil actualizado exitosamente', severity: 'success' });

      setUser(updatedUser); // Actualizar el estado con los datos actualizados
    } catch (error) {
      console.error('Error al actualizar el perfil:', error);

      // Usar solo el Snackbar para mostrar el mensaje de error
      setAlert({ open: true, message: 'Hubo un error al actualizar el perfil', severity: 'error' });
    }
  };


  const customSubmit = () => {
    handleSubmit(onSubmit)();
  };

  const closeAlert = () => {
    setAlert((prevAlert) => ({ ...prevAlert, open: false }));
  };

  const closeModal = () => {
    closeUpdateForm(); // close the update form modal
    closeLogOutForm(); // close the logout form modal
  };

  const handleModalSubmit = () => {
    customSubmit();  // Trigger the custom submit for the form
    closeModal();    // Close the modal once submission is complete
  };

  const styles = {
    divider: {
      width: '100%',
      height: '2px',
      backgroundColor: '#999',
      marginTop: 20,
      marginBottom: 20,
    },
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      color: '#30437A',
      marginBottom: 20,
    },
    titleLO: {
      fontSize: 28,
      fontWeight: 'bold',
      color: '#dd1e1e',
      marginBottom: 20,
    },

    subtitle: {
      fontSize: 14,
      fontWeight: 'bold',
      color: '#666',
      marginTop: 15,
      alignSelf: 'flex-start',
    },
    required: {
      fontSize: 14,
      fontWeight: 'bold',
      color: '#f00',
      marginTop: 15,
      marginLeft: 5,
      alignSelf: 'flex-start',
    },
    modalStyle: {
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: 600,
      bgcolor: 'background.paper',
      boxShadow: 24,
      p: 4,
      borderRadius: '8px',
    },
    alert: {
      position: 'fixed',
      top: 20,
      left: '50%',
      transform: 'translate(-50%, 0)'
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-vh-100 d-flex flex-column justify-content-center">
      <div className="row justify-content-center">
        <TopNavBar />
        <Divider style={styles.divider} />
      </div>

      <div className="row d-flex justify-content-center flex-grow-1">
        <div className="col-sm-6 d-flex flex-column justify-content-center align-items-center">
          <form className="d-flex flex-column col-8">
            <div className="d-flex flex-column justify-content-center">
              <div className="d-flex flex-row text-start">
                <p style={styles.subtitle}>Nombre:</p>
                <p style={styles.required}>*</p>
              </div>

              <input
                className="input col-12"
                type="text"
                {...register("name")}
                placeholder="Nombre"
              />
              {errors.name && <p style={{ color: "red" }}>{errors.name.message}</p>}
            </div>

            <div className="d-flex flex-column justify-content-center">
              <div className="d-flex flex-row text-start">
                <p style={styles.subtitle}>Correo electrónico:</p>
                <p style={styles.required}>*</p>
              </div>

              <input
                className="input col-12"
                disabled
                style={{ cursor: "not-allowed", opacity: 0.6 }}
                type="email"
                {...register("email")}
                placeholder="Correo electrónico"
              />
              {errors.email && <p style={{ color: "red" }}>{errors.email.message}</p>}
            </div>

            <div className="d-flex flex-column justify-content-center">
              <div className="d-flex flex-row text-start">
                <p style={styles.subtitle}>Número telefónico:</p>
                <p style={styles.required}>*</p>
              </div>

              <input
                className="input col-12"
                type="text"
                {...register("phoneNumber")}
                placeholder="Número telefónico"
              />
              {errors.phoneNumber && <p style={{ color: "red" }}>{errors.phoneNumber.message}</p>}
            </div>
          </form>
        </div>

        <div className="col-sm-6 d-flex flex-column justify-content-center align-items-center">
          <button className="secondary_button col-8" type="button" onClick={openUpdateForm}>
            EDITAR PERFIL
          </button>
          <button className="logOut_button col-8" type="button" onClick={openLogOutForm}>
            CERRAR SESIÓN
          </button>
        </div>
      </div>

      {/* Modal */}
      <Modal open={openU} onClose={closeModal}>
        <Box sx={styles.modalStyle}>
          <form onSubmit={handleModalSubmit}>
            <div style={{ marginBottom: '20px' }}>
              <text style={styles.title}>Editar Perfil</text>
            </div>
            <Divider style={styles.divider} />
            <p style={{ textAlign: 'center', fontSize: '20px' }}>¿Estás seguro de que deseas editar tu perfil?</p>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '30px' }}>
              <button className='primary_button' style={{ width: '40%', marginRight: '10px' }} type="button" onClick={closeUpdateForm}>Cancelar</button>
              <button className='secondary_button' style={{ width: '40%' }} type="submit">Editar</button>
            </div>
          </form>
        </Box>
      </Modal>

      {/* Modal */}
      <Modal open={openLO} onClose={closeModal}>
        <Box sx={styles.modalStyle}>
          <form onSubmit={handleLogout}>
            <div style={{ marginBottom: '20px' }}>
              <text style={styles.titleLO}>Cerrar Sesión</text>
            </div>
            <Divider style={styles.divider} />
            <p style={{ textAlign: 'center', fontSize: '20px' }}>¿Estás seguro de que deseas cerrar tu sesión?</p>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '30px' }}>
              <button className='primary_button' style={{ width: '40%', marginRight: '10px' }} type="button" onClick={closeLogOutForm}>Cancelar</button>
              <button className='logOut_button' style={{ width: '40%' }} type="submit">Cerrar Sesión</button>
            </div>
          </form>
        </Box>
      </Modal>

      <Snackbar open={alert.open} autoHideDuration={3000} onClose={closeAlert}>
        <Alert onClose={closeAlert} severity={alert.severity} style={styles.alert}>
          {alert.message}
        </Alert>
      </Snackbar>
    </div>
  );
}