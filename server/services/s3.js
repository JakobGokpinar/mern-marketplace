const { S3Client, ListObjectsV2Command, DeleteObjectsCommand, DeleteObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');

const BUCKET_NAME = process.env.AWS_BUCKET_NAME;

const s3 = new S3Client({
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
  region: process.env.AWS_BUCKET_REGION,
});

const getEnvFolder = () => process.env.NODE_ENV === 'production' ? 'prod' : 'dev';

const deleteObjectsByPrefix = async (prefix) => {
  const listed = await s3.send(new ListObjectsV2Command({ Bucket: BUCKET_NAME, Prefix: prefix }));
  if (!listed.Contents || listed.Contents.length === 0) return;
  await s3.send(new DeleteObjectsCommand({
    Bucket: BUCKET_NAME,
    Delete: { Objects: listed.Contents.map((f) => ({ Key: f.Key })) },
  }));
};

const deleteObject = async (key) => {
  await s3.send(new DeleteObjectCommand({ Bucket: BUCKET_NAME, Key: key }));
};

const getObject = async (key) => {
  return s3.send(new GetObjectCommand({ Bucket: BUCKET_NAME, Key: key }));
};

const streamToBuffer = async (stream) => {
  const chunks = [];
  for await (const chunk of stream) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
};

module.exports = { s3, BUCKET_NAME, getEnvFolder, deleteObjectsByPrefix, deleteObject, getObject, streamToBuffer };
