import { faker } from '@faker-js/faker';
import type { User, ApiCredentials } from '../types';

export class DataFactory {
  createUser(overrides: Partial<User> = {}): User {
    return {
      id:        faker.string.uuid(),
      email:     faker.internet.email(),
      firstName: faker.person.firstName(),
      lastName:  faker.person.lastName(),
      role:      'user',
      ...overrides,
    };
  }

  createAdminUser(overrides: Partial<User> = {}): User {
    return this.createUser({ role: 'admin', ...overrides });
  }

  createCredentials(overrides: Partial<ApiCredentials> = {}): ApiCredentials {
    return {
      email:    faker.internet.email(),
      password: faker.internet.password({ length: 12 }),
      ...overrides,
    };
  }

  randomEmail(): string    { return faker.internet.email(); }
  randomPassword(): string { return faker.internet.password({ length: 12 }); }
  randomName(): string     { return faker.person.fullName(); }
  randomUuid(): string     { return faker.string.uuid(); }
}
