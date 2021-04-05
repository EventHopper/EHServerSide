import {
  AWS_SECRET_ACCESS_KEY,
  AWS_ACCESS_KEY_ID
} from '../../../common/utils/config';

const awsConfig = {
  accessKeyId: AWS_ACCESS_KEY_ID,
  secretAccessKey: AWS_SECRET_ACCESS_KEY,
  region: 'us-east-2',
  apiVersion: '2006-03-01'
};


export default awsConfig;
