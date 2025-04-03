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
import ForgottenPassword from './components/forgottenPassword';
import logo from './assets/logo.png';
import MaterialUsageTracker from './components/Empresarial/logged/RawMaterials/MaterialUsageTracker';
import RawMaterialOrder from './components/Empresarial/logged/RawMaterials/RawMaterialOrder';
import './assets/js/styles/app.css';
import RawMaterialProfile from './components/Empresarial/logged/RawMaterials/RawMaterialProfile';
import RawMaterialGraphic from '../src/components/Empresarial/logged/RawMaterials/RawMaterialGraphics';
import NewProductExpenseTracker from './components/Empresarial/logged/NewProductsExpense/NewProductsExpenseTracker';
import NewProductOrderTracker from './components/Empresarial/logged/NewProductsExpense/NewProductOrderTracker';
import NewProductOrdersGraphics from './components/Empresarial/logged/NewProductsExpense/NewProductOrdersGraphics';
import NewProductProfile from './components/Empresarial/logged/NewProductsExpense/NewProductProfile';

function Home() {
    const navigate = useNavigate();

    const styles = {
        image: {
            width: '150px',
            height: '150px',
            marginBottom: '40px',
        },
        title: {
            fontSize: '26px',
            marginBottom: '30px',
            textAlign: 'center',
            maxWidth: '80%',
            color: 'black',
            marginHorizontal: '6px',
        }
    };

    return (
        <div className="background-container align-content-center">
            <div className='container d-flex flex-column align-items-center justify-content-center'>
                <img className='col-4' style={styles.image} src={logo} alt="logo" />
                <p style={styles.title}>¿Qué tipo de cuenta deseas?</p>
                <div className='d-flex flex-column col-sm-4'>
                    <button className='primary_button' onClick={() => navigate('/choose-business')}>
                        EMPRESARIAL
                    </button>
                    <button className='secondary_button' onClick={() => navigate('/login-personal')}>
                        PERSONAL
                    </button>
                </div>
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
                    <Route path="/forgotten-password" element={<ForgottenPassword />} />
                    <Route path="/create-business-raw-material-account" element={<CreateBusinessRawMaterialAccount />} />
                    <Route path="/create-business-new-product-expense-account" element={<CreateBusinessNewProductExpenseAccount />} />
                    <Route path="/choose-business" element={<ChooseBusiness />} />
                    <Route path="/create-personal-account" element={<CreatePersonalAccount />} />
                    <Route path="/verify-account" element={<VerifyAccount />} />

                    {/* Rutas protegidas - BUSINESS NEW PRODUCT EXPENSE */}
                    <Route
                        path="/new-product-expense-tracker"
                        element={
                            <ProtectedRoute allowedAccountTypes={['business-new-product-expense']}>
                                <NewProductExpenseTracker />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/new-product-order-tracker"
                        element={
                            <ProtectedRoute allowedAccountTypes={['business-new-product-expense']}>
                                <NewProductOrderTracker />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/new-product-expense-graphic"
                        element={
                            <ProtectedRoute allowedAccountTypes={['business-new-product-expense']}>
                                <NewProductOrdersGraphics />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/new-product-profile"
                        element={
                            <ProtectedRoute allowedAccountTypes={['business-new-product-expense']}>
                                <NewProductProfile />
                            </ProtectedRoute>
                        }
                    />

                    {/* Rutas protegidas - BUSINESS RAW MATERIAL */}
                    <Route
                        path="/raw-materials-tracker"
                        element={
                            <ProtectedRoute allowedAccountTypes={['business-raw-material']}>
                                <RawMaterialsTracker />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/material-usage-tracker"
                        element={
                            <ProtectedRoute allowedAccountTypes={['business-raw-material']}>
                                <MaterialUsageTracker />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/raw-material-order"
                        element={
                            <ProtectedRoute allowedAccountTypes={['business-raw-material']}>
                                <RawMaterialOrder />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/raw-material-graphics"
                        element={
                            <ProtectedRoute allowedAccountTypes={['business-raw-material']}>
                                <RawMaterialGraphic />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/raw-material-profile"
                        element={
                            <ProtectedRoute allowedAccountTypes={['business-raw-material']}>
                                <RawMaterialProfile />
                            </ProtectedRoute>
                        }
                    />

                    {/* Rutas protegidas - PERSONAL */}
                    <Route
                        path="/personal-budget-planner"
                        element={
                            <ProtectedRoute allowedAccountTypes={['personal']}>
                                <PersonalBudgetPlanner />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/personal-expenses"
                        element={
                            <ProtectedRoute allowedAccountTypes={['personal']}>
                                <PersonalExpensesTracker />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/personal-debt-tracker"
                        element={
                            <ProtectedRoute allowedAccountTypes={['personal']}>
                                <PersonalDebtTracker />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/personal-saving-tracker"
                        element={
                            <ProtectedRoute allowedAccountTypes={['personal']}>
                                <PersonalSavingTracker />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/personal-graphics"
                        element={
                            <ProtectedRoute allowedAccountTypes={['personal']}>
                                <PersonalGraphics />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/personal-profile"
                        element={
                            <ProtectedRoute allowedAccountTypes={['personal']}>
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