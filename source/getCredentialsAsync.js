getAwsSecretAsync = require('./getAwsSecretAsync');

/**
 * Gets secret for connecting to the target IMAP server
 *
 * @return {Promise} a promise of an oject that can be used to connect with IMAP
 */
module.exports.getCredentialsAsync = async function getCredentialsAsync() {
    const credPath = 'Credentials.json';
    var myMostPrivateDetails;
    if (process.env.AWS_SESSION_TOKEN) {
        var options = {
            hostname: 'localhost',
            port: Number(process.env.PARAMETERS_SECRETS_EXTENSION_HTTP_PORT),
            path: '/secretsmanager/get?secretId=' + process.env.CREDS_PATH,
            headers: {
                'X-Aws-Parameters-Secrets-Token': process.env.AWS_SESSION_TOKEN
            },
            method: 'GET'
        };
        try {
            let resp = await getAwsSecretAsync(
                process.env.PARAMETERS_SECRETS_EXTENSION_HTTP_PORT,
                process.env.CREDS_PATH,
                process.env.AWS_SESSION_TOKEN
            );
            let secret = JSON.parse(resp.SecretString);
            myMostPrivateDetails =
            {
                user: secret.UserName,
                password: secret.Password,
                host: "imap.gmail.com",
                port: 993,
                tls: true,
                tlsOptions: {
                    rejectUnauthorized: false
                }
            };
        }
        catch (error) {
            console.error(error);
        }

    } else if (fs.existsSync(credPath)) {
        myMostPrivateDetails = JSON.parse(fs.readFileSync('Credentials.json', 'utf8'));
    } else {
        throw new Error('No credentials');
    }
    return myMostPrivateDetails;
}