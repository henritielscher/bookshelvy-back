import Book from "./book.model";

export const findBookById = async (id: string) => await Book.findById(id);

export const findBooksByUserId = async (userId: string) =>
	await Book.find({ creator: userId });

export const saveBook = async (
	author: string,
	title: string,
	userId: string
) => {
	const book = new Book({ author, title, creator: userId });
	await book.save();
	return book;
};

export const updateBook = async (
	bookId: string,
	author: string,
	title: string
) => await Book.findByIdAndUpdate(bookId, { author, title });

export const deleteBook = async (bookId: string) =>
	await Book.findByIdAndDelete(bookId);
