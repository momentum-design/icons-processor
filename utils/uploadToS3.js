require('dotenv').config();
const AWS = require('aws-sdk');
const { logger } = require('./logger');
const s3 = new AWS.S3({
  apiVersion: '2006-03-01',
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

const uploadToS3 = async (filePath, fileContent, fileMimeType) => {
  const s3Promise = s3
    .putObject({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: filePath,
      Body: fileContent,
      ContentType: fileMimeType,
    })
    .promise();
  try {
    await s3Promise;
    return logger.verbose(`Successfully uploaded '${filePath}'!`);
  } catch (error) {
    return logger.error(`Error, ${error.message}`);
  }
};

module.exports = uploadToS3;
