# Use a lightweight Node.js image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files first (to cache npm install)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the app code
COPY . .

# Expose port (important for Render)
EXPOSE 8080

# Start the bot
CMD ["node", "index.js"]
