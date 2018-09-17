const _ = require('lodash');
const fs = require('fs-extra');
const { logger } = require('./logger');
const config = require('../config');
const fileFormats = _.concat(
  config.baseFormats,
  config.iosFormats,
  config.androidFormats
);

const checkForAllFileFormats = iconInfo => {
  const { dir, variation } = iconInfo;
  for (let format of fileFormats) {
    if (!fs.existsSync(`${dir}/${variation}${format}`)) {
      return false;
    }
  }
  return true;
};

module.exports = checkForAllFileFormats;
