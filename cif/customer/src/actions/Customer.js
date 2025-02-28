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

const LoaderProxy = require('../../../common/LoaderProxy.js');
const CustomerLoader = require('../loaders/CustomerLoader.js');
const Address = require('./Address.js');

class Customer {
  /**
   * @param {Object} parameters parameter object contains the graphqlContext, actionParameters & access token
   * @param {Object} [parameters.graphqlContext] The optional GraphQL execution context passed to the resolver.
   * @param {Object} [parameters.actionParameters] Some optional parameters of the I/O Runtime action, like for example customerId, bearer token, query and url info.
   */
  constructor(parameters) {
    this.actionParameters = parameters.actionParameters;
    this.getCustomerLoader = new CustomerLoader(parameters.actionParameters);
    /**
     * This class returns a Proxy to avoid having to implement a getter for all properties.
     */
    return new LoaderProxy(this);
  }

  /**
   * method used to call load method of getCustomerIdLoader class
   */
  __load() {
    return this.getCustomerLoader.load(this.actionParameters);
  }

  /**
   * method used to convert getCustomerIdLoader CT data into magento GraphQL response
   * @param {*} data parameter data contains the generateCustomerToken(AccessToken+CustomerID) data
   */
  __convertData(data) {
    return {
      ...data,
      id: 1,
      default_shipping: 1,
      default_billing: 1,

      addresses: data.addresses.map((address, index) => {
        address.street = [address.street];
        address.default_shipping = index === 1;
        address.default_billing = index === 1;
        address.id = index;
        return new Address(address).address;
      }),
    };
  }
}

/**
 * @type {Customer}
 */
module.exports = Customer;
