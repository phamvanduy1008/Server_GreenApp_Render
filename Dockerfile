# Base image Node.js
FROM node:18

# Install Python & pip
RUN apt-get update && \
    apt-get install -y python3 python3-pip && \
    pip3 install --upgrade pip --break-system-packages

# Set working directory
WORKDIR /app

# Copy Node dependencies
COPY package*.json ./
RUN npm install

# Copy Python requirements and install them
COPY requirements.txt ./
RUN pip3 install --no-cache-dir -r requirements.txt --break-system-packages

# Copy necessary files
COPY AI ./AI
COPY images ./images
COPY . .

# Debug: check AI folder
RUN ls -l ./AI

# Expose port
EXPOSE 3000

# Start Node.js app
CMD ["npm", "start"]
