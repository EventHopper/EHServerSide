/* eslint-disable no-unused-vars */
/* eslint-disable no-invalid-this */
/* eslint-disable max-len */
/* eslint-disable require-jsdoc */
import express from 'express';
import path from 'path';
import chalk from 'chalk';
import bodyParser from 'body-parser';
import Auth from '../auth/server_auth';
import {ControllerInterface} from './utils/controller.interface';

class App {
  public app: express.Application;
  public port: number;
  private _auth: Auth;

  constructor(controllers: ControllerInterface[], port: number) {
    this.app = express();
    this.port = port;
    this._auth = new Auth();
    this.initializeMiddlewares();
    this.initializeControllers(controllers);
  }

  private initializeMiddlewares() {
    this.app.use(bodyParser.json());
    this.app.use(bodyParser.urlencoded({extended: true}));
    this.app.disable('x-powered-by') //See https://expressjs.com/en/advanced/best-practice-security.html
    this.app.use(express.static(path.join(__dirname, 'public')));
    this.app.set('view engine', 'ejs');
    this.app.use(this.authMiddleware);
  }

  private authMiddleware = async(request: express.Request,
    response: express.Response, next: express.NextFunction) => {
    console.log(`${request.method} ${request.path} ${String(request.query.key)}`);
    let enumString: any;
    enumString = await this._auth.loginApiKey(String(request.query.key)).catch((err)=>{
      console.log(err);
    });

    if (enumString === 'AUTH_SUCCESS') {
      // console.log(chalk.greenBright('Auth Succeeded'));
      // console.log(this._auth.getAccessToken());
      next();
    } else if (enumString === 'AUTH_FAILED') {
      // console.log(chalk.redBright('Auth Failed'));
      response.status(400).json('Failed to authenticate request. Please ensure valid apikey');
    }
  }

  private initializeControllers = (controllers: ControllerInterface[]) => {
    controllers.forEach((controller: ControllerInterface) => {
      controller.setAuthObject(this._auth);
      this.app.use('/', controller.router);
    });
    //Home Route
    this.app.use('/', (req:express.Request, res: express.Response)=>{
      res.status(200)
        .render(path.join(__dirname, '/public/views/welcome'));
    });
  }

  public listen() {
    this.app.listen(this.port, () => {
      console.log(`App listening on the port ${this.port}`);
    });
  }
}

export default App;