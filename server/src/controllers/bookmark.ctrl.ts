import { Context } from "hono";
import { response } from "../utils/response.util";
import { BookmarkI } from "../interfaces/bookmark.interface";
import {
	getMissingFieldMessage,
	getMissingOrEmptyFields,
} from "../utils/validation.util";
import { UserContextI } from "../interfaces/user.interface";
import { BookmarkModel } from "../database/models/bookmark.model";
import mongoose from "mongoose";
import { message } from "../constants/message.const";

/** Get all Bookmarks */
export const getBookmarks = async (c: Context) => {
	try {
		const user: UserContextI = await c.get("user");

		const bookmarks = await BookmarkModel.find({
			user_id: user.id,
		});

		return response(
			c,
			200,
			true,
			"Bookmarks retrieved successfully",
			bookmarks,
		);
	} catch (err) {
		return response.serverError(c, err);
	}
};

/** Add bookmark */
export const addBookmark = async (c: Context) => {
	try {
		const body: Partial<BookmarkI> = await c.req.json();
		const user: UserContextI = await c.get("user");

		const missingFields = getMissingOrEmptyFields(body, [
			"video_id",
			"title",
			"poster_path",
		]);

		if (missingFields.length > 0) {
			return response(c, 400, false, getMissingFieldMessage(missingFields));
		}

		const { video_id, title, poster_path } = body;

		//Validate ID
		if (!mongoose.Types.ObjectId.isValid(String(video_id))) {
			return response(c, 400, false, "The provided video ID is not valid");
		}

		// Check for existing bookmark.
		const existingBookmark = await BookmarkModel.findOne({ video_id });
		if (existingBookmark) {
			return response(
				c,
				400,
				false,
				"This video is already in your bookmarks",
			);
		}

		// Save the bookmark to DB
		await BookmarkModel.create({
			video_id,
			user_id: user.id,
			poster_path,
			title,
		});

		return response(
			c,
			201,
			true,
			"The bookmark was added successfully",
			null,
		);
	} catch (err) {
		return response.serverError(c, err);
	}
};

/** Remove bookmark */
export const deleteBookmark = async (c: Context) => {
	try {
		const { video_id } = await c.req.param();

		// Validate ID
		if (!mongoose.Types.ObjectId.isValid(video_id)) {
			return response(c, 403, false, message.invalidId("bookmark"));
		}

		// Attempt to delete the bookmark
		const deletedBookmark = await BookmarkModel.findOneAndDelete({
			video_id,
		});
		if (!deletedBookmark) {
			return response(
				c,
				404,
				false,
				message.notFound("bookmark"),
			);
		}

		return response(c, 200, true, "The bookmark was successfully deleted");
	} catch (err) {
		return response.serverError(c, err);
	}
};
