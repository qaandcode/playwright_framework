FROM mcr.microsoft.com/playwright:v1.44.0-jammy

WORKDIR /app

# Install dependencies first (layer-cached)
COPY package*.json ./
RUN npm ci

# Copy source
COPY . .

# Default command — override at runtime
CMD ["npx", "playwright", "test"]
