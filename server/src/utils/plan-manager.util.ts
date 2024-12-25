import moment from "moment";
import { plansConst } from "../constants/plans.const";
import { PlanModel } from "../database/models/plan.model";
import { UserModel } from "../database/models/user.model";
import {
	ContentTypeT,
	PlanDurationT,
	PlanNameT,
} from "../interfaces/plan.interface";
import { UserModelI } from "../interfaces/user.interface";

/**
 * Utility to manage Subscription feature
 */
export const planManager = {
	/**
	 * Check what content a user can access
	 * @param planName - Plan Name
	 * @param contentType - Trailers or videos & trailers
	 */
	canAccessContent: (planName: PlanNameT, contentType: ContentTypeT) => {
		const plan = plansConst[planName];

		if (!plan) {
			// Invalid Plan
			console.error(`Invalid plan name: ${planName}`);
			return false;
		}

		// Determine access based on plan's contentAccess feature
		if (plan.features.contentAccess === "both") {
			// Can access both movies and trailers
			return true;
		}

		if (plan.features.contentAccess === contentType) {
			// Can access specific content type
			return true;
		}

		// No Access
		return false;
	},

	/**
	 * Get a plan's features
	 * @param planName - Plan Name
	 */
	getPlan: (planName: PlanNameT) => {
		return plansConst[planName];
	},

	/**
	 * Get all available plans
	 */
	getAllPlans: () => {
		return Object.keys(plansConst).map((planName) => ({
			planName,
			...plansConst[planName as PlanNameT],
		}));
	},

	/**
	 *  Upgrade/Downgrade Plan
	 * @param userID - User ID
	 * @param newPlan - A subscription Plan Type
	 * @param duration - Plan duration (e.g., monthly, yearly, null)
	 */
	changePlan: async (
		userID: string,
		newPlan: PlanNameT,
		duration: PlanDurationT,
	) => {
		// Check if the provided plan is valid
		const plan = plansConst[newPlan];
		if (!plan) {
			throw new Error("Invalid plan");
		}

		// Verify if the user exists
		const existingUser = await UserModel.findById(userID);
		if (!existingUser) {
			throw new Error("User not found");
		}

		// Get the user's current plan
		const userPlan = await PlanModel.findOne({ user_id: userID });
		if (!userPlan) {
			throw new Error("User doesn't have an active subscription plan");
		}

		// Check if the new plan is the same as the current plan
		if (userPlan.name === newPlan && userPlan.duration === duration) {
			throw new Error(
				`User is already subscribed to the ${newPlan} plan with a ${duration} duration.`,
			);
		}

		// Subscription update
		console.log(
			`Updating subscription for user ${existingUser.firstname} to plan: ${newPlan}, duration: ${duration}.`,
		);

		// Update user's plan in the DB
		const newlyCreatedPlan = await PlanModel.updateOne(
			{ userId: existingUser.id },
			{
				name: newPlan,
				duration,
			},
		).select("-user_id");
		return newlyCreatedPlan;
	},
};
