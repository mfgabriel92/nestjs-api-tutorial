import { HttpStatus, INestApplication } from '@nestjs/common';
import { ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { PrismaService } from '@src/database/prisma.service';
import { AppModule } from '@src/app.module';
import * as pactum from 'pactum';

describe('Auth', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
    );

    await app.init();
    await app.listen(3333);
    await app.get(PrismaService).cleanDb();

    pactum.request.setBaseUrl('http://localhost:3333');
  });

  describe('Sign-up', () => {
    it('Should sign-up successfully with all required fields', () => {
      return pactum
        .spec()
        .post('/auth/sign-up')
        .withJson({
          firstName: 'John',
          lastName: 'Doe',
          email: 'johndoe@gmail.com',
          password: 'abcd1234',
        })
        .expectStatus(HttpStatus.CREATED);
    });

    it('Should fail signin-up with duplicated e-mail', () => {
      return pactum
        .spec()
        .post('/auth/sign-up')
        .withJson({
          firstName: 'John',
          lastName: 'Doe',
          email: 'johndoe@gmail.com',
          password: 'abcd1234',
        })
        .expectStatus(HttpStatus.FORBIDDEN)
        .expectBody({
          statusCode: 403,
          message: 'E-mail is already taken',
          error: 'Forbidden',
        });
    });

    it('Should fail signin-up with missing all required fields', () => {
      return pactum
        .spec()
        .post('/auth/sign-up')
        .withJson({
          lastName: 'Doe',
          email: 'johndoe@gmail.com',
          password: 'abcd1234',
        })
        .expectStatus(HttpStatus.BAD_REQUEST)
        .expectBody({
          error: 'Bad Request',
          message: [
            'firstName must be a string',
            'firstName should not be empty',
          ],
          statusCode: 400,
        });
    });
  });

  describe('Sign-in', () => {
    it('Should sign-in successfully with all required fields', () => {
      return pactum
        .spec()
        .post('/auth/sign-in')
        .withJson({
          email: 'johndoe@gmail.com',
          password: 'abcd1234',
        })
        .expectStatus(HttpStatus.OK)
        .stores('accessToken', 'accessToken');
    });

    it('Should fail signin-in with missing all required fields', () => {
      return pactum
        .spec()
        .post('/auth/sign-in')
        .withJson({
          password: 'abcd1234',
        })
        .expectStatus(HttpStatus.BAD_REQUEST)
        .expectBody({
          statusCode: 400,
          message: ['email must be an email', 'email should not be empty'],
          error: 'Bad Request',
        });
    });
  });

  describe('User', () => {
    it('Should fetch current in user information with valid access token', () => {
      return pactum
        .spec()
        .get('/users/me')
        .withHeaders({
          Authorization: 'Bearer $S{accessToken}',
        })
        .expectStatus(HttpStatus.OK);
    });
  });

  afterAll(() => app.close());
});
