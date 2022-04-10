class ExpressError extends Error {
	msg: string;
	statusCode: number;

	constructor(msg: string, statusCode: number) {
		super();
		this.msg = msg;
		this.statusCode = statusCode;
	}
}

export default ExpressError;
