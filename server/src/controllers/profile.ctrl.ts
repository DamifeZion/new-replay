import { Context } from "hono";
import { ProfileModel } from "../database/models/profile.model";
import { missingReqMsg, response } from "../utils/response.util";
import { UserContextI } from "../interfaces/user.interface";
import {
	getMissingFieldMessage,
	getMissingOrEmptyFields,
} from "../utils/validation.util";
import mongoose from "mongoose";
import { planManager } from "../utils/plan-manager.util";
import { message } from "../constants/message.const";

// Get a single profile by ID
export const getProfile = async (c: Context) => {
	try {
		const { id } = await c.req.param();

		if (!mongoose.Types.ObjectId.isValid(id)) {
			return response(c, 403, false, message.invalidId("profile"));
		}

		const profile = await ProfileModel.findById(id);
		if (!profile) {
			return response(c, 404, false, null, null);
		}

		return response(c, 200, true, null, profile);
	} catch (err) {
		return response.serverError(c, err);
	}
};

// Get all profiles for a user
export const getAllProfile = async (c: Context) => {
	try {
		const user: UserContextI = await c.get("user");

		const profiles = await ProfileModel.find({
			user_id: user.id,
		});

		if (!profiles) {
			return response(c, 404, false, null, null);
		}

		return response(c, 200, true, null, profiles);
	} catch (err) {
		return response.serverError(c, err);
	}
};

// Create a new profile
export const createProfile = async (c: Context) => {
	try {
		const user: UserContextI = await c.get("user");
		const userId = user.id;

		const body = await c.req.json();
		if (!body) {
			return response(c, 400, false, message.missingBody());
		}

		const { name, is_kids, avatar } = body;

		// Ensure each profile name is unique to a user
		const existingPlanName = await ProfileModel.findOne({
			name,
			user_id: user.id,
		});
		if (existingPlanName) {
			return response(c, 403, false, message.alreadyExists("Profile name"));
		}

		// Handle empty fields
		const missingFields = getMissingOrEmptyFields(body, ["name"]);
		if (missingFields.length > 0) {
			return response(c, 400, false, getMissingFieldMessage(missingFields));
		}

		// Check if the user has reached the profile limit
		const userProfileCount = await ProfileModel.countDocuments({
			user_id: userId,
		});
		const maxProfiles = planManager.getPlan(user.plan).features.maxProfiles;

		if (userProfileCount >= maxProfiles) {
			return response(
				c,
				403,
				false,
				"You have reached the maximum number of profiles allowed",
			);
		}

		// Create the profile.
		const profile = await ProfileModel.create({
			name,
			avatar,
			is_kids,
			user_id: userId,
		});

		return response(c, 201, true, message.successCreate("Profile"), profile);
	} catch (err) {
		return response.serverError(c, err);
	}
};

// Edit an existing profile
export const editProfile = async (c: Context) => {
	try {
		const { id } = c.req.param();
		const body = await c.req.json();

		if (!mongoose.Types.ObjectId.isValid(id)) {
			return response(c, 403, false, message.invalidId("profile"));
		}

		const updatedProfile = await ProfileModel.findByIdAndUpdate(
			id,
			{
				...body,
			},
			{ new: true },
		);
		if (!updatedProfile) {
			return response(c, 404, false, message.notFound("Profile"));
		}

		return response(
			c,
			200,
			true,
			message.successUpdate("Profile"),
			updatedProfile,
		);
	} catch (err) {
		return response.serverError(c, err);
	}
};

// Delete a profile
export const deleteProfile = async (c: Context) => {
	try {
		const { id } = await c.req.param();
		const user: UserContextI = await c.get("user");

		if (!mongoose.Types.ObjectId.isValid(id)) {
			return response(c, 403, false, message.invalidId("Profile"));
		}

		// Check if there is only one profile left
		const userProfiles = await ProfileModel.countDocuments({
			user_id: user.id,
		});
		if (userProfiles <= 1) {
			return response(
				c,
				403,
				false,
				"You cannot delete this profile. At least one profile must remain.",
			);
		}

		// Delete the profile
		const deletedProfile = await ProfileModel.findByIdAndDelete(id);
		if (!deletedProfile) {
			return response(c, 404, false, message.notFound("Profile"));
		}

		return response(c, 200, true, "Profile deleted successfully");
	} catch (err) {
		return response.serverError(c, err);
	}
};
