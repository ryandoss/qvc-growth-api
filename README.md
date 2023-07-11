# Project overview

This project is a boilerplate to quick start a nestjs api with prisma and a postgresql data base. It exists to serve as a platform for other internal mwi developers to grab and go while it also serves as an introduction to the Nest-mwi project's api

## Instructions

#### _Prequisites_

- Have [docker desktop](https://www.docker.com/products/docker-desktop/) installed

- Have nvm installed

### Project Setup

- Install Dependencies

  ```bash
  # use a shared node version
  nvm use
  # install the dependencies
  npm install
  ```

- Copy the env variables

  ```bash
  # copies example env variables to .env
  $ cp .env.example .env
  ```

- Start the PostgreSQL database

  ```bash
  npm run db:dev:up
  ```

- Generate Prisma Client JS by running

  ```bash
  npm run prisma:generate
  ```

- Seed the database data with this script

  ```bash
  npm run seed
  ```

- Run Nest Server in Development mode:

  ```bash
  npm run start

  # watch mode
  npm run start:dev
  ```

- Now open up [localhost:3000](http://localhost:3000) to verify that your nest server is running.
  > There is [RESTful API](http://localhost:3000/api) documentation available with Swagger.

---

### Docker Compose

- Setup a the database and Nest application
  ```bash
  # start docker-compose
  docker-compose up -d
  ```

### Migrations

- to customize your `migration.sql` file run the following command

  ```bash
    npm run migrate:dev:create
  ```

> **Note**: Every time you update [schema.prisma](prisma/schema.prisma) re-generate Prisma Client JS

- Make sure migrations and the prisma client types have been generated

  ```bash
  npm run migrate:up
  ```

### Testing

- To run migrations and generate the prisma client types run:

  ```bash
  npm run migrate:up
  ```

- Run the test command

  ```bash
  yarn test:e2e
  ```
