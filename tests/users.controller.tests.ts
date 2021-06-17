import * as should from 'should';
import * as sinon from 'sinon';
import supertest from 'supertest';
import App from '../src/api/app';
import  * as Config from '../src/common/utils/config';
import UserController from '../src/api/users/users.controller';

const longString = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam facilisis elementum orci, a pellentesque nisl dapibus ac placerat.';
const testUsername = 'kanga';
const testEmail = 'kangaroo@eventhopper.app';
const testPassword = 'password';
const testID = '3LoUabnfbNfwgieGST7aVfSMk3l2';

const PORT = Config.variables.ports.testPort;
const KEY = Config.variables.environment.testAuthApiKey;

const request = supertest(new App([
  new UserController(),
],   
Number(PORT)).app)


describe('Users Controller Tests: ', () =>{
  describe('', ()=>{
    it('Fails to find user that does not exist', async ()=>{
      const req = await request.get('/users');
      const res = { 
        status: sinon.spy(),
        body: sinon.spy(),
        send: sinon.spy(),
        json: sinon.spy(),
      };
      res.status.calledWith(404).should.equal(true)
    })
  })
})