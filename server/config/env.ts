import 'dotenv/config';

if (process.argv.includes('dev')) {
  process.env.NODE_ENV = 'development';
  process.env.CLIENT_URL = process.env.CLIENT_URL_DEV;
  process.env.MONGODB_URL = process.env.MONGODB_DEV;
} else if (process.argv.includes('start')) {
  process.env.NODE_ENV = 'production';
  process.env.CLIENT_URL = process.env.CLIENT_URL_PROD;
  process.env.MONGODB_URL = process.env.MONGODB_PROD;
}
