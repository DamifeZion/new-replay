const clientBase = process.env.CLIENT_BASE_URL!;

export const clientRoute = {
	verify_email: clientBase + process.env.CLIENT_VERIFY_EMAIL_URL!,
};
