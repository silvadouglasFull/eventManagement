# Use uma imagem base do Node.js
FROM node:18-alpine

# Defina o diretório de trabalho dentro do contêiner
WORKDIR /app

# Copie os arquivos de manifesto do projeto para aproveitar o cache do Docker
COPY package*.json ./

# Instale as dependências do projeto
RUN npm install

# Copie todo o código-fonte para o contêiner
COPY . .

# Exponha a porta que a nossa aplicação irá utilizar
EXPOSE 3000

# Comando para iniciar a aplicação
CMD ["npm", "run", "dev"]