// import { userBucket } from '../utils';
import { s3_utils as s3 } from '../utils';
import * as fs from 'fs';
import * as fileType from 'file-type';

const usersBucket = 'hopper-users-bucket';

/**
 * @summary create a folder for a user in data lake if none exists
 * @param userId
 * @returns {Promise} user folder path in bucket 
 */
export async function createUserFolder(userId: string) {
  //TODO: input sanity check
  if (userId.length === 0) {
    throw new Error('cannot create folder for empty userId');
  }
  const folderPath = `${userId}/`;
  try {
    const userFolder = await s3.createFolder(usersBucket, folderPath);
    console.log(userFolder);
  } catch (err) {
    console.log(err);
  }
}

/**
 * @summary upload a file for a user in data lake
 * @param userId User's unique id
 * @param filePath local/remote path to user file
 * @returns {Promise<string>} final file URL 
 */
export async function uploadUserFile(
  userId: string,
  filePath: string
): Promise<string> {
  //TODO: input sanity check
  // check filetype to put in appropriate folder
  let folder: string | undefined;
  // try {
  //   const fType = await fileType.fromFile(filePath);
  //   folder = fType?.mime.split('/')[0];
  // } catch (err) {
  //   console.log(err.message);
  // }

  try {
    const results = await s3.uploadFile(usersBucket, `${userId}/${folder}/`, filePath);
    return results;
  } catch (err) {
    throw new Error(err.message);
  }
}
