import { s3_utils } from './utils';

// console.log(
//   s3_utils.createBucket({
//     Bucket: 'hopper-test-bucket-0'
//   })
// );

// console.log(s3_utils.listBuckets());

s3_utils.createFolder('hopper-test-bucket-0', 'testFolder1/');
