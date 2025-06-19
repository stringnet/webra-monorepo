# Usamos una imagen de Nginx, un servidor web ligero y eficiente
FROM nginx:stable-alpine

# Copiamos el archivo del visualizador al directorio por defecto de Nginx
COPY viewer.html /usr/share/nginx/html/index.html

# Exponemos el puerto 80
EXPOSE 80

# El comando para iniciar Nginx
CMD ["nginx", "-g", "daemon off;"]