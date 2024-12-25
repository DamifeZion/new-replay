import { getProfile } from "../controllers/profile.ctrl";

export const routeConst = {
	apiVersion: process.env.API_VERSION || "/api/v1",
	index: "/",
	auth: {
		base: "/auth",
		refresh: "/refresh/:refresh_token",
		logout: "/logout/:refresh_token",
		logoutAll: "/logout-all",
		login: "/login",
		register: "/register",
		forgotPassword: "/forgot-password",
		resetPassword: "/reset-password/:reset_token",
		verifyEmail: "/email_verification",
	},
	profile: {
		base: "/profile",
		getProfile: "/:id",
		editProfile: "/:id",
		deleteProfile: "/:id",
	},
	bookmark: {
		base: "/bookmark",
		deleteBookmark: "/:id",
	},
};
