import { ObjectId } from "mongoose";
import { UserModelI } from "./user.interface";
import { MongooseIdI } from "./mongoose.interface";

export type ContentTypeT = "trailers" | "both";
export type VideoQualityT = "SD" | "HD" | "4K";
export type PlanNameT = "free" | "basic" | "standard" | "premium" | "family";

// The Plan Interface and its schema
export type PlanI = Record<
	PlanNameT,
	{
		cost: number;
		features: {
			contentAccess: ContentTypeT;
			videoQuality: VideoQualityT;
			simultaneousStreams: number;
			maxProfiles: number;
			ads: boolean;
			offlineDownloads: boolean;
			exclusiveContent: boolean;
			watchParty: boolean;
			parentalControls: boolean;
		};
	}
>;

// User Model Plans
export type PlanDurationT = "monthly" | "yearly" | null;
export interface PlanModelI {
	_id: MongooseIdI;
	user_id: MongooseIdI;
	name: PlanNameT;
	duration?: PlanDurationT;
	expired?: boolean;
	expiresAt?: Date | null;
}
