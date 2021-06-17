/* eslint-disable no-invalid-this */
/* eslint-disable new-cap */
/* eslint-disable require-jsdoc */
/* eslint-disable no-unused-vars */
/* eslint-disable max-len */
import * as UserManager from '../../models/users/user_manager.model';
import * as express from 'express';
import {ControllerInterface} from '../utils/controller.interface';
import CalendarFunctions from '../../services/calendar/index';
import Auth from '../../auth/server_auth';
import CalendarRoutes from './calendar.routes.config';
import Debug from 'debug';

const debug = Debug('calendar.controller');

export default class CalendarController implements ControllerInterface {
  public router = express.Router();

  constructor() {
    this.initializeRoutes();
  }

  public setAuthObject = (authObject:Auth) => {
    
  }

  public initializeRoutes() {
    this.router.post(CalendarRoutes.addEventPath, this.addEventToCalendar);
    this.router.get(CalendarRoutes.freeBusyPath, this.getFreeBusy);
    this.router.get(CalendarRoutes.freeBusyIterativePath, this.getFreeBusyIteratively);
    this.router.get(CalendarRoutes.eventsListPath, this.listEvents);
  }

  /**
   * @route GET calendar/listevents/:userid
   * @documentation {https://docs.eventhopper.app/users#h.28k4ntj99bnx}
   */
  listEvents = async (req:express.Request, res:express.Response) => {
    
    const calendarCredentials = await this.getCalendarCredentials(req.params.userid, res);
    
    if (calendarCredentials == null) {
      return;
    } 
    const numberOfEvents:number = req.query.number? Number(req.query.number) : 10;
   
    const client_id: String = calendarCredentials.client_id;
    const calendarFunc:CalendarFunctions = new CalendarFunctions(client_id);
    const result = await calendarFunc.listEvents(calendarCredentials['refresh_token'], numberOfEvents);
    res.status(200).send(result);
    return;
  };

  getCalendarCredentials = async (userID:string, res:express.Response) => {
    if(userID == null){
      res.status(400).send({ message: 'Invalid Request. Please provide a user id', code: -2, result: ''});
      return null;
    }
    const calendarCredentials = await UserManager.getUserCalendarCredentials(String(userID));
    if (calendarCredentials == null) {
      res.status(404).send({ message: 'Error: User consent not given', code: -1, result: ''});
      return null;
    } 
    return calendarCredentials
  }
  /**
   * @route POST calendar/create/:userid
   * @documentation {https://docs.eventhopper.app/users#h.tdqa8qxms843}
   */
  addEventToCalendar = async (req:express.Request, res:express.Response) => {

    const calendarCredentials = await this.getCalendarCredentials(req.params.userid, res);
    
    if (calendarCredentials == null) {
      return;
    } 
    const id:string = req.body.eventid;
    if(id == null){
      res.status(400).send({ message: 'Error: No Event ID present', code: -3, link: ''});
    }
    const client_id: String = calendarCredentials.client_id;
    const calendarFunc:CalendarFunctions = new CalendarFunctions(client_id);
    const result = await calendarFunc.addToCalendar(calendarCredentials['refresh_token'], id);

    if(result!.code != 0){
      res.status(404).send(result);
    }else{
      res.status(200).json(result);
    }
  };

  /**
   * @route GET /freebusy/:userid
   * @documentation {https://docs.eventhopper.app/users#h.28k4ntj99bnx}
   */
  getFreeBusy = async (req:express.Request, res:express.Response) => {
    const calendarCredentials = await this.getCalendarCredentials(req.params.userid, res);
    
    if (calendarCredentials == null) {
      return;
    } 
    if(!(req.query.emails && req.query.start && req.query.end)){
      res.status(400).send({ message: 'Invalid Query Parameters', code: -1, result: ''});
    }
    const emails:string[] = String(req.query.emails).split(',');
    const startRange: Date = new Date(String(req.query.start));
    const endRange: Date = new Date(String(req.query.end));
    const client_id: String = calendarCredentials.client_id;
    const calendarFunc:CalendarFunctions = new CalendarFunctions(client_id);
    const result = await calendarFunc.getFreeBusy(calendarCredentials['refresh_token'], startRange, endRange, emails);
    res.status(200).json(result);
    return;
  };

  /**
   * @route GET /freebusyiteratve/:userids
   * @documentation {https://docs.eventhopper.app/users#h.28k4ntj99bnx}
   */
  getFreeBusyIteratively = async (req:express.Request, res:express.Response) => {

    if(!(req.query.start && req.query.end && req.params.userids)){
      res.status(400).send({ message: 'Invalid Query Parameters', code: -1, result: ''});
      return;
    }

    const ids:string[] = String(req.params.userids).split(',');
    let final_result:any[] = []; 
    
    for (const id of ids){
      const calendarCredentials = await this.getCalendarCredentials(id, res);
      if (calendarCredentials == null) {
        continue; //skip this iteration
      }
      const startRange: Date = new Date(String(req.query.start));
      const endRange: Date = new Date(String(req.query.end));
      const client_id: String = calendarCredentials.client_id;
      const calendarFunc: CalendarFunctions = new CalendarFunctions(client_id);
      const result = await calendarFunc.getFreeBusy(calendarCredentials['refresh_token'], startRange, endRange, ['primary']);
      final_result.push(result);
    }
    res.status(200).json(final_result);
    return;
  };

}
