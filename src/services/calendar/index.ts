import Debug from 'debug';
import { calendar_v3, google} from 'googleapis';
import { OAuth2Client } from 'googleapis/node_modules/google-auth-library';
import { EventDoc } from '../../models/events/events.model';
import * as EventModel from '../../models/events/events.model';
import * as ServerConfig from '../../common/utils/config';

class CalendarFunctions {

  public oAuth2Client: OAuth2Client;

  constructor(client_id:any){
    this.oAuth2Client = new google.auth.OAuth2({clientId: client_id, redirectUri:ServerConfig.variables.services.google.authRedirectURI});
  }

  /**
 * Lists the next n events on the user's primary calendar.
 * @param {string} token The refresh token of the user.
 * @param {number} NumberOfEvents The number of upcoming events to list from the user's calendar.
 */

  public listEvents = async (token: string, numberOfEvents: number) => {

    this.oAuth2Client.setCredentials({ refresh_token: token });
    
    google.options({auth: this.oAuth2Client});
    const calendar = google.calendar({version: 'v3'}); 
    const empty: calendar_v3.Schema$Event[] = [];
    let result;
    // console.log('token is: ' + token);
    await calendar.events.list({
      calendarId: 'primary',
      timeMin: (new Date()).toISOString(),
      maxResults: numberOfEvents,
      singleEvents: true,
      orderBy: 'startTime',
    }).then((res) => {
      const events = res?.data.items ? res.data.items : empty;
      result = {message: 'Successfully retrieved events', code: 0, Events: events};
      if(events != null){
        if (events.length) {
          // console.log('Upcoming 10 events:');
          events.map((event, i) => {
            const start = event.start!.dateTime || event.start!.date;
          });
        } else {
          // console.log('No upcoming events found.');
        }   
      }    
    }).catch((err) => {
      console.log('The API returned an error: ' + err);
      result = {message: 'The API returned an error: ' + err, code: -1, Events: empty};
    });

    return result;
  }

  /**Retrives the free busy information for a given user or group of users.
 * @param {string} token The refresh token of the user.
 * @param {Date} startRange The first available time slot to begin searching.
 * @param {Date} endRange The last available time slot to search.
 * @param {[string]} emails The emails/calendars to include in the free busy query
 */
public getFreeBusy = async (token: string, startRange: Date, endRange: Date, emails:string[]) => {
  this.oAuth2Client.setCredentials({refresh_token: token});
  google.options({auth: this.oAuth2Client});
  const calendar = google.calendar({version: 'v3'});
  
  let response;
  let i:number  = 0;
  
  let calendars = [];
  for(i = 0; i < emails.length; i++){
    calendars.push({id: emails[i]});
  }

  await calendar.freebusy.query({
    requestBody: {
      timeMin: startRange.toISOString(), 
      timeMax: endRange.toISOString(),
      timeZone: 'UTC',
      calendarExpansionMax: emails.length,
      items: calendars
    }
  }).then((result) => {
    response = {
      message: 'Success',
      code: 0,
      calendars: result.data.calendars
    };
  }).catch((e) => {
    
    response = {
      message: e,
      code: -1,
      calendars: ''
    };
  });
  return response;
}

/**Adds the event to the user's calendar.
 * @param {string} token The refresh token of the user.
 * @param {} event The event represented as a json to add to the user's calendar.
 */
public addToCalendar = async (token: string, eventid:String) => {
  const event:EventDoc = (await EventModel.byID(eventid))[0];

  let response;
  if(event == null || event == undefined){
    return {message: 'Invalid Event ID', code: -1, link: ''};
  }
  this.oAuth2Client.setCredentials({refresh_token: token});
  google.options({auth: this.oAuth2Client});
  const calendar = google.calendar({version: 'v3'});

  const calendar_event:calendar_v3.Schema$Event = this.convertToCalendarEvent(event);
  
  await calendar.events.insert({
    calendarId: 'primary',
    sendUpdates: 'all',
    requestBody: calendar_event,
  }).then((event) => {
    response = {
      message: 'Successfully added event to calendar', 
      code: 0, 
      link: event!.data.htmlLink
    };
  }).catch((e) => {
    response = {
      message: e,
      code: -1,
      link: ''
    };
  });
  
  return response;
}

/**Converts from the event hopper event schema to the google calendar event schema
 * @param {} event The event hopper event 
 */
public convertToCalendarEvent = (event:EventDoc) => {
  
  let end_date_default : Date =  new Date(event.start_date_local);
  end_date_default.setHours(event.start_date_local.getHours() + 1);

  let end_date:calendar_v3.Schema$EventDateTime = {
    dateTime: event.end_date_local ? event.end_date_local.toISOString() : end_date_default.toISOString(),
    timeZone: 'Etc/UTC'
  };
  let start_date:calendar_v3.Schema$EventDateTime = {
    dateTime: event.start_date_local.toISOString(),
    timeZone: 'Etc/UTC'
  };

  let full_description:string =  `${String(event.details)}. <b><a href=\"${event.public_action}\" >See here for more info</a></b>`;

  let calendar_event: calendar_v3.Schema$Event = {
    summary: String(event.name),
    description: full_description,
    creator: {displayName: 'EventHopper LLC', email: 'info@eventhopper.app'},
    end: end_date,
    organizer: {displayName: String(event.organizer)},
    originalStartTime: start_date,
    start: start_date,
    location: `${event.venue.name},${event.venue.street},${event.venue.city}, ${event.venue.state}, ${event.venue.zip}`,
  };
  return calendar_event;
}

}

export default CalendarFunctions;
