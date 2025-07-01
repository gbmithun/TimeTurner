const sendMail = require('./mailer'); 

sendMail(
  "noreply.timeturner@gmail.com", 
  "Test Subject",
  "<p>This is a test email from TimeTurner!</p>"
).then(info => {
  console.log("Email sent:", info.response);
}).catch(err => {
  console.error("Error sending email:", err);
});