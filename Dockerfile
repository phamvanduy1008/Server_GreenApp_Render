# Base image Node.js
FROM node:18

# Install Python & pip
RUN apt-get update && \
    apt-get install -y python3 python3-pip && \
    pip3 install --upgrade pip

# Set working directory
WORKDIR /app

# Copy package files first and install Node dependencies (for Docker layer caching)
COPY package*.json ./
RUN npm install

# Copy Python requirements and install them
COPY requirements.txt ./
RUN pip3 install --no-cache-dir -r requirements.txt

# Copy the rest of the app
COPY . .

# Expose port (phù hợp với app đang dùng)
EXPOSE 3000

# Default command
CMD ["npm", "start"]
