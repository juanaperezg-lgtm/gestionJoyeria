# Guía de Despliegue - Aura Joyeros

Esta aplicación está lista para ser desplegada en plataformas como **Render**, **Railway**, **DigitalOcean App Platform** o cualquier servidor con Node.js.

## Requisitos Previos

1.  Un servidor con Node.js instalado (v18 o superior).
2.  Acceso a una base de datos (por defecto usa SQLite, pero se puede cambiar a PostgreSQL o MySQL).

## Pasos para el Despliegue

### 1. Variables de Entorno

Crea un archivo `.env` en la carpeta `server/` (o configura las variables en tu plataforma de hosting) basándote en `.env.example`:

-   `PORT`: Puerto donde correrá el servidor (ej. 3001).
-   `JWT_SECRET`: Una clave secreta larga y aleatoria para firmar los tokens.
-   `DATABASE_URL`: La URL de conexión a la base de datos.
    -   Para SQLite: `"file:./dev.db"`
    -   Para PostgreSQL: `"postgresql://..."`
-   `NODE_ENV`: Establecer a `production`.

### 2. Comandos de Construcción

En tu plataforma de hosting, configura el comando de construcción (**Build Command**):

```bash
npm install && npm run build
```

Este comando:
1.  Instala las dependencias del frontend y del servidor.
2.  Construye el frontend (genera la carpeta `dist/`).
3.  Genera el cliente de Prisma para el servidor.

### 3. Comando de Inicio

Configura el comando de inicio (**Start Command**):

```bash
npm start
```

Este comando inicia el servidor Express, el cual servirá tanto la API como los archivos estáticos del frontend.

## Notas sobre SQLite

Si usas SQLite en una plataforma como Render o Heroku, recuerda que los archivos son efímeros. Se recomienda:
1.  Usar una base de datos externa (PostgreSQL/MySQL).
2.  O usar volúmenes persistentes si la plataforma lo permite.

Para cambiar a PostgreSQL:
1.  Modifica `server/prisma/schema.prisma`: `provider = "postgresql"`.
2.  Actualiza `DATABASE_URL` en tu `.env`.
3.  Ejecuta `npm run build:backend` para regenerar el cliente.

## Estructura de Producción

-   El frontend se construye en la raíz en la carpeta `dist/`.
-   El backend reside en `server/` y sirve `dist/` de forma estática cuando `NODE_ENV=production`.
