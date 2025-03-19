import React, { useEffect, useState } from 'react';
import { getUsers, createUser } from '../services/UserService';

export default function UserList() {
    const [users, setUsers] = useState([]);
    const [newUser, setNewUser] = useState('');

    useEffect(() => {
        async function fetchData() {
            const data = await getUsers();
            setUsers(data);
        }
        fetchData();
    }, []);

    const handleAddUser = async () => {
        const user = { name: newUser };
        const data = await createUser(user);
        setUsers([...users, data]);
        setNewUser('');
    };

    return (
        <div>
            <input
                type="text"
                value={newUser}
                onChange={(e) => setNewUser(e.target.value)}
                placeholder="Nuevo usuario"
            />
            <button onClick={handleAddUser}>Agregar</button>
            <ul>
                {users.map((user) => (
                    <li key={user.id}>{user.name}</li>
                ))}
            </ul>
        </div>
    );
}
