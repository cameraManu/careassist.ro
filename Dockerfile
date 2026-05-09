# --- Stage 1: Build backend ---
FROM node:20-alpine AS backend-builder

# Create app directory
WORKDIR /app

# Copy only backend package files first (better cache)
COPY backend/package*.json ./backend/

# Install backend dependencies
WORKDIR /app/backend
RUN npm install

# Copy backend source
COPY backend/ /app/backend/

# Build TypeScript -> dist/
RUN npm run build

# --- Stage 2: Runtime image ---
FROM node:20-alpine

WORKDIR /app/backend

# Copy only what we need to run
COPY --from=backend-builder /app/backend/node_modules ./node_modules
COPY --from=backend-builder /app/backend/dist ./dist
COPY backend/package*.json ./  # for metadata if needed

ENV NODE_ENV=production
# We'll run the backend on 5000 to match docker-compose
ENV PORT=5000

EXPOSE 5000

# Start compiled backend
CMD ["node", "dist/server.js"]
