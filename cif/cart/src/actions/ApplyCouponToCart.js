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
const ApplyCouponToCartLoader = require('../loaders/ApplyCouponToCartLoader.js');
const VersionLoader = require('../loaders/VersionLoader.js');

class ApplyCouponToCart {
  /**
   * @param {Object} parameters parameter object contains the cartId,couponCode,graphqlContext & actionParameters
   * @param {String} parameters.input parameter contains the cartId and couponCode
   * @param {Object} [parameters.graphqlContext] The optional GraphQL execution context passed to the resolver.
   * @param {Object} [parameters.actionParameters] Some optional parameters of the I/O Runtime action, like for example customerId, bearer token, query and url info.
   */
  constructor(parameters) {
    this.input = parameters.input;
    this.graphqlContext = parameters.graphqlContext;
    this.actionParameters = parameters.actionParameters;
    this.applyCouponToCartLoader = new ApplyCouponToCartLoader(
      parameters.actionParameters
    );
    this._versionLoader = new VersionLoader(parameters);
    /**
     * This class returns a Proxy to avoid having to implement a getter for all properties.
     */
    return new LoaderProxy(this);
  }

  /**
   * Version number is mandatory in commercetools for updatecart..
   * method used to initially call the versionLoader to get version number
   * method used to call load method from applyCouponToCart loader class
   */
  __load() {
    return this._versionLoader.load(this.input).then(version => {
      return this.applyCouponToCartLoader.load(this.input, version);
    });
  }

  /**
   * Converts data from the 3rd-party commerce system into the Magento GraphQL format.
   * @param {Object} data parameter data contains details from hybris
   * @returns {Object} convert the hybris data into magento graphQL schema and return the object
   */
  __convertData(data) {
    const discountCodes = data.discountCodes;
    return {
      cart: {
        applied_coupon: {
          code:
            (discountCodes &&
              discountCodes.length > 0 &&
              discountCodes[0].discountCode.code) ||
            '',
        },
      },
    };
  }
}
module.exports = ApplyCouponToCart;
