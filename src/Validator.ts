export class Validator {
    private errors: string[] = [];
  
    validateString(value: any, fieldName: string, required: boolean = false, minLength: number = 0): void {
      if (required && (value === null || value === undefined || value === '')) {
          this.errors.push(`${fieldName} is required.`);
      } else if (value !== null && value !== undefined && typeof value !== 'string') {
          this.errors.push(`${fieldName} must be a string.`);
      } else if (value && value.length < minLength) {
          this.errors.push(`${fieldName} must be at least ${minLength} characters long.`);
      }
  }
  
    validateInteger(value: any, fieldName: string, required: boolean = false): void {
      if (required && (value === null || value === undefined)) {
        this.errors.push(`${fieldName} is required.`);
      } else if (value !== null && value !== undefined && !Number.isInteger(value)) {
        this.errors.push(`${fieldName} must be an integer.`);
      }
    }
  
    validateEmail(value: any, fieldName: string, required: boolean = false): void {
      if (required && (value === null || value === undefined || value === '')) {
        this.errors.push(`${fieldName} is required.`);
      } else if (value !== null && value !== undefined && typeof value !== 'string') {
        this.errors.push(`${fieldName} must be a string.`);
      } else if (value && !/\S+@\S+\.\S+/.test(value)) {
        this.errors.push(`${fieldName} must be a valid email address.`);
      }
    }
  
    validateDate(value: any, fieldName: string, required: boolean = false): void {
      if (required && (value === null || value === undefined)) {
        this.errors.push(`${fieldName} is required.`);
      } else if (value !== null && value !== undefined && isNaN(Date.parse(value))) {
        this.errors.push(`${fieldName} must be a valid date.`);
      }
    }
  
    getErrors(): string[] {
      return this.errors;
    }
  
    hasErrors(): boolean {
      return this.errors.length > 0;
    }
  }