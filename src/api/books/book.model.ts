import mongoose from "mongoose";
import { IBook } from "../../types";

const bookSchema = new mongoose.Schema<IBook>({
	author: {
		type: String,
		required: true,
		minlength: 3,
	},
	title: {
		type: String,
		required: true,
		minlength: 3,
	},
	creator: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User",
	},
});

export default mongoose.model<IBook>("Book", bookSchema);
