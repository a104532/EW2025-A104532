# Use a Node.js base image
FROM node:18-alpine

# Create app directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build the application (if needed)
# RUN npm run build

# Expose the app port
EXPOSE 18000

# Command to run the application
CMD ["npm", "start"]