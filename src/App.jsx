import React from 'react';
import { BrowserRouter as Router, Route, Routes, useNavigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext'; // Importar el AuthProvider
import PersonalLogin from './components/Personal/PersonalLogin';
import CreatePersonalAccount from './components/Personal/CreatePersonalAccount';
import PersonalExpensesTracker from './components/Personal/PersonalExpenses/PersonalExpenseTracker';

function Home() {
    const navigate = useNavigate();

    return (
        <div>
            <h1>Bienvenido</h1>
            <div style={{ marginTop: '20px' }}>
                <button onClick={() => navigate('/login-personal')}>
                    Login Personal
                </button>
                <button onClick={() => navigate('/login-empresarial')} style={{ marginLeft: '10px' }}>
                    Login Empresarial
                </button>
            </div>
        </div>
    );
}

function App() {
    return (
        <AuthProvider> {/* Envuelve el Router con el AuthProvider */}
            <Router>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/login-personal" element={<PersonalLogin />} />
                    <Route path="/create-personal-account" element={<CreatePersonalAccount />} />
                    <Route path="/personal-expenses" element={<PersonalExpensesTracker />} />
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;