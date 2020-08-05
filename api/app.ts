/* eslint-disable require-jsdoc */
import express from 'express';
import * as bodyParser from 'body-parser';
import Auth from '../auth/authentication';
import Realm from 'realm';


class App {
  public app: express.Application;
  public port: number;
  private auth: Auth;
  private user: Realm.User;

  constructor(controllers:any, port:number) {
    this.app = express();
    this.port = port;
    this.auth = new Auth();

    this.initializeMiddlewares();
    this.initializeControllers(controllers);
  }

  private async authMiddleware(request: express.Request,
      response: express.Response, next:express.NextFunction) {
    console.log(`${request.method} ${request.path}`);
    // if (this.tokenCache === '') {
    //   const apikey:string = request.body.key;
    //   this.tokenCache = await this.auth.loginApiKey(apikey);
    //   // eslint-disable-next-line max-len
    //   this.tokenCache === '' ? next() : response.send('Could not authenticate user');
    // } else {
    //   next();
    // }

    /* loginApiKey('frfhr').then((user) => {
  user ? console.log('alive') : console.log('nah');
  // console.log('Successfully logged in!', user);
}); */
  }

  private initializeMiddlewares() {
    this.app.use(bodyParser.json());
    this.app.use(this.authMiddleware);
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
