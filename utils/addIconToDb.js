const axios = require('axios');
require('dotenv').config();
const { logger } = require('./logger');

const iconsUrl = process.env.ICONS_API_URL || 'http://127.0.0.1:8080/api/icons';

const addIconToDb = async (iconInfo) => {
  const iconData = {
    name: iconInfo.baseName,
    colors: {},
    sizes: {},
  };
  iconData.colors[iconInfo.color] = [iconInfo.size];
  iconData.sizes[iconInfo.size] = [iconInfo.color];
  try {
    const updatedIcon = await axios.post(iconsUrl, iconData);
    logger.info(`${updatedIcon.data.name} updated in the database!`);
  } catch (error) {
    logger.error(`Error adding con to the database. ${error.message}`);
  }
}

module.exports = addIconToDb;
