require('dotenv').config({ path: './config.env' });

const notifier = require('mail-notifier');
const request = require('request');
const moment = require('moment');

const inbox = {
 user: process.env.IMAP_USER,
 password: process.env.IMAP_PASS,
 host: process.env.IMAP_HOST,
 port: process.env.IMAP_PORT,
 tls: true,
 tlsOptions: { rejectUnauthorized: false }
};

notifier(inbox).on('mail', (mail) => {
   var body = ''
   body = mail.html
   console.debug(mail);
   const newsletterObject = {
       '@type': process.env.PLONE_CONTENTTYPE,
       'from': mail.from[0].address,
       'date': mail.receivedDate,
       'title': mail.subject ? mail.subject : 'No Subject',
       'text': body,
       'description': moment.utc().format("DD.MM.YYYY"),
   };
   // console.debug(mail)
   console.info("*** New Email Received!");
   console.info(moment.utc().format("DD.MM.YYYY"), '|', newsletterObject['title']);
   console.info(newsletterObject['text']);

   const options = {
     'uri': process.env.WEBHOOK_TARGET,
     'json': true,
     'body': newsletterObject,
     'headers': {
       'User-Agent': 'mail-in client',
     },
   }

   function callback(err, httpResponse, body){
        if (err) {
          console.error(err);
        }
        console.info('*** httpResponse');
        console.info(httpResponse && httpResponse.statusCode);
      }

   if (process.env.ALLOWED_SENDERS.split(',').includes(newsletterObject['from'])) {
     request.post(options, callback).auth(process.env.PLONE_LOGIN, process.env.PLONE_PASSWORD);
   }
}).start();
