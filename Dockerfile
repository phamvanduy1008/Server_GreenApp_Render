# Base image Node.js
FROM node:18

# Install Python & pip with override
RUN apt-get update && \
    apt-get install -y python3 python3-pip && \
    pip3 install --upgrade pip --break-system-packages

# Set working directory
WORKDIR /app

# Copy package files and install Node dependencies
COPY package*.json ./
RUN npm install

# Copy Python requirements and install them (bypass system restrictions)
COPY requirements.txt ./
RUN pip3 install --no-cache-dir -r requirements.txt --break-system-packages

# Copy the rest of the app
COPY . .

# Expose port (tùy backend đang chạy)
EXPOSE 3000

# Start Node.js app
CMD ["npm", "start"]
