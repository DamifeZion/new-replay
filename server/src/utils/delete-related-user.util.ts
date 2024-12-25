import { PlanModel } from "../database/models/plan.model";
import { ProfileModel } from "../database/models/profile.model";
import { TokenModel } from "../database/models/token.model";
import { MongooseIdI } from "../interfaces/mongoose.interface";
import { sessionManager } from "./session-manager.util";

export const deleteRelatedData = async (userId: MongooseIdI) => {
	try {
		// Delete related profiles
		await ProfileModel.deleteMany({ user_id: userId });
		console.log(`Deleted profiles for user ${userId}`);

		// Delete related plans
		await PlanModel.deleteMany({ user_id: userId });
		console.log(`Deleted plans for user ${userId}`);

		// Delete related sessions
		await sessionManager.invalidateAllSessions(userId);
		console.log(`Deleted sessions for user ${userId}`);

		// Delete related Tokens
		await TokenModel.deleteMany({ user_id: userId });
		console.log(`Deleted tokens for user ${userId}`);
	} catch (err) {
		console.error(`Error deleting related data for user ${userId}:`, err);
		throw err;
	}
};
