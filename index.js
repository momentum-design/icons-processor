const _ = require('lodash');
const chokidar = require('chokidar');
const fs = require('fs-extra');
const mongoose = require('mongoose');
const path = require('path');
const Queue = require('better-queue');

require('dotenv').config();
const config = require('./config');
const dbAddress = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/test';

const checkForAllFileFormats = require('./utils/checkForAllFileFormats');
const createCommit = require('./utils/createCommit');
const copyBaseFormats = require('./utils/copyBaseFormats');
const createAndroidZip = require('./utils/createAndroidZip');
const createIosZip = require('./utils/createIosZip');
const deleteFiles = require('./utils/deleteFiles');
const getIconInfo = require('./utils/getIconInfo');
const { logFile, logger } = require('./utils/logger');
const optimizeSvgFiles = require('./utils/optimizeSvgFiles');
const uploadToS3 = require('./utils/uploadToS3');

const Icon = require('./models/icon');
const icons = {};
const iconsDbQueue = new Queue(processDbQueue);

const addIconToDb = require('./utils/addIconToDb');
// async function addIconToDb(iconInfo) {
//   const iconData = {
//     name: iconInfo.baseName,
//     colors: {},
//     sizes: {},
//   };
//   iconData.colors[iconInfo.color] = [iconInfo.size];
//   iconData.sizes[iconInfo.size] = [iconInfo.color];
//   try {
//     const icon = await Icon.findOrCreate({ name: iconData.name }, iconData);
//     if (icon.created)
//       return logger.info(`${iconData.name} added to the database!`);
//     const newIcon = _.mergeWith(icon.doc, iconData, mergeArrays);
//     const updatedIcon = await Icon.findByIdAndUpdate(newIcon.id, newIcon, {
//       new: true,
//     });
//     return logger.info(`${updatedIcon.name} updated in the database!`);
//   } catch (error) {
//     logger.info(`Error adding con to the database. ${error.message}`);
//     await addIconToDb(iconInfo);
//   }
// }

// function mergeArrays(objValue, srcValue) {
//   if (_.isArray(objValue)) {
//     const combinedArrays = objValue.concat(srcValue);
//     return [...new Set(combinedArrays)];
//   }
// }

async function processDbQueue(icon, cb) {
  await addIconToDb(icon);
  cb();
}

fs.ensureFile(logFile)
  .then(() => {
    mongoose
      .connect(dbAddress)
      .then(() => logger.info('connection succesful'))
      .catch(err => logger.error(`Error: MongoDB ${err.message}`));

    chokidar
      .watch('../uploads', {
        ignored: /^.*DS_Store.*$/,
        persistent: true,
        awaitWriteFinish: {
          stabilityThreshold: 2000,
          pollInterval: 100,
        },
      })
      .on('all', async (event, path) => {
        if (event === 'error') return logger.error(`Watcher Error`);
        if (event === 'unlink') return logger.verbose(event, path);
        if (_.indexOf(['addDir', 'unlinkDir'], event) !== -1)
          return logger.verbose(event, path);
        logger.info(event, path);
        let iconInfo = await getIconInfo(path);
        const { variation, format } = iconInfo;
        if (_.get(icons, variation)) {
          icons[variation].push(format);
        } else {
          icons[variation] = [format];
        }
        if (
          icons[variation].length === 11 &&
          checkForAllFileFormats(iconInfo)
        ) {
          try {
            logger.verbose(icons);
            await optimizeSvgFiles(iconInfo);
            const iosZip = createIosZip(iconInfo);
            const androidZip = createAndroidZip(iconInfo);
            const copyFormats = copyBaseFormats(iconInfo);
            await iosZip;
            await androidZip;
            await copyFormats;
            iconsDbQueue.push(iconInfo);
            await deleteFiles(iconInfo);
            delete icons[variation];
            await createCommit(iconInfo);
          } catch (error) {
            logger.error(`Error, ${error.message}`);
          }
        }
      });
  })
  .catch(err => {
    console.error(err);
  });
