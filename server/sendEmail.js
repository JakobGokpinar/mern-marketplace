const nodemailer = require('nodemailer');
const EmailVerifyToken = require('./models/EmailVerifyToken.js');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: "",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASS
  },
  tls: {
    rejectUnauthorized: false
  }
})


const emailVerify = async (receiver_email, receiver_username, receiver_id, token) => {
  await EmailVerifyToken.create({ userId: receiver_id, token: token})
  const options = emailVerifyTemplate(receiver_email, receiver_username, token)

  // Send Email
  transporter.sendMail(options, (err, info) => {
    if(err) {
      console.log(err)
    } 
  })
} 

function emailVerifyTemplate(receiver_email, receiver_username,token) {
  const options = {
    from: process.env.EMAIL_USER,
    to: receiver_email,
    subject: "Your account has been registered",
    html:`<body style="background-color:#ffffff;color:#24292e;font-family:-apple-system,BlinkMacSystemFont,&quot;Segoe UI&quot;,Helvetica,Arial,sans-serif,&quot;Apple Color Emoji&quot;,&quot;Segoe UI Emoji&quot;">
  <table align="center" role="presentation" cellSpacing="0" cellPadding="0" border="0" width="100%" style="max-width:37.5em;width:480px;margin:0 auto;padding:20px 0 48px">
    <tr style="width:100%">
      <td><img alt="Rego" src="https://www.rego.live/static/media/Rego.7bf7a9db.png" width="128" height="128" style="display:block;outline:none;border:none;text-decoration:none" />
        <p style="font-size:24px;line-height:1.25;margin:16px 0;text-decoration:none"><strong>${receiver_email}</strong>, Welcome to Rego.live</p>
        <table style="padding:24px;border:solid 1px #dedede;border-radius:5px;text-align:center" align="center" border="0" cellPadding="0" cellSpacing="0" role="presentation" width="100%">
          <tbody>
            <tr>
              <td>
                <p style="font-size:14px;line-height:24px;margin:0 0 10px 0;text-align:left">Hey <strong>${receiver_username}</strong>!</p>
                <p style="font-size:14px;line-height:24px;margin:0 0 10px 0;text-align:left">
                  Welcome to Winners Club! You have been succesfully registered to rego.live. 
                  Please complete the account verification  by clicking the button or link below.
                </p>
                <a target="_blank" style="font-size:14px;background-color:#28a745;color:#fff;line-height:100%;border-radius:0.5em;padding:0px 0px;text-decoration:none;display:inline-block;max-width:100%">
                  <span><!--[if mso]>
                      <i style="letter-spacing: undefinedpx;mso-font-width:-100%;mso-text-raise:0" hidden>
                        &nbsp;
                      </i>
                    <![endif]-->
                  </span>
                <a target="_blank" href="${process.env.CLIENT_URL}/emailVerify?t=${token}" style="color:#0366d6;text-decoration:none;font-size:12px">

                  <span style="font-size:14px;background-color:#28a745;color:#fff;line-height:120%;border-radius:0.5em;padding:0.75em 1.5em;max-width:100%;display:inline-block;text-decoration:none;text-transform:none;mso-padding-alt:0px;mso-text-raise:0">
                Verify your account
              
                </span>
                </a>
                <span><!--[if mso]><i style="letter-spacing: undefinedpx;mso-font-width:-100%" hidden>&nbsp;</i><![endif]--></span>
              </a>
              </td>
            </tr>
          </tbody>
        </table>
        <p style="font-size:14px;line-height:24px;margin:16px 0;text-align:center">
            <a target="_blank" href="${process.env.CLIENT_URL}/emailVerify?t=${token}" style="color:#0366d6;text-decoration:none;font-size:12px">
            ${process.env.CLIENT_URL}/emailVerify?t=${token}
            </a>
        </p>
        <p style="font-size:12px;line-height:24px;margin:16px 0;color:#6a737d;text-align:center;margin-top:60px">Rego.live, Inc. ・Oslo, Norway</p>
      </td>
    </tr>
  </table>
</body>`
};

  return options;
}

module.exports = emailVerify