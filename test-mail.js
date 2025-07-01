const sendMail = require('./mailer'); // Adjust path if needed

sendMail(
  "noreply.timeturner@gmail.com", // Replace with your email to test
  "Test Subject",
  "<p>This is a test email from TimeTurner!</p>"
).then(info => {
  console.log("Email sent:", info.response);
}).catch(err => {
  console.error("Error sending email:", err);
});