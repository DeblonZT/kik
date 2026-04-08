import mysql from 'mysql2/promise';


let connection;
export const createConnection = async () => {
    if (!connection) {
        // ✅ Tambah log ini untuk cek apakah env terbaca
        console.log('🔌 DB Config:', {
            host: process.env.DATABASE_HOST,
            user: process.env.DATABASE_USER,
            database: process.env.DATABASE_NAME,
            password: process.env.DATABASE_PASSWORD ? '***ada***' : '❌ KOSONG',
        });

        connection = await mysql.createConnection({
            host: process.env.DATABASE_HOST,
            user: process.env.DATABASE_USER,
            password: process.env.DATABASE_PASSWORD,
            database: process.env.DATABASE_NAME,
        });

        console.log('✅ DB Connected!');
    }
    return connection;
}

