import express from 'express';
import {CLIENT_PORT as PORT} from '../../common/utils/config';

const app = express();

app.get('/', (req, res) => {
  res.send('Express + Typescript server running without a hick');
});

app.listen(PORT, () => {
  console.log(`app is running at port ${PORT}`);
});

