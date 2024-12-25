import { Context } from "hono";
import { ApiResponseI } from "../interfaces/response.interface";
import { catchError } from "./catch-error.util";

/**
 * Sends a JSON response in a consistent API format.
 * @template T - The type of the data being returned in the response.
 * @param {Context} c - The Hono context object, used to send the response.
 * @param {number} status - The HTTP status code of the response.
 * @param {boolean} success - Indicates whether the operation was successful.
 * @param {string | unknown} message - The message describing the response or error.
 * @param {T} [data] - Optional data payload to include in the response.
 * @param {any} [error] - Optional error object to include in the response.
 * @returns {Response} Response - A Hono JSON response with the provided data.
 */
export const response = <T>(
	c: Context,
	status: number,
	success: boolean,
	message: string | unknown,
	data?: T,
	error?: any,
) => {
	const response: ApiResponseI<T> = {
		success,
		message,
		...(data && { data }),
		...(error && { error }),
	};

	return c.json(response, { status });
};

/**
 * Utility function to handle server-side errors in a try-catch block.
 *
 * **Important Usage Guidelines**
 * - **Do not use this function in nested `try-catch` block:** This function should only be used in the outermost `catch` block to prevent confusion in error handling and ensure precise error reporting.
 *
 * @param {Context} c -The Hono context object, used to send the response.
 * @param {unknown} err - The error caught in the catch block, which can be of any type.
 * @returns {Response} Response - A Hono JSON response with a 500 status code, containing the error message and details.
 */
response.serverError = (c: Context, err: unknown) => {
	console.error(err);
	return response(
		c,
		500,
		false,
		"Internal server error",
		null,
		catchError(err),
	);
};

/**
 * Predefined error messages for missing request parameters or body.
 * Useful for validation and consistent error reporting.
 */
export const missingReqMsg = {
	params: "Missing request params",
	body: "Missing request body",
};
