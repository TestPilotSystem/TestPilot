# Test Pilot System

Test Pilot es una plataforma educativa diseñada para la gestión y práctica de tests de conducción. El sistema integra funcionalidades avanzadas impulsadas por inteligencia artificial para mejorar la experiencia de aprendizaje.

## Prerrequisitos

Aviso: este proyecto ha sido desarrollado y probado en un entorno Windows. Los pasos para la instalación pueden variar en otros sistemas operativos.

Antes de comenzar, asegúrate de tener instalado lo siguiente en tu sistema:

-   [Git](https://git-scm.com/)
-   [Node.js](https://nodejs.org/) (versión 18 o superior recomendada)
-   [Docker](https://www.docker.com/) y [Docker Compose](https://docs.docker.com/compose/)

## Configuración Inicial

1.  **Clonar el repositorio**:
    ```bash
    git clone https://github.com/TestPilotSystem/test-pilot.git
    cd test-pilot
    ```

2.  **Configurar variables de entorno**:
    Copia el archivo de ejemplo para crear tu configuración local.
    ```bash
    cp .env.example .env
    ```
    *(En Windows puedes usar `copy .env.example .env` o hacerlo manualmente).*

---

## Método 1: Desarrollo Local (Recomendado)

Este método ejecuta la aplicación Next.js en tu máquina local mientras utiliza Docker para la base de datos. Es ideal para el desarrollo diario.

1.  **Instalar dependencias**:
    ```bash
    npm install
    ```

2.  **Iniciar la base de datos**:
    Levanta el contenedor de MySQL en segundo plano.
    ```bash
    docker compose up -d db
    ```
    > **Importante**: Espera unos segundos a que la base de datos esté completamente lista antes de continuar.

3.  **Configurar la base de datos**:
    Ejecuta las migraciones y carga los datos iniciales (seeds).
    ```bash
    npm run db:install
    ```

    Nota: Si quieres actualizar la base de datos con las nuevas migraciones, ejecuta:
    ```bash
    npm run db:migrate
    npm run db:seed (si quieres cargar los datos iniciales)
    ```

4.  **Lanzar la aplicación**:
    Inicia el servidor de desarrollo.
    ```bash
    npm run dev
    ```
    La aplicación estará disponible en [http://localhost:3000](http://localhost:3000).

---

## Método 2: Despliegue Completo con Docker

Si prefieres ejecutar todo el sistema (aplicación + base de datos) dentro de contenedores.

1.  Levanta todos los servicios:
    ```bash
    docker-compose up --build
    ```
    La aplicación estará disponible en [http://localhost:3000](http://localhost:3000).

> **Nota**: Asegúrate de que tu `DATABASE_URL` en el archivo `.env` apunte al servicio `db` dentro de la red de Docker si usas este método exclusivamente, aunque la configuración por defecto suele funcionar gracias a la exposición de puertos.

---

## ⚠️ Servicio de Inteligencia Artificial (Requerido)

Para utilizar las funcionalidades de IA (como el chat con el tutor o la generación de explicaciones), **es obligatorio tener desplegado y funcionando el servidor de IA**.

El sistema Test Pilot depende de este microservicio externo. Por favor, sigue las instrucciones de instalación en su repositorio oficial:

👉 **[Repositorio del Servicio de IA (test-pilot-ai)](https://github.com/TestPilotSystem/test-pilot-ai)**

Asegúrate de configurar la variable `AI_API_BASE_URL` en tu archivo `.env` para que apunte a la dirección donde has desplegado el servicio de IA (por defecto suele ser `http://127.0.0.1:8000`).
