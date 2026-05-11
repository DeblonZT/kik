export const sessionOptions = {
  password: process.env.SESSION_SECRET,
  cookieName: 'admin-session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 60 * 60 * 8, // 8 jam
  },
};