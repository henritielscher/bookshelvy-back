import express, { ErrorRequestHandler } from "express";
import morgan from "morgan";
import books from "./books/book.routes";
import users from "./users/user.routes";
import ExpressError from "../ExpressError";
import config from "../env";
import cors from "cors";

// AUTHENTIFICATION
import session, { SessionOptions } from "express-session";
import MongoDBStore from "connect-mongo";
import mongoose from "mongoose";
export default function (databaseUrl: string, hasMongoSessionStore: boolean) {
	const app = express();
	const sessionConfig: SessionOptions = {
		secret: config.SESSION_SECRET,
		store: undefined,
		cookie: {
			httpOnly: true,
			maxAge: 1000 * 60 * 60 * 24 * 7,
			secure: process.env.npm_lifecycle_event === "dev" ? false : true,
			sameSite:
				process.env.npm_lifecycle_event === "dev" ? "strict" : "none",
		},
		saveUninitialized: false,
		resave: false,
		proxy: true,
	};

	if (hasMongoSessionStore) {
		sessionConfig.store = MongoDBStore.create({
			client: mongoose.connection.getClient(),
			mongoUrl: config.MONGO_URI,
		});
	}

	app.use(
		cors({
			origin: [
				"http://localhost:3006",
				"https://booklist-frontend.vercel.app",
			],
			credentials: true,
		})
	);
	app.use(session(sessionConfig));
	app.use(express.json());
	app.use(morgan("dev"));
	app.use("/books", books);
	app.use("/users", users);

	// ERROR HANDLING

	const errHandler: ErrorRequestHandler = (err, req, res, next) => {
		console.log("Error Route");
		const error = new ExpressError("Route not found", 404);
		next(error);
	};

	const catchAllErrHandler: ErrorRequestHandler = (err, req, res, next) => {
		const { statusCode = 500 } = err;
		if (!err.message) err.message = "Something went wrong!";
		console.log(err);
		res.status(statusCode).json(err);
	};

	app.all("*", errHandler);
	app.use(catchAllErrHandler);

	return app;
}
