// import startApp from "./api/app";
import startApp from "./src/api/app";
import connectDb from "./src/db/database";
import config from "./src/env";

const PORT = process.env.PORT || 3085;
connectDb(config.MONGO_URI);
const app = startApp(config.MONGO_URI, true);

app.listen(PORT, () => console.log("Server is running on " + PORT));
