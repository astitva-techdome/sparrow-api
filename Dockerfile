FROM node:hydrogen
# App directory
WORKDIR /app

# App dependencies
COPY package*.json ./
RUN npm i -g pnpm
RUN pnpm i

# Copy app source code
COPY . .

# Env setup
COPY .env.example .env

#Expose port and begin application
EXPOSE 9000

# Start the app
CMD [ "pnpm", "run", "start"]