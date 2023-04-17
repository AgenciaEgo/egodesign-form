const validationMessages = {
    "default": {
        "empty": "Campo requerido.",
        "invalid": "Campo nó válido."
    },
    "email": {
        "empty": "El email es requerido.",
        "invalid": "El email no es válido.",
    },
    "message": {
        "empty": "El mensaje es requerido.",
    },
    "password": {
        "empty": "Ingrese una contraseña.",
    },
    "password_repeat": {
        "empty": "Debe repetir la contraseña.",
        "unequal": "Las contraseñas no coindicen.",
    },
    "cuil": {
        "empty": "Campo requerido.",
        "min": "El número debe tener exactamente 11 dígitos.",
        "invalid": "El número ingresado no es válido.",
    },
    "url": {
        "empty": "Campo requerido.",
        "invalid": "URL no válida.",
    },
    "file": {
        "empty": "Campo requerido",
        "min_size": "El tamaño mínimo es [[var]]",
        "max_size": "El tamaño máximo es [[var]]"
    }
};

export default validationMessages;