import { Context } from "hono";
import { plansConst } from "../constants/plans.const";
import { PlanModel } from "../database/models/plan.model";
import { SessionModel } from "../database/models/session.model";
import { getIpAddress, getUserAgent } from "./req-header.util";
import { MongooseIdI } from "../interfaces/mongoose.interface";

/**
 * Utility to manage user sessions
 */
export const sessionManager = {
	/**
	 * Create a new session
	 * @param userId - User ID
	 * @param sessionToken - Session token (refresh token)
	 * @returns created session or error
	 */
	createSession: async (
		c: Context,
		userId: MongooseIdI,
		refreshToken: string,
	) => {
		try {
			// Fetch active sessions for the user
			const activeSessions = await SessionModel.find({ user_id: userId });

			// Get user's Plan
			const userPlan = await PlanModel.findOne({ user_id: userId });

			if (!userPlan) {
				throw new Error("User does not have an active plan.");
			}

			// Max sessions based on the user's plan
			const maxSessions =
				plansConst[userPlan.name].features.simultaneousStreams;

			// Check session limit
			if (activeSessions.length >= maxSessions) {
				const activeDevices = activeSessions.map((item) =>
					item.user_agent ? item.user_agent : item.ip_address,
				);

				throw new Error(
					`You have reached the maximum number of devices allowed for your plan (${maxSessions} device${maxSessions > 1 ? "s" : ""}). Please sign out from ${maxSessions > 1 ? "one of the following devices" : "device"}: '${activeDevices.join("', '")}' and try again.`,
				);
			}

			// Check for duplicate session
			const existingSession = await SessionModel.findOne({
				session_token: refreshToken,
			});
			if (existingSession) {
				throw new Error("Session already exists.");
			}

			// Create a new session
			const ipAddress = getIpAddress(c) || "unknown";
			const userAgent = getUserAgent(c) || "unknown";

			const session = await SessionModel.create({
				user_id: userId,
				session_token: refreshToken,
				ip_address: ipAddress,
				user_agent: userAgent,
			});

			return session;
		} catch (err) {
			console.error(`Failed to create session for user ${userId}:`, err);
			throw err;
		}
	},

	/**
	 * Get an active sessions for a user
	 * @param sessionIdentifier - Session token or ID - User ID
	 */
	getSession: async (sessionIdentifier: string | MongooseIdI) => {
		try {
			return await SessionModel.findOne({
				$or: [
					{ session_token: sessionIdentifier },
					{ id: sessionIdentifier },
				],
			});
		} catch (err) {
			throw err;
		}
	},

	/**
	 * Get all active sessions for a user
	 * @param userId - User ID
	 */
	getAllSessions: async (userId: MongooseIdI) => {
		try {
			return await SessionModel.find({ user_id: userId });
		} catch (err) {
			throw err;
		}
	},

	/**
	 * Invalidate a specific session
	 * @param sessionId - Session ID
	 */
	invalidateSession: async (sessionId: MongooseIdI) => {
		try {
			await SessionModel.findOneAndDelete({ _id: sessionId });
		} catch (err) {
			throw err;
		}
	},

	/**
	 * Invalidate all sessions for a user
	 * @param userId - User ID
	 */
	invalidateAllSessions: async (userId: MongooseIdI) => {
		try {
			await SessionModel.deleteMany({ user_id: userId });
		} catch (err) {
			throw err;
		}
	},
};
