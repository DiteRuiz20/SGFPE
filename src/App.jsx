import React from 'react';
import { BrowserRouter as Router, Route, Routes, useNavigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import PersonalLogin from './components/Personal/managment/PersonalLogin';
import CreatePersonalAccount from './components/Personal/managment/CreatePersonalAccount';
// import CreateBusinessAccount from './components/Empresarial/managment/CreateBusinessAccount';
import PersonalExpensesTracker from './components/Personal/loggedViewsPersonal/PersonalExpenseTracker';
import BusinessRawMaterialsLogin from './components/Empresarial/managment/BusinessRawMaterialsLogin';
import BusinessNewProductsExpenseLogin from './components/Empresarial/managment/BusinessNewProductsExpenseLogin';
import CreateBusinessRawMaterialAccount from './components/Empresarial/managment/CreateBusinessRawMaterialAccount';
import CreateBusinessNewProductExpenseAccount from './components/Empresarial/managment/CreateBusinessNewProductExpenseAccount';
import ChooseBusiness from './components/Empresarial/managment/ChooseBusiness';
import PersonalBudgetPlanner from './components/Personal/loggedViewsPersonal/PersonalBudgetPlanner';
import PersonalDebtTracker from './components/Personal/loggedViewsPersonal/PersonalDebtTracker';
import PersonalSavingTracker from './components/Personal/loggedViewsPersonal/PersonalSavingTracker';
import PersonalGraphics from './components/Personal/loggedViewsPersonal/PersonalGraphics';
import PersonalProfile from './components/Personal/loggedViewsPersonal/PersonalProfile';
import VerifyAccount from './components/Personal/managment/VerifyAccount';
import RawMaterialsTracker from './components/Empresarial/logged/RawMaterials/RawMaterialsTracker';
import logo from './assets/logo.png';
import MaterialUsageTracker from './components/Empresarial/logged/RawMaterials/MaterialUsageTracker';
import RawMaterialOrder from './components/Empresarial/logged/RawMaterials/RawMaterialOrder';
import ResetPassword from './components/ResetPassword/ResetPassword';

function Home() {
    const navigate = useNavigate();

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
        image: {
            width: '150px',
            height: '150px',
            marginBottom: '40px',
        },
        title: {
            fontSize: '24px',
            marginBottom: '30px',
            textAlign: 'center',
            maxWidth: '100%',
            color: 'black'
        }
    };

    return (
        <div style={styles.container}>
            <img style={styles.image} src={logo} alt="logo" />
            <text style={styles.title}>What type of account do you want to create?</text>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
                <button className='primary_button' onClick={() => navigate('/choose-business')}>
                    BUSINESS
                </button>
                <button className='secondary_button' onClick={() => navigate('/login-personal')}>
                    PERSONAL
                </button>
            </div>
        </div>
    );
}

function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    {/* Rutas públicas */}
                    <Route path="/" element={<Home />} />
                    <Route path="/login-personal" element={<PersonalLogin />} />
                    <Route path="/business-raw-materials-login" element={<BusinessRawMaterialsLogin />} />
                    <Route path="/business-new-products-expense-login" element={<BusinessNewProductsExpenseLogin />} />
                    {/* <Route path="/create-business-account" element={<CreateBusinessAccount />} /> */}
                    <Route path="/create-business-raw-material-account" element={<CreateBusinessRawMaterialAccount />} />
                    <Route path="/create-business-new-product-expense-account" element={<CreateBusinessNewProductExpenseAccount />} />
                    <Route path="/choose-business" element={<ChooseBusiness />} />
                    <Route path="/raw-materials-tracker" element={<RawMaterialsTracker />} />
                    <Route path="/create-personal-account" element={<CreatePersonalAccount />} />
                    <Route path="/verify-account" element={<VerifyAccount />} />
                    <Route path="/business-raw-materials-tracker" element={<RawMaterialsTracker />} />
                    <Route path="/material-usage-tracker" element={<MaterialUsageTracker/>}/>
                    <Route path="/raw-material-order" element={<RawMaterialOrder/>}/>
                    <Route path="/forgot-password" element={<ResetPassword />} />

                    {/* Rutas protegidas para usuarios personales */}
                    <Route
                        path="/personal-budget-planner"
                        element={
                            <ProtectedRoute requiredAccountType="personal">
                                <PersonalBudgetPlanner />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/personal-expenses"
                        element={
                            <ProtectedRoute requiredAccountType="personal">
                                <PersonalExpensesTracker />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/personal-debt-tracker"
                        element={
                            <ProtectedRoute requiredAccountType="personal">
                                <PersonalDebtTracker />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/personal-saving-tracker"
                        element={
                            <ProtectedRoute requiredAccountType="personal">
                                <PersonalSavingTracker />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/personal-graphics"
                        element={
                            <ProtectedRoute requiredAccountType="personal">
                                <PersonalGraphics />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/personal-profile"
                        element={
                            <ProtectedRoute requiredAccountType="personal">
                                <PersonalProfile />
                            </ProtectedRoute>
                        }
                    />
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;