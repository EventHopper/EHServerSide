import * as dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
const epath = path.join(__dirname, '../../../.env');
dotenv.config({path: epath});

export const TEST_PORT = process.env.TEST_PORT;
export const UPDATE_PORT = process.env.UPDATE_PORT;
export const CLIENT_PORT = process.env.CLIENT_PORT;
export const ENVIRONMENT = process.env.ENVIRONMENT;
export const MONGO_PROJECT_ID = process.env.MONGO_PROJECT_ID;
export const TICKETLEAP_API_KEY = process.env.TICKETLEAP_API_KEY;
export const TICKETMASTER_CONSUMER_KEY = process.env.TICKETMASTER_CONSUMER_KEY;
// export const REALM_APP_ID = process.env.REALM_APP_ID;
// export const REALM_NUMERICAL_APP_ID = process.env.REALM_NUMERICAL_APP_ID;
// export const REALM_PRIVATE_KEY = process.env.REALM_PRIVATE_KEY;
// export const REALM_PUBLIC_KEY = process.env.REALM_PUBLIC_KEY;
export const TEST_AUTH_API_KEY = process.env.TEST_AUTH_API_KEY;
export const GOOGLE_GEOCODING_API_KEY = process.env.GOOGLE_GEOCODING_API_KEY;
export const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY
export const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID
export const usersBucket = process.env.USERS_BUCKET;


export const variables = {
  ports:{
    port: process.env.TEST_PORT,
    updatePort: process.env.UPDATE_PORT,
    clientPort: process.env.CLIENT_PORT,
  },
  environment: {
    type: process.env.ENVIRONMENT,
    testAuthApiKey: process.env.TEST_AUTH_API_KEY
  },
  services: {
    aws: {
      accessKeyId : process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
    mongo: {
      projectId: process.env.MONGO_PROJECT_ID,
    },
    google: {
      geocodingApiKey: process.env.GOOGLE_GEOCODING_API_KEY,
    },
    firebase: {
      serviceAccountObject: {
        'type': String(process.env.FSAV_TYPE),
        'project_id': String(process.env.FSAV_PROJECT_ID),
        'private_key_id': String(process.env.FSAV_PRIVATE_KEY_ID),
        'private_key': String(process.env.FSAV_PRIVATE_KEY),
        'client_email': String(process.env.FSAV_CLIENT_EMAIL),
        'client_id': String(process.env.FSAV_CLIENT_ID),
        'auth_uri': String(process.env.FSAV_AUTH_URI),
        'token_uri': String(process.env.FSAV_TOKEN_URI),
        'auth_provider_x509_cert_url': String(process.env.FSAV_AUTH_PROVIDER_X509_CERT_URL),
        'client_x509_cert_url': String(process.env.FSAV_CLIENT_X509_CERT_URL)
      },
    }
  },
  aggregator: {
    ticketleapApiKey: process.env.TICKETLEAP_API_KEY,
    ticketMasterApiKey: process.env.TICKETMASTER_CONSUMER_KEY,
  },
}