const required = [
  'SESSION_SECRET',
  'AWS_ACCESS_KEY',
  'AWS_SECRET_ACCESS_KEY',
  'AWS_BUCKET_NAME',
  'AWS_BUCKET_REGION',
];

const validateEnv = () => {
  const missing = required.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    console.error(`Missing required environment variables: ${missing.join(', ')}`);
    process.exit(1);
  }
};

module.exports = validateEnv;
