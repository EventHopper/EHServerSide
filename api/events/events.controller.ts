/* eslint-disable no-invalid-this */
/* eslint-disable new-cap */
/* eslint-disable require-jsdoc */
/* eslint-disable no-unused-vars */
/* eslint-disable max-len */
// const EventModel = require('../../models/events/events.model');
import * as EventModel from '../../models/events/events.model';
import * as express from 'express';
import {Schema, model, Document, Model} from 'mongoose';
import Auth from '../../auth/server_auth';
import {ControllerInterface} from '../utils/controller.interface';
import QueryBuilder from '../utils/graphql/query.builder';
import {QueryType} from '../utils/graphql/query.types';
// import EventModel from '../index';


export default class EventsController implements ControllerInterface {
  public path = '/events';
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
    this.router.get(this.path, this.list);
    this.router.post(this.path, this.insert);
  }

  public insert = (req:express.Request, res:express.Response) => {
    if (JSON.stringify(req.body) !== JSON.stringify({})) {
      EventModel.saveEvent(req.body)
        .then((result:any) => {
          return res.status(201).send({id: result._id});
        });
    } else {
      res.json('Cannot Create EventHopper Event: Request Body Empty');
    }
  };

  public list = (req:express.Request, res:express.Response) => {
    const size:number = req.query.limit &&
     Number.parseInt(String(req.query.limit)) <= 100 ? parseInt(String(req.query.limit)) : 10;
    let page:number = 0;
    if (req.query) {
      if (req.query.page) {
        let pageParam:number = parseInt(String(req.query.page));
        page = Number.isInteger(pageParam) ? pageParam : 0;
      }
    }

    console.log('%i, %i', size, page);
    EventModel.list(size, page)
      .then((result: any) => {
        res.status(200).send(result);
      });
  };
}
