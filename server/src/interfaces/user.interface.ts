import { ObjectId } from "mongoose";
import { PlanNameT } from "./plan.interface";

export interface UserModelI {
	_id: ObjectId;
	profile: string;
	firstname: string;
	lastname: string;
	fullname: string;
	email: string;
	age: number;
	date_of_birth: Date;
	email_active: boolean;
	phone_active: boolean;

	// Fields specific to authentication
	password?: string; // Required for local auth, not for social auth
	provider: "google" | "local"; // Default to local for sign up via form
	providerId?: string; // Social auth-specific ID (Google/Facebook, e.t.c UID)

	//Optional Fields
	phone_number?: string;
}

// User In hono context via JwtMiddleware
export interface UserContextI {
	id: ObjectId;
	firstname: string;
	lastname: string;
	fullname: string;
	email: string;
	plan: PlanNameT;
}
