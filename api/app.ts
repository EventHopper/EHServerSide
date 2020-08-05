/* eslint-disable max-len */
/* eslint-disable require-jsdoc */
import express from 'express';
import bodyParser from 'body-parser';
import Auth from '../auth/authentication';

class App {
  public app: express.Application;
  public port: number;
  /* Having trouble getting this.
  Keep getting anTypeError: Cannot read property 'auth' of undefined
  to replicate, uncomment line 14, comment line 29.
  Then change all calls to auth to this.auth instead*/
  private _auth:Auth;

  constructor(controllers:any, port:number) {
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

  private authMiddleware(request: express.Request,
      response: express.Response, next:express.NextFunction) {
    console.log(`${request.method} ${request.path} ${String(request.query.key)}`);
    // const auth = new Auth();
    let enumString:any;
    this._auth.loginApiKey(String(request.query.key)).then((result)=>{
      enumString = result;
    }).catch((err)=>{
      console.log(err);
    });
    if (enumString === 'AUTH_SUCCESS') {
      console.log('Auth Succeeded');
      console.log(this._auth.getAccessToken());
      next();
    } else if (enumString === 'AUTH_FAILED') {
      console.log('Auth Failed');
      response.json('Failed to authenticate request. Please ensure valid apikey');
    }
  }

  private initializeControllers(controllers:any) {
    controllers.forEach((controller:any) => {
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
