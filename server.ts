import express from "express";
import * as bodyParser from "body-parser";
import path from "path";
import { cfRouter } from "./routes/cfRouter";

const app = express();

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname + "/frontend/static")));
app.use("/", cfRouter);

const PORT = <unknown>process.env.PORT as number;
const HOST = process.env.HOST as string;
app.listen(PORT, HOST, (): void => {
    console.log(`Server listening on http://${HOST}:${PORT}`);
});