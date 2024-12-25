import mongoose from "mongoose";
import { MongooseIdI } from "./mongoose.interface";

export interface SessionI {
	_id: MongooseIdI;
	user_id: MongooseIdI;
	session_token: string;
	user_agent: string; // Track device or browser info
	ip_address: string; // Track user IP Address
}
