# --- Etapa 1: Construcción (Build) ---
# Usamos una imagen oficial de Node.js con Alpine Linux para un tamaño menor
FROM node:18-alpine AS build

# Establecemos el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copiamos package.json y package-lock.json para cachear las dependencias
COPY package.json ./
COPY package-lock.json ./

# Instalamos todas las dependencias del proyecto
RUN npm install

# Copiamos el resto de los archivos de la aplicación (la carpeta src, public, etc.)
COPY . .

# Construimos la aplicación para producción. Esto genera una carpeta 'build'
# con archivos estáticos optimizados.
RUN npm run build


# --- Etapa 2: Servidor (Serve) ---
# Usamos una imagen de Nginx, un servidor web ligero y eficiente
FROM nginx:stable-alpine

# Copiamos los archivos estáticos construidos en la etapa anterior desde la 
# etapa 'build' al directorio por defecto de Nginx donde sirve contenido.
COPY --from=build /app/build /usr/share/nginx/html

# Copia una configuración personalizada de Nginx si la tuvieras. Esto es útil
# para configurar rutas en Single Page Applications (SPA).
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# Exponemos el puerto 80, que es el puerto por defecto de Nginx
EXPOSE 80

# El comando para iniciar Nginx cuando el contenedor se inicie
CMD ["nginx", "-g", "daemon off;"]