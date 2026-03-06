const required = [
  'SESSION_SECRET',
  'S3_ACCESS_KEY',
  'S3_SECRET_ACCESS_KEY',
  'S3_BUCKET_NAME',
  'S3_BUCKET_REGION',
];

const validateEnv = () => {
  const missing = required.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    console.error(`Missing required environment variables: ${missing.join(', ')}`);
    process.exit(1);
  }
};

export default validateEnv;
