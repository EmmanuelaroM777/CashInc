# CashInc 🛡️📈

CashInc es una plataforma integral de gestión financiera y control de activos diseñada específicamente para PyMEs (Pequeñas y Medianas Empresas). Su objetivo principal es democratizar las herramientas financieras avanzadas, permitiendo a los dueños de negocios tener un control absoluto sobre su flujo de caja, depreciación de herramientas, y operaciones diarias en un entorno multiusuario seguro.

## ✨ Características Principales

* **Sistema de Multitenencia (Código de Empresa):** Los administradores pueden generar un código de empresa único. Los trabajadores usan este código al registrarse para unirse al espacio de trabajo de la empresa de forma sincronizada.
* **Roles de Usuario:** 
  * *Administrador:* Control total sobre la empresa y generación de códigos.
  * *Trabajador:* Acceso seguro (solo lectura o colaborativo) a los datos del administrador.
* **Gestión de Activos:** Registro de herramientas y equipos con cálculo automático de depreciación lineal.
* **Control Financiero:** Seguimiento de ingresos, gastos, transacciones y presupuestos en tiempo real.
* **Generación de Reportes:** Exportación de reportes detallados en formato PDF y Excel (Periodos y Comparativas de activos).
* **Sistema de Alertas:** Notificaciones automáticas (ej. cuando un activo ha superado su vida útil o depreciación).

## 🛠️ Tecnologías Utilizadas

* **Frontend:** React, Vite, Tailwind CSS, Lucide React (Íconos), React Router.
* **Backend:** Python, FastAPI, Motor (MongoDB Async).
* **Base de Datos:** MongoDB.

## 🚀 Guía de Instalación y Ejecución

Sigue estos pasos para descargar, instalar y ejecutar el proyecto en cualquier computadora local:

### 1. Requisitos Previos
Asegúrate de tener instalados los siguientes programas:
* [Git](https://git-scm.com/)
* [Node.js](https://nodejs.org/) (Versión 18 o superior recomendada)
* [Python](https://www.python.org/) (Versión 3.9 o superior)
* [MongoDB](https://www.mongodb.com/try/download/community) (Asegúrate de que el servicio de base de datos local esté corriendo en el puerto `27017`)

### 2. Clonar el repositorio
Abre tu terminal y ejecuta:
```bash
git clone https://github.com/TU_USUARIO/CashInc.git
cd CashInc
```
*(Asegúrate de reemplazar `TU_USUARIO` con tu usuario real de GitHub).*

### 3. Configurar y encender el Backend (API)
Abre una terminal en la carpeta principal del proyecto y ejecuta:
```bash
cd backend
python -m venv venv
```

Activa el entorno virtual:
* En **Windows**: `venv\Scripts\activate`
* En **Mac/Linux**: `source venv/bin/activate`

Instala las dependencias y arranca el servidor:
```bash
pip install -r requirements.txt
uvicorn app.main:app --reload
```
*(El backend estará corriendo en `http://localhost:8000`)*

### 4. Configurar y encender el Frontend (Interfaz)
Abre **otra pestaña de terminal nueva**, dirígete a la carpeta principal del proyecto y ejecuta:
```bash
cd frontend
npm install
npm run dev
```
*(El frontend estará corriendo y será accesible desde tu navegador, usualmente en el enlace `http://localhost:5173`)*

## 📂 Estructura del Proyecto

```text
CashInc/
│
├── backend/               # Código del servidor (FastAPI)
│   ├── app/
│   │   ├── alerts/        # Módulo de notificaciones
│   │   ├── assets/        # Módulo de inventario y depreciación
│   │   ├── auth/          # Módulo de usuarios y multi-tenencia
│   │   ├── finances/      # Módulo de transacciones e ingresos/gastos
│   │   └── reports/       # Generación de PDFs y Excels
│   └── requirements.txt   # Dependencias de Python
│
└── frontend/              # Código de la interfaz web (React + Vite)
    ├── public/            # Archivos estáticos (Logos e imágenes de la página)
    └── src/
        ├── api/           # Configuración para comunicarse con el Backend
        ├── components/    # Botones, Inputs, Menús, y UI reusables
        ├── context/       # Estado global (AuthContext y Manejo de Sesiones)
        └── pages/         # Vistas principales (Landing, Login, Dashboard, etc.)
```
