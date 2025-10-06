# Use an official Node.js image as the base
FROM node:20-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package files and install dependencies
# This also installs the Angular CLI locally from your project's dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the application source code
COPY . .

# Expose the port the Angular development server runs on
EXPOSE 4200

# Use the standard npm start command to run the app
CMD ["npm", "start"]
