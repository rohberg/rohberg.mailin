# rohberg.mailin

The service *rohberg.mailin* listens to incoming mails of defined mail accounts and sends a request to Plone website. This creates content in Plone.

Download code to arbitrary location, configure with **config.env** and start with

    yarn mailin

configuration is made in **config.env**. See an example configuration at config.env.example

    IMAP_USER = foo@gmail.com
    IMAP_PASS = abc
    IMAP_HOST = imap.gmail.com
    IMAP_PORT = 993
    WEBHOOK_TARGET = 'http://code.example.com'
    PLONE_LOGIN = 'admin'
    PLONE_PASSWORD = 'secret'
    PLONE_CONTENTTYPE = 'mycontenttype'
    ALLOWED_SENDERS = 'foo@gmail.com,bar@gmail.com'



> ** Take care not to show the unsubscribe link. **

## Plone configuration

1. plone.restapi is installed.
2. User PLONE_LOGIN has write access to WEBHOOK_TARGET for PLONE_CONTENTTYPE.

## Dependencies:
1. mail-notifier https://www.npmjs.com/package/mail-notifier

## Credits

thank you Harjyot Singh for inspiration:
 https://www.twilio.com/blog/2017/06/how-to-forward-emails-sms-node-js.html

thank you jcreigno for mail-notifier:
https://www.npmjs.com/package/mail-notifier

## Testing

Add your test email to ALLOWED_SENDERS and send an email from this account to IMAP_USER. This creates a first content item in Plone at WEBHOOK_TARGET.
