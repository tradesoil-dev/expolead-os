const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, BorderStyle } = require('docx');
const fs = require('fs');

function h1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 360, after: 160 },
    children: [new TextRun({ text, bold: true, size: 28, font: 'Arial' })]
  });
}

function h2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 280, after: 120 },
    children: [new TextRun({ text, bold: true, size: 24, font: 'Arial' })]
  });
}

function p(text) {
  return new Paragraph({
    spacing: { before: 80, after: 120 },
    children: [new TextRun({ text, size: 22, font: 'Arial' })]
  });
}

function bullet(text) {
  return new Paragraph({
    spacing: { before: 60, after: 60 },
    indent: { left: 720 },
    children: [new TextRun({ text: '•  ' + text, size: 22, font: 'Arial' })]
  });
}

function bold(text) {
  return new TextRun({ text, bold: true, size: 22, font: 'Arial' });
}

function divider() {
  return new Paragraph({
    spacing: { before: 240, after: 240 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: 'CCCCCC', space: 1 } },
    children: []
  });
}

const doc = new Document({
  styles: {
    default: { document: { run: { font: 'Arial', size: 22 } } }
  },
  sections: [{
    properties: {
      page: {
        size: { width: 11906, height: 16838 },
        margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 }
      }
    },
    children: [

      new Paragraph({
        spacing: { before: 0, after: 80 },
        children: [new TextRun({ text: 'Current as of 20 June 2026', size: 20, font: 'Arial', color: '888888' })]
      }),

      new Paragraph({
        spacing: { before: 0, after: 200 },
        children: [new TextRun({ text: 'Privacy Notice', bold: true, size: 40, font: 'Arial' })]
      }),

      p('Welcome, and thank you for your interest in ExpoLead OS ("ExpoLead OS," "we," or "us"), our website at https://expolead.tradesoil.com and all related services we provide (collectively, "ExpoLead OS Operations"). ExpoLead OS is a product of Tradesoil International, operated by Gladwin Gerald.'),

      p('This Privacy Notice describes the information we gather when you use ExpoLead OS, how we use and disclose such information, and the steps we take to protect it.'),

      p('This Privacy Notice is incorporated into and subject to the ExpoLead OS Terms of Service, available at https://expolead.tradesoil.com/terms.'),

      divider(),

      h1('1. DEFINITIONS'),

      p('"Personal Data" means any information relating to an identified or identifiable natural person.'),
      p('"Platform" means the ExpoLead OS application and all related services accessible after logging in.'),
      p('"User" means any individual who has created an account on ExpoLead OS.'),
      p('"Visitor" means an individual who accesses the public-facing website at expolead.tradesoil.com without logging in.'),

      divider(),

      h1('2. OUR ROLE'),

      p('ExpoLead OS acts solely as a data controller in relation to your Personal Data. As a data controller, we determine the purposes and means of processing your Personal Data. This includes information you provide when you sign up for an account and information generated through your use of the Platform.'),
      p('We do not act as a data processor on behalf of any third party in the context of ExpoLead OS Operations.'),

      divider(),

      h1('3. THE INFORMATION WE COLLECT'),

      h2('3.1 Information You Provide Directly'),
      p('Account signup: When you create an account, we collect your email address and password (stored in hashed form — we never store plain-text passwords). You may optionally provide your name.'),
      p('Business data you enter: Any connections, opportunities, exhibition records, notes, sample details, quotation records, and follow-up information you create within the Platform. This is your business data and you own it at all times.'),
      p('Communications: If you contact us by email for support or other purposes, we retain those communications to assist you and manage our relationship.'),

      h2('3.2 Automatically Collected Information'),
      p('Usage and log data: We collect basic logs of actions taken within the Platform for security monitoring and debugging purposes. This includes access timestamps, features used, and error reports.'),
      p('Device and browser information: When you access ExpoLead OS, we may collect standard browser and device information such as IP address, browser type, and operating system.'),

      h2('3.3 Cookies'),
      p('ExpoLead OS uses only essential cookies required for authentication and session management. We do not use tracking cookies, advertising cookies, or third-party analytics cookies. No cookie consent banner is required as we use only strictly necessary cookies.'),

      h2('3.4 No Sensitive Personal Data'),
      p('We do not knowingly collect sensitive or special categories of Personal Data such as health data, racial or ethnic origin, political opinions, or financial account numbers.'),

      divider(),

      h1('4. HOW WE USE THE INFORMATION WE COLLECT'),

      h2('4.1 Operations'),
      new Paragraph({ spacing: { before: 80, after: 60 }, children: [new TextRun({ text: 'We use the information to:', size: 22, font: 'Arial' })] }),
      bullet('Set up and maintain your account and provide the ExpoLead OS service;'),
      bullet('Store and retrieve the business data you enter into the Platform;'),
      bullet('Provide customer support and respond to your enquiries;'),
      bullet('Detect and prevent fraudulent activity and protect the security of the Platform;'),
      bullet('Enforce our Terms of Service and protect our legal rights.'),

      h2('4.2 Communications'),
      new Paragraph({ spacing: { before: 80, after: 60 }, children: [new TextRun({ text: 'We use the information to communicate with you, including:', size: 22, font: 'Arial' })] }),
      bullet('Send transactional emails such as account confirmation, welcome email, trial expiry notices, and security alerts;'),
      bullet('Notify you of material changes to our Terms of Service or this Privacy Notice;'),
      bullet('Respond to support requests you initiate.'),
      p('We do not send unsolicited marketing emails. We do not sell your data or use it for advertising purposes.'),

      h2('4.3 Security and Legal Compliance'),
      new Paragraph({ spacing: { before: 80, after: 60 }, children: [new TextRun({ text: 'We use the information to:', size: 22, font: 'Arial' })] }),
      bullet('Monitor and maintain the security and integrity of the Platform;'),
      bullet('Comply with applicable laws, regulations, and legal obligations;'),
      bullet('Respond to valid requests from regulatory authorities, courts, or law enforcement.'),

      h2('4.4 Legal Bases for Processing Personal Data'),
      p('We collect and process your Personal Data only where we have a lawful basis to do so. The legal bases we rely on are:'),
      bullet('Contract performance: Processing necessary to provide you with ExpoLead OS Operations under our Terms of Service;'),
      bullet('Legitimate interests: Processing for security, fraud prevention, and service improvement, where such interests are not overridden by your data protection rights;'),
      bullet('Legal obligation: Processing necessary to comply with applicable laws and regulations;'),
      bullet('Consent: Where we rely on your consent (for example, for non-essential communications), you may withdraw consent at any time by contacting us.'),

      divider(),

      h1('5. TO WHOM WE DISCLOSE INFORMATION'),

      p('We do not sell your Personal Data. We do not share your business data with third parties for advertising or marketing purposes. We disclose Personal Data only in the following circumstances:'),

      h2('5.1 Service Providers'),
      p('We work with the following trusted third-party service providers who may process Personal Data as part of providing their services to us:'),
      bullet('Supabase — database, authentication and storage (hosted on AWS);'),
      bullet('Vercel — application hosting and deployment;'),
      bullet('Resend — transactional email delivery.'),
      p('We limit the information provided to these service providers to what is reasonably necessary for them to perform their functions. Our agreements with them require them to maintain the confidentiality and security of such information.'),

      h2('5.2 Law Enforcement and Legal Process'),
      p('We may disclose Personal Data if required to do so by applicable law, court order, or valid legal process, or where we believe in good faith that disclosure is necessary to: (i) comply with legal obligations; (ii) protect the safety and rights of ExpoLead OS, its users, or the public; (iii) detect, prevent, or address fraud, security, or technical issues.'),

      h2('5.3 Business Transfer'),
      p('In the event of a merger, acquisition, sale of assets, or similar transaction, Personal Data we hold may be transferred to the acquiring entity. We will notify you by email or a notice on our website if such a transfer occurs.'),

      h2('5.4 Non-Personally Identifiable Information'),
      p('We may share anonymous, aggregated, or otherwise non-personally-identifiable information for business analysis or reporting purposes. Such information cannot be used to identify you.'),

      divider(),

      h1('6. DATA SECURITY'),

      p('We take data security seriously and have implemented appropriate administrative, technical, and physical safeguards designed to prevent unauthorised access, use, disclosure, or destruction of your information. These include:'),
      bullet('All data is encrypted in transit using HTTPS/TLS;'),
      bullet('Authentication is managed by Supabase, an industry-standard platform;'),
      bullet('Row Level Security (RLS) policies enforce strict data isolation — no user can access another user’s data;'),
      bullet('Passwords are hashed and never stored in plain text.'),
      p('However, no security system is perfect. We cannot guarantee the absolute security of data transmitted over the internet. You are responsible for protecting your password and maintaining the security of your devices.'),
      p('If you believe your Personal Data has been compromised, please contact us immediately at hello.expolead@tradesoil.com. If we learn of a security breach, we will inform you and relevant authorities as required by applicable law.'),

      divider(),

      h1('7. INTERNATIONAL DATA TRANSFERS'),

      p('ExpoLead OS is operated by Tradesoil International, based in Singapore. Your data is stored on Supabase infrastructure hosted on AWS. By using ExpoLead OS, you acknowledge that your data may be transferred to and processed in countries other than your own.'),
      p('We take appropriate measures to ensure that any such international transfers comply with applicable data protection laws, including relying on standard contractual protections where required.'),

      divider(),

      h1('8. MINORS AND CHILDREN’S PRIVACY'),

      p('ExpoLead OS is not directed to or intended for individuals under the age of 18. We do not knowingly collect Personal Data from children under 18. If you are under 18, please do not use ExpoLead OS. If we learn that we have collected Personal Data from a person under 18, we will take steps to delete that information. If you are a parent or guardian and believe your child has created an account, please contact us at hello.expolead@tradesoil.com.'),

      divider(),

      h1('9. DATA ACCURACY AND RETENTION'),

      p('Information you provide should be accurate, complete, and up to date for the purposes for which it is used.'),
      p('We retain your Personal Data for as long as your account is active or as necessary to provide you with ExpoLead OS Operations. If you close your account, we will delete your personal data and business records within 30 days upon request. We may retain certain information for longer periods where required by law, to resolve disputes, or to enforce our agreements.'),
      p('To request deletion of your data, contact us at hello.expolead@tradesoil.com.'),

      divider(),

      h1('10. YOUR RIGHTS AND CHOICES'),

      p('Depending on the laws applicable to you, you may have the following rights regarding your Personal Data:'),
      bullet('Right to access: The right to confirm whether we process Personal Data about you and to obtain a copy of that data;'),
      bullet('Right to rectification: The right to request corrections to inaccurate or incomplete Personal Data;'),
      bullet('Right to deletion: The right to request deletion of your Personal Data;'),
      bullet('Right to restriction: The right to request that we limit how we use your Personal Data;'),
      bullet('Right to data portability: The right to receive your Personal Data in a structured, machine-readable format. You can export your data at any time using the CSV export feature;'),
      bullet('Right to object: The right to object to certain processing of your Personal Data;'),
      bullet('Right to withdraw consent: Where we rely on consent, you may withdraw it at any time without affecting the lawfulness of prior processing.'),

      p('To exercise any of these rights, contact us at hello.expolead@tradesoil.com. We will respond within 7 business days. We may need to verify your identity before processing your request.'),

      p('You may also update or correct your account information at any time by accessing your account settings within the Platform.'),

      divider(),

      h1('11. THIRD PARTY WEBSITES AND LINKS'),

      p('ExpoLead OS may contain links to third-party websites or services. We are not responsible for the privacy practices or content of those third parties. We encourage you to review the privacy notices of any third-party sites you visit.'),

      divider(),

      h1('12. CHANGES AND UPDATES TO THIS PRIVACY NOTICE'),

      p('We may update this Privacy Notice from time to time as the product evolves or legal requirements change. We will notify active users by email for any material changes. The date at the top of this page reflects the most recent update. Your continued use of ExpoLead OS after any updates constitutes your acceptance of the revised Privacy Notice.'),

      divider(),

      h1('13. HOW TO CONTACT US'),

      p('If you have any questions, concerns, or requests regarding this Privacy Notice or our data processing practices, please contact us:'),
      new Paragraph({
        spacing: { before: 80, after: 60 },
        indent: { left: 360 },
        children: [
          new TextRun({ text: 'ExpoLead OS / Tradesoil International', bold: true, size: 22, font: 'Arial' }),
        ]
      }),
      new Paragraph({
        spacing: { before: 40, after: 60 },
        indent: { left: 360 },
        children: [new TextRun({ text: 'Email: hello.expolead@tradesoil.com', size: 22, font: 'Arial' })]
      }),
      new Paragraph({
        spacing: { before: 40, after: 60 },
        indent: { left: 360 },
        children: [new TextRun({ text: 'Website: https://expolead.tradesoil.com', size: 22, font: 'Arial' })]
      }),
      new Paragraph({
        spacing: { before: 40, after: 60 },
        indent: { left: 360 },
        children: [new TextRun({ text: 'Governing law: Singapore', size: 22, font: 'Arial' })]
      }),

    ]
  }]
});

Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync('C:/Users/Gladwin Gerald/Downloads/ExpoLead OS Project Docs/Securiry Docs - Uploaded/ExpoLead-Privacy-Notice.docx', buffer);
  console.log('Done');
});
