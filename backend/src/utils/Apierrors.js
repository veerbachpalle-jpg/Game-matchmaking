class ApiError extends Error{
  constructor(
    statuscode,
    errors = [],
    message = "Something went wrong",
    stack,
  ){
    super(message),
    this.message = message,
    this.statuscode = statuscode,
    this.success = false;
    this.data = null;
    this.errors  = errors;

    if(stack){
      this.stack = stack;
    }
    else{
      Error.captureStackTrace(this,this.constructor)
    }
  }
}

export{apiError}