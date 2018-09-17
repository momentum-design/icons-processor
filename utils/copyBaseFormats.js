const config = require('../config');
const fs = require('fs-extra');
const mime = require('mime');
const { logger } = require('./logger');
const uploadToS3 = require('./uploadToS3');

const copyBaseFormats = async iconInfo => {
  const { variation, dir, color } = iconInfo;
  try {
    for (let format of config.baseFormats) {
      const filePath = `${dir}/${variation}${format}`;
      const downloadsFilePath = `${
        config.iconsDirectory
      }${variation}/${variation}${format}`;
      const mimeType = mime.getType(filePath);
      const fileContent = fs.readFileSync(filePath);
      await uploadToS3(downloadsFilePath, fileContent, mimeType);
      if (format === '.svg' && color === 'default') {
        await fs.copy(
          `${dir}/${variation}${format}`,
          `${config.svgDirectory}/${variation}${format}`
        );
      }
    }
    return logger.info(
      `${variation} variations were copied to ${
        config.svgDirectory
      }`
    );
  } catch (error) {
    return logger.error(`Error, ${error.message}`);
  }
};

module.exports = copyBaseFormats;
