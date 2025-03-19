import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { getUsers, createUser } from '../../services/UserService';

// Esquema de validación con Yup
const schema = yup.object().shape({
    name: yup.string().required('El nombre es obligatorio'),
    email: yup.string().email('Ingresa un correo válido').required('El correo es obligatorio'),
    username: yup.string().required('El nombre de usuario es obligatorio'),
    password: yup.string().min(6, 'La contraseña debe tener al menos 6 caracteres').required('La contraseña es obligatoria'),
});

export default function CreatePersonalAccount() {
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
        } catch (error) {
            console.error('Error al crear la cuenta:', error);
            alert('Hubo un error al crear la cuenta');
        }
    };

    return (
        <div>
            <h1>Crear Cuenta Personal</h1>
            <form onSubmit={handleSubmit(onSubmit)}>
                <div>
                    <label>Nombre:</label>
                    <input
                        type="text"
                        {...register('name')}
                        placeholder="Ingresa tu nombre"
                    />
                    {errors.name && <p style={{ color: 'red' }}>{errors.name.message}</p>}
                </div>

                <div>
                    <label>Correo Electrónico:</label>
                    <input
                        type="email"
                        {...register('email')}
                        placeholder="Ingresa tu correo"
                    />
                    {errors.email && <p style={{ color: 'red' }}>{errors.email.message}</p>}
                </div>

                <div>
                    <label>Nombre de Usuario:</label>
                    <input
                        type="text"
                        {...register('username')}
                        placeholder="Ingresa tu nombre de usuario"
                    />
                    {errors.username && <p style={{ color: 'red' }}>{errors.username.message}</p>}
                </div>

                <div>
                    <label>Contraseña:</label>
                    <input
                        type="password"
                        {...register('password')}
                        placeholder="Ingresa tu contraseña"
                    />
                    {errors.password && <p style={{ color: 'red' }}>{errors.password.message}</p>}
                </div>

                <button type="submit">Crear Cuenta Personal</button>
            </form>

            <h2>Usuarios registrados</h2>
            <ul>
                {users.map((user, index) => {
                    // Usamos user.email o un índice para asegurar que la clave sea única
                    const uniqueKey = user.id && typeof user.id !== 'object' ? user.id : `${user.email}-${index}`;
                    return (
                        <li key={uniqueKey}>
                            {user.name} - {user.email} - Tipo de cuenta: {user.accountType}
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}
