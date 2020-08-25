import * as aggregator from './services/aggregator/aggregator';
import express from 'express';
import * as bodyParser from 'body-parser';
import * as EventsRouter from './src/api/events/routes.config';
import * as constants from './common/public/constants';
import * as Location from './common/utils/location';
import * as LocationModel from './models/location/location.model';
import {UPDATE_PORT as PORT} from './common/utils/config';


const app = express();

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE');
  res.header('Access-Control-Expose-Headers', 'Content-Length');
  res.header(
    'Access-Control-Allow-Headers',
    'Accept, Authorization, Content-Type, X-Requested-With, Range',
  );
  if (req.method === 'OPTIONS') {
    return res.send(200);
  } else {
    return next();
  }
});

app.use(bodyParser.json());
app.set('view engine', 'ejs');
EventsRouter.routesConfig(app);

/* <-------------------------------------------------------------
Sanity check */

const location = {
  country: 'United States of America',
  country_code: 'US',
  region_code: 'PA',
  city: 'Philadelphia',
};

(async() => {
  // let location = await getLocation();
  // console.log(location);

  // LocationModel.saveLocation(location);
  aggregator.aggregate(location);
  // update.updateJob();
})();

app.get('/', (req, res) => {
  res.json(constants.API_HOME_MESSAGE);
});

/* ------------------------End of Testing section------------------> */

app.listen(PORT, function() {
  console.log(`app listening at port ${PORT}`);
});
