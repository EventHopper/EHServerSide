/* eslint-disable no-unused-vars */
/* eslint-disable no-invalid-this */
/* eslint-disable max-len */
/* eslint-disable require-jsdoc */
import express from 'express';
import chalk from 'chalk';
import bodyParser from 'body-parser';
import Auth from '../auth/server_auth';
import {ControllerInterface} from './utils/controller.interface';

class App {
  public app: express.Application;
  public port: number;
  private _auth:Auth;

  constructor(controllers:ControllerInterface[], port:number) {
    this.app = express();
    this.port = port;
    this._auth = new Auth();
    this.initializeMiddlewares();
    this.initializeControllers(controllers);
  }

  private initializeMiddlewares() {
    this.app.use(bodyParser.json());
    this.app.use(bodyParser.urlencoded());
    this.app.use(this.authMiddleware);
  }

  private authMiddleware = async (request: express.Request,
    response: express.Response, next:express.NextFunction) => { // TODO: Update Access token from cache
    console.log(`${request.method} ${request.path} ${String(request.query.key)}`);
    // const auth = new Auth();
    let enumString:any;
    if (!this._auth.hasAccessToken()) {
      // console.log('Did not have token: fetching from server');
      enumString = await this._auth.loginApiKey(String(request.query.key)).catch((err)=>{
        console.log(err);
      });
    } else {
      // console.log('Already had token: fetching from cache');
      enumString = 'AUTH_SUCCESS';
    }
    if (enumString === 'AUTH_SUCCESS') {
      // console.log(chalk.greenBright('Auth Succeeded'));
      // console.log(this._auth.getAccessToken());
      next();
    } else if (enumString === 'AUTH_FAILED') {
      console.log(chalk.redBright('Auth Failed'));
      response.json(chalk.redBright('Failed to authenticate request. Please ensure valid apikey'));
    }
  }

  private initializeControllers = (controllers:ControllerInterface[]) => {
    controllers.forEach((controller:ControllerInterface) => {
      controller.setAuthObject(this._auth);
      this.app.use('/', controller.router);
    });
  }

  public listen() {
    this.app.listen(this.port, () => {
      console.log(`App listening on the port ${this.port}`);
    });
  }
}

export default App;
