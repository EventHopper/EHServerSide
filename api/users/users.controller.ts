/* eslint-disable no-invalid-this */
/* eslint-disable new-cap */
/* eslint-disable require-jsdoc */
/* eslint-disable no-unused-vars */
/* eslint-disable max-len */
// const EventModel = require('../../models/events/events.model');
// import * as UserModel from '../../models/events/events.model';
import * as express from 'express';
import {Schema, model, Document, Model} from 'mongoose';
import Auth from '../../auth/server_auth';
import {ControllerInterface} from '../utils/controller.interface';
// import EventModel from '../index';

class UserController implements ControllerInterface {
  public usersPath = '/users';
  public registrationPath = '/register';
  public loginPath = '/login';
  public router = express.Router();
  private _auth:Auth;

  constructor() {
    this.initializeRoutes();
    this._auth = new Auth();
  }

  public setAuthObject = (authObject:Auth)=>{
    this._auth = authObject;
  }

  public initializeRoutes() {
    this.router.get(this.usersPath, this.listUsers);
    this.router.post(this.registrationPath, this.createNewUser);
    this.router.post(this.loginPath, this.logIn);
  }

  createNewUser = (req:express.Request, res:express.Response) => {
    if (JSON.stringify(req.body) !== JSON.stringify({})) {

    } else {
      res.json('Cannot Create EventHopper User: Request Body Empty');
    }
  };

  logIn = (req:express.Request, res:express.Response) => {
    const username = req.query.username;
    const email = req.query.email;
    const password = req.query.passwordHash;

    if (JSON.stringify(req.body) !== JSON.stringify({})) {

    } else {
      res.json('Could not log in user');
    }
  };

  sendFriendRequest = (req:express.Request, res: express.Response) => {
    if (JSON.stringify(req.body) !== JSON.stringify({})) {

    } else {

    }
  }

  verifyPassword = function(username, password, done) {
    if (typeof password !== `string`) {
      done(new Error(`password should be a string`));
      return;
    }

    // computeHash(password, username.passwordHashOpts, function(err, hash) {
    //   if (err) {
    //     done(err);
    //     return;
    //   }

    //   done(null, hash === username.passwordHash);
    // });
  }

  listUsers = (req:express.Request, res:express.Response) => {

  };
}

export default EventsController;
