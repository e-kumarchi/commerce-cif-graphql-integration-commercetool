/*******************************************************************************
 *
 *    Copyright 2019 Adobe. All rights reserved.
 *    This file is licensed to you under the Apache License, Version 2.0 (the "License");
 *    you may not use this file except in compliance with the License. You may obtain a copy
 *    of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 *    Unless required by applicable law or agreed to in writing, software distributed under
 *    the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 *    OF ANY KIND, either express or implied. See the License for the specific language
 *    governing permissions and limitations under the License.
 *
 ******************************************************************************/

'use strict';

const sinon = require('sinon');
const assert = require('chai').assert;
const resolve = require('../../src/resolvers/customerResolver.js').main;
const chai = require('chai');
const expect = require('chai').expect;
const chaiShallowDeepEqual = require('chai-shallow-deep-equal');
chai.use(chaiShallowDeepEqual);
const TestUtils = require('../../../utils/TestUtils.js');
const ctApiHost = require('../../../../package.json').ctApiHost;

describe('GenerateCustomerToken', function() {
  before(() => {
    sinon.stub(console, 'debug');
    sinon.stub(console, 'error');
  });

  after(() => {
    console.debug.restore();
    console.error.restore();
  });

  describe('Integration tests', () => {
    let args = {
      url: TestUtils.getCTInstance(),
      context: {
        settings: {
          bearer: '',
          customerId: '',
          CT_PROTOCOL: 'https',
          CT_AUTH_HOST: '<CT_AUTH_HOST>',
          CT_OAUTH_PATH: '/oauth/adobeio-ct-connector/customers/token',
          CT_CLIENTSECRET: '<CLIENT_SECRET>',
          CT_CLIENTID: 'zCzF-LD2Y3Ga5BNSoi8mDtT9',
          apiHost: ctApiHost,
        },
      },
    };

    it('Mutation: Validate generate customer token', () => {
      args.query =
        'mutation {generateCustomerToken(email: "abc.xyz@123.com", password: "abc@123"){token}}';
      return resolve(args).then(result => {
        const { errors } = result;
        assert.isUndefined(result.errors);
        let responseData = result.data.generateCustomerToken.token;
        assert.notEqual(responseData, '');
        expect(errors).to.be.undefined;
      });
    });
  });
});
