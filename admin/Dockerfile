# --- Etapa 1: Construcción (Build) ---
# Usamos una imagen oficial de Node.js para construir nuestro proyecto
FROM node:18-alpine AS build

# Establecemos el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copiamos los archivos de dependencias
COPY package.json ./
COPY package-lock.json ./

# Instalamos las dependencias del proyecto
# (En un proyecto real, necesitarías un package.json. Para este ejemplo,
# asumimos las dependencias básicas de React y las que usamos)
RUN npm install react react-dom lucide-react

# Copiamos el resto de los archivos de la aplicación
COPY . .

# Construimos la aplicación para producción. Esto genera una carpeta 'build'
# con archivos estáticos optimizados.
# NOTA: Como usamos un solo archivo, este paso es conceptual.
# En una app real con create-react-app, ejecutarías `RUN npm run build`
# Por ahora, nos aseguraremos de que los archivos estén listos para ser servidos.


# --- Etapa 2: Servidor (Serve) ---
# Usamos una imagen de Nginx, un servidor web ligero y eficiente
FROM nginx:stable-alpine

# Copiamos los archivos estáticos construidos en la etapa anterior
# desde la etapa 'build' al directorio por defecto de Nginx
# COPY --from=build /app/build /usr/share/nginx/html

# Para este ejemplo con un solo archivo, simularemos el contenido.
# En una aplicación real, el paso anterior es el correcto.
# Copiamos nuestro código fuente directamente para que sea servido.
# Esto NO es una práctica recomendada para producción, pero funciona para este caso.
COPY --from=build /app/ /usr/share/nginx/html

# Copiamos una configuración personalizada de Nginx si fuera necesario.
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# Exponemos el puerto 80, que es el puerto por defecto de Nginx
EXPOSE 80

# El comando para iniciar Nginx cuando el contenedor se inicie
CMD ["nginx", "-g", "daemon off;"]