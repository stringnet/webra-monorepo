# Usamos una imagen ligera de Node.js
FROM node:18-alpine

# Establecemos el directorio de trabajo
WORKDIR /app

# Copiamos el package.json y package-lock.json (si existe)
COPY package*.json ./

# Instalamos las dependencias
RUN npm install

# Copiamos el resto del código de la aplicación
COPY . .

# Exponemos el puerto en el que correrá la aplicación
EXPOSE 3001

# El comando para iniciar la aplicación
CMD ["npm", "start"]