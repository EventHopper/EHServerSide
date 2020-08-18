import { Mongoose }  from 'mongoose';

let count = 0;
const userMongooseInstance = new Mongoose();

const options = {
  autoIndex: false, // Don't build indexes
  // reconnectTries: 30, // Retry up to 30 times
  // reconnectInterval: 500, // Reconnect every 500ms
  poolSize: 10, // Maintain up to 10 socket connections
  /* If not connected, return errors immediately rather
  than waiting for reconnect*/
  bufferMaxEntries: 0,
  // geting rid off the depreciation errors
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: true,

};
const uri = 'mongodb+srv://ransford:chiefarchitect@eventhoppertesting.mdabm.mongodb.net/user_database?retryWrites=true&w=majority';

const connectWithRetry = () => {
  console.log('MongoDB connection with retry');
  userMongooseInstance.connect(uri, options).then(()=>{
    console.log('MongoDB - User Database is connected');
  }).catch((err:any)=>{
    console.log('MongoDB connection unsuccessful, retry after 5 seconds. ',
      ++count);
    setTimeout(connectWithRetry, 5000);
  });
};

connectWithRetry();

export{userMongooseInstance};
