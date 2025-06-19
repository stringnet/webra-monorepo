# Usamos una imagen de Nginx, un servidor web ligero y eficiente
FROM nginx:stable-alpine

# Copiamos el archivo del visualizador como la página principal
COPY viewer.html /usr/share/nginx/html/index.html

# Copiamos la configuración de Nginx para manejar correctamente las rutas
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Exponemos el puerto 80
EXPOSE 80

# El comando para iniciar Nginx
CMD ["nginx", "-g", "daemon off;"]