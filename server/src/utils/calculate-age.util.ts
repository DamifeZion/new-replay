/**
 * Calculate age from the given date of birth
 * @param dateOfBirth - The user's date of birth as a string or Date object
 * @returns Age as a number
 */

export const calculateAge = (dateOfBirth: Date | string): number => {
	const dob = new Date(dateOfBirth);
	const today = new Date();
	let age = today.getFullYear() - dob.getFullYear();

	// Adjust age if birthday has not occurred yet this year
	if (
		today.getMonth() < dob.getMonth() ||
		(today.getMonth() === dob.getMonth() && today.getDate() < dob.getDate())
	) {
		age--;
	}

	return age;
};
