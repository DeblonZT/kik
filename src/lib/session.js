// src/lib/session.js
export const sessionOptions = {
  password: "pasti-kan-password-ini-minimal-32-karakter-panjangnya", 
  cookieName: "absensi_admin_session",
  cookieOptions: {
    // secure: true harus aktif jika menggunakan https (production)
    secure: process.env.NODE_ENV === "production",
  },
};