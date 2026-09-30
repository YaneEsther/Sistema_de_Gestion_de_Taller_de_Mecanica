# Sistema de Gestión de Taller de Mecánica (SGTM / TallerGest)

Sistema web para administrar las operaciones de un taller mecánico: clientes, vehículos, órdenes de trabajo, repuestos y facturación.

Proyecto de la asignatura **Ingeniería de Software II**.

## Equipo (Grupo 4)

| Integrante |
| --- |
| Yaneyri E. Hernández R. |
| Yarlenis Tamares Rosa |
| Argenis Garcia Sosa |
| Raymond Garcia Romero |
| Arlennys Maria García Reyes |

**Docente:** Jose Ariel Pereyda Francisco

## Tecnologías

- **Backend:** JavaScript con [Node.js](https://nodejs.org/) y [Express](https://expressjs.com/)
- **Frontend:** HTML, CSS y JavaScript
- **Base de datos:** MySQL
- **Editor:** Visual Studio Code
- **Control de versiones:** Git y GitHub

## Estructura del repositorio

```
Sistema_de_Gestion_de_Taller_de_Mecanica/
├── backend/           # API y lógica del servidor (Node.js + Express)
├── database/          # Scripts SQL: esquema y datos de prueba
├── docs/              # Documentación del proyecto (informes, diagramas)
├── frontend/pages/    # Páginas de la interfaz
├── .gitignore
└── README.md
```

## Funcionalidades principales

- Gestión de clientes
- Gestión de vehículos
- Órdenes de trabajo y seguimiento de reparaciones
- Control de inventario de repuestos
- Gestión de mecánicos
- Facturación

## Requisitos previos

- [Node.js](https://nodejs.org/) (versión LTS recomendada)
- npm (incluido con Node.js)
- MySQL 8.0 o superior
- Git

## Instalación y ejecución

1. Clonar el repositorio:

   ```bash
   git clone https://github.com/YaneEsther/Sistema_de_Gestion_de_Taller_de_Mecanica.git
   cd Sistema_de_Gestion_de_Taller_de_Mecanica
   ```

2. Instalar las dependencias del backend:

   ```bash
   cd backend
   npm install
   ```

3. Configurar las variables de entorno: 
Crear un archivo .env dentro de la carpeta backend/ a partir del archivo .env.example y completar los datos de conexión a MySQL.

4. Crear la base de datos con el script de la carpeta `database/`:


5. Iniciar el servidor:

   ```bash
   npm start
   ```

6. Abrir en el navegador: `http://localhost:PUERTO`

## Documentación

Los informes, diagramas y demás entregables están en la carpeta [`docs/`](./docs).

## Licencia

Proyecto con fines académicos.