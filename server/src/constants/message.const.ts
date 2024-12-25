export const message = {
	/**
	 * Message for invalid IDs
	 * @param route - The route or resource name (lowercase)
	 * @returns A formatted invalid ID message string
	 */
	invalidId: (route: string) => {
		return `The provided ${route} ID is invalid.`;
	},

	/**
	 * Message for missing parameters
	 * @param params - Comma-separated list of missing parameters (lowercase)
	 * @returns A formatted missing parameters message string
	 */
	missingParams: (params?: string) => {
		return params
			? `Missing required parameters: ${params}`
			: `Missing required parameters`;
	},

	/**
	 * Message for missing request body
	 * @returns A formatted missing request body message string
	 */
	missingBody: () => {
		return `The request body is missing`;
	},

	/**
	 * Message for successful resource creation
	 * @param resource - The name of the resource (uppercase)
	 * @returns A formatted success message string
	 */
	successCreate: (resource: string) => {
		return `${resource} created successfully`;
	},

	/**
	 * Message for successful resource update
	 * @param resource - The name of the resource (uppercase)
	 * @returns A formatted success update message string
	 */
	successUpdate: (resource: string) => {
		return `${resource} updated successfully`;
	},

	/**
	 * Message for not found resources
	 * @param resource - The name of the resource (uppercase)
	 * @returns A formatted not found message string
	 */
	notFound: (resource: string) => {
		return `${resource} not found`;
	},

	/**
	 * Message for duplicate resources
	 * @param resource - The name of the resource (uppercase)
	 * @returns A formatted already exists message string
	 */
	alreadyExists: (resource: string) => {
		return `${resource} already exists`;
	},

	/**
	 * Message for unauthorized actions
	 * @returns A formatted unauthorized action message string
	 */
	unauthorized: () => {
		return `You are not authorized to perform this action`;
	},
};
