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
const chai = require('chai');
const { expect } = chai;
const nock = require('nock');
const assert = require('chai').assert;
const chaiShallowDeepEqual = require('chai-shallow-deep-equal');
chai.use(chaiShallowDeepEqual);
const resolve = require('../../src/resolvers/cartResolver.js').main;
const ctSetBillingAddressOnCartResponse = require('../resources/SetBillingAddressOnCartResponse.json');
const ctSetBillingAddressOnCart = require('../resources/SetBillingAddressOnCart.json');
const commerceVersionNumberResponse = require('../resources/ctVersionNumberResponse.json');
const commerceInvalidVersionIdResponse = require('../resources/ctInvalidVersionIdResponse.json');
const commerceInvalidCartIdResponse = require('../resources/ctInvalidCartIdResponse.json');
const TestUtils = require('../../../utils/TestUtils.js');
const VersionCartQuery = require('../../src/graphql/version.grapql.js');
const SetBillingAddressMutation = require('../../src/graphql/setBillingAddress.graphql.js');

describe('SetBillingAddressOnCart', function() {
  const scope = nock('https://CT_INSTANCE_HOSTNAME', {
    reqheaders: {
      Authorization: TestUtils.getContextData().context.settings.defaultRequest
        .headers.Authorization,
    },
  });

  before(() => {
    sinon.stub(console, 'debug');
    sinon.stub(console, 'error');
  });

  after(() => {
    console.debug.restore();
    console.error.restore();
  });

  describe('Unit Tests', () => {
    let args = TestUtils.getContextData();

    it('Mutation: validate response should return new billing address on cart', () => {
      scope
        .post('/CT_INSTANCE_PROJECT/graphql', {
          query: VersionCartQuery,
          variables: {
            uid: '03bdd6d9-ede2-495c-8ed8-728326003259',
          },
        })
        .reply(200, commerceVersionNumberResponse);
      scope
        .post('/CT_INSTANCE_PROJECT/graphql', {
          query: SetBillingAddressMutation,
          variables: {
            city: 'Austin',
            uid: '03bdd6d9-ede2-495c-8ed8-728326003259',
            version: 106,
            firstName: 'Bob',
            lastName: 'Roll',
            company: 'Magento',
            streetName: 'Magento shipping',
            region: 'US-WA',
            postalCode: '78758',
            country: 'US',
            phone: '9999998899',
          },
        })
        .reply(200, ctSetBillingAddressOnCartResponse);

      args.query =
        'mutation {setBillingAddressOnCart(input: {cart_id: "03bdd6d9-ede2-495c-8ed8-728326003259", billing_address: {address: {firstname: "Bob", lastname: "Roll", company: "Magento", street: ["Magento shipping", "Main Street"], city: "Austin", region: "US-WA", postcode: "78758", country_code: "US", telephone: "9999998899", save_in_address_book: false}}}) { cart {billing_address {firstname,lastname,company,street,city,region {code,label},postcode,telephone,country {code,label} }}}}';
      return resolve(args).then(result => {
        let response = result.data;
        assert.isUndefined(result.errors);
        expect(response).to.deep.equals(ctSetBillingAddressOnCart);
      });
    });

    it('Mutation: validate response should return invalid version id', () => {
      scope
        .post('/CT_INSTANCE_PROJECT/graphql', {
          query: VersionCartQuery,
          variables: {
            uid: '03bdd6d9-ede2-495c-8ed8-728326003259',
          },
        })
        .reply(200, commerceInvalidVersionIdResponse);
      scope
        .post('/CT_INSTANCE_PROJECT/graphql', {
          query: SetBillingAddressMutation,
          variables: {
            uid: '03bdd6d9-ede2-495c-8ed8-728326003259',
            version: 106,
            firstName: 'Bob',
            lastName: 'Roll',
            company: 'Magento',
            streetName: 'Magento shipping',
            city: 'Austin',
            region: 'US-WA',
            postalCode: '78758',
            country: 'US',
            phone: '9999998899',
          },
        })
        .reply(200, ctSetBillingAddressOnCartResponse);

      args.query =
        'mutation {setBillingAddressOnCart(input: {cart_id: "03bdd6d9-ede2-495c-8ed8-728326003259", billing_address: {address: {firstname: "Bob", lastname: "Roll", company: "Magento", street: ["Magento shipping", "Main Street"], city: "Austin", region: "US-WA", postcode: "78758", country_code: "US", telephone: "9999998899", save_in_address_book: false}}}) { cart {billing_address {firstname,lastname,company,street,city,region {code,label},postcode,telephone,country {code,label} }}}}';
      return resolve(args).then(result => {
        const errors = result.errors[0];
        expect(errors).shallowDeepEqual({
          message:
            'Object 03bdd6d9-ede2-495c-8ed8-728326003259 has a different version than expected. Expected: 16 - Actual: 22.',
          source: {
            name: 'GraphQL request',
          },
        });
      });
    });

    it('Mutation: validate response should return invalid cart id', () => {
      scope
        .post('/CT_INSTANCE_PROJECT/graphql', {
          query: VersionCartQuery,
          variables: {
            uid: '03bdd6d9-ede2-495c-8ed8-72832600325',
          },
        })
        .reply(200, commerceVersionNumberResponse);
      scope
        .post('/CT_INSTANCE_PROJECT/graphql', {
          query: SetBillingAddressMutation,
          variables: {
            uid: '03bdd6d9-ede2-495c-8ed8-72832600325',
            version: 106,
            firstName: 'Bob',
            lastName: 'Roll',
            company: 'Magento',
            streetName: 'Magento shipping',
            city: 'Austin',
            region: 'US-WA',
            postalCode: '78758',
            country: 'US',
            phone: '9999998899',
          },
        })
        .reply(200, commerceInvalidCartIdResponse);

      args.query =
        'mutation {setBillingAddressOnCart(input: {cart_id: "03bdd6d9-ede2-495c-8ed8-72832600325", billing_address: {address: {firstname: "Bob", lastname: "Roll", company: "Magento", street: ["Magento shipping", "Main Street"], city: "Austin", region: "US-WA", postcode: "78758", country_code: "US", telephone: "9999998899", save_in_address_book: false}}}) { cart {billing_address {firstname,lastname,company,street,city,region {code,label},postcode,telephone,country {code,label} }}}}';
      return resolve(args).then(result => {
        const errors = result.errors[0];
        expect(errors).shallowDeepEqual({
          message:
            "The Cart with ID '03bdd6d9-ede2-495c-8ed8-072832600325' was not found.",
          source: {
            name: 'GraphQL request',
          },
        });
      });
    });
  });
});
