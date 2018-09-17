const _ = require('lodash');
const archiver = require('archiver');
const config = require('../config');
const fs = require('fs-extra');
const { logger } = require('./logger');
const mime = require('mime');
const uploadToS3 = require('./uploadToS3');

const createAndroidZip = async iconInfo => {
  const { variation, dir } = iconInfo;
  const zipFileFormat = '_png-svg.zip';
  const downloadsPath = `${config.iconsDirectory}${variation}`;
  const downloadsFilePath = `${downloadsPath}/${variation}${zipFileFormat}`;
  const tempFilePath = `${config.tempPath}/${variation}${zipFileFormat}`;
  try {
    const output = fs.createWriteStream(tempFilePath);
    const archive = archiver('zip', {
      zlib: { level: 9 },
    });
    archive.pipe(output);
    archive.file(`${dir}/${variation}.svg`, { name: `${variation}.svg` });
    for (let format of config.androidFormats) {
      const pngFormat = _.split(format, '*adr_')[1].split('.png')[0];
      archive.file(`${dir}/${variation}${format}`, {
        name: `${pngFormat}/${variation}.png`,
      });
    }
    archive.finalize();
    const mimeType = mime.getType(tempFilePath);
    const fileContent = fs.readFileSync(tempFilePath);
    await uploadToS3(downloadsFilePath, fileContent, mimeType);
    fs.unlinkSync(tempFilePath);
    return logger.info(`${variation} Android zip file created`);
  } catch (error) {
    logger.error(`Error, ${error.message}`);
  }
};

module.exports = createAndroidZip;
