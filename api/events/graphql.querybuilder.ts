/* eslint-disable require-jsdoc */

/**
   * Generates a graphql query with specified fields
   * @author ransford
   */
class QueryBuilder {
  // eslint-disable-next-line require-jsdoc
  private all:string = `{
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

  private queryFields:string = '{';

  constructor(fields: string[]=[]) {
    if (fields.length === 0) {
      this.queryFields = this.all;
    } else {
      fields.forEach( (field) => {
        this.queryFields += field + ' ';
      });
      this.queryFields += '}}';
    }
  }

  /**
   * Generates the query to retrieve an event by event id.
   * @param {string} id The id of the event to retrieve.
   * @return {string} The query
   */
  public generateGetByIDQuery(id:string):string {
    let queryString:string = `query {
        event (query: {_id : "${id}"})`;
    queryString += this.queryFields;
    return queryString;
  }
}

export default QueryBuilder;
