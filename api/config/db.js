import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const dbUrlConn = String(process.env.ONLN_DBURL)
const appenv = process.env.APP_ENV || 'quality';
const env = process.env.NODE_ENV || 'dev';

const dbUrl = appenv === 'production'
    ? (env === 'live' ? (console.log('Live (Production Server)'), `${dbUrlConn}notifyprddb?appName=notifyapp`) : (console.log('Dev (Production Server)'), `${dbUrlConn}notifydb?appName=notifyapp`))
    : (env === 'live' ? (console.log('Live (Quality Server)'), `${dbUrlConn}notifyqasdb?appName=notifyapp`) : (console.log('Dev (Quality Server)'), `${dbUrlConn}notifydb?appName=notifyapp`));

const dbnm = appenv === 'production'
    ? (env === 'live' ? (console.log('Live (Production Server)'), 'notifyprddb') : (console.log('Dev (Production Server)'), 'notifydb'))
    : (env === 'live' ? (console.log('Live (Quality Server)'), 'notifyqasdb') : (console.log('Dev (Quality Server)'), 'notifydb'));

mongoose.set('strictQuery', false); // Disable strict query mode

console.log(dbUrl);

const connectDB = async () => {
    try {
        await mongoose.connect(dbUrl, {
            dbName: dbnm,
            retryWrites: true,
            w: 'majority',
            ssl: true,
            maxPoolSize: 1, // Keep per-worker connections low
            minPoolSize: 1
        });
        console.log(`Worker ${process.pid}: DB Successfully Connected...`);
    } catch (error) {
        console.error(error);
        throw new Error('Database connection failed');
    }
}

export default connectDB;
