# Production server with Express proxy
FROM node:20-slim

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the frontend
RUN npm run build

# Expose Express server port
EXPOSE 3000

# Set environment variable for port
ENV PORT=3000

# Start Express server (serves built frontend and proxies API)
CMD ["npm", "run", "server"]
