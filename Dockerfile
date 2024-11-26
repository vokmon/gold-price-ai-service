# Dockerfile

FROM oven/bun:latest

# Install necessary packages for Puppeteer
# Installs latest Chromium (100) package.
RUN apt-get update && apt-get install -y \
libnss3 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libdrm2 \
    libgbm1 \
    libxkbcommon0 \
    libxcomposite1 \
    libxrandr2 \
    libasound2 \
    libpangocairo-1.0-0 \
    libgtk-3-0 \
    fonts-liberation \
    curl \
    ca-certificates \
    udev \
    chromium \
    && rm -rf /var/lib/apt/lists/*

ENV PUPPETEER_SKIP_DOWNLOAD=false
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium


RUN mkdir -p /opt/app
ENV TZ=Asia/Bangkok
WORKDIR /opt/app
COPY package.json bun.lockb ./
RUN bun install
COPY . .
CMD ["bun", "run", "start-cron"]