# --- Stage 1: Build Frontend ---
FROM node:20-alpine AS builder
WORKDIR /app

# Copy package files from the root
COPY package*.json ./
RUN npm install

# Copy all files from root to builder
COPY . .

# Run the build (Vite/React usually outputs to /dist)
RUN npm run build

# --- Stage 2: Final Run Image ---
FROM node:20-alpine
WORKDIR /app

# Install only production dependencies
COPY package*.json ./
RUN npm install --production

# Copy all backend files
COPY . .

# Copy the compiled frontend into a folder named 'public' 
# so the backend can serve it
COPY --from=builder /app/dist ./public

# Expose the port your app runs on
EXPOSE 5000

# Start the application
CMD ["node", "index.js"]
