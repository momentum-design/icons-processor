const _ = require('lodash');
const config = require('../config');
const fileFormats = _.concat(
  config.baseFormats,
  config.iosFormats,
  config.androidFormats
);
const fs = require('fs-extra');
const { logger } = require('./logger');

const deleteFiles = async iconInfo => {
  const { variation, dir } = iconInfo;
  for (let format of fileFormats) {
    try {
      await fs.move(
        `${dir}/${variation}${format}`,
        `${config.backupDirectory}/${variation}${format}`,
        { overwrite: true }
      );
      logger.verbose(`${dir}/${variation}${format} deleted.`);
    } catch (error) {
      logger.error(`Error, ${error.message}`);
    }
  }
  logger.info(`${variation} files were deleted`);
};

module.exports = deleteFiles;
