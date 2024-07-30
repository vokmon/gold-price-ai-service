# Dockerfile

FROM node:22-alpine3.19
RUN mkdir -p /opt/app
WORKDIR /opt/app
COPY package.json package-lock.json ./
RUN npm install
COPY . .
RUN chmod +x runscript.sh
EXPOSE 8888
CMD ["npm", "run", "start-server"]