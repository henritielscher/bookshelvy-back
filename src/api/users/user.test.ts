jest.mock("./user.service");
import supertest from "supertest";
import startApp from "../app";
import express, { Application, Router } from "express";
import * as UserService from "./user.service";
import { Cookie } from "express-session";

let restClient: any;

let cookie: Cookie;

let mockDatabase = [
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
		email: "chip@chap.de",
		password: "password",
	},
];

beforeAll(async () => {
	restClient = supertest(startApp("", false));

	// SETTING COOKIE FOR AUTHENTICATION
	const { email, password } = mockDatabase[0];

	jest.spyOn(UserService, "findUserByEmail").mockImplementation(
		(email): any => {
			const user = mockDatabase.find((user) => user.email === email);
			return user;
		}
	);

	jest.spyOn(UserService, "validateUserPassword").mockResolvedValue(true);

	const response = await restClient
		.post("/users/login")
		.send({ email, password });

	cookie = response.headers["set-cookie"][0];

	expect(response.statusCode).toBe(200);
	expect(cookie).toMatch(/connect.sid/);
});

describe("Registering User", () => {
	test("Successful user registration", async () => {
		const mockBody = { email: "test@test.de", password: "password" };
		const { password, email } = mockBody;

		jest.spyOn(UserService, "findUserByEmail").mockResolvedValue(null);
		jest.spyOn(UserService, "saveUser").mockImplementation(
			async (email, password): Promise<any> => {
				const newUser = { email, password, _id: "4" };
				mockDatabase.push(newUser);
				return newUser;
			}
		);

		const response = await restClient
			.post("/users/register")
			.send(mockBody);
		expect(response.status).toBe(201);
		expect(mockDatabase.length).toBe(4);
		expect(response.body.message).toBeDefined();
		expect(response.body.userId).toBe("4");
		// expect(userValidation).toBeCalledTimes(1);
	});

	test("Register an existing user and get 400 error", async () => {
		const { email, password } = mockDatabase[3];
		jest.spyOn(UserService, "findUserByEmail").mockImplementation(
			(email): any => {
				const user = mockDatabase.find((user) => user.email === email);
				return user;
			}
		);
		const response = await restClient
			.post("/users/register")
			.send({ email, password });
		expect(response.statusCode).toBe(400);
		expect(response.body.message).toMatch(/does already exist/);
	});
});

describe("Login in a user", () => {
	test("logging in with correct credentials", async () => {
		const { password, email } = mockDatabase[0];

		jest.spyOn(UserService, "findUserByEmail").mockImplementation(
			(email): any => {
				const user = mockDatabase.find((user) => user.email === email);
				return user;
			}
		);

		jest.spyOn(UserService, "validateUserPassword").mockResolvedValue(true);

		const response = await restClient
			.post("/users/login")
			.set("Cookie", cookie)
			.send({ email, password });

		expect(response.statusCode).toBe(200);
		expect(response.body.user).toBeDefined();
		expect(response.body.message).toMatch(/logged in/);
		expect(response.body.user.email).toBe("achim@kunibert.de");
	});

	test("login with wrong password", async () => {
		const { password, email } = mockDatabase[0];

		jest.spyOn(UserService, "validateUserPassword").mockResolvedValue(
			false
		);

		const response = await restClient
			.post("/users/login")
			.send({ email, password });

		expect(response.statusCode).toBe(400);
		expect(response.body.message).toBeDefined();
		expect(response.body.message).toMatch(/was wrong/);
		expect(response.body.user).not.toBeDefined();
		expect(response.header["set-cookie"]).not.toBeDefined();
	});

	test("login with non-existing email", async () => {
		const mockBody = { email: "stimmt@nicht.de", password: "sagichnich" };
		jest.spyOn(UserService, "findUserByEmail").mockResolvedValue(null);
		const response = await restClient.post("/users/login").send(mockBody);

		expect(response.statusCode).toBe(400);
		expect(response.body.message).toMatch(/not exist/);
		expect(response.body.user).not.toBeDefined();
		expect(response.header["set-cookie"]).not.toBeDefined();
		expect(response.body.message).toBeDefined();
	});
});

describe("DELETE User", () => {
	test("deleting a user with correct user-session ID", async () => {
		const { _id } = mockDatabase[0];

		jest.spyOn(UserService, "findUserById").mockResolvedValue(
			mockDatabase[0] as any
		);

		jest.spyOn(UserService, "deleteUser").mockImplementation(
			async function (_id): Promise<any> {
				mockDatabase = mockDatabase.filter((user) => user._id !== _id);
			}
		);

		const res = await restClient
			.delete("/users/delete")
			.set("Cookie", cookie);

		expect(res.statusCode).toBe(200);
		expect(mockDatabase.length).toBe(3);
		expect(mockDatabase[0]._id).toBe("2");
	});
});

describe("Logout user", () => {
	test("if session is available to destroy", async () => {
		const res = await restClient
			.post("/users/logout")
			.set("Cookie", cookie);

		expect(res.statusCode).toBe(200);
	});

	test("if no user is found to logout", async () => {
		const res = await restClient.post("/users/logout");

		expect(res.statusCode).toBe(400);
	});
});
