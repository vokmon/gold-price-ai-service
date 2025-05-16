# Dockerfile

FROM oven/bun:latest AS base

# Set environment variables to reduce size
ENV PUPPETEER_SKIP_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium
ENV TZ=Asia/Bangkok

# Install only the essential packages with minimal extras
RUN apt-get update && apt-get install -y --no-install-recommends \
    # Core system requirements
    ca-certificates \
    # Minimal Chromium dependencies
    chromium \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/* \
    /var/cache/apt/* \
    /tmp/* \
    /var/tmp/*

# Set up application
WORKDIR /opt/app
COPY package.json bun.lockb ./
RUN bun install --production
COPY . .

# Run the application
CMD ["bun", "run", "start-cron"]