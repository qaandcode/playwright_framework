import { faker } from '@faker-js/faker';
import type { User, TestProduct, TestOrder, Address } from '../types';

/**
 * DataFactory — generates randomised, realistic test data.
 * Call factory functions in beforeEach/beforeAll to keep tests isolated.
 */
export class DataFactory {

  // ── Users ──────────────────────────────────────────────────────────────────

  static createUser(overrides: Partial<User> = {}): User {
    return {
      email: faker.internet.email({ provider: 'testmail.example.com' }).toLowerCase(),
      password: faker.internet.password({ length: 12, memorable: false }),
      name: faker.person.fullName(),
      role: 'user',
      ...overrides,
    };
  }

  static createAdminUser(overrides: Partial<User> = {}): User {
    return DataFactory.createUser({ role: 'admin', ...overrides });
  }

  static createUsers(count: number, overrides: Partial<User> = {}): User[] {
    return Array.from({ length: count }, () => DataFactory.createUser(overrides));
  }

  // ── Products ───────────────────────────────────────────────────────────────

  static createProduct(overrides: Partial<TestProduct> = {}): TestProduct {
    return {
      name: faker.commerce.productName(),
      price: parseFloat(faker.commerce.price({ min: 1, max: 1000 })),
      category: faker.commerce.department(),
      sku: faker.string.alphanumeric(8).toUpperCase(),
      inStock: faker.datatype.boolean(0.8),
      ...overrides,
    };
  }

  static createProducts(count: number, overrides: Partial<TestProduct> = {}): TestProduct[] {
    return Array.from({ length: count }, () => DataFactory.createProduct(overrides));
  }

  // ── Orders ─────────────────────────────────────────────────────────────────

  static createOrder(userId: string, overrides: Partial<TestOrder> = {}): TestOrder {
    const products = DataFactory.createProducts(faker.number.int({ min: 1, max: 5 }));
    return {
      userId,
      products,
      total: products.reduce((sum, p) => sum + p.price, 0),
      status: 'pending',
      ...overrides,
    };
  }

  // ── Addresses ──────────────────────────────────────────────────────────────

  static createAddress(overrides: Partial<Address> = {}): Address {
    return {
      street: faker.location.streetAddress(),
      city: faker.location.city(),
      state: faker.location.state({ abbreviated: true }),
      zip: faker.location.zipCode(),
      country: 'US',
      ...overrides,
    };
  }

  // ── Text & misc ────────────────────────────────────────────────────────────

  static randomEmail(): string {
    return faker.internet.email({ provider: 'testmail.example.com' }).toLowerCase();
  }

  static randomPhone(): string {
    return faker.phone.number();
  }

  static randomParagraph(): string {
    return faker.lorem.paragraph();
  }

  static randomInt(min: number, max: number): number {
    return faker.number.int({ min, max });
  }

  static randomAlphanumeric(length = 8): string {
    return faker.string.alphanumeric(length);
  }

  static randomUUID(): string {
    return faker.string.uuid();
  }

  // ── Dates ──────────────────────────────────────────────────────────────────

  static pastDate(years = 1): Date {
    return faker.date.past({ years });
  }

  static futureDate(years = 1): Date {
    return faker.date.future({ years });
  }

  static isoDate(): string {
    return new Date().toISOString();
  }
}
