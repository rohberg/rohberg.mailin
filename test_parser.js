// ### Pipe file to MailParser
//
// This example pipes a `readableStream` file to **MailParser**

    var MailParser = require("mailparser").MailParser,
        mailparser = new MailParser(),
        fs = require("fs");

    // old mailparser version
    // mailparser.on("end", function(mail_object){
    //     console.log("Subject:", mail_object.subject);
    // });

    mailparser.on('headers', headers => {
        console.log(headers.get('subject'));
    });

    mailparser.on('data', data => {
        if (data.type === 'attachment') {
            console.log(data.filename);
            // data.content.pipe(process.stdout);
            data.content.on('end', () => data.release());
        }
    });

    // fs.createReadStream("Rich Text.eml").pipe(mailparser);
    fs.createReadStream("Rich Text email with attachment.eml").pipe(mailparser);
