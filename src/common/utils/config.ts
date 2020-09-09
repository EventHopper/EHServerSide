import * as dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
const epath = path.join(__dirname, '../../../.env');
dotenv.config({path: epath});

export const TEST_PORT = process.env.TEST_PORT;
export const UPDATE_PORT = process.env.UPDATE_PORT;
export const CLIENT_PORT = process.env.CLIENT_PORT;
export const LOG_LEVEL = process.env.LOG_LEVEL;
export const ENVIRONMENT = process.env.ENVIRONMENT;
export const MONGO_PROJECT_ID = process.env.MONGO_PROJECT_ID;
export const TICKETLEAP_API_KEY = process.env.TICKETLEAP_API_KEY;
export const TICKETMASTER_CONSUMER_KEY = process.env.TICKETMASTER_CONSUMER_KEY;
export const REALM_APP_ID = process.env.REALM_APP_ID;
export const REALM_NUMERICAL_APP_ID = process.env.REALM_NUMERICAL_APP_ID;
export const REALM_PRIVATE_KEY = process.env.REALM_PRIVATE_KEY;
export const REALM_PUBLIC_KEY = process.env.REALM_PUBLIC_KEY;
export const TEST_AUTH_API_KEY = process.env.TEST_AUTH_API_KEY;
export const GOOGLE_GEOCODING_API_KEY = process.env.GOOGLE_GEOCODING_API_KEY;
export const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY
export const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID
export const usersBucket = process.env.USERS_BUCKET;
