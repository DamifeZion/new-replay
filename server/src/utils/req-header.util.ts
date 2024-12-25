import { Context } from "hono";
import { getConnInfo } from "hono/bun";

export const getIpAddress = (c: Context): string => {
	return (
		getConnInfo(c).remote.address || c.req.header("x-forwarded-for") || ""
	);
};

export const getUserAgent = (c: Context): string => {
	return c.req.header("User-Agent") || "Unknown";
};
