// components/InputValidator.js

export const regexValidators = {
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, // email básico
    password: /^[A-Za-z\d@$!%*#?&]{6,}$/, // 6 o más caracteres válidos
    positiveNumber: /^(?!0+(?:\.0+)?$)\d+(\.\d{1,2})?$/,
    onlyLetters: /^[A-Za-zÁÉÍÓÚáéíóúñÑ ]+$/, // solo letras con espacios y acentos
    nameOrDescription: /^[A-Za-zÁÉÍÓÚáéíóúñÑ ]+$/, // igual que onlyLetters para campos de texto
    positiveInteger: /^[1-9]\d*$/, // enteros positivos estrictamente > 0
    address: /^[A-Za-zÁÉÍÓÚáéíóúñÑ0-9 ,.\-#]+$/, // letras, números, espacios y signos comunes
    phoneNumber: /^\d{10}$/ // exactamente 10 dígitos sin caracteres especiales
};

export const validateField = (type, value) => {
    if (!value || value.trim() === '') {
        return { valid: false, message: 'Este campo es obligatorio' };
    }

    if (!regexValidators[type].test(value)) {
        let message = 'Formato inválido';
        switch (type) {
            case 'email':
                message = 'Ingresa un correo electrónico válido'; break;
            case 'password':
                message = 'La contraseña debe tener al menos 6 caracteres'; break;
            case 'onlyLetters':
            case 'nameOrDescription':
                message = 'Solo se permiten letras y espacios'; break;
            case 'positiveNumber':
                message = 'Ingresa un número mayor a 0 (puede incluir decimales)'; break;
            case 'positiveInteger':
                message = 'Ingresa un número entero mayor a 0'; break;
            case 'address':
                message = 'La dirección solo puede contener letras, números y signos comunes como # , . -'; break;
            case 'phoneNumber':
                message = 'Ingresa un número telefónico de 10 dígitos'; break;
            default:
                message = 'Formato inválido'; break;
        }
        return { valid: false, message };
    }

    return { valid: true };
};
