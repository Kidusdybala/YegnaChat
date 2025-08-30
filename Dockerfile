# Use Node.js 18 LTS
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY backend/package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY backend/ ./

# Move backend contents to root
RUN mv backend/* ./ && rm -rf backend

# Create uploads directory
RUN mkdir -p uploads

# Expose port
EXPOSE 5001

# Start the application
CMD ["npm", "start"]