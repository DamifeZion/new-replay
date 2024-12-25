import mongoose from "mongoose";
import { PlanModelI } from "../../interfaces/plan.interface";
import moment from "moment";

const planSchema = new mongoose.Schema<PlanModelI>({
	user_id: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "userss",
		required: true,
		unique: true,
	},
	name: {
		type: String,
		required: true,
		default: "free",
		enum: ["free", "basic", "standard", "premium", "family"],
	},
	duration: {
		type: String,
		required: function () {
			// Duration is required for non-free plans
			return this.name !== "free";
		},
		default: null,
		enum: ["monthly", "yearly"],
	},
	expiresAt: {
		type: Date,
		default: null,
		required: function () {
			// expiresAt is required for non-free plans
			return this.name !== "free";
		},
	},
});

/** Pre-Validation Hook for Dynamic Validation */
planSchema.pre("validate", function (next) {
	if (this.name !== "free" && this.duration) {
		// Set the expiry based on duration
		switch (this.duration) {
			case "yearly":
				this.expiresAt = moment().add(1, "year").toDate();
				break;
			case "monthly":
			default:
				// Defaults to one month if duration is invalid
				this.expiresAt = moment().add(1, "month").toDate();
		}

		console.log(`Expiry set for non-free plan: ${this.expiresAt}`);
	} else {
		// For free plans, set expiresAt to null
		this.expiresAt = null;
	}

	next();
});

// Virtual field to know if plan is expired.
planSchema.virtual("expired").get(function () {
	return this.expiresAt ? moment().isAfter(this.expiresAt) : false;
});

// Ensure virtuals are included when converting to JSON or objects
planSchema.set("toJSON", { virtuals: true });
planSchema.set("toObject", { virtuals: true });

export const PlanModel = mongoose.model("plans", planSchema);
