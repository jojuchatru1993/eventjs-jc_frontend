# EventJS - Aplicación de Gestión de Eventos

## Descripción
EventJS es una aplicación web moderna desarrollada con Angular 19 que permite a los usuarios gestionar eventos, hacer reservas y administrar su participación en diferentes actividades.

## Características Principales

### Autenticación de Usuarios
- Sistema de login seguro
- Gestión de tokens JWT para mantener la sesión del usuario
- Registro de nuevos usuarios
- Protección de rutas privadas

### Gestión de Eventos (CRUD)
- Creación de nuevos eventos con detalles como título, descripción, fecha, ubicación y capacidad
- Visualización de listado de eventos disponibles
- Actualización de la información de eventos existentes
- Eliminación de eventos

### Sistema de Reservas
- Reserva de plazas en eventos disponibles
- Cancelación de reservas existentes
- Visualización de estado de reserva para cada evento
- Control de capacidad para evitar sobrereservas

## Tecnologías Utilizadas
- Angular 19
- PrimeNG para componentes UI
- Tailwind CSS para estilos
- RxJS para programación reactiva
- JWT para autenticación

## Instalación y Ejecución

### Requisitos Previos
- Node.js (versión recomendada: 18 o superior)
- npm o yarn

### Pasos para Instalación
```bash
# Clonar el repositorio
git clone [url-del-repositorio]

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm start
```

La aplicación estará disponible en `http://localhost:4200/`

## Estructura API
La aplicación se comunica con un backend a través de endpoints REST:

- `/auth` - Endpoints de autenticación (login, registro)
- `/events` - CRUD completo para gestión de eventos
- `/bookings` - Gestión de reservas de usuarios para eventos
