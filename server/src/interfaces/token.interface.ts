import { ObjectId } from "mongoose";

export type TokenPurposeT =
	| "reset_password"
	| "email_verification"
	| "phone_verification"
	| "unknown";
export interface TokenModelI {
	_id: ObjectId;
	user_id: Object;
	token: string;
	purpose: TokenPurposeT;
	expires_at: Date;
}
