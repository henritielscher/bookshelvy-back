import { NextFunction, Request, Response } from "express";
import { CustomSessionData } from "./types";
import { bookSchema, userSchema } from "./validation";
import { findBookById } from "./api/books/book.service";

export const isAuth = (req: Request, res: Response, next: NextFunction) => {
	const session: CustomSessionData = req.session;
	if (session.user) {
		next();
	} else {
		return res.status(401).json({ message: "You have to be logged in." });
	}
};

export const isBookCreator = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	const session: CustomSessionData = req.session;
	const { id } = session.user;
	const { bookId } = req.params;
	try {
		const book = await findBookById(bookId);
		if (!book) {
			return res
				.status(404)
				.json({ method: req.method, message: "No book found." });
		}
		if (!book?.creator.equals(id)) {
			return res.status(401).json("You have no permission to do that.");
		}
		next();
	} catch (error) {
		next(error);
	}
};

export const validateBook = (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	const { error } = bookSchema.validate(req.body);
	if (error) {
		return res.status(400).json({
			method: req.method,
			message: "Invalid data to update book.",
			error,
		});
	}
	next();
};

export const validateUser = (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	const { error } = userSchema.validate(req.body);
	if (error) {
		return res.status(400).json({
			method: req.method,
			message: "Invalid data to register a user.",
		});
	}
	next();
};
