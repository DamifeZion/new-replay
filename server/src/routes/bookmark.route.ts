import { Hono } from "hono";
import { routeConst } from "../constants/route.const";
import {
	getBookmarks,
	addBookmark,
	deleteBookmark,
} from "../controllers/bookmark.ctrl";
import { JwtMiddleWare } from "../middlewares/jwt.middleware";

const bookmarkRoute = new Hono();

bookmarkRoute.use(JwtMiddleWare);
bookmarkRoute.get(routeConst.index, getBookmarks);
bookmarkRoute.post(routeConst.index, addBookmark);
bookmarkRoute.delete(routeConst.bookmark.deleteBookmark, deleteBookmark);

export default bookmarkRoute;
