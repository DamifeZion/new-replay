import jwt from "jsonwebtoken";
import { UserModelI } from "../interfaces/user.interface";

const JWT_SECRET = process.env.JWT_SECRET!;

/**
 * Generate JWT Token
 * @param payload - Data to encode in the token
 * @param expiresIn - Token expiration time (e.g., '3h', '7d'). Default '3h'
 * @returns JWT Token as a string
 */
export const generateToken = (payload: object, expiresIn?: string): string => {
	const defaultExp = expiresIn || "3h";
	return jwt.sign(payload, JWT_SECRET, { expiresIn: defaultExp });
};

/** Generate user access refresh token */
generateToken.refresh = (user: UserModelI) => {
	return generateToken({ id: user._id }, process.env.JWT_REFRESH_EXP!);
};

/** Generate user access token */
generateToken.access = (user: UserModelI) => {
	return generateToken(
		{
			id: user._id,
			firstname: user.firstname,
			lastname: user.lastname,
			fullname: user.fullname,
			email: user.email,
		},
		process.env.JWT_ACCESS_EXP!,
	);
};

/**
 * Verify JWT Token
 * @param token - JWT token to verify
 * @returns Decoded payload if valid
 */
export const verifyToken = (token: string) => {
	return jwt.verify(token, JWT_SECRET);
};
