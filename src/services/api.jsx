import axios from 'axios';

// Crear una instancia de axios con la URL base
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080', // Usar variable de entorno o default
    timeout: 30000, // 30 segundos
    headers: { 'Content-Type': 'application/json' },
});

// Interceptor para agregar token en las cabeceras de cada petición
api.interceptors.request.use(
    (config) => {
        console.log('------------------------------');
        console.log('URL de la petición:', config.url);
        console.log('Método HTTP:', config.method);
        
        // No añadir token y userId en rutas de autenticación
        const isAuthRoute = 
            config.url.includes('/auth/login') || 
            config.url.includes('/login') ||
            config.url.includes('/auth/validate-account') ||
            config.url.includes('/api/personal/users/register') ||
            config.url.includes('/register');
        
        if (!isAuthRoute) {
            // Obtener token del almacenamiento local
            const token = localStorage.getItem('token');
            const userId = localStorage.getItem('userId');
            
            if (token) {
                console.log('Token recuperado: Presente');
                config.headers.Authorization = `Bearer ${token}`;
            } else {
                console.log('Token recuperado: Ausente');
            }
            
            if (userId) {
                console.log('UserId recuperado: Presente');
                config.headers['User-ID'] = userId;
            } else {
                console.log('UserId recuperado: Ausente');
            }
        } else {
            console.log('Ruta de autenticación detectada, no se añaden headers de auth');
        }
        
        // Para depuración
        console.log('Headers completos de la petición:', config.headers);
        console.log('Datos de la petición:', config.data);
        console.log('------------------------------');
        
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Interceptor para manejar respuestas
api.interceptors.response.use(
    (response) => {
        // Procesar respuesta exitosa
        return response;
    },
    (error) => {
        // Manejar error de respuesta
        if (error.response) {
            // El servidor respondió con un código de error
            console.error(`Error ${error.response.status}: ${error.response.statusText}`);
            
            // Si es un error 401 (no autorizado), limpiar token y redirigir a login
            if (error.response.status === 401) {
                console.error('Token inválido o expirado');
                localStorage.removeItem('token');
                localStorage.removeItem('userId');
                localStorage.removeItem('accountType');
                // La redirección se maneja en el componente con useNavigate
            }
        } else if (error.request) {
            // La petición fue hecha pero no se recibió respuesta
            console.error('No se recibió respuesta del servidor:', error.request);
        } else {
            // Ocurrió un error al configurar la petición
            console.error('Error de configuración de la petición:', error.message);
        }
        
        return Promise.reject(error);
    }
);

export default api;
