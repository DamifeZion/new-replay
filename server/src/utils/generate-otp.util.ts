import crypto from "crypto";
import { TokenModel } from "../database/models/token.model";

/**
 * Utility function to generate randam unique OTP codes.
 * @returns 6 Digit Code
 */
export const generateSixDigitCode = async () => {
	try {
		let token = crypto.randomInt(100000, 999999);

		let existingToken = await TokenModel.findOne({ token });

		// if the token already exist, generate a new one
		while (existingToken) {
			token = crypto.randomInt(100000, 999999);
			existingToken = await TokenModel.findOne({ token });
		}

		return token.toString();
	} catch (err) {
		throw err;
	}
};
