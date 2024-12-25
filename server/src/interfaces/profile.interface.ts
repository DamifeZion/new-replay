import { MongooseIdI } from "./mongoose.interface";

export interface ProfileModelI {
	_id: MongooseIdI;
	user_id: MongooseIdI;
	name: string;
	is_kids: boolean;
	avatar: string;
}
