/* eslint-disable no-unused-vars */
/* eslint-disable require-jsdoc */
import Auth from '../../auth/server_auth';
import EventController from '../events/events.controller';
import * as express from 'express';

export interface ControllerInterface {
  router: express.Router;
  initializeRoutes(): void;
  setAuthObject: (authObject: Auth) => void;
}

export function createController(
  Controller: any,
  authObject: Auth
): ControllerInterface {
  return new Controller(authObject);
}

export type Controller = EventController;
