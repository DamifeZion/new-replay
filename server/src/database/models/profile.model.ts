import mongoose from "mongoose";
import { ProfileModelI } from "../../interfaces/profile.interface";

const profileSchema = new mongoose.Schema<ProfileModelI>(
	{
		user_id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "users",
			required: true,
		},
		name: { type: String, require: true, unique: true },
		is_kids: { type: Boolean, default: false },
		avatar: { type: String, default: "" },
	},
	{
		timestamps: true,
	},
);

export const ProfileModel = mongoose.model("profiles", profileSchema);
