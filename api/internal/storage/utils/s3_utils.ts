import { awsConfig } from '.';
import * as aws from 'aws-sdk';

aws.config.update(awsConfig);

const s3 = new aws.S3();

export function listBuckets() {
  s3.listBuckets((err, data) => {
    if (err) {
      console.log('Error:', err);
    } else {
      console.log('Success:', data);
    }
  });
}

export const createBucket = (bucketParams: any) => {
  s3.createBucket(bucketParams, (err, data) => {
    if (err) {
      console.log('Error', err);
      return err;
    } else {
      console.log('success', data.Location);
      return data.Location;
    }
  });
};

export const createFolder = (bucketName: string, path: string) => {
  if (path[path.length - 1] !== '/') {
    throw new Error('path must end with "/" ');
  }
  s3.putObject(
    {
      Bucket: bucketName,
      Key: path
    },
    (err, data) => {
      if (err) {
        console.log(err);
        return err;
      } else {
        console.log(data);
        return data;
      }
    }
  );
};
