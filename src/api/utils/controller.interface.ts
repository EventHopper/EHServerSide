/* eslint-disable no-unused-vars */
/* eslint-disable require-jsdoc */
import Auth from '../../auth/server_auth';
import EventsController from '../events/events.controller';
import UserController from '../users/users.controller';
import CalendarController from '../calendar/calendar.controller';
import * as express from 'express';

export interface ControllerInterface {
  router: express.Router;
  initializeRoutes(): void;
  setAuthObject: (authObject: Auth) => void;
}

export function createController(
  Controller: any,
  authObject: Auth,
): ControllerInterface {
  return new Controller(authObject);
}


export type {EventsController};
export type {UserController};
export type {CalendarController};
