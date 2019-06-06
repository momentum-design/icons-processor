const { logger } = require('./logger');
const path = require('path');
const processNames = require('./processNames');

const getIconInfo = async file => {
  const iconInfo = {};
  const fileInfo = path.parse(file);
  const iconNames = await processNames(fileInfo.name, fileInfo.ext);
  iconInfo.dir = path.resolve(__dirname, '../', fileInfo.dir);
  iconInfo.fileName = fileInfo.base;
  iconInfo.variation = iconNames.variation;
  iconInfo.format = iconNames.format;
  iconInfo.size = iconNames.size;
  iconInfo.color = iconNames.color;
  iconInfo.baseName = iconNames.baseName;
  return iconInfo;
};

module.exports = getIconInfo;
