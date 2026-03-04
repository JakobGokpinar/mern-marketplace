const nodemailer = require('nodemailer');
const EmailVerifyToken = require('../models/EmailVerifyToken');

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: 587,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASS
    }
});

const sendVerificationEmail = async (receiver_email, receiver_username, receiver_id, token) => {
    await EmailVerifyToken.create({ userId: receiver_id, token });

    const options = {
        from: process.env.EMAIL_USER,
        to: receiver_email,
        subject: 'Bekreft e-postadressen din på Rego',
        html: `
<body style="background-color:#ffffff;color:#24292e;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif">
  <table align="center" role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width:480px;margin:0 auto;padding:20px 0 48px">
    <tr>
      <td>
        <p style="font-size:24px;line-height:1.25;margin:16px 0"><strong>${receiver_username}</strong>, velkommen til Rego</p>
        <table style="padding:24px;border:solid 1px #dedede;border-radius:5px;text-align:center" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%">
          <tbody>
            <tr>
              <td>
                <p style="font-size:14px;line-height:24px;margin:0 0 10px 0;text-align:left">Hei <strong>${receiver_username}</strong>!</p>
                <p style="font-size:14px;line-height:24px;margin:0 0 10px 0;text-align:left">
                  Du er registrert på Rego. Klikk på knappen nedenfor for å bekrefte e-postadressen din.
                </p>
                <a target="_blank" href="${process.env.CLIENT_URL}/emailVerify?t=${token}" style="display:inline-block;font-size:14px;background-color:#0D9488;color:#fff;line-height:120%;border-radius:0.5em;padding:0.75em 1.5em;text-decoration:none;margin-top:8px">
                  Bekreft e-post
                </a>
              </td>
            </tr>
          </tbody>
        </table>
        <p style="font-size:12px;line-height:24px;margin:16px 0;color:#6a737d;text-align:center">
          <a target="_blank" href="${process.env.CLIENT_URL}/emailVerify?t=${token}" style="color:#0366d6;text-decoration:none;font-size:12px">
            ${process.env.CLIENT_URL}/emailVerify?t=${token}
          </a>
        </p>
        <p style="font-size:12px;line-height:24px;margin:16px 0;color:#6a737d;text-align:center;margin-top:60px">Rego ・Oslo, Norway</p>
      </td>
    </tr>
  </table>
</body>`
    };

    await transporter.sendMail(options);
};

module.exports = sendVerificationEmail;
