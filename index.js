require("dotenv").config();
const aggregator = require("./services/aggregator/aggregator"); //TODO: for testing, move to routes later
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const EventsRouter = require("./api/events/routes.config");
const constants = require("./common/public/constants");
const Location = require("./common/utils/location");
const LocationModel = require("./models/location/location.model");
const update = require("./jobs/update_job/index");

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
app.set('view engine', 'ejs');
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

app.get('/', (req, res) => { 
    res.json(constants.API_HOME_MESSAGE);
})

/*------------------------End of Testing section------------------> */
app.listen(process.env.PORT, function () {
  console.log("app listening at port %s", process.env.PORT);
});
