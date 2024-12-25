import { Context } from "hono";
import { PlanModel } from "../database/models/plan.model";
import { UserModelI } from "../interfaces/user.interface";
import { generateToken } from "./jwt.util";
import { sessionManager } from "./session-manager.util";
import { ProfileModel } from "../database/models/profile.model";
import { UserModel } from "../database/models/user.model";

/**
 * Utility function executed upon account creation.
 * Performs actions like creating user account, session, and profile.
 * Cleans up all user-related data if any step fails.
 */
export const runSignupActions = async (
	c: Context,
	user: UserModelI,
): Promise<{
	accessToken: string;
	refreshToken: string;
}> => {
	try {
		// Create the users plan before session.
		const plan = await PlanModel.create({
			user_id: user._id,
		});

		// Generate session tokens
		const accessToken = generateToken.access(user);
		const refreshToken = generateToken.refresh(user);

		// Create the users session
		await sessionManager.createSession(c, user._id, refreshToken);

		// Create users profile
		await ProfileModel.create({
			user_id: user._id,
			name: `${user.firstname} ${user.lastname}`,
		});

		return { accessToken, refreshToken };
	} catch (err) {
		// Rollback: Delete all user-related data
		await UserModel.findByIdAndDelete(user._id);
		throw err;
	}
};
