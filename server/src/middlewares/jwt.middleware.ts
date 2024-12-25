import { Context, Next } from "hono";
import { response } from "../utils/response.util";
import { verifyToken } from "../utils/jwt.util";
import { UserContextI } from "../interfaces/user.interface";
import { PlanModel } from "../database/models/plan.model";
import { message } from "../constants/message.const";

export const JwtMiddleWare = async (c: Context, next: Next) => {
	try {
		// Extract the Authorization header
		const authHeader = c.req.header("Authorization");
		if (!authHeader || !authHeader.startsWith("Bearer ")) {
			return response(c, 401, false, message.unauthorized());
		}

		// Extract token
		const token = authHeader.split(" ")[1];

		//Verify token
		const decodedToken = verifyToken(token) as UserContextI;
		if (!decodedToken) {
			return response(c, 401, false, message.unauthorized());
		}

		// Attach user payload to context
		const user = decodedToken;

		// Get user plan
		const userPlan = await PlanModel.findOne({ user_id: user.id });
		if (!userPlan) {
			return response(c, 403, false, "User does not have a plan");
		}

		c.set("user", {
			...user,
			plan: userPlan.name,
		});

		// Continue to the next handler
		await next();
	} catch (err) {
		console.error("JWT Verification Error:", err);
		return response(
			c,
			500,
			false,
			"Unauthorized: Invalid or expired token.",
			null,
			err,
		);
	}
};
