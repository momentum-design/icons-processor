const _ = require('lodash');
const archiver = require('archiver');
const config = require('../config');
const fs = require('fs-extra');
const { logger } = require('./logger');
const mime = require('mime');
const uploadToS3 = require('./uploadToS3');

const createIosZip = async iconInfo => {
  const { variation, dir } = iconInfo;
  const zipFileFormat = '_png.zip';
  const downloadsPath = `${config.iconsDirectory}${variation}`;
  const downloadsFilePath = `${downloadsPath}/${variation}${zipFileFormat}`;
  const tempFilePath = `${config.tempPath}/${variation}${zipFileFormat}`;
  try {
    const output = fs.createWriteStream(tempFilePath);
    const archive = archiver('zip', {
      zlib: { level: 9 },
    });
    archive.pipe(output);
    for (let format of config.iosFormats) {
      const pngFormat = _.split(format, '*')[0];
      archive.file(`${dir}/${variation}${format}`, {
        name: `${variation}${pngFormat}.png`,
      });
    }
    archive.finalize();
    const mimeType = mime.getType(tempFilePath);
    const fileContent = fs.readFileSync(tempFilePath);
    await uploadToS3(downloadsFilePath, fileContent, mimeType);
    fs.unlinkSync(tempFilePath);
    return logger.info(`${variation} iOS zip file created`);
  } catch (error) {
    logger.error(`Error, ${error.message}`);
  }
};

module.exports = createIosZip;
