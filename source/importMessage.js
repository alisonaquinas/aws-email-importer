/**
 * @summary: Adds a message to a specified imap server, adds domain label for gmail accounts
 * @async
 * 
 * @param {Object} imap             : Access port for connecting to AWS
 * @param {Object} notificationObj  : CredentialPath for the desired secret
 * 
 * @return {Promise} a promise to import the message
 */
exports.importMessage = async function (imap, notificationObj) {
    console.log('Processing ', notificationObj.mail.commonHeaders.subject, " from  ", notificationObj.mail.commonHeaders.date)
    let messageObj = notificationObj.mail;
    let buff = Buffer.from(notificationObj.content, 'base64');
    let msg = buff.toString('utf8');
    let sendDate = new Date(messageObj.headers.find(a => a.name == "Date").value);
    let messageId = messageObj.headers.find(a => a.name == "Message-ID").value;
    const mainInbox = 'INBOX';
    console.log("adding ", messageId);
    await imap.appendAsync(msg, { mailbox: mainInbox, date: sendDate });
    boxes = await imap.getBoxesAsync()
    await Promise.all(messageObj.destination.map(async (aDest) => {
        let domain = aDest.split("@")[1]
        if (!boxes[domain]) { return; }
        console.log(domain, " - ", messageId);
        await imap.appendAsync(msg, { mailbox: domain, date: sendDate });
        let msgCriteria = [['HEADER', 'Message-ID', messageId]]
        try {
            await imap.openBoxAsync(mainInbox);
            let uuid = await imap.searchAsync(msgCriteria);
            console.debug(uuid);
            await imap.addLabelsAsync(uuid, domain);
        }
        finally {
            await imap.closeBoxAsync()
        }
        try {
            await imap.openBoxAsync(domain)
            let uuid = await imap.searchAsync(msgCriteria);
            console.debug(uuid);
            await imap.addLabelsAsync(uuid, domain);
        }
        finally {
            await imap.closeBoxAsync()
        }
        console.log('Finished adding', messageId);
    }));
    return notificationObj;
}