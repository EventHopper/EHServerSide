/* eslint-disable require-jsdoc */

import {CLIENT_PORT as PORT} from '../../common/utils/config';
import EventsController from '../../api/events/events.controller';
import UserController from '../../api/users/users.controller';
import App from '../app';

const app = new App([
  new EventsController(),
  new UserController(),
],

Number(PORT));

app.listen();
