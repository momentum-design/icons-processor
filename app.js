const _ = require('lodash');
const chokidar = require('chokidar');
const cron = require('node-cron');
const fs = require('fs-extra');
const path = require('path');
const Queue = require('better-queue');

require('dotenv').config();
const config = require('./config');

const checkForAllFileFormats = require('./utils/checkForAllFileFormats');
const copyBaseFormats = require('./utils/copyBaseFormats');
const createAndroidZip = require('./utils/createAndroidZip');
const createCommit = require('./utils/createCommit');
const createIosZip = require('./utils/createIosZip');
const deleteFiles = require('./utils/deleteFiles');
const getIconInfo = require('./utils/getIconInfo');
const { logFile, logger } = require('./utils/logger');
const optimizeSvgFiles = require('./utils/optimizeSvgFiles');
const processDbQueue = require('./utils/processDbQueue');
const pushCommits = require('./utils/pushCommits');
const uploadToS3 = require('./utils/uploadToS3');

const icons = {};
const iconsDbQueue = new Queue(processDbQueue);

fs.ensureFile(logFile)
  .then(() => {
    console.log('starting...')
    cron
      .schedule('0 4 * * *', async () => {
        await pushCommits();
      });
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
