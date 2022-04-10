import mongoose from "mongoose";
import { IUser } from "../../types";

const userSchema = new mongoose.Schema<IUser>({
	email: {
		type: String,
		required: true,
		unique: true,
	},
	username: {
		type: String,
		required: true,
	},
	password: {
		type: String,
		required: true,
	},
});

export default mongoose.model<IUser>("User", userSchema);
