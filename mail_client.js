require('dotenv').config({ path: './config.env' });

const notifier = require('mail-notifier');
const request = require('request');
const moment = require('moment');
const parser = require('node-html-parser');

const inbox = {
 user: process.env.IMAP_USER,
 password: process.env.IMAP_PASS,
 host: process.env.IMAP_HOST,
 port: process.env.IMAP_PORT,
 tls: true,
 tlsOptions: { rejectUnauthorized: false }
};

notifier(inbox).on('mail', (mail) => {
   let txt = '';
   if (mail.html) {
       var root = parser.parse(mail.html);
       var body = root.querySelector('body')
       if (body) {
           txt = body.innerHTML;
       } else {
           txt = mail.html;
       }
   } else {
       txt = mail.text
   }
   let subject = mail.subject ? mail.subject : 'No Title';
   subject = subject.substring(0, subject.indexOf("#")) || subject;
   let tags = mail.subject.match( /\#\S*/g );
   let sender = mail.from[0].address;
   if (process.env.PLONE_CONTENTTYPE=='File') {
       var attachment = null;
       if (mail.attachments) {
           attachment1 = mail.attachments[0];
           let buffer = attachment1['content'];
           let encoding = attachment1['transferEncoding'];
           encoding = encoding=='quoted-printable' ? 'base64' : encoding;
           let data = buffer.toString(encoding);
           attachment = {
                "data": data,
                "encoding": encoding,
                "filename": attachment1['fileName'],
                "content-type": attachment1['contentType']
            };
       } else {
           attachment = {
               "data": "w6TDtsO8",
               "encoding": "base64",
               "filename": "dummy.txt",
               "content-type": "text/plain"}
       }
   };

   const bodyoptions = {
       '@type': process.env.PLONE_CONTENTTYPE,
       'from': mail.from[0].address,
       'date': mail.receivedDate,
       'title': subject,
       'text': txt,
       'description': moment.utc().format("DD.MM.YYYY"),
       'subjects': tags,
       'contributors': [sender],
   };
   if (process.env.PLONE_CONTENTTYPE=='File') {
       bodyoptions['file'] = attachment;
   };
   console.info("*** New mail received.");
   console.info(moment.utc().toLocaleString(), '|', bodyoptions['title']);
   // console.info(bodyoptions['text'])
   const options = {
     'uri': process.env.WEBHOOK_TARGET,
     'json': true,
     'body': bodyoptions,
     'headers': {
       'User-Agent': 'mail-in client',
     },
     'encoding': 'utf-8'
   }

   function callback(err, httpResponse, txt){
        if (err) {
          console.error(err);
        }
        console.info('status code: ' + httpResponse.statusCode);
      }

   if (process.env.ALLOWED_SENDERS.split(',').includes(bodyoptions['from'])) {
     request.post(options, callback).auth(process.env.PLONE_LOGIN, process.env.PLONE_PASSWORD);
     console.info("request posted.")
   }
}).start();
