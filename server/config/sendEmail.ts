import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: 587,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const BRAND_COLOR = '#0D9488';
const TEXT_COLOR = '#1F2937';
const MUTED_COLOR = '#6B7280';

function emailLayout(content: string) {
  return `
<!DOCTYPE html>
<html lang="no">
<head><meta charset="utf-8" /></head>
<body style="margin:0;padding:0;background-color:#F9FAFB;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:${TEXT_COLOR}">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="padding:40px 16px">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:480px;background:#ffffff;border-radius:12px;border:1px solid #E5E7EB;overflow:hidden">
          <!-- Header -->
          <tr>
            <td style="padding:28px 32px 20px;border-bottom:1px solid #F3F4F6">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td style="width:28px;height:28px;background:${BRAND_COLOR};border-radius:6px;text-align:center;vertical-align:middle;color:#fff;font-size:14px;font-weight:700">R</td>
                  <td style="padding-left:10px;font-size:18px;font-weight:700;color:${TEXT_COLOR};letter-spacing:-0.3px">Rego</td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding:28px 32px 32px">
              ${content}
            </td>
          </tr>
        </table>
        <!-- Footer -->
        <p style="font-size:12px;color:#9CA3AF;margin:24px 0 0;text-align:center">
          Rego &middot; Din markedsplass for brukte ting
        </p>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function button(text: string, href: string) {
  return `<a href="${href}" target="_blank" style="display:inline-block;font-size:14px;font-weight:600;background-color:${BRAND_COLOR};color:#ffffff;padding:12px 28px;border-radius:8px;text-decoration:none;margin-top:8px">${text}</a>`;
}

function greeting(name: string) {
  return `<p style="font-size:15px;line-height:1.6;margin:0 0 16px;color:${TEXT_COLOR}">Hei <strong>${name}</strong>,</p>`;
}

function paragraph(text: string) {
  return `<p style="font-size:15px;line-height:1.6;margin:0 0 16px;color:${TEXT_COLOR}">${text}</p>`;
}

function smallText(text: string) {
  return `<p style="font-size:13px;line-height:1.5;margin:16px 0 0;color:${MUTED_COLOR}">${text}</p>`;
}

// --- Email senders ---

export const sendVerificationEmail = async (to: string, name: string, verifyUrl: string) => {
  const content = `
    ${greeting(name)}
    ${paragraph('Takk for at du registrerte deg på Rego! Klikk på knappen under for å bekrefte e-postadressen din.')}
    ${button('Bekreft e-postadresse', verifyUrl)}
    ${smallText('Hvis knappen ikke fungerer, kopier og lim inn denne lenken i nettleseren din:')}
    <p style="font-size:12px;word-break:break-all;margin:4px 0 0"><a href="${verifyUrl}" style="color:${BRAND_COLOR};text-decoration:none">${verifyUrl}</a></p>
    ${smallText('Denne lenken utloper om 10 minutter.')}
  `;

  await transporter.sendMail({
    from: process.env.SMTP_USER,
    to,
    subject: 'Bekreft e-postadressen din - Rego',
    html: emailLayout(content),
  });
};

export const sendPasswordChangedEmail = async (to: string, name: string) => {
  const content = `
    ${greeting(name)}
    ${paragraph('Passordet ditt har blitt endret. Hvis du ikke gjorde denne endringen, ta kontakt med oss umiddelbart.')}
    ${smallText('Denne e-posten ble sendt fordi passordet til kontoen din ble oppdatert.')}
  `;

  await transporter.sendMail({
    from: process.env.SMTP_USER,
    to,
    subject: 'Passordet ditt er endret - Rego',
    html: emailLayout(content),
  });
};

export const sendEmailChangedNotification = async (to: string, name: string, newEmail: string) => {
  const masked = newEmail.replace(/^(.{2})(.*)(@.*)$/, (_, a, b, c) => a + '*'.repeat(b.length) + c);
  const content = `
    ${greeting(name)}
    ${paragraph(`E-postadressen til kontoen din har blitt endret til <strong>${masked}</strong>.`)}
    ${paragraph('Hvis du ikke gjorde denne endringen, ta kontakt med oss umiddelbart.')}
    ${smallText('Denne e-posten ble sendt til din tidligere e-postadresse som en sikkerhetsmelding.')}
  `;

  await transporter.sendMail({
    from: process.env.SMTP_USER,
    to,
    subject: 'E-postadressen din er endret - Rego',
    html: emailLayout(content),
  });
};

export const sendPasswordResetEmail = async (to: string, name: string, resetUrl: string) => {
  const content = `
    ${greeting(name)}
    ${paragraph('Vi mottok en forespørsel om å tilbakestille passordet ditt. Klikk på knappen under for å velge et nytt passord.')}
    ${button('Tilbakestill passord', resetUrl)}
    ${smallText('Hvis knappen ikke fungerer, kopier og lim inn denne lenken i nettleseren din:')}
    <p style="font-size:12px;word-break:break-all;margin:4px 0 0"><a href="${resetUrl}" style="color:${BRAND_COLOR};text-decoration:none">${resetUrl}</a></p>
    ${smallText('Denne lenken utloper om 10 minutter. Hvis du ikke ba om dette, kan du trygt ignorere denne e-posten.')}
  `;

  await transporter.sendMail({
    from: process.env.SMTP_USER,
    to,
    subject: 'Tilbakestill passordet ditt - Rego',
    html: emailLayout(content),
  });
};
