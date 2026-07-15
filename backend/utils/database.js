import { AppError } from "./http.js";

export function assertDatabaseResult(error, fallbackMessage = "Database operation failed.") {
  if (!error) return;

  let status = 500;
  let code = "DATABASE_ERROR";
  let message = fallbackMessage;

  if (error.code === "23505") {
    status = 409;
    code = "DUPLICATE_RECORD";
    message = "A record with that value already exists.";
  } else if (error.code === "22P02") {
    status = 400;
    code = "INVALID_ID";
    message = "Invalid record identifier.";
  }

  const appError = new AppError(status, message, code);
  appError.cause = error;
  throw appError;
}
