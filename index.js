const express = require("express");
const exphbs = require("express-handlebars");
const bodyParser = require("body-parser");
var session = require("express-session");

const PORT = process.env.PORT || 5000;
const app = express();

var dotenv = require("dotenv");

// Enable telemetry collection with Application Insights
var ai = require("applicationinsights");
ai.setup(
  process.env.APPLICATIONINSIGHTSKEY || "372f6744-e99b-448b-89fb-093b77f69cc3"
).start();
dotenv.config();

//Import Routes Controller
const routesController = require("./controllers/routes/routes");

// using express bodyparser to intercept the route and get data from form.
app.use(bodyParser.urlencoded({ extended: true }));

//Handlebars Configuaration
app.engine("handlebars", exphbs());
app.set("view engine", "handlebars");

//Database Configuration
require("./config/db/db.config");

// Access Static files in Public folder
app.use("/public", express.static("public"));

//Configure Session
app.use(
  session({
    name: "swiggy-clone",
    secret: "A Swiggy Clone Application",
    resave: false,
    saveUninitialized: true,
    cookie: {
      maxAge: 1000 * 60 * 60,
      sameSite: true
    }
  })
);

//All the routes will be redirected to controllers/routes/routes.js
app.use("/", routesController);

app.listen(PORT, function() {
  console.log(`Server is Listening on ${PORT}`);
});
