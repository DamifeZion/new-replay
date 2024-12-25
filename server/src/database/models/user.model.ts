import mongoose from "mongoose";
import { UserModelI } from "../../interfaces/user.interface";
import { calculateAge } from "../../utils/calculate-age.util";
import { deleteRelatedData } from "../../utils/delete-related-user.util";

const userSchema = new mongoose.Schema<UserModelI>(
	{
		profile: { type: String, default: "" },
		firstname: { type: String, required: true },
		lastname: { type: String, required: true },
		email: { type: String, required: true, unique: true, lowercase: true },
		fullname: { type: String, required: true },
		email_active: { type: Boolean, required: true, default: false },
		phone_active: { type: Boolean, required: true, default: false },
		age: { type: Number, required: true },
		date_of_birth: {
			type: Date,
			required: true,
		},
		password: { type: String, default: "" },
		provider: {
			type: String,
			required: true,
			default: "local",
			enum: ["local", "google"],
		},
		providerId: { type: String, default: "" },
		phone_number: { type: String, default: "" },
	},
	{
		timestamps: true,
	},
);

// Middleware for findOneAndDelete, findByIdAndDelete, deleteOne
userSchema.pre("findOneAndDelete", async function (next) {
	const userId = this.getQuery()._id;
	await deleteRelatedData(userId);
	next();
});
userSchema.pre("deleteOne", async function (next) {
	const userId = this.getQuery()._id;
	await deleteRelatedData(userId);
	next();
});

/** Pre-Validation Hook for Dynamic Validation */
userSchema.pre("validate", function (next) {
	if (!this.password && this.provider === "local") {
		this.invalidate(
			"password",
			"Password is required for local authentication.",
		);
	}

	if (this.provider !== "local" && !this.providerId) {
		this.invalidate(
			"providerId",
			"ProviderId is required for social authentication.",
		);
	}

	if (this.firstname && this.lastname) {
		this.fullname = `${this.firstname} ${this.lastname}`;
	}

	// Calculate and set the user's age based on date_of_birth
	if (this.date_of_birth) {
		this.age = calculateAge(this.date_of_birth);
	}

	next();
});

export const UserModel = mongoose.model("users", userSchema);
