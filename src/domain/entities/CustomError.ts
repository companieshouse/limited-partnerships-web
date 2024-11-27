class CustomError {
  private field: string;
  private message: string;

  constructor(field: string, message: string) {
    this.field = field;
    this.message = message;
  }

  getField(): string {
    return this.field;
  }

  getMessage(): string {
    return this.message;
  }

  static errorsToCustomErrors(errors: any) {
    return !Array.isArray(errors) ? [errors] : errors;
  }
}

export default CustomError;
