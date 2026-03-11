import { ZodError } from "zod";
import { TErrorSources, TGenericErrorResponse } from "../interfaces/error.types";

export const handlerZodError = (err: ZodError): TGenericErrorResponse => {
  const errorSources: TErrorSources[] = err.issues.map((issue) => {
    return {
      path: issue?.path[issue.path.length - 1].toString() || "",
      message: issue?.message || "",
    };
  });

  const statusCode = 400;

  return {
    statusCode,
    message: "Validation Error",
    errorSources,
  };
};
