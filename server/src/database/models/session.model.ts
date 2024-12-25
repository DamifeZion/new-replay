import mongoose from "mongoose";
import { SessionI } from "../../interfaces/session.interface";

const sessionSchema = new mongoose.Schema<SessionI>(
	{
		user_id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "users",
			required: true,
		},
		ip_address: { type: String, required: true },
		session_token: { type: String, required: true, unique: true },
		user_agent: { type: String, required: true },
	},
	{
		timestamps: true,
	},
);

export const SessionModel = mongoose.model("sessions", sessionSchema);
