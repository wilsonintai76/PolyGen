import https from 'https';
import fs from 'fs';

https.get('https://odzvkxzgoibxxybcocbr.supabase.co/storage/v1/object/public/branding/horizontal%20logo.png', (res) => {
  const chunks: Buffer[] = [];
  res.on('data', (chunk) => chunks.push(chunk));
  res.on('end', () => {
    const buffer = Buffer.concat(chunks);
    fs.writeFileSync('logo.png', buffer);
    console.log('Downloaded logo.png', buffer.length);
  });
});
