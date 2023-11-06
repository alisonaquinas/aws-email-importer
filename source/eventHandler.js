/**
 * @file eventHandler.js
 * @summary Entry point for AWS events from SNS
 */

var IPromise = require('imap-promise');
const { getCredentialsAsync } = require('./getCredentialsAsync');
const { importMessage } = require('./importMessage');

/**
 * @async
 * @summary 
 * @param {*} event Event object from AWS SNS
 * @param {*} context runtime reporting from AWS Lambda 
 * @returns {Object} context token for success / fail
 */
exports.eventHandler = async function (event, context) {
    console.log(context);
    if (context) { console.log(context.getRemainingTimeInMillis(), 'ms remaining') };
    var myMostPrivateDetails = await getCredentialsAsync();
    var imap = new IPromise(myMostPrivateDetails);
    imap.disconnectAsync = () => {
        return new Promise(function (yay, nay) {
            try {
                imap.on('end', yay);
                imap.end();
            }
            catch (error) {
                nay(error);
            }
        });
    }
    imap.closeBoxAsync = util.promisify(imap.closeBox);
    imap.getBoxesAsync = util.promisify(imap.getBoxes);
    imap.appendAsync = util.promisify((msg, opt, cb) => { imap.append(msg, opt, cb) });
    imap.addLabelsAsync = util.promisify((msg, lab, cb) => { imap.addLabels(msg, lab, cb) });
    imap.searchAsync = util.promisify((crit, cb) => { imap.search(crit, cb) });

    try {
        await imap.connectAsync();
        if (context) { console.log(context.getRemainingTimeInMillis(), 'ms remaining') };
    }
    catch (error) {
        console.error("Server failed to connect", error);
        return error;
    }
    console.log("Server Connected");

    console.debug('event:', JSON.stringify(event));

    let errors = [];

    try {
        await Promise.all(event.Records.map(async (aEvent) => {
            try {
                let source = aEvent.EventSource;
                switch (source) {
                    case "aws:sns":
                        console.log("Processing Sns")
                        let message = JSON.parse(aEvent.Sns.Message)
                        await importMessage(imap, message);
                        break;
                    default:
                        error = "Unknown Source: " + source;
                        console.log(error);
                        throw new Error(error);
                }
            }
            catch (error) {
                console.error(error);
                errors.push(error);
            }
        }));
    }
    catch (error) {
        console.error("Error working with gmail: ", error);
        return context.error(error);
    }
    finally {
        await imap.disconnectAsync();
        imap.destroy();
        console.log("Server disconnected");
        if (context) { console.log(context.getRemainingTimeInMillis(), 'ms remaining') };
    }
    if (errors.length > 0) {
        if (context)
            return context.fail(errors);
        else
            return errors;
    }
    if (context)
        return context.succeed();
    else
        return 'OK'
}
