const _ = require('lodash');
const config = require('../config');
const fs = require('fs-extra');
const JSZip = require('jszip');
const mime = require('mime');
const path = require('path');
const { logger } = require('./logger');
const uploadToS3 = require('./uploadToS3');

const createIosZip = async iconInfo => {
  const { variation, dir } = iconInfo;
  const zipFileFormat = '_png.zip';
  const downloadsPath = `${config.iconsDirectory}${variation}`;
  const downloadsFilePath = `${downloadsPath}/${variation}${zipFileFormat}`;
  const tempFilePath = path.resolve(__dirname, `../${config.tempPath}/${variation}${zipFileFormat}`);
  try {
    const zip = new JSZip();

    for (let format of config.iosFormats) {
      const pngFormat = _.split(format, '*')[0];
      const file = `${dir}/${variation}${format}`;
      const fileName = `${variation}${pngFormat}.png`;
      const fileContents = fs.readFileSync(file);
      zip.file(fileName, fileContents, { binary: true });
    }
    const foo = fs.createWriteStream(tempFilePath)
    zip
      .generateNodeStream({ type: 'nodebuffer', streamFiles: true })
      .pipe(foo)
      .on('finish', async () => {
        const mimeType = mime.getType(tempFilePath);
        const fileContent = fs.readFileSync(tempFilePath);
        await uploadToS3(downloadsFilePath, fileContent, mimeType);
        fs.unlinkSync(tempFilePath);
        return logger.info(`${variation} iOS zip file created`);
      });
  } catch (error) {
    logger.error(`Error, ${error.message}`);
  }
};

module.exports = createIosZip;
