class ApiError extends Error {
  constructor(
    statuscode,
    message = "Something went wrong",
    errors = [],
    stack
  ) {
    if (typeof message !== "string" && Array.isArray(message)) {
      const temp = message;
      message = typeof errors === "string" ? errors : "Something went wrong";
      errors = temp;
    }
    super(message);
    this.message = message;
    this.statuscode = statuscode;
    this.success = false;
    this.data = null;
    this.errors = Array.isArray(errors) ? errors : [errors].filter(Boolean);

    if (stack) {
      this.stack = stack;
    }
    else {
      Error.captureStackTrace(this, this.constructor)
    }
  }
}

export { ApiError, ApiError as apiError };