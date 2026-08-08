# CashInc (InfraControl) 🛡️📈

CashInc es una plataforma integral de gestión financiera y control técnico de activos físicos diseñada específicamente para PyMEs (Pequeñas y Medianas Empresas). Su objetivo principal es democratizar las herramientas financieras avanzadas y la administración de infraestructura física, permitiendo a los dueños de negocios tener un control absoluto sobre su flujo de caja, mantenimiento preventivo y correctivo, depreciación de herramientas, y operaciones diarias en un entorno multiusuario seguro.

---

## ✨ Características Principales

### 1. Gestión de Activos Físicos y Técnicos 🛠️
* **Inventario Detallado:** Control físico por tipo (edificio, maquinaria, sucursal, equipos, proyectos constructivos).
* **Campos Técnicos Avanzados:** Registro de Marca, Modelo, Número de Serie y Estado de Desgaste Físico (`excelente`, `bueno`, `regular`, `malo`, `crítico`).
* **Depreciación Realista:** Cálculo matemático de depreciación en libros utilizando método lineal y de doble saldo decreciente ajustado automáticamente por el nivel de deterioro físico del activo.

### 2. Mantenimientos Preventivos y Correctivos ⚙️
* **Cronogramas y Responsables:** Programación de tareas técnicas con costos estimados, fechas programadas y encargados asignados.
* **Integración ROI:** Al resolver un mantenimiento e ingresar el costo real, la plataforma inserta automáticamente una transacción de egreso asociada, actualizando de inmediato el retorno de inversión (ROI) del activo afectado.

### 3. Alertas en Tiempo Real y Notificaciones 🔔
* **Desviaciones Presupuestarias:** Monitoreo automatizado que genera alertas de advertencia (gasto >= 85%) o críticas (gasto >= 100%) en tus presupuestos asignados.
* **Alertas de Cronograma:** Alarma por mantenimientos vencidos o próximos a expirar (menos de 48 horas).
* **Gastos Fuera de Rango:** Detección de gastos anómalos o de gran volumen.
* **Notificaciones Externas:** Envío automático de alertas a través de correos electrónicos (**SMTP**) y mensajes de WhatsApp (**Twilio**) si las credenciales correspondientes están configuradas, con fallback a consola interactiva.

### 4. Inteligencia Artificial y Chatbot Conversacional (EMAI) 🔮
* **Proyecciones Financieras:** Generación de pronósticos de depreciación acumulada y costos de mantenimiento a 10 años utilizando modelos predictivos basados en el estado físico del activo.
* **Chatbot EMAI:** Ventana de chat conversacional integrada. Hace uso de la API de **Google Gemini** con el contexto real de la base de datos (activos, transacciones y alertas) del usuario. Cuenta con un motor de palabras clave local (NLP) inteligente como fallback si no se tiene una clave API de Gemini.

### 5. Control de Acceso y Calidad de Vida (QoL) 🔒
* **Seguridad y Recuperación:** Flujo completo de recuperación de contraseña olvidada mediante el despacho de códigos de verificación numéricos seguros de 6 dígitos.
* **Roles Granulares:** Vistas y menús de navegación restringidos para los roles de `financiero` (no ve paneles técnicos o de mantenimiento) y `mantenimiento` (no ve balances financieros, egresos generales o ROI).
* **Simulación de Monetización:** Panel integrado para calcular ingresos estimados simulados por impresiones de anuncios, CTR y CPM.
* **Filtros Avanzados y Paginación:** Búsqueda dinámica y paginación rápida para todos los listados de activos, transacciones y tareas técnicas.

---

## 🛠️ Tecnologías Utilizadas

* **Frontend:** React, Vite, Tailwind CSS, Lucide React (Íconos), React Router, Recharts (Gráficos Interactivos).
* **Backend:** Python, FastAPI, Motor (MongoDB Async Driver), Pytest (Pruebas Automatizadas).
* **Base de Datos:** MongoDB.
* **Despliegue:** Vercel SPA Routing (`vercel.json`).

---

## 🚀 Guía de Instalación y Ejecución

Sigue estos pasos para descargar, instalar y ejecutar el proyecto localmente:

### 1. Requisitos Previos
Asegúrate de tener instalados los siguientes programas:
* [Git](https://git-scm.com/)
* [Node.js](https://nodejs.org/) (Versión 18 o superior)
* [Python](https://www.python.org/) (Versión 3.9 o superior)
* [MongoDB](https://www.mongodb.com/try/download/community)

### 2. Configurar y encender el Backend (API)
1. Entra a la carpeta del backend y crea tu entorno virtual:
   ```bash
   cd backend
   python -m venv venv
   ```
2. Activa el entorno virtual:
   - **Windows (PowerShell)**: `venv\Scripts\Activate.ps1`
   - **Mac/Linux**: `source venv/bin/activate`
3. Instala dependencias y arranca el servidor:
   ```bash
   pip install -r requirements.txt
   uvicorn app.main:app --reload
   ```
   *(El backend corre en `http://localhost:8000`)*

### 3. Ejecutar Pruebas Unitarias del Backend
Para correr la suite de pruebas del backend y asegurar que las validaciones y endpoints están respondiendo de manera correcta, ejecuta:
```bash
python -m pytest tests/test_api.py
```

### 4. Configurar y encender el Frontend (Interfaz)
Abre otra terminal nueva en la carpeta principal del proyecto y ejecuta:
```bash
cd frontend
npm install
npm run dev
```
*(El frontend corre en `http://localhost:5173`)*

---

## 📂 Estructura del Proyecto

```text
CashInc/
│
├── backend/               # Código del servidor (FastAPI)
│   ├── app/
│   │   ├── ai/            # Algoritmos predictivos de desgaste, anomalías y chatbot
│   │   ├── alerts/        # Módulo de notificaciones (SMTP/Twilio WhatsApp)
│   │   ├── assets/        # Módulo de inventario físico y cronogramas de mantenimiento
│   │   ├── auth/          # Módulo de seguridad, roles y recuperación de contraseña
│   │   ├── finances/      # Módulo de cash flow y cálculo de VAN/Viabilidad
│   │   └── reports/       # Reportes en PDF y Excel
│   ├── tests/             # Suite de pruebas unitarias automáticas
│   └── requirements.txt   # Dependencias de Python (FastAPI, Pytest, etc.)
│
└── frontend/              # Código de la interfaz web (React + Vite)
    ├── vercel.json        # Configuración de redireccionamiento de rutas para Vercel
    └── src/
        ├── api/           # Cliente Axios para endpoints
        ├── components/    # Botones, Menús, Modales y Layouts de UI
        ├── context/       # Estado global (Autenticación, Idiomas, Temas)
        └── pages/         # Vistas principales (LoginPage, Dashboard, MaintenancePage...)
```
