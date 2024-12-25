import { Hono } from "hono";
import { routeConst } from "../constants/route.const";
import {
	forgotAccountPassword,
	login,
	logout,
	logoutAll,
	refreshSession,
	register,
	resetAccountPassword,
	verifyEmail,
} from "../controllers/auth.ctrl";
import { JwtMiddleWare } from "../middlewares/jwt.middleware";

const authRoute = new Hono();

authRoute.get(routeConst.auth.refresh, refreshSession);
authRoute.get(routeConst.auth.logout, logout);
authRoute.post(routeConst.auth.login, login);
authRoute.post(routeConst.auth.register, register);
authRoute.post(routeConst.auth.forgotPassword, forgotAccountPassword);
authRoute.post(routeConst.auth.resetPassword, resetAccountPassword);

// Protected route
authRoute.post(routeConst.auth.verifyEmail, JwtMiddleWare, verifyEmail);
authRoute.get(routeConst.auth.logoutAll, JwtMiddleWare, logoutAll);

export default authRoute;
