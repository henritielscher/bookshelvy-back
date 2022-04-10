import { ErrorRequestHandler, NextFunction, Response } from "express";

// type WrappedFunction = (req : Request, res: Response, next: NextFunction) => any

export function wrapAsync(fn: any): any {
	return (req: Request, res: Response, next: NextFunction) =>
		fn(req, res, next).catch((e: ErrorRequestHandler) => next(e));
}
