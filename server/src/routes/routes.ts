import { Hono } from "hono";
import authRoute from "./auth.route";
import { routeConst } from "../constants/route.const";
import profileRoute from "./profile.route";
import bookmarkRoute from "./bookmark.route";

const router = new Hono();

// Index
router.get(routeConst.index, (c) => c.text("Server is running..."));

// Authentication
router.route(routeConst.auth.base, authRoute);
router.route(routeConst.profile.base, profileRoute);
router.route(routeConst.bookmark.base, bookmarkRoute);

export default router;
