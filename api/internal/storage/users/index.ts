import { usersBucket } from '../../../../common/utils/config';
// import { userBucket } from '../utils';
import { s3_utils as s3 } from '../utils';
import * as fs from 'fs';
import * as fileType from 'file-type';
import * as path from 'path';
import got from 'got';

/**
 * @summary create a folder for a user in data lake if none exists
 * @param userId
 * @returns {string} user folder path in bucket 
 */
export async function createUserFolder(userId: string) {
  //TODO: input sanity check
  if (userId.length === 0) {
    throw new Error('cannot create folder for empty userId');
  }
  const folderPath = `${userId}/`;
  try {
    const userFolder = await s3.createFolder(usersBucket!, folderPath);
    return userFolder;
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
export async function uploadUserFile(userId: string, filePath: string) {
  //TODO: input sanity check
  // check filetype to put in appropriate folder
  let folder: string | undefined;

  await _destUserFolder(filePath)
    .then(data => folder = data)
    .catch(err => {throw new Error(err.message)})

  try {
    const results = await s3.uploadFile(
      usersBucket!,
      `${userId}/${folder}/`,
      filePath
    );
    return results;
  } catch (err) {
    throw new Error(err.message);
  }
}

async function _destUserFolder(filePath: string) {
  let destination;
  if (s3.isValidURL(filePath)) {
    try {
      const stream = got.stream(filePath);
      const fType = await fileType.fromStream(stream);
      const rType = fType?.mime.split('/')[0].toString();
      if (rType === 'image') {
        destination = 'images'
      } else if (rType === 'video') {
        destination = 'video'
      } else {
        destination = 'misc';
      }
    } catch (err) {
      throw new Error(`URL File Type Read Error: ${err.message}`);
    }
  } else if (s3.isValidFile(filePath)) {
    try {
      const fType = await fileType.fromFile(filePath);
      const rType = fType?.mime.split('/')[0].toString();
      if (rType === 'image') {
        destination = 'images'
      } else if (rType === 'video') {
        destination = 'video'
      } else {
        destination = 'misc';
      }
    } catch (err) {
      throw new Error(`File Type Fetching Error ${err.message}`)
    }
  }
  return destination;
}
