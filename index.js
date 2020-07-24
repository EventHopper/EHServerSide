require("dotenv").config();
const aggregator = require("./event_aggregator/aggregator"); //for testing, move to routes later
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const EventsRouter = require("./events/routes.config");
const Location = require("./common/utils/location");

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
  region: "PA",
  city: "Philadelphia",
/**** Testing for Event Aggregation TODO: move to routes *****/

var getLocation = async () => {
  const res = await Location.constructLocation(40.10889, -93.346420); //the hardcoded numbers will be replaced by the user's latlong
  return res;
};

(async () => {
  let location = await getLocation();
  console.log(location);
  aggregator.aggregate(location);
})();

/*------------------------End of Testing section------------------> */
app.listen(process.env.PORT, function () {
  console.log("app listening at port %s", process.env.PORT);
});
