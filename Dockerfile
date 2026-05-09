# --- Stage 1: Build backend ---
FROM node:20-alpine AS backend-builder

WORKDIR /app

# Copy backend package files
COPY backend/package*.json ./backend/

# Install backend dependencies
WORKDIR /app/backend
RUN npm install

# Copy backend source
COPY backend/ /app/backend/

# Copy shared folder (IMPORTANT!)
COPY shared/ /app/shared/

# Build TypeScript -> dist/
RUN npm run build

# --- Stage 2: Runtime image ---
FROM node:20-alpine

WORKDIR /app/backend

# Copy only what is needed to run
COPY --from=backend-builder /app/backend/node_modules ./node_modules
COPY --from=backend-builder /app/backend/dist ./dist
COPY backend/package*.json ./

ENV NODE_ENV=production
ENV PORT=5000

EXPOSE 5000

CMD ["node", "dist/backend/src/server.js"]
