# --- Stage 1: Build ---
FROM node:20-alpine AS builder
WORKDIR /app

# Copy only package files first for better caching
COPY package*.json ./

# Clean install including devDependencies (needed for 'vite build')
RUN npm ci || npm install

# Copy everything else
COPY . .

# Run build with CI=false to ignore warnings
# We use '|| ls -la' so if it fails, the build log might show us the folder state
RUN CI=false npm run build

# --- Stage 2: Execution ---
FROM node:20-alpine
WORKDIR /app

# Only production dependencies here
COPY package*.json ./
RUN npm install --production

# Copy all source files
COPY . .

# Copy the built assets from Stage 1
# IMPORTANT: If your vite.config.js uses a different base/outDir, adjust 'dist'
COPY --from=builder /app/dist ./public

ENV NODE_ENV=production
EXPOSE 5000

# Using node directly to ensure we see errors in Portainer logs
CMD ["node", "index.js"]
