import { PlanI } from "../interfaces/plan.interface";

export const plansConst: PlanI = {
	free: {
		cost: 0,
		features: {
			contentAccess: "trailers",
			videoQuality: "SD",
			simultaneousStreams: 1,
			maxProfiles: 1,
			ads: true,
			offlineDownloads: false,
			exclusiveContent: false,
			watchParty: false,
			parentalControls: false,
		},
	},
	basic: {
		cost: 8,
		features: {
			contentAccess: "both",
			videoQuality: "SD",
			simultaneousStreams: 1,
			maxProfiles: 2,
			ads: false,
			offlineDownloads: false,
			exclusiveContent: false,
			watchParty: false,
			parentalControls: true,
		},
	},
	standard: {
		cost: 12,
		features: {
			contentAccess: "both",
			videoQuality: "HD",
			simultaneousStreams: 2,
			maxProfiles: 3,
			ads: false,
			offlineDownloads: true,
			exclusiveContent: false,
			watchParty: true,
			parentalControls: true,
		},
	},
	premium: {
		cost: 18,
		features: {
			contentAccess: "both",
			videoQuality: "4K",
			simultaneousStreams: 4,
			maxProfiles: 6,
			ads: false,
			offlineDownloads: true,
			exclusiveContent: true,
			watchParty: true,
			parentalControls: true,
		},
	},
	family: {
		cost: 25,
		features: {
			contentAccess: "both",
			videoQuality: "4K",
			simultaneousStreams: Infinity,
			maxProfiles: Infinity,
			ads: false,
			offlineDownloads: true,
			exclusiveContent: true,
			watchParty: true,
			parentalControls: true,
		},
	},
};
