## First to create this auth system with nestjs
npm i -g @nestjs/cli
nest new (project-name)
cd auth-project
npm install @nestjs/typeorm typeorm mysql2
npm install @nestjs/config
npm install bcrypt @types/bcrypt
## To implement login functionality with a dynamic bearer token for each user, you can use JSON Web Tokens (JWT). Here’s how you can integrate JWT in your NestJS application:
npm install @nestjs/jwt @nestjs/passport passport passport-jwt
npm install --save-dev @types/passport-jwt

mkdir src/auth/jwt.strategy.ts
mkdir src/profile.controller.ts

## To implement an OTP (One-Time Password) verification flow and send a welcome email after successful login, you need to do the following:

npm install nodemailer

## install the dotenv package to load environment variables from a .env file.
npm install dotenv

### Run the Migration:
npx typeorm migration:create src/migrations/AddIsVerifiedToUsers(For example)
``For Example``
  import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

      export class AddIsVerifiedToUsers1686175623456 implements MigrationInterface {
      public async up(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.addColumn('user', new TableColumn({
      name: 'isVerified',
      type: 'boolean',
      isNullable: true,
      default: false,
      }));
      }
  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('user', 'isVerified');
  }
}

#### Run This to migrate the changes 
npx ts-node -r tsconfig-paths/register ./node_modules/typeorm/cli.js migration:run -d src/data-source.ts


npm run start:dev


## SQL control to modify the data sets in the database, add the firstname before id
  ALTER TABLE users
  MODIFY COLUMN firstname VARCHAR(255) AFTER id;

## Sql to align the id of the data sets in the database, arrange the id if a column was deleted or something( Manually )
CREATE TABLE temp_users LIKE users;

SET @new_id = 0;
INSERT INTO temp_users (id, firstname, email, password)
SELECT @new_id := @new_id + 1, firstname, email, password FROM users ORDER BY id;

DROP TABLE users;

ALTER TABLE temp_users RENAME TO users;

ALTER TABLE users AUTO_INCREMENT = 1;

###
The endpoints -
## Register
http://localhost:3000/auth/register

  {
      "firstname": "John", 
      "email": "johndoe@gmail.com", 
      "password": "password"
  }

## Login
http://localhost:3000/auth/login

  {
      "email": "johndoe@gmail.com", 
      "password": "password"
  }

## Verify
http://localhost:3000/auth/verify-otp

  {
      "email": "johndoe@gmail.com", 
      "otp": "6349"
  }

## GetProfile (Protected)
http://localhost:3000/profile

## Aligns/reset your data set
POST
http://localhost:3000/auth/reset
http://localhost:3000/auth/realign


## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Installation

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://kamilmysliwiec.com)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](LICENSE).
