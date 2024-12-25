import { Hono } from "hono";
import { convertFileSize } from "./utils/file-size.util";
import { logger } from "hono/logger";
import router from "./routes/routes";
import { serveStatic } from "hono/bun";
import { poweredBy } from "hono/powered-by";
import dbConnect from "./database/connect";
import { cors } from "hono/cors";
import { routeConst } from "./constants/route.const";

const app = new Hono({ strict: false });

/** Middlewares & Configurations */
app.use("*", logger()); // Request logging
app.use("*", poweredBy());
app.use(
	"*",
	cors({
		origin: process.env.NODE_ENV === "development" ? "*" : "",
		allowMethods: ["GET", "POST", "PUT", "DELETE"],
		credentials: true,
	}),
);
app.use("/static/*", serveStatic({ root: "./views" }));

/** Routes */
app.get(routeConst.index, (c) => c.text("Server is running..."));
app.route(routeConst.apiVersion, router);

/** DB Connection */
dbConnect()
	.then(() => {
		console.log("Connected to database successfully.");
	})
	.catch((err) => {
		app.get("/*", (c) => {
			return c.text(`Failed to connect to DB: ${err.message}`);
		});
	});

/** Start Server */
const port = process.env.PORT || 3000;
Bun.serve({
	fetch: app.fetch,
	port: Number(port),
	maxRequestBodySize: convertFileSize(2, "gb"),
});

/** Minor Error Handler */
app.onError((err, c) => {
	return c.text(`App Error: ${err.message}`);
});

export default app;
