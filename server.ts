import express from "express";
import * as bodyParser from "body-parser";
import path from "path";
import { cfRouter } from "./routes/cfRouter";

const app = express();

app.set("view engine", "ejs");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname + "/static")));
app.use("/", cfRouter);

const PORT = <unknown>process.env.PORT as number;
const HOST = process.env.HOST as string;
app.listen(PORT, HOST, (): void => {
    console.log(`Server listening on http://${HOST}:${PORT}`);
});