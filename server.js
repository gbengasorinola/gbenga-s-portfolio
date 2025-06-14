const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public', {
  maxAge: '30d' // Cache static assets for 30 days
}));

app.post('/send', (req, res) => {
  const { name, email, message } = req.body;

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'sorinolag@gmail.com',
      pass: 'xgka rkwa wptp bjtl'
    }
  });

  const mailOptions = {
    from: email,
    to: 'sorinolag@gmail.com',
    subject: 'Portfolio Form Message',
    text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) return res.status(500).send('Error');
    res.redirect('/');
  });
});

app.listen(3000, '127.0.0.1', () => {
  console.log(`Server running on http://127.0.0.1:3000`);
});
