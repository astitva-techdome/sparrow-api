# Pull base image
FROM node:hydrogen

# App directory
WORKDIR /app

# Copy app source code
COPY . .

# App dependencies
RUN npm i -g pnpm
RUN pnpm i

#Expose port and begin application
EXPOSE 9000

# Start the app
CMD [ "pnpm", "run", "start"]

# CMD if [ "$ENVIRONMENT" = "PROD" ]; then echo"prod"; pnpm run start; else echo "dev"; pnpm run start:dev; fi
