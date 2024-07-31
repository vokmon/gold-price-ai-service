# Dockerfile

FROM node:22-alpine3.19
RUN mkdir -p /opt/app
ENV TZ=Asia/Bangkok
WORKDIR /opt/app
COPY package.json package-lock.json ./
RUN npm install
COPY . .
RUN chmod +x runscript.sh
CMD ["npm", "run", "start-cron"]