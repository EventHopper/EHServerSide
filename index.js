require("dotenv").config();
const aggregator = require("./events/aggregator/aggregator"); //for testing, move to routes later
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const EventsRouter = require("./events/routes.config");
const Location = require("./common/utils/location");
const LocationModel = require("./events/models/location.model");
const update = require("./events/update_job/index");

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
Testing for Event Aggregation TODO: move to routes */

// var getLocation = async () => {
//   const res = await Location.constructLocation(39.952583, -75.165222); //the hardcoded numbers will be replaced by the user's latlong
//   return res;
// };
var location = {	
  country: "United States of America",
  country_code: "US",
  region_code: "PA",	  
  city: "Philadelphia",
};

(async () => {
  // let location = await getLocation();
  // console.log(location);

  //LocationModel.saveLocation(location);
  aggregator.aggregate(location);
  //update.updateJob();
})();

/*------------------------End of Testing section------------------> */
app.listen(process.env.PORT, function () {
  console.log("app listening at port %s", process.env.PORT);
});
