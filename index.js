const config = require("./common/config/env.config"); //TODO: change config file to env variable
const aggregator = require("./event_aggregator/aggregator"); //for testing, move to routes later

const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const EventsRouter = require("./events/routes.config");

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Methods", "GET,HEAD,PUT,PATCH,POST,DELETE");
  res.header("Access-Control-Expose-Headers", "Content-Length");
  res.header(
    "Access-Control-Allow-Headers",
    "Accept, Authorization, Content-Type, X-Requested-With, Range"
  );
  if (req.method === "OPTIONS") {
    return res.send(200);
  } else {
    return next();
  }
});

app.use(bodyParser.json());
EventsRouter.routesConfig(app);

/* <------------------------------------------------------------- 
Testing for Event Aggregation */
var location = {
  country_code: "USA",
  region_name: "PA",
  city: "Philadelphia",
};

aggregator.aggregate(location);

/*------------------------End of Testing section-------------------------------------------> */
app.listen(config.port, function () {
  console.log("app listening at port %s", config.port);
});
