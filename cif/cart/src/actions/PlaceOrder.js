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
const PlaceOrderLoader = require('../loaders/PlaceOrderLoader.js');
const VersionLoader = require('../loaders/VersionLoader.js');

class PlaceOrder {
  /**
   * @param {Object} parameters parameter object contains the input, graphqlContext & actionParameters
   * @param {String} parameters.input parameter contains the cartId
   * @param {Object} [parameters.graphqlContext] The optional GraphQL execution context passed to the resolver.
   * @param {Object} [parameters.actionParameters] Some optional parameters of the I/O Runtime action, like for example customerId, bearer token, query and url info.
   */
  constructor(parameters) {
    this.input = parameters.input;
    this.graphqlContext = parameters.graphqlContext;
    this.actionParameters = parameters.actionParameters;
    this._versionLoader = new VersionLoader(parameters);

    this.placeOrderLoader = new PlaceOrderLoader(parameters);
    /**
     * This class returns a Proxy to avoid having to implement a getter for all properties.
     */
    return new LoaderProxy(this);
  }

  /**
   * method used to call load method from placeorder loader class
   */
  __load() {
    return this._versionLoader.load(this.input).then(version => {
      return this.placeOrderLoader.load(this.input, version);
    });
  }

  /**
   * Converts post order data from the 3rd-party commerce system into the Magento GraphQL format.
   * @param {Object} data parameter data contains post order details from hybris
   * @returns {Object} convert the hybris data into magento graphQL schema and return the post order object
   */
  __convertData(data) {
    return {
      order: {
        order_id: data.orderNumber,
      },
    };
  }
}

module.exports = PlaceOrder;
