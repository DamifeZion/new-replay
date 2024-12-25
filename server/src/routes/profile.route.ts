import { Hono } from "hono";
import { routeConst } from "../constants/route.const";
import {
	createProfile,
	deleteProfile,
	editProfile,
	getAllProfile,
	getProfile,
} from "../controllers/profile.ctrl";
import { JwtMiddleWare } from "../middlewares/jwt.middleware";

const profileRoute = new Hono();

profileRoute.use(JwtMiddleWare);
profileRoute.get(routeConst.profile.getProfile, getProfile);
profileRoute.get(routeConst.index, getAllProfile);
profileRoute.post(routeConst.index, createProfile);
profileRoute.put(routeConst.profile.editProfile, editProfile);
profileRoute.delete(routeConst.profile.deleteProfile, deleteProfile);

export default profileRoute;
