const _ = require('lodash');
const config = require('../config');
const fs = require('fs-extra');
const JSZip = require('jszip');
const mime = require('mime');
const path = require('path');
const { logger } = require('./logger');
const uploadToS3 = require('./uploadToS3');

const createAndroidZip = async iconInfo => {
  const { variation, dir } = iconInfo;
  const zipFileFormat = '_png-svg.zip';
  const downloadsPath = `${config.iconsDirectory}${variation}`;
  const downloadsFilePath = `${downloadsPath}/${variation}${zipFileFormat}`;
  const tempFilePath = path.resolve(__dirname, `../${config.tempPath}/${variation}${zipFileFormat}`);

  try {
    const zip = new JSZip();
    zip.file(`${variation}.svg`, fs.readFileSync(`${dir}/${variation}.svg`), { binary: true });

    for (let format of config.androidFormats) {
      const pngFormat = _.split(format, '*adr_')[1].split('.png')[0];
      const file = `${dir}/${variation}${format}`;
      const fileName = `${pngFormat}/${variation}.png`;
      const fileContents = fs.readFileSync(file);
      zip.file(fileName, fileContents, { binary: true });
    }
    zip
      .generateNodeStream({ type: 'nodebuffer', streamFiles: true })
      .pipe(fs.createWriteStream(tempFilePath))
      .on('finish', async () => {
        const mimeType = mime.getType(tempFilePath);
        const fileContent = fs.readFileSync(tempFilePath);
        await uploadToS3(downloadsFilePath, fileContent, mimeType);
        fs.unlinkSync(tempFilePath);
        return logger.info(`${variation} Android zip file created`);
      });
  } catch (error) {
    logger.error(`Error, ${error.message}`);
  }
};

module.exports = createAndroidZip;
