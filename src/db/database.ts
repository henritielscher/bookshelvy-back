import mongoose from "mongoose";

const connectDb = async (dbUrl: string) => {
	try {
		await mongoose.connect(dbUrl);
		console.log("Database connected");
	} catch (err) {
		throw err;
	}
};

export const dropCollections = async () => {
	const collections = Object.keys(mongoose.connection.collections);
	for (const collecionName of collections) {
		const collection = mongoose.connection.collections[collecionName];
		try {
			await collection.drop();
		} catch (error) {
			if (error) return;
		}
	}
};

export default connectDb;
