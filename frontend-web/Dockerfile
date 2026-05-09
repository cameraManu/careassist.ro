FROM node:20-alpine AS builder

WORKDIR /app/frontend

# Copy only frontend package files
COPY frontend-web/package*.json ./
RUN npm install

# Copy frontend source
COPY frontend-web/ .

# Copy shared folder (now visible because build context is root)
COPY shared/ /app/shared

# Build frontend
RUN npm run build

# --- Serve with nginx ---
FROM nginx:alpine

COPY --from=builder /app/frontend/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
