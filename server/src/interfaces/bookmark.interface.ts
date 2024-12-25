import { MongooseIdI } from "./mongoose.interface";

export interface BookmarkI {
	_id: MongooseIdI;
	user_id: MongooseIdI;
	video_id: MongooseIdI;
	title: string;
	poster_path: string;
}
