import { Hono } from 'hono';

const storageRoute = new Hono<{ Bindings: { BUCKET: any } }>();

storageRoute.post('/upload', async (c) => {
  try {
    const body = await c.req.parseBody();
    const file = body['file'];
    
    if (!file || !(file instanceof File)) {
      return c.json({ error: 'No file provided' }, 400);
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `polygen-${Date.now()}.${fileExt}`;

    // Cloudflare R2 Binding
    if (c.env && c.env.BUCKET) {
      await c.env.BUCKET.put(fileName, await file.arrayBuffer(), {
        httpMetadata: { contentType: file.type }
      });
      // In production, you would use a custom domain or Cloudflare Public URL
      // For now, we return a relative path or the filename
      return c.json({ publicUrl: `/api/storage/files/${fileName}`, fileName });
    }

    // Fallback for local development WITHOUT R2: convert to base64
    const buffer = await file.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');
    const dataUrl = `data:${file.type};base64,${base64}`;
    
    return c.json({ publicUrl: dataUrl, fileName: 'local-file' });
  } catch (error: any) {
    console.error('Storage upload error:', error);
    return c.json({ error: error.message }, 500);
  }
});

storageRoute.get('/files/:filename', async (c) => {
  const filename = c.req.param('filename');
  
  if (c.env && c.env.BUCKET) {
    const object = await c.env.BUCKET.get(filename);
    if (!object) return c.text('File not found', 404);
    
    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set('etag', object.httpEtag);
    
    return c.body(object.body, 200, {
      headers: Object.fromEntries(headers.entries())
    });
  }

  return c.text('R2 bucket not configured', 500);
});

export default storageRoute;
