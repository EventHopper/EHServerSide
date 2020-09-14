/* eslint-disable no-unused-vars */
/* eslint-disable require-jsdoc */
export enum QueryType{
    EVENT,
    USER,
    EVENT_MANAGER,
    USER_MANAGER,
    VENUE
   }

export class QueryTypes {
    private static allEvents:string = `{
        _id
        category
        details
        end_date_local
        end_date_utc
        image_url_full
        image_url_small
        name
        organizer
        public_action
        source
        start_date_local
        start_date_utc
        tags
        vendor_id
  }
}`;
    // TODO: Add other queryTypes e.g. users
    public static all(type: QueryType):string {
      switch (type) {
        case QueryType.EVENT: return this.allEvents;
          break;
        default: return this.allEvents;
          break;
      }
    }
}


