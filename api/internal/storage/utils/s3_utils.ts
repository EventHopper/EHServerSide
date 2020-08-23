import * as aws from 'aws-sdk';
import * as fs from 'fs';
import * as http from 'http';
import * as path from 'path';
import { awsConfig } from '.';
import * as validURL from 'valid-url';
import * as stream from 'stream';

aws.config.update(awsConfig);
let s3 = new aws.S3();

/** utility functions to manipulate s3 instance. 
 * These are simple wrappers around the SDK */

/**
 * 
 * @summary Update the aws configuration of the application 
 * @param {accessKeyId: string; secretAccessKey: string;region: string; apiVersion: string;} config
 * @returns {void}
 * */
export function updateAWS(config: {
  accessKeyId: string;
  secretAccessKey: string;
  region: string;
  apiVersion: string;
}) {
  aws.config.update(config);
  s3 = new aws.S3();
}

/**
 * @summary List all the buckets in the s3 instance of the application 
 * @returns {Promise<any>} List of buckets
*/
export async function listBuckets(): Promise<any> {
  try {
    const result = await s3.listBuckets().promise();
    return result;
  } catch (err) {
    throw new Error(`Error During Bucket Listing ${err.message}`);
  }
}

/**
 * @summary create a bucket in the s3 instance of the application 
 * @param {Promise<any>} bucketParams 
*/
export const createBucket = async (bucketName: string) => {
  try {
    const result = await s3.createBucket({ Bucket: bucketName }).promise();
    return result;
  } catch (err) {
    console.log(err);
    throw new Error(`Bucket Creation Message: ${err.message}`);
  }
};

/**@summary ceates a folder in the s3 instance of the application 
 * @param {string} bucketName
 * @param {string} path path of the folder inside the bucket
 * @returns {Promise<string}> final folder ETag
*/
export async function createFolder(bucketName: string, path: string) {
  if (path[path.length - 1] !== '/') {
    throw new Error('path must end with "/" ');
  }

  try {
    await s3.headBucket({ Bucket: bucketName }).promise();
    const result = await s3
      .putObject({
        Bucket: bucketName,
        Key: path
      })
      .promise();
    return result;
  } catch (err) {
    console.log(`Error during Folder Creation: ${err}`);
  }
}

/**@summary Delete multiple objects in s3
 * @description 
 * @param {string} bucketName name of the bucket
 * @param {string[]} paths paths of the object in the bucket
 */
export const deleteObjects = async (bucketName: string, paths: string[]) => {
  const objects = paths.map((path) => {
    return {
      Key: path
    };
  });

  try {
    await s3.headBucket({ Bucket: bucketName }).promise();
    await s3
      .deleteObjects({
        Bucket: bucketName,
        Delete: {
          Objects: objects
        }
      })
      .promise();
  } catch (err) {
    throw new Error(`Error during Multiple Objects Deletion: ${err.message}`);
  }
};

/**
 * @summary Delete one object in s3
 * @description
 * @param {string} bucketName name of the bucket
 * @param {string} path path of the object in the bucket
 */
export const deleteObject = async (bucketName: string, path: string) => {
  const params = {
    Bucket: bucketName,
    Key: path
  };
  try {
    await s3.headObject(params).promise();
    await s3.deleteObject(params).promise();
  } catch (err) {
    throw new Error(`Error During Object Deletion ${err.message}`);
  }
};

/**
 * 
 * @summary return object in s3 path
 * @description
 * @param {string} bucketName name of the bucket
 * @param {string} path path of the parent directory in the bucket
 */
export const getObject = async (bucketName: string, path: string) => {
  const params = { Bucket: bucketName, Key: path };
  try {
    const result = await s3.getObject(params).promise();
    return result;
  } catch (err) {
    throw new Error(`Error retrieving s3 objects: ${err.message}`);
  }
};

/**
 * @summary list content of a folder in s3
 * @description
 * @param {string} bucketName name of the bucket
 * @param {string} path path of the target directory
 */
export async function listObjects(bucketName: string, path: string) {
  try {
    const result = await s3
      .listObjectsV2({ Bucket: bucketName, Prefix: path })
      .promise();
    return result.Contents;
  } catch (err) {
    throw new Error(`Error Listing Objects ${err}`);
  }
}

/**
 * @summary uploads a file into a particular bucket and folder
 * @description
 * @param {string} bucketName name of the bucket
 * @param {string} bucketTargetDirectory name of target directory for file
 * @param {string} filePath path/url of file to upload directory
 * @returns {string} final destination of the file in s3
 */
export async function uploadFile(
  bucketName: string,
  bucketTargetDirectory: string,
  filePath: string
) {
  const pass = new stream.PassThrough();
  let fileStream: stream.PassThrough | fs.ReadStream;

  // Input sanity check
  if (isValidURL(filePath)) {
    http.get(filePath, (res) => {
      res.pipe(pass);
    });
    fileStream = pass;
  } else if (isValidFile(filePath)) {
    fileStream = fs.createReadStream(filePath);
  } else {
    throw new Error(
      'file is not reachable. Make sure URL/file path is correct'
    );
  }

  fileStream.on('error', (err) => {
    throw new Error(`File stream error ${err.message}`);
  });

  const uploadParam = {
    Bucket: bucketName,
    Key: `${bucketTargetDirectory}${path.basename(filePath)}`,
    Body: fileStream
  };

  try {
    const result = await s3.upload(uploadParam).promise();
    return result.Location.toString();
  } catch (err) {
    throw new Error(err.message);
  }
}

/**
 * @summary checks if string is URL
 * @description
 * @param {string} url name of the bucket
 * @returns {boolean} true if input URL is a valid url
 */
export function isValidURL(url: string) {
  if (validURL.isHttpUri(url) || validURL.isHttpsUri || validURL.isWebUri) {
    return true;
  } else {
    return false;
  }
}
/**
 * @summary checks if string is path to an existing local file
 * @description
 * @param {string} filePath local path of file
 * @returns {boolean} true if input URL is a valid url
 */
export const isValidFile = (filePath: string) => {
  return fs.existsSync(filePath);
};
