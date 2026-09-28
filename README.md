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
- **Base de datos:** `<!-- COMPLETAR: MySQL / PostgreSQL / SQLite -->`
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

`<!-- AJUSTAR según los requerimientos del informe -->`

- Gestión de clientes
- Gestión de vehículos
- Órdenes de trabajo y seguimiento de reparaciones
- Control de inventario de repuestos
- Gestión de mecánicos
- Facturación

## Requisitos previos

- [Node.js](https://nodejs.org/) (versión LTS recomendada)
- npm (incluido con Node.js)
- `<!-- COMPLETAR: gestor de base de datos elegido -->`
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

3. Configurar las variables de entorno: copiar `.env.example` a `.env` y completar los datos de conexión a la base de datos.

4. Crear la base de datos con el script de la carpeta `database/`:

   `<!-- COMPLETAR: comando o instrucciones según el gestor elegido -->`

5. Iniciar el servidor:

   ```bash
   npm start
   ```

   `<!-- COMPLETAR: confirmar el script real en package.json y el puerto -->`

6. Abrir en el navegador: `http://localhost:<!-- PUERTO -->`

## Documentación

Los informes, diagramas y demás entregables están en la carpeta [`docs/`](./docs).

## Licencia

Proyecto con fines académicos.