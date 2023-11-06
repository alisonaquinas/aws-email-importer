var https = require('http');

/**
 * @async
 * @summary Gets secret from AWS using HTTPs
 *
 * @param {Object} secretsHttpPort : Access port for connecting to AWS
 * @param {Object} credentialPath  : CredentialPath for the desired secret
 * @param {Object} token           : Token provided for IAM REST access
 * 
 * @return {Promise} a promise of request
 */
module.exports.getAwsSecretAsync = function getAwsSecret(secretsHttpPort, credentialPath, token) {
  var options = {
    hostname: 'localhost',
    port: secretsHttpPort,
    path: '/secretsmanager/get?secretId=' + credentialPath,
    headers: {
      'X-Aws-Parameters-Secrets-Token': token
    },
    method: 'GET'
  };
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      res.setEncoding('utf8');
      let responseBody = '';

      res.on('data', (chunk) => {
        responseBody += chunk;
      });

      res.on('end', () => {
        resolve(JSON.parse(responseBody));
      });
    });

    req.on('error', (err) => {
      reject(err);
    });
    req.end();
  });
}