# --- Stage 1: Build Frontend ---
FROM node:20-alpine AS build-frontend
WORKDIR /app/frontend
# Adjust these paths if your folders are named differently (e.g., 'client')
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# --- Stage 2: Run Backend ---
FROM node:20-alpine
WORKDIR /app/backend

# Install backend dependencies
COPY backend/package*.json ./
RUN npm install --production

# Copy backend source code
COPY backend/ ./

# Copy the built frontend into the backend's public directory
# Note: Ensure your Express app is configured to serve the 'public' folder
COPY --from=build-frontend /app/frontend/dist ./public

EXPOSE 5000
CMD ["npm", "start"]
