# Dockerfile

FROM node:22-alpine3.19
RUN apk add --no-cache tzdata
RUN mkdir -p /opt/app
ENV TZ=Asia/Bangkok
WORKDIR /opt/app
COPY package.json package-lock.json ./
RUN npm install
COPY . .
RUN chmod +x runscript.sh
EXPOSE 8888
CMD ["npm", "run", "start-server"]