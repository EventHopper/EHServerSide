/* eslint-disable require-jsdoc */

import {CLIENT_PORT as PORT} from '../../common/utils/config';
import EventsController from '../../api/events/events.controller';
import UserController from '../../api/users/users.controller';
import CalendarController from '../../api/calendar/calendar.controller';
import App from '../app';

const events = new EventsController();
const users = new UserController();
const calendar = new CalendarController();

const app = new App([
  events,
  users,
  calendar
],

Number(PORT));

app.listen();
