/**
 * Validates required fields in a payload and returns any missing fields.
 *
 * @param payload - An object containing the fields to validate.
 * @param requiredKeys - An array of field names that are required.
 * @returns An array of missing field names.
 *
 * @example
 * const payload = { firstname: "John", email: "" };
 * const requiredFields = ["firstname", "lastname", "email"];
 * const missingFields = getMissingOrEmptyFields(payload, requiredFields);
 * console.log(missingFields); // ["lastname", "email"]
 */
export const getMissingOrEmptyFields = (
	payload: Record<string, any>,
	requiredKeys: string[],
): string[] => {
	return requiredKeys.filter((key) => !payload[key]);
};

export const getMissingFieldMessage = (missingFields: Array<string>) => {
	return `Missing required field${missingFields.length > 1 ? "s" : ""}: '${missingFields.join("', '").replaceAll("_", " ")}'`;
};
