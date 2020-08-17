/* eslint-disable require-jsdoc */
// eslint-disable-next-line no-unused-vars
import { QueryTypes, QueryType } from './query.types';

/**
   * Generates a graphql query with specified fields
   * @author ransford
   */

class QueryBuilder {
  // eslint-disable-next-line require-jsdoc

  private queryFields: string = '{';

  constructor(fields: string[] = [], type: QueryType) {
    if (fields.length === 0) {
      this.queryFields = QueryTypes.all(type);
    } else {
      fields.forEach((field) => {
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
  public generateGetByIDQuery(id: string): string {
    let queryString: string = `query {
        event (query: {_id : "${id}"})`;
    queryString += this.queryFields;
    return queryString;
  }
}

export default QueryBuilder;
