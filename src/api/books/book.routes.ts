import express from "express";
const router = express.Router();
import { isAuth, isBookCreator, validateBook } from "../../middleware";
import { wrapAsync } from "../../utils";
import {
	createBook,
	deleteBook,
	getBook,
	getBooks,
	updateBook,
} from "./book.controller";

router
	.route("/")
	.get(isAuth, wrapAsync(getBooks))
	.post(isAuth, validateBook, wrapAsync(createBook));

router
	.route("/:bookId")
	.get(isAuth, isBookCreator, wrapAsync(getBook))
	.patch(isAuth, isBookCreator, validateBook, wrapAsync(updateBook))
	.delete(isAuth, isBookCreator, wrapAsync(deleteBook));

export default router;
