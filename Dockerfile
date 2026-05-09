# --- Stage 1: Build Frontend ---
FROM node:20-alpine AS builder
WORKDIR /app

# Copy package files
COPY package*.json ./
# Use 'install' but ignore optional platform-specific errors
RUN npm install

# Copy everything
COPY . .

# CI=false prevents the build from failing on simple warnings
# If it still fails, the error is a hard code error
RUN CI=false npm run build

# --- Stage 2: Final Run Image ---
FROM node:20-alpine
WORKDIR /app

COPY package*.json ./
RUN npm install --production
COPY . .

# Copy build from previous stage
COPY --from=builder /app/dist ./public

EXPOSE 5000
CMD ["node", "index.js"]
