/**
 * aws-email-importer: Scripts to import messages received by AWS and sent to 
 * a Lambda instance into an imap server account
 */

let loadStart = Date.now()
console.log('Loading function...');
const {eventHandler} = require('./source/eventHandler')
let loadTime = Date.now() - loadStart;
console.log('Done Loading: %O ms', loadTime)

exports.handler = eventHandler;
