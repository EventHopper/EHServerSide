/* eslint-disable require-jsdoc */

import {CLIENT_PORT as PORT} from '../../common/utils/config';
import EventsController from '../events/events.controller';
import App from '../app';

// function loggerMiddleware(request: express.Request,
//     response: express.Response, next) {
//   console.log(`${request.method} ${request.path}`);
//   next();
// }

const app = new App([
  new EventsController(),
],
Number(PORT));

app.listen();

// eventRouter(app);

// app.get('/', (req, res) => {
//   res.send('Express + Typescript server running without a hick');
// });

// app.listen(PORT, () => {
//   console.log(`app is running at port ${PORT}`);
// });
