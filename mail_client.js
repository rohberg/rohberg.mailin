require('dotenv').config({ path: './config.env' });

const notifier = require('mail-notifier');
const request = require('request');

const inbox = {
 user: process.env.IMAP_USER,
 password: process.env.IMAP_PASS,
 host: process.env.IMAP_HOST,
 port: process.env.IMAP_PORT,
 tls: true,
 tlsOptions: { rejectUnauthorized: false }
};

notifier(inbox).on('mail', (mail) => {
   const newsletterObject = {
       '@type': 'zhkathnewsletter',
       'from': mail.from[0].address,
       'date': mail.receivedDate,
       'title': mail.subject ? mail.subject : 'No Subject',
       'text': mail.text && mail.text.replace(/\s/g,'').length > 0? mail.text : 'No Message body',
   };
   console.info("*** New Email Received!");
   console.info(newsletterObject['date'], '|', newsletterObject['title']);
   console.info(newsletterObject['text']);

   const options = {
     'uri': process.env.WEBHOOK_TARGET,
     'headers': {
       'User-Agent': 'mail-in client',
        'Accept': 'application/json',
        'Accept-Charset': 'utf-8',
        'Content-Type': 'application/json',
     },
     json: true,
     body: newsletterObject,
   }

   function callback(err, httpResponse, body){
        console.debug(err);
        console.debug('*** httpResponse');
        console.debug(httpResponse && httpResponse.statusCode);
        console.debug('');
      }

   request.post(options, callback).auth(process.env.PLONE_LOGIN, process.env.PLONE_PASSWORD);
   // request.post(options, callback);
   if (newsletterObject['from']==='newsletter@zh.kath.ch' || newsletterObject['from']==='newsletter@zhkath.ch') {
     // TODO: WEBHOOK_TARGET auf edgültige Adresse setzen um Plone Content zu erstellen
     // request.post(options, callback);
   }
}).start();
