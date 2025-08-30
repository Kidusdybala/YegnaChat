# Use Node.js 18 LTS
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files first for better caching
COPY backend/package*.json ./

# Install production dependencies
RUN npm ci --only=production

# Copy backend contents directly into /app (no need to move later)
COPY backend/ ./

# Ensure uploads directory exists at runtime
RUN mkdir -p uploads

# Expose the backend port
EXPOSE 5001

# Start the application
CMD ["npm", "start"]