### 📚 Description

This project is made to hold backend-apis of Project Sparrow.

---

### 🛠️ Prerequisites

#### Non Docker

- Please make sure to either have MongoDB Community installed locally or a subscription to Mongo on the cloud by configuration a cluster in [atlas](https://www.mongodb.com/cloud/atlas). 

#### Docker 🐳

- Please make sure to have docker desktop setup on any preferred operating system to quickly compose the required dependencies. Then follow the docker procedure outlined below.

**Note**: Docker Desktop comes free on both Mac and Windows, but it only works with Windows 10 Pro. A workaround is to get [Docker Toolbox](https://docs.docker.com/toolbox/toolbox_install_windows/) which will bypass the Windows 10 Pro prerequisite by executing in a VM.

---

### 🚀 Deployment

#### Manual Deployment without Docker

- Create a `.env` file using the `cp .env.example .env` command and replace the existing env variables with personal settings (MongoDB URL either `srv` or `localhost`)
	- Modify the connection string by modifying the following [line](https://github.com/msanvarov/nest-rest-mongo-boilerplate/blob/master/.env.example#L10).

- Download dependencies using `pnpm i`

- Start the app in pre-production mode using `pnpm run start` or `pnpm run start:dev` for development

#### Deploying with Docker 🐳

- Execute the following command in-app directory:

```bash
# creates and loads the docker container with required configuration
$ docker-compose up -d 
```
- The following command will set up and run the docker project for quick use. Then the web application, and MongoDB will be exposed to http://localhost:9000 and http://localhost:27017 respectively.

### 🔒 Environment Configuration

By default, the application comes with a config module that can read in every environment variable from the `.env` file.

**PORT** - the application port number.

**APP_ENV** - the application environment to execute as, either in development or production. Determines the type of logging options to utilize. Options: `DEV` or `PROD`. 

**APP_URL** - the base URL for the application. Made mainly to showcase the power of `ConfigService` and can be removed as it doesn't serve any other purpose

**WEBTOKEN_SECRET_KEY** - the secret key to encrypt/decrypt web tokens with. Make sure to generate a random alphanumeric string for this.

**WEBTOKEN_EXPIRATION_TIME** - **the time in seconds** indicating when the web token will expire; by default, it's 2400 seconds which is 40 mins.

**DB_URL** - the URL to the MongoDB collection

---

### ✅ Testing

#### Docker 🐳

```bash
# unit tests
$ docker exec -it nest yarn test

# e2e tests
$ docker exec -it nest yarn test:e2e

# test coverage
$ docker exec -it nest yarn test:cov
```

#### Non-Docker

```bash
# unit tests
$ pnpm run test

# e2e tests
$ pnpm run test:e2e

# test coverage
$ pnpm run test:cov
```

---

### 📝 Open API

Go to localhost:{PORT}/api/docs