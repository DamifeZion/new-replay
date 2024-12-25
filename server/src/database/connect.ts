import mongoose from "mongoose";

const dbConnect = async () => {
	try {
		await mongoose.connect(process.env.MONGO_DB_URI!);
		console.log("✅ DB Connection Successful...");
	} catch (err) {
		console.error("❌ Failed to connect to DB: ", err);
		process.exit(1);
	}
};

export default dbConnect;
