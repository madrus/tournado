import { faker } from '@faker-js/faker'

/**
 * Generate a valid email address for testing
 * Removes invalid characters like apostrophes and hyphens
 */
export function createValidTestEmail(): string {
  const firstName = faker.person
    .firstName()
    .toLowerCase()
    .replace(/[^a-z]/g, '')
  const lastName = faker.person
    .lastName()
    .toLowerCase()
    .replace(/[^a-z]/g, '')
  return `${firstName}${lastName}@example.com`
}

/**
 * Generate test user data with valid email
 */
export function createTestUserData() {
  return {
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    email: `${faker.person
      .firstName()
      .toLowerCase()
      .replace(/[^a-z]/g, '')}${faker.person
      .lastName()
      .toLowerCase()
      .replace(/[^a-z]/g, '')}@example.com`,
    password: 'MyReallyStr0ngPassw0rd!!!',
  }
}
