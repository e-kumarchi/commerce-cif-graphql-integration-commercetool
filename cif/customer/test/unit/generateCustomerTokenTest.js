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
const resolve = require('../../src/resolvers/customerResolver.js').main;
const chai = require('chai');
const { expect } = chai;
const chaiShallowDeepEqual = require('chai-shallow-deep-equal');
chai.use(chaiShallowDeepEqual);
const nock = require('nock');
const assert = require('chai').assert;
const TestUtils = require('../../../utils/TestUtils.js');
const ctGenerateCustomerBearer = require('../resources/ctGenerateCustomerBearer.json');
const validGenerateCustomerToken = require('../resources/validGenerateCustomerToken.json');
const unSupportedGrantType = require('../resources/unSupportedGrantType.json');
const badClientCredentials = require('../resources/badClientCredentials.json');
const qs = require('querystring');

describe('GenerateCustomerToken', () => {
  const scopeAuth = nock('https://CT_TEST_INSTANCE_HOSTNAME');

  before(() => {
    // Disable console debugging
    sinon.stub(console, 'debug');
    sinon.stub(console, 'error');
  });

  after(() => {
    console.debug.restore();
    console.error.restore();
  });

  describe('Unit Tests', () => {
    let args = TestUtils.getContextData();

    it('Mutation: Generate customer token ', () => {
      const query = {
        grant_type: 'password',
        username: 'test@example.com',
        password: 'Password@123',
        scope: 'manage_project:CT_INSTANCE_PROJECT',
      };
      scopeAuth
        .post(
          'CT_TEST_INSTANCE_OAUTH_PATH',
          qs.stringify(query)
        )
        .basicAuth({
          user: 'CT_TEST_INSTANCE_CLIENTID',
          pass: 'CT_TEST_INSTANCE_CLIENTSECRET',
        })
        .reply(200, ctGenerateCustomerBearer);
      args.query =
        'mutation {generateCustomerToken(email: "test@example.com", password: "Password@123"){token}}';
      return resolve(args).then(result => {
        assert.isUndefined(result.errors);
        let response = result.data.generateCustomerToken.token;
        expect(response).to.deep.equals(validGenerateCustomerToken.token);
      });
    });

    it('Mutation: validate response should return unsupported grant type', () => {
      const query = {
        grant_type: 'password',
        username: 'test@example.com',
        password: 'Password@123',
        scope: 'manage_project:CT_INSTANCE_PROJECT',
      };
      scopeAuth
        .post(
          'CT_TEST_INSTANCE_OAUTH_PATH',
          qs.stringify(query)
        )
        .basicAuth({
          user: 'CT_TEST_INSTANCE_CLIENTID',
          pass: 'CT_TEST_INSTANCE_CLIENTSECRET',
        })
        .reply(400, unSupportedGrantType);
      args.query =
        'mutation {generateCustomerToken(email: "test@example.com", password: "Password@123"){token}}';
      args.context.settings.grant_type = 'pass';
      return resolve(args).then(result => {
        const errors = result.errors[0];
        expect(errors).shallowDeepEqual({
          message: 'Request failed with status code 400',
          source: {
            name: 'GraphQL request',
          },
        });
      });
    });

    it('Mutation: validate response should return bad client credentials ', () => {
      const query = {
        grant_type: 'password',
        username: 'test@example.com',
        password: 'Password@123',
        scope: 'manage_project:CT_INSTANCE_PROJECT',
      };
      scopeAuth
        .post(
          'CT_TEST_INSTANCE_OAUTH_PATH',
          qs.stringify(query)
        )
        .basicAuth({ user: 'CT_TEST_INSTANCE_CLIENTID', pass: 'CT_TEST_INSTANCE_CLIENTSECRET' })
        .reply(401, badClientCredentials);
      args.query =
        'mutation {generateCustomerToken(email: "test@example.com", password: "Password@123"){token}}';
      args.context.settings.CT_CLIENTSECRET = 'ADOBE_';
      return resolve(args).then(result => {
        const errors = result.errors[0];
        expect(errors).shallowDeepEqual({
          message: 'Request failed with status code 401',
          source: {
            name: 'GraphQL request',
          },
        });
      });
    });
  });
});
