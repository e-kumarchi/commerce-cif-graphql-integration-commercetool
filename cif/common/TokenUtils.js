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

const axios = require('axios');
const qs = require('querystring');

class TokenUtils {
  static getOAuthClientBearer(actionParameters) {
    const {
      CT_CLIENTID,
      CT_CLIENTSECRET,
      CT_AUTH_HOST,
      CT_OAUTH_PATH,
      CT_PROTOCOL,
      bearer,
    } = actionParameters;
    if (bearer) {
      return Promise.resolve(`Bearer ${bearer}`);
    }
    return axios
      .request({
        url: `${CT_PROTOCOL}://${CT_AUTH_HOST}${CT_OAUTH_PATH}`,
        method: 'POST',
        auth: {
          username: CT_CLIENTID,
          password: CT_CLIENTSECRET,
        },
        data: qs.stringify({
          grant_type: 'client_credentials',
          scope: 'manage_project:CT_INSTANCE_PROJECT',
        }),
      })
      .then(response => `Bearer ${response.data.access_token}`)
      .catch(err => err);
  }
}

module.exports = TokenUtils;
