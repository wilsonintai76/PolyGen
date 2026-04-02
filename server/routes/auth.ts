import { Hono } from 'hono';
import { setCookie, deleteCookie, getCookie } from 'hono/cookie';
import { getDb } from '../db';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';

const authRoute = new Hono<{ Bindings: { DB: any, GOOGLE_CLIENT_ID: string, GOOGLE_CLIENT_SECRET: string, AUTH_REDIRECT_URI: string } }>();

authRoute.get('/google', (c) => {
  const googleClientId = c.env.GOOGLE_CLIENT_ID;
  const redirectUri = c.env.AUTH_REDIRECT_URI;
  
  if (!googleClientId || !redirectUri) {
    return c.text('Google OAuth environment variables not configured', 500);
  }

  const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${googleClientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=openid%20email%20profile&access_type=offline&prompt=consent`;
  
  return c.redirect(googleAuthUrl);
});

authRoute.get('/callback', async (c) => {
  const db = getDb(c.env);
  const code = c.req.query('code');
  
  if (!code) return c.redirect('/login?error=missing_code');

  try {
    // Exchange code for token
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: c.env.GOOGLE_CLIENT_ID,
        client_secret: c.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: c.env.AUTH_REDIRECT_URI,
        grant_type: 'authorization_code'
      })
    });

    const tokenData = await tokenRes.json() as any;
    if (tokenData.error) throw new Error(tokenData.error_description);

    // Get user info
    const userRes = await fetch('https://www.googleapis.com/oauth2/v1/userinfo?alt=json', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` }
    });
    
    const userData = await userRes.json() as any;
    
    // Upsert user in DB
    const [existingUser] = await db.select().from(users).where(eq(users.email, userData.email)).limit(1);
    
    let userId = existingUser?.id;
    if (!existingUser) {
      const [newUser] = await db.insert(users).values({
        name: userData.name || userData.email.split('@')[0],
        email: userData.email,
        role: 'lecturer', // Default role
        isActive: true
      }).returning();
      userId = newUser.id;
    }

    // Set simple session cookie (in a real app, use signed cookies or JWT)
    setCookie(c, 'auth_session', JSON.stringify({
      id: userId,
      email: userData.email,
      name: userData.name,
      role: existingUser?.role || 'lecturer'
    }), {
      path: '/',
      secure: true,
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 7, // 7 days
      sameSite: 'Lax'
    });

    return c.redirect('/dashboard');
  } catch (error: any) {
    console.error('Google Auth Error:', error);
    return c.redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }
});

authRoute.get('/session', (c) => {
  const session = getCookie(c, 'auth_session');
  if (!session) return c.json(null);
  
  try {
    return c.json(JSON.parse(session));
  } catch (e) {
    return c.json(null);
  }
});

authRoute.post('/logout', (c) => {
  deleteCookie(c, 'auth_session');
  return c.json({ success: true });
});

export default authRoute;
