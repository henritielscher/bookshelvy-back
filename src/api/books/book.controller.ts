import { Request, Response } from "express";
import Book from "./book.model";
import { CustomSessionData } from "../../types";
import * as Service from "./book.service";

export const getBooks = async (req: Request, res: Response) => {
	const session: CustomSessionData = req.session;
	const { id, username } = session.user;
	const books = await Service.findBooksByUserId(id);
	res.status(200).json({ books, username });
};

export const createBook = async (req: Request, res: Response) => {
	const session: CustomSessionData = req.session;
	const { id } = session.user;
	const { author, title } = req.body;
	if (!author || !title || !req.body) {
		return res.status(400).json({
			method: req.method,
			message: "Invalid data to create book",
		});
	}
	const book = await Service.saveBook(author, title, id);
	res.status(201).json(book);
};

export const getBook = async (req: Request, res: Response) => {
	const { bookId } = req.params;
	const book = await Service.findBookById(bookId);
	if (!book) {
		return res.status(404).json("No book found!");
	}
	res.status(200).json(book);
};

export const updateBook = async (req: Request, res: Response) => {
	const { bookId } = req.params;
	const { author, title } = req.body;
	const book = await Book.findByIdAndUpdate(bookId, { ...req.body });
	res.status(200).json({
		message: "Successfully updated Book",
		book: { ...req.body },
	});
};

export const deleteBook = async (req: Request, res: Response) => {
	const { bookId } = req.params;
	const book = await Service.deleteBook(bookId);
	res.status(200).json({ message: "Successfully deleted book", book });
};
