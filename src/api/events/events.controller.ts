/* eslint-disable no-invalid-this */
/* eslint-disable new-cap */
/* eslint-disable require-jsdoc */
/* eslint-disable no-unused-vars */
/* eslint-disable max-len */
// const EventModel = require('../../models/events/events.model');
import * as EventModel from '../../models/events/events.model';
import * as EventManager from '../../models/events/event_manager.model';
import * as express from 'express';
import Auth from '../../auth/server_auth';
import {ControllerInterface} from '../utils/controller.interface';
import Debug from 'debug';
const debug = Debug('events.controller');

export default class EventsController implements ControllerInterface {
  public path = '/events';
  public updatePath = '/events/:id';
  public router = express.Router();
  private _auth:Auth;
  private valid_filters:string[]; 

  constructor() {
    this.initializeRoutes();
    this._auth = new Auth();
    this.valid_filters = new Array('date_before','category','tags', 'date_after'); 
  }

  public setAuthObject = (authObject:Auth)=>{
    this._auth = authObject;
  }

  public initializeRoutes() {
    this.router.get(this.path, this.pathResolver);
    this.router.post(this.updatePath, this.update);
  }

  public update = (req:express.Request, res:express.Response) => {
    if (req.body) {
      EventManager.updateEventManager(req.params.id, req.body)
        .then((result:any) => {
          return res.status(200).send({id: result._id});
        });
    } else {
      res.json('Cannot Update EventManager Event: Request Body Empty');
    }
  };

  public pathResolver = (req:express.Request, res:express.Response) => {
  
    if(!req.query){
      res.status(400).json('Invalid search index');
    }

    /*Parse pagination parameters  */
    const size:number = req.query.limit &&
     Number.parseInt(String(req.query.limit)) <= 100 ? parseInt(String(req.query.limit)) : 10;
    let page:number = 0;
    if (req.query.page) {
      let pageParam:number = parseInt(String(req.query.page));
      page = Number.isInteger(pageParam) ? pageParam : 0;
    }

    /*  Parse endpoints  */
    if(!req.query.index){ //no query index, return all events 
      return this.listAll(res, size, page);
    }
    let endpoint:string = String(req.query.index);
    switch(endpoint){
    case 'id':  //find event by ID
      this.byID(req, res);
      break;
    case 'location':
      this.byLocation(req,res,size,page);
      break;
    case 'venue':
      this.byVenue(req,res,size,page);
      break;
    default:
      res.status(400).json('Invalid search index');
      break;
    }
  };

  private generateFilterQuery = (req:express.Request, query: {[k: string]: any}) => {
    for (var param in req.query) {
      if(this.valid_filters.includes(param)){ //add to query
        switch(param){
        case 'date_after':  //find all events after this date
          let afterDateQuery: {[k: string]: any}  = {'$gt' : new Date(`${req.query[param]}`)};
          query['start_date_utc'] = afterDateQuery;
          break;
        case 'date_before':
          let beforeDateQuery: {[k: string]: any}  = {'$lt' : new Date(`${req.query[param]}`)};
          query['start_date_utc'] = beforeDateQuery;
          break;
        case 'tags': //include events which contain the specified tags
          let tags:string[] = String(req.query[param]).split(',');
          let tagsQuery: {[k: string]: any}  = {'$in' : tags};
          query['tags'] = tagsQuery;
          break;
        case 'category': //include events which contain the specified categories
          let category:string[] = String(req.query[param]).split(',');
          let categoryQuery: {[k: string]: any}  = {'$in' : category};
          query['category'] = categoryQuery;
        default:
          break;
        }
      }
    }  
  };

  private byID = (req:express.Request, res:express.Response) => {
    
    if(!req.query.id){
      return res.status(400).json('Invalid ID provided to search endpoint'); 
    }
    const id:string = String(req.query.id);
    EventModel.byID(id)
      .then((result: any) => {
        return res.status(200).send(result);
      }).catch(error => {
        return res.status(400).json('No such event exists');
      });
  };

  private byVenue = (req:express.Request, res:express.Response, size:number, page:number) => {
    
    if(!req.query.name){ //city or coordinates not provided
      return res.status(400).json('Invalid venue name'); 
    }

    const venueName:string = String(req.query.name);
    let query: {[k: string]: any}  = {'venue.name' : venueName};

    /*Handle filters */
    this.generateFilterQuery(req, query); //add filter query to query objects
    debug(query);
   
    EventModel.list(size, page, query)
      .then((result: any) => {
        return res.status(200).send(result);
      }).catch(error => {
        return res.status(400).json('No such event exists');
      });
  }

  private byLocation = (req:express.Request, res:express.Response, size:number, page:number) => {
    
    if(!(req.query.city || req.query.lat)){ //city or coordinates not provided
      return res.status(400).json('Invalid query parameters provided to search endpoint'); 
    }
    if(req.query.city) { //search by city
      const desiredCity:string = String(req.query.city);
      let query: {[k: string]: any}  = {'venue.city' : desiredCity};
      /*Handle filters */
      this.generateFilterQuery(req, query); //add filter query to query objects
      debug(query);

      EventModel.list(size, page, query)
        .then((result: any) => {
          return res.status(200).send(result);
        }).catch(error => {
          return res.status(400).json('No such event exists');
        });
    }
    const radius:number = Number(req.query.radius); 
    if(req.query.long && req.query.lat){
      let query: {[k: string]: any}  = {};
      this.generateFilterQuery(req, query); //add filter query to query objects
      debug(query);
      EventModel.byLatLong(size, page, Number(req.query.long), Number(req.query.lat), query, radius)
        .then((result: any) => {
          return res.status(200).send(result);
        }).catch(error => {

          debug(error);
          res.status(400).json('No such event exists');

        });;
    }
  };
  public listAll = (res:express.Response, size:number, page:number) => { //all events, no query

    debug('%i, %i', size, page);
    EventModel.list(size, page)
      .then((result: any) => {
        return res.status(200).send(result);
      }).catch(error => {
        return res.status(500).json(error);
      });
  };
}
