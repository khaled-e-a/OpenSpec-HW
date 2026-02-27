export class RegistrationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RegistrationError';
  }
}
