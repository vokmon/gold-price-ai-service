# Dockerfile

FROM oven/bun:latest

# Install necessary packages for Puppeteer
# Installs latest Chromium (100) package.
RUN apt-get update && apt-get install -y \
    libnss3 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libxkbcommon0 \
    libxcomposite1 \
    libxrandr2 \
    libasound2 \
    libgtk-3-0 \
    libx11-xcb1 \
    libxcb-dri3-0 \
    libcups2 \
    libdbus-1-3 \
    libdrm2 \
    libxdamage1 \
    libxshmfence1 \
    lsb-release \
    ca-certificates \
    fonts-liberation \
    wget \
    xdg-utils \
    libgbm-dev \
    libglib2.0-0 \
    libpango-1.0-0 \
    libharfbuzz0b \
    libx11-6 \
    libxext6 \
    libxfixes3 \
    libxcursor1 \
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