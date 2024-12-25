import { Context } from "hono";
import { missingReqMsg, response } from "../utils/response.util";
import { UserModel } from "../database/models/user.model";
import bcrypt from "bcryptjs";
import { generateToken, verifyToken } from "../utils/jwt.util";
import { UserContextI, UserModelI } from "../interfaces/user.interface";
import {
	getMissingOrEmptyFields,
	getMissingFieldMessage,
} from "../utils/validation.util";
import validator from "validator";
import { sessionManager } from "../utils/session-manager.util";
import { SessionModel } from "../database/models/session.model";
import { TokenModel } from "../database/models/token.model";
import { generateSixDigitCode } from "../utils/generate-otp.util";
import { convertToValidDate } from "../utils/convert-date.util";
import { catchError } from "../utils/catch-error.util";
import { runSignupActions } from "../utils/run-signup-action.util";
import { routeConst } from "../constants/route.const";
import { clientRoute } from "../constants/client-route.const";
import { message } from "../constants/message.const";

export const refreshSession = async (c: Context) => {
	try {
		const { refresh_token } = await c.req.param();

		let decodedToken;
		try {
			decodedToken = verifyToken(refresh_token);
		} catch (err) {
			console.error(err);
			return response(
				c,
				401,
				false,
				"Invalid or expired token",
				null,
				catchError(err),
			);
		}

		const { id } = decodedToken as { id: string };

		// Get the existing user
		const existingUser = await UserModel.findById(id).select(
			"-password -providerId -provider",
		);

		if (!existingUser) {
			return response(c, 401, false, message.unauthorized());
		}

		// Check if session is still valid
		const existingSession = await sessionManager.getSession(refresh_token);
		if (!existingSession) {
			return response(c, 401, false, "Session expired");
		}

		// Generate session tokens
		const accessToken = generateToken.access(existingUser);
		const newRefreshToken = generateToken.refresh(existingUser);

		// Update the user session.
		await SessionModel.updateOne(
			{ session_token: refresh_token },
			{
				session_token: newRefreshToken,
			},
		);

		return response(c, 201, true, "Session generated successfully", {
			refresh_token: newRefreshToken,
			access_token: accessToken,
		});
	} catch (err) {
		return response.serverError(c, err);
	}
};

export const login = async (c: Context) => {
	try {
		const body = await c.req.json();

		// Get missing required fields
		const missingFields = getMissingOrEmptyFields(body, [
			"email",
			"password",
		]);

		if (missingFields.length > 0) {
			return response(c, 400, false, getMissingFieldMessage(missingFields));
		}

		const { email, password } = body;

		// Find user. Provider must be local, since its not Social Auth
		const existingUser = await UserModel.findOne({
			provider: "local",
			email,
		});

		// If no user or user didn't register via traditional auth
		if (
			!existingUser ||
			existingUser.provider !== "local" ||
			!existingUser.password
		) {
			return response(c, 401, false, "Invalid credentials");
		}

		// Validate password
		const isValidPassword = await bcrypt.compareSync(
			password,
			existingUser.password,
		);
		if (!isValidPassword) {
			return response(c, 401, false, "Invalid credentials");
		}

		// If user's email is not verified. Redirect on the client side verification page.
		if (!existingUser.email_active) {
			c.redirect(routeConst.auth.base + routeConst.auth.verifyEmail);
			return response(c, 403, false, "Account email is inactive.", {
				redirect_url: clientRoute.verify_email,
			});
		}

		// Generate session tokens
		const accessToken = generateToken.access(existingUser);
		const refreshToken = generateToken.refresh(existingUser);

		// Create the user session
		try {
			await sessionManager.createSession(c, existingUser._id, refreshToken);
		} catch (err) {
			return response(c, 401, false, catchError(err));
		}

		// Successful response
		return response(c, 200, true, "Welcome back!", {
			refresh_token: refreshToken,
			access_token: accessToken,
			tmdb_access_token: process.env.TMDB_ACCESS_TOKEN_AUTH!
		});
	} catch (err) {
		return response.serverError(c, err);
	}
};

export const register = async (c: Context) => {
	try {
		const body = (await c.req.json()) as Partial<UserModelI>;

		// Get missing required fields
		const missingFields = getMissingOrEmptyFields(body, [
			"firstname",
			"lastname",
			"email",
			"date_of_birth",
			"password",
		]);

		if (missingFields.length > 0) {
			return response(c, 400, false, getMissingFieldMessage(missingFields));
		}

		const { profile, firstname, lastname, email, date_of_birth, password } =
			body as Record<string, string>;

		// Validate Email
		if (!validator.isEmail(email)) {
			return response(c, 400, false, "Invalid email");
		}

		// Check if email exists in DB
		const existingUser = await UserModel.findOne({
			email,
		});

		if (existingUser) {
			return response(
				c,
				409,
				false,
				message.alreadyExists(`Email ${email}`),
			);
		}

		// Check if password is strong
		if (!validator.isStrongPassword(password)) {
			return response(
				c,
				400,
				false,
				"Password must contain one uppercase, lowercase, number, special character and must be at least 8 characters long",
			);
		}

		// Encrypt Password
		const hashedPassword = await bcrypt.hashSync(password, 10);

		const dob = convertToValidDate(date_of_birth);

		//Create the user & save to DB.
		const user = await UserModel.create({
			profile,
			firstname,
			lastname,
			email,
			date_of_birth: dob,
			password: hashedPassword,
		});

		//  Initialize other tables
		const { accessToken, refreshToken } = await runSignupActions(c, user);

		// Return response with session tokens and also a redirect url to direct the user to the email verification page.
		return response(c, 201, true, message.successCreate("Account"), {
			refresh_token: refreshToken,
			access_token: accessToken,
			tmdb_access_token: process.env.TMDB_ACCESS_TOKEN_AUTH!,
			email_active: user.email_active,
		});
	} catch (err) {
		return response.serverError(c, err);
	}
};

export const logout = async (c: Context) => {
	try {
		const { refresh_token } = await c.req.param();

		// No need to validate the token. Check session table for existing session
		const existingSession = await sessionManager.getSession(refresh_token);
		if (!existingSession) {
			return response(c, 401, false, "Session expired");
		}

		try {
			await sessionManager.invalidateSession(existingSession._id);
		} catch (err) {
			return response(
				c,
				401,
				false,
				"Session expired",
				null,
				catchError(err),
			);
		}

		return response(c, 200, true, "Successfully logged out");
	} catch (err) {
		return response.serverError(c, err);
	}
};

export const logoutAll = async (c: Context) => {
	try {
		const user = (await c.get("user")) as UserContextI;

		// Fin existing sessions and if non return error
		const existingSession = await sessionManager.getAllSessions(user.id);
		if (existingSession.length === 0) {
			return response(c, 401, false, "Session expired");
		}

		// Logout all sessions
		await sessionManager.invalidateAllSessions(user.id);

		return response(
			c,
			200,
			true,
			"Successfully logged out from all sessions",
		);
	} catch (err) {
		return response.serverError(c, err);
	}
};

// Request to rest your passowrd
export const forgotAccountPassword = async (c: Context) => {
	try {
		let body = await c.req.json();

		if (!body) {
			return response(c, 400, false, missingReqMsg.body);
		}

		const { email } = body;

		// Get missing required fields
		const missingFields = getMissingOrEmptyFields(body, ["email"]);

		if (missingFields.length > 0) {
			return response(c, 400, false, getMissingFieldMessage(missingFields));
		}

		// Check if user exists
		const existingUser = await UserModel.findOne({
			email,
		});

		if (!existingUser) {
			return response(c, 400, false, message.notFound("User"));
		}

		// Invalidate all of users active sessions
		await sessionManager.invalidateAllSessions(existingUser._id);

		// Create a validation token for the user to reset
		const resetToken = generateToken(
			{ user_id: existingUser._id },
			process.env.JWT_Token_Model_EXP,
		);

		// Delete all previous token created by this controller
		await TokenModel.deleteMany({
			user_id: existingUser._id,
			purpose: "reset_password",
		});

		// Store the reset token to DB.
		await TokenModel.create({
			user_id: existingUser._id,
			token: resetToken,
			purpose: "reset_password",
		});

		// Store the created OTP
		let generatedOTP;

		try {
			generatedOTP = await generateSixDigitCode();
		} catch (err) {
			return response(
				c,
				500,
				false,
				"Failed to generate OTP. Please try again",
				null,
				err,
			);
		}

		await TokenModel.create({
			user_id: existingUser._id,
			token: generatedOTP,
			purpose: "reset_password",
		});

		// Send email to the user with the generatedOTP

		// Success
		return response(
			c,
			200,
			true,
			`An otp has been sent to your email ${existingUser.email}`,
			{
				reset_token: resetToken,
				otp: generatedOTP, // TODO: Remove this in PROD
			},
		);
	} catch (err) {
		return response.serverError(c, err);
	}
};

export const resetAccountPassword = async (c: Context) => {
	try {
		const params = await c.req.param();
		const body = await c.req.json();

		if (!params) {
			return response(c, 400, false, missingReqMsg.params);
		}
		if (!body) {
			return response(c, 400, false, missingReqMsg.body);
		}

		const { reset_token } = params;
		const { password, confirm_password, otp } = body;

		// Validate the token
		let decodedToken;
		try {
			decodedToken = verifyToken(reset_token);
		} catch (err) {
			console.error(err);
			return response(
				c,
				401,
				false,
				"Invalid or expired token",
				null,
				catchError(err),
			);
		}

		const { user_id } = decodedToken as { user_id: string };

		// Ensure no missing fields
		const missingFields = getMissingOrEmptyFields(body, [
			"password",
			"confirm_password",
			"otp",
		]);
		if (missingFields.length > 0) {
			return response(c, 400, false, getMissingFieldMessage(missingFields));
		}

		// Check if passwords match
		if (confirm_password !== password) {
			return response(c, 400, false, "Passwords do not match");
		}

		if (!validator.isStrongPassword(password)) {
			return response(
				c,
				400,
				false,
				"Password must contain one uppercase, lowercase, number, special character and must be at least 8 characters long",
			);
		}

		// Get the existing JWT reset token
		const existingResetToken = await TokenModel.findOne({
			user_id,
			token: reset_token,
			purpose: "reset_password",
		});

		if (!existingResetToken) {
			return response(c, 401, false, message.unauthorized());
		}

		// Get the existing OTP in token table
		const existingOTP = await TokenModel.findOne({
			user_id,
			token: otp,
			purpose: "reset_password",
		});

		if (!existingOTP) {
			return response(c, 400, false, "Invalid OTP");
		}

		// Hash and update the user password
		const hashedPassword = await bcrypt.hashSync(password, 10);
		await UserModel.findOneAndUpdate(
			{
				_id: user_id,
			},
			{
				password: hashedPassword,
			},
		);

		// Delete all user reset otp and token, relating to the reset password
		await TokenModel.deleteMany({
			user_id,
			purpose: "reset_password",
		});

		return response(c, 200, true, message.successUpdate("Account password"));
	} catch (err) {
		return response.serverError(c, err);
	}
};

export const verifyEmail = async (c: Context) => {
	try {
		const user: UserContextI = await c.get("user");
		let body;

		try {
			body = await c.req.json();
		} catch (err) {
			return response(c, 400, false, missingReqMsg.body);
		}

		const { otp, request_otp } = body;

		// Check for existing user
		const existingUser = await UserModel.findOne({ _id: user.id });

		if (!existingUser) {
			return response(c, 400, false, message.notFound("User"));
		}

		// Check if user email is verified
		if (existingUser.email_active) {
			return response(c, 400, false, "Email already verified");
		}

		// If there is no OTP provided, we send OTP code to the user's email, so that the second time they already have an OTP to validate their mail.
		if (request_otp && !otp) {
			let generatedOTP;
			try {
				generatedOTP = await generateSixDigitCode();
			} catch (err) {
				return response(
					c,
					500,
					false,
					"Failed to generate OTP. Please try again.",
					null,
					catchError(err),
				);
			}

			// Delete all previously created tokens
			await TokenModel.deleteMany({
				user_id: existingUser._id,
				purpose: "email_verification",
			});

			// Store the generated otp in DB
			await TokenModel.create({
				user_id: existingUser._id,
				token: generatedOTP,
				purpose: "email_verification",
			});

			//TODO: Send user an email with generated OTP

			return response(
				c,
				200,
				true,
				`An otp has been sent to your email ${existingUser.email}`,
				{
					otp: generatedOTP,
				},
			);
		}

		// Check if otp is valid
		const existingOTP = await TokenModel.findOne({
			token: otp,
			user_id: existingUser._id,
		});

		if (!existingOTP) {
			return response(c, 400, false, "Provided OTP is invalid");
		}

		// Set the user email active.
		existingUser.email_active = true;
		existingUser.save();

		// Delete all previously created tokens
		await TokenModel.deleteMany({
			user_id: existingUser._id,
			purpose: "email_verification",
		});

		return response(c, 200, true, "Account email verified successfully");
	} catch (err) {
		return response.serverError(c, err);
	}
};
