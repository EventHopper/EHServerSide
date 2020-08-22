import { s3_utils as s3 } from './utils';
import * as user from './users';

// s3
//   .createBucket('hopper-test-bucket-1')
//   .then((data) => console.log(data))
//   .catch((err) => console.log(err));

// s3
//   .listBuckets()
//   .then((data) => console.log(data))
//   .catch((err) => console.log(err));

// s3
//   .createFolder('hopper-test-bucket-0', 'testFolder1/')
//   .then((data) => console.log(data))
//   .catch((err) => console.log(err));
// s3.deleteObjects('hopper-test-bucket-0', [ 'testFolder0/' ]);
// s3
//   .deleteObject('hopper-test-bucket-0', 'testFolder0/')
//   .then(() => console.log('success'))
//   .catch((err) => console.log(err));

// s3
//   .getObject('hopper-test-bucket-0', 'testFolder1/')
//   .then((data) => console.log(data))
//   .catch((err) => console.log(err));

// s3
//   .listObjects('hopper-test-bucket-0', 'testFolder1/')
//   .then((data) => console.log(data))
//   .catch((err) => console.log(err));

// user.createUserFolder('kyler')
//   .then((data) => console.log(data))
//   .catch((err) => console.log(err));

const filePath =
  '/Users/idovenix/Desktop/hopper/Dev/EHServerSide/api/public/images/logo.png';
user.uploadUserFile('kyler', filePath).then((data) => console.log(data));
// s3
//   .uploadFile('hopper-users-bucket', 'kyler/', filePath)
//   .then((data) => console.log(data))
//   .catch((err) => console.log(err));
