import express from "express";
import * as nunjucks from "nunjucks";
import * as path from "path";
import * as config from "./config";
import logger from "./utils/logger";
import router from "./routes";

const app = express();

// set some app variables from the environment
app.set("port", config.PORT);
app.set("dev", config.NODE_ENV === "development");

// set up the template engine
nunjucks.configure([
  "views"
], {
  autoescape: true,
  express: app,
});

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "html");

// apply our default router to /
app.use("/", router);

logger.info(`${config.APPLICATION_NAME} has started.`);
export default app;
