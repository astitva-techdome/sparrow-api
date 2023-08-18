### 📚 Description

This project is made to hold backend-apis of Project Sparrow.
---

### 🛠️ Prerequisites

- Please make sure to either have MongoDB Community installed locally or ask for dev db url from your manager.
- Node.js v18.
- pnpm package Manager (npm i -g pnpm)
- VS Code

---

### 🚀 How to Run Locally

- Create a `.env` file using the `cp .env.example .env` command and replace the existing env variables with personal settings

- Download dependencies using `pnpm i`

- Start the app in pre-production mode using `pnpm run start` or `pnpm run start:dev` for development
---

### How to name your commits?

[Conventional Commits](https://techdome.atlassian.net/wiki/spaces/DEV/pages/155189253/Commit+Convention)

- API relevant changes
    - **feat** Commits, that adds a new feature
    - **fix** Commits, that fixes a bug

- **refactor** Commits, that rewrite/restructure your code, however does not change any behaviour
    - **perf** Commits are special refactor commits, that improve performance
    
- **style** Commits, that do not affect the meaning (white-space, formatting, missing semi-colons, etc)

- **test** Commits, that add missing tests or correcting existing tests

- **docs** Commits, that affect documentation only

- **build** Commits, that affect build components like build tool, ci pipeline, dependencies, project version etc.

- **ops** Commits, that affect operational components like infrastructure, deployment, backup, recovery etc.

- **chore** Miscellaneous commits e.g. modifying .gitignore

### How to name your branch?

[Branch Naming](https://techdome.atlassian.net/wiki/spaces/DEV/pages/155451396/Branch+Naming)


### 📝 API Documentation (Using Swagger,Until Sparrow is Live )

Go to localhost:**{PORT}**/api/docs