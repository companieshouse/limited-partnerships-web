import {
  TransactionRouting,
  transactionRoutingDefault,
} from "./TransactionRouting";

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

  static routingWithErrors(
    transactionRouting: TransactionRouting | undefined,
    errors: any
  ): TransactionRouting {
    const errorsMap = CustomError.errorsToCustomErrors(errors);

    return transactionRouting
      ? { ...transactionRouting, errors: errorsMap }
      : { ...transactionRoutingDefault, errors: errorsMap };
  }
}

export default CustomError;
