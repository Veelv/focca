import { Validator } from '../../src/Index';

describe('Validator', () => {
  let validator: Validator;

  beforeEach(() => {
    validator = new Validator();
  });

  afterEach(() => {
    validator = new Validator();
  });

  test('should validate required string', () => {
    validator.validateString('', 'Name', true);
    expect(validator.hasErrors()).toBe(true);
    expect(validator.getErrors()).toContain('Name is required.');
  });

  test('should validate string type', () => {
    validator.validateString(123, 'Name');
    expect(validator.hasErrors()).toBe(true);
    expect(validator.getErrors()).toContain('Name must be a string.');
  });

  test('should validate valid email', () => {
    validator.validateEmail('invalid-email', 'Email');
    expect(validator.hasErrors()).toBe(true);
    expect(validator.getErrors()).toContain('Email must be a valid email address.');
  });

  test('should validate required integer', () => {
    validator.validateInteger(null, 'Age', true);
    expect(validator.hasErrors()).toBe(true);
    expect(validator.getErrors()).toContain('Age is required.');
  });

  test('should validate integer type', () => {
    validator.validateInteger(10.5, 'Age');
    expect(validator.hasErrors()).toBe(true);
    expect(validator.getErrors()).toContain('Age must be an integer.');
  });

  test('should validate required date', () => {
    validator.validateDate(null, 'Birthdate', true);
    expect(validator.hasErrors()).toBe(true);
    expect(validator.getErrors()).toContain('Birthdate is required.');
  });

  test('should validate valid date', () => {
    validator.validateDate('invalid-date', 'Birthdate');
    expect(validator.hasErrors()).toBe(true);
    expect(validator.getErrors()).toContain('Birthdate must be a valid date.');
  });

  test('should validate string minimum length', () => {
    const validator = new Validator();
    const minLength = 3;
    const value = 'ab';
    validator.validateString(value, 'Username', true, minLength);
    
    expect(validator.hasErrors()).toBe(true);
    expect(validator.getErrors()).toContain('Username must be at least 3 characters long.'); 
});
});