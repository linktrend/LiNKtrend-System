export class LinkdeveloperNotFoundError extends Error {
  constructor(message = "Product run not found") {
    super(message);
    this.name = "LinkdeveloperNotFoundError";
  }
}

export class LinkdeveloperValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "LinkdeveloperValidationError";
  }
}
