import moment from "moment";

/**
 * Convert any date input into a valid JavaScript Date object.
 * @param {Date | string | number} dateInput - The input date in any format.
 * @returns {Date} - A valid JavaScript Date object.
 * @throws {Error} - If the input cannot be converted to a valid Date.
 */
export const convertToValidDate = (dateInput: string | Date | number): Date => {
	// Attempt to parse the input using the native Date constructor
	let date = new Date(dateInput);

	// Handle cases where Date constructor fails
	if (isNaN(date.getTime())) {
		const formats = [
			moment.ISO_8601,
			"YYYY-MM-DD",
			"DD-MM-YYYY",
			"MM-DD-YYYY",
			"YYY MM DD",
			"DD MM YYYY",
			"MM DD YYYY",
			"YYYY/MM/DD",
			"DD/MM/YYYY",
			"MM/DD/YYYY",
		];
		const parsedDate = moment(dateInput, formats, true);

		if (parsedDate.isValid()) {
			return parsedDate.toDate();
		}

		throw new Error(
			`Invalid date input: ${dateInput}. Expected formats: ${formats.slice(1).join(", ")}`,
		);
	}

	return date;
};
