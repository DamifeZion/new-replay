import mongoose from "mongoose";
import { BookmarkI } from "../../interfaces/bookmark.interface";

const bookmartSchema = new mongoose.Schema<BookmarkI>({
   user_id: {
      type: mongoose.Schema.Types.ObjectId,
		ref: "users",
		required: true,
	},
   video_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "videos",
      required: true,
      unique: true,
   },
	title: {
		type: String,
		required: true,
	},
	poster_path: {
		type: String,
		required: true,
	},
});

export const BookmarkModel = mongoose.model("bookmarks", bookmartSchema);
