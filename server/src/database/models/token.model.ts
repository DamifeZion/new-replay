import mongoose from "mongoose";
import { TokenModelI } from "../../interfaces/token.interface";

const tokenSchema = new mongoose.Schema<TokenModelI>(
	{
		user_id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "users",
			required: true,
		},
		token: { type: String, required: true, unique: true },
		expires_at: {
			type: Date,
			default: Date.now,
			expires: process.env.JWT_Token_Model_EXP || "3h", // Delete documents in specified time.
		},
		purpose: {
			type: String,
			default: "unknown",
			required: true,
			enum: [
				"reset_password",
				"email_verification",
				"phone_verification",
				"unknown",
			],
		},
	},
	{
		timestamps: true,
	},
);

export const TokenModel = mongoose.model("tokens", tokenSchema);
