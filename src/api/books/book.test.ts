jest.mock("./book.service.ts");
jest.mock("../users/user.service.ts");

import { Cookie } from "express-session";
import startApp from "../app";
import supertest from "supertest";
import * as UserService from "../users/user.service";
import * as BookService from "./book.service";
import mongoose from "mongoose";

mongoose.Types.ObjectId;
let cookie: Cookie;
let restClient: any;

type MockBook = {
	_id: string | mongoose.Types.ObjectId;
	author: string;
	title: string;
	creator: string | mongoose.Types.ObjectId;
};

let mockBooks: MockBook[] = [
	{
		_id: "1",
		author: "Gott",
		title: "Die Bibel",
		creator: "1",
	},
	{
		_id: "2",
		author: "Helge Schneider",
		title: "Eiersalat - Eine Frau Geht Seinen Weg",
		creator: "2",
	},
	{
		_id: "3",
		author: "Bernd Bolle",
		title: "Design Patterns",
		creator: "2",
	},
	{
		_id: "4",
		author: "Matthias Reim",
		title: "Mein Schaffen",
		creator: "1",
	},
];

type MockUser = {
	_id: string;
	email: string;
	password: string;
};

const mockUsers: MockUser[] = [
	{
		_id: "1",
		email: "achim@kunibert.de",
		password: "password",
	},
	{
		_id: "2",
		email: "lollek@bollek.de",
		password: "password",
	},
	{
		_id: "3",
		email: "lollek@bollek.de",
		password: "password",
	},
];

const loginUser = async (user: MockUser) => {
	const { password, email } = user;

	// MOCKING DATABASE CALLS
	jest.spyOn(UserService, "findUserByEmail").mockImplementation(
		async (): Promise<any> => user
	);
	jest.spyOn(UserService, "validateUserPassword").mockResolvedValue(true);

	const res = await restClient.post("/users/login").send({ email, password });
	// SETTING COOKIE
	cookie = res.headers["set-cookie"][0];

	expect(res.statusCode).toBe(200);
	expect(cookie).toMatch(/connect.sid/);
};

const logoutUser = async () => {
	const res = await restClient.post("/users/logout");

	expect(res.statusCode).toBe(200);
};

beforeAll(async () => {
	restClient = supertest(startApp("", false));
});

describe("User interactions with Book Database", () => {
	test("if logged in user can see all of his/her posted books", async () => {
		const { _id } = mockUsers[0];
		await loginUser(mockUsers[0]);
		// mock finding user books in database
		jest.spyOn(BookService, "findBooksByUserId").mockImplementation(
			async (_id): Promise<any> =>
				mockBooks.filter((book) => book.creator === _id)
		);

		const res = await restClient.get("/books").set("Cookie", cookie);

		expect(res.statusCode).toBe(200);
		expect(res.body.length).toBe(2);
	});

	test("if logged in user can post a new book", async () => {
		const { _id } = mockUsers[0];
		const mockBook = {
			author: "Alfred E. Neuman",
			title: "MAD Müll",
		};

		jest.spyOn(BookService, "saveBook").mockImplementation(
			async (): Promise<any> => {
				const newBook = { ...mockBook, _id: "5", creator: _id };
				mockBooks.push(newBook);
			}
		);

		const res = await restClient
			.post("/books")
			.send(mockBook)
			.set("Cookie", cookie);

		expect(res.statusCode).toBe(201);
		expect(mockBooks.length).toBe(5);
	});

	test.only("if user can delete a book of his own", async () => {
		await loginUser(mockUsers[0]);
		jest.spyOn(BookService, "findBookById").mockImplementation(
			async (): Promise<any> => {
				return mockBooks.find((book) => book._id === "4") as MockBook;
			}
		);
		const res = await restClient.delete("/books/4").set("Cookie", cookie);
		expect(res.statusCode).toBe(200);
	});
});
