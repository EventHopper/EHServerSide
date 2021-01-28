/* eslint-disable require-jsdoc */

import {CLIENT_PORT as PORT} from '../../common/utils/config';
import EventsController from '../../api/events/events.controller';
import UserController from '../../api/users/users.controller';
import CalendarController from '../../api/calendar/calendar.controller';
import App from '../app';

const app = new App([
  new EventsController(),
  new UserController(),
  new CalendarController(),
],

Number(PORT));

app.listen();
