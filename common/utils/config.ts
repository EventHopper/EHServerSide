import * as dotenv from 'dotenv';

dotenv.config();
// TODO: re-export all env variables

export const CLIENT_PORT = process.env.CLIENT_PORT;
export const APP_ID = process.env.REALM_APP_ID;
// export const LOG_LEVEL = process.env.LOG_LEVEL;
