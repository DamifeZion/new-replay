/**
 * A utility function to extract a readable error message from unknown error objects.
 * Handles Error instances, strings, and other types, with a fallback message.
 * @param {unknown} err - The error object or string.
 * @param {string} [customMessage] - A custom message to use if no other error message is available.
 * @returns {string} - The extracted or fallback error message.
 */
export const catchError = (err: unknown, customMessage?: string): string => {
	if (err instanceof Error) {
		// Handle standard Error objects
		return err.message;
	} else if (typeof err === "string") {
		// Handle string errors
		return err;
	} else if (typeof err === "object" && err !== null) {
		// Handle object errors with a 'message' property
		const errorMessage = (err as { message?: string }).message;
		return errorMessage
			? errorMessage
			: customMessage || "An unexpected error occurred";
	} else {
		// Handle all other types (e.g., null, undefined, numbers)
		return customMessage || "An unknown error occurred";
	}
};
