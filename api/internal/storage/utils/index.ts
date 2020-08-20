import * as dotenv from 'dotenv';
dotenv.config({path: '/.env'});
export {default as awsConfig} from './aws_config';
export * as s3_utils from './s3_utils';

export const userBucket = process.env.USERS_BUCKET;
