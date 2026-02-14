#!/usr/bin/env node
/**
 * Gmail IMAP Poller
 * Polls Gmail inbox every 15 minutes, processes emails, extracts attachments
 */

const Imap = require('imap');
const { simpleParser } = require('mailparser');
const fs = require('fs');
const path = require('path');

const GMAIL_USER = 'clark.openclawbot@gmail.com';
const GMAIL_PASS = 'dhqh adbq ogva kxto';
const ATTACHMENTS_DIR = path.join(process.env.HOME, '.openclaw/workspace/email-attachments');
const PROCESSED_FILE = path.join(process.env.HOME, '.openclaw/workspace/email-processed.json');

// Ensure directories exist
if (!fs.existsSync(ATTACHMENTS_DIR)) {
  fs.mkdirSync(ATTACHMENTS_DIR, { recursive: true });
}

// Track processed emails
let processedEmails = {};
if (fs.existsSync(PROCESSED_FILE)) {
  try {
    processedEmails = JSON.parse(fs.readFileSync(PROCESSED_FILE, 'utf8'));
  } catch (e) {
    processedEmails = {};
  }
}

const imap = new Imap({
  user: GMAIL_USER,
  password: GMAIL_PASS,
  host: 'imap.gmail.com',
  port: 993,
  tls: true,
});

async function processEmail(msg) {
  return new Promise((resolve, reject) => {
    simpleParser(msg, async (err, parsed) => {
      if (err) {
        console.error('Parse error:', err);
        resolve(null);
        return;
      }

      const emailData = {
        subject: parsed.subject || '(no subject)',
        from: parsed.from?.text || 'unknown',
        text: parsed.text || '',
        attachments: [],
      };

      // Extract attachments
      if (parsed.attachments && parsed.attachments.length > 0) {
        for (const att of parsed.attachments) {
          const filename = att.filename || `attachment-${Date.now()}`;
          const filepath = path.join(ATTACHMENTS_DIR, filename);
          fs.writeFileSync(filepath, att.content);
          emailData.attachments.push({
            filename,
            path: filepath,
            size: att.size,
          });
        }
      }

      resolve(emailData);
    });
  });
}

function openInbox(cb) {
  imap.openBox('INBOX', false, cb);
}

async function pollInbox() {
  return new Promise((resolve, reject) => {
    imap.openBox('INBOX', false, async (err, box) => {
      if (err) {
        console.error('Box error:', err);
        resolve([]);
        return;
      }

      // Search for UNSEEN emails
      imap.search(['UNSEEN'], (err, results) => {
        if (err) {
          console.error('Search error:', err);
          resolve([]);
          return;
        }

        if (!results || results.length === 0) {
          resolve([]);
          return;
        }

        const f = imap.fetch(results, { bodies: '' });
        const newEmails = [];

        f.on('message', (msg, seqno) => {
          processEmail(msg).then((emailData) => {
            if (emailData) {
              newEmails.push(emailData);
            }
          });
        });

        f.on('error', reject);
        f.on('end', () => {
          resolve(newEmails);
        });
      });
    });
  });
}

imap.openBox('INBOX', false, async (err, box) => {
  if (err) throw err;

  const emails = await pollInbox();
  
  if (emails.length > 0) {
    console.log(`Found ${emails.length} new emails`);
    
    // Build summary for output
    const summary = emails.map(e => ({
      from: e.from,
      subject: e.subject,
      attachments: e.attachments.map(a => a.filename),
      preview: e.text.substring(0, 200),
    }));

    console.log(JSON.stringify(summary, null, 2));
    
    // Save processed
    const timestamp = Date.now();
    emails.forEach((e, idx) => {
      processedEmails[`${timestamp}-${idx}`] = {
        subject: e.subject,
        from: e.from,
        attachments: e.attachments,
        processedAt: new Date().toISOString(),
      };
    });
    
    fs.writeFileSync(PROCESSED_FILE, JSON.stringify(processedEmails, null, 2));
  } else {
    console.log('No new emails');
  }

  imap.end();
});

imap.openBox('INBOX', false, (err, box) => {
  if (err) throw err;
});

imap.on('error', (err) => {
  console.error('IMAP error:', err);
});

imap.on('end', () => {
  console.log('Connection ended');
});

imap.openBox('INBOX', false, (err, box) => {
  if (err) throw err;
  process.exit(0);
});
