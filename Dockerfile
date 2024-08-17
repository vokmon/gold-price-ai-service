# Dockerfile

FROM oven/bun:latest
RUN mkdir -p /opt/app
ENV TZ=Asia/Bangkok
WORKDIR /opt/app
COPY package.json bun.lockb ./
RUN bun install
COPY . .
CMD ["bun", "run", "start-cron"]