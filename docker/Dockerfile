# Use a lightweight Node.js base image for production
FROM node:20-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy the rest of the application source code
COPY . .

# Set environment variables for production
# This ensures Env.ts loads .env.prod and IS_TEST is not 'true'
ENV EXEC_ENV=prod

# The port your application listens on (if applicable, for Discord bots this is less critical)
# If your app had an Express server, you would expose the port here.
# EXPOSE 3000

# Command to run the application when the container starts
# Assumes your TypeScript output is in the 'dist' directory and index.js is the entry point
CMD ["node", "dist/index.js"]