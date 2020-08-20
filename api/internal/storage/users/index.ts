// import { userBucket } from '../utils';
import { s3_utils as s3 } from '../utils';
import * as fs from 'fs';

const usersBucket = 'hopper-users-bucket';

/**
 * @summary create a folder for a user in data lake if none exists
 * @param userId
 * @returns {Promise} user folder path in bucket 
 */
export async function createUserFolder(userId: string) {
  //input sanity check
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

// export async function uploadUserFile(userId: string, filePath: string) {
//   const uploadParams = {
    
//   }

// }
