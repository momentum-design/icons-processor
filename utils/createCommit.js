const config = require('../config');
const gitP = require('simple-git/promise');
const git = gitP(config.gitWorkingDir);
const { logger } = require('./logger');

const createCommit = async iconInfo => {
  const { color, variation } = iconInfo;
  if (color !== 'default') return logger.verbose('no git changes to commit');
  const svgFilePath = `svg/${variation}.svg`;
  gitStatus = await git.status();
  const gitChangeType = gitStatus.modified.includes(svgFilePath)
    ? 'update'
    : 'add';
  const commitMessage = `feat(icons): ${gitChangeType} ${variation}`;
  try {
    await git.addConfig('user.username', process.env.GITHUB_USER);
    await git.addConfig('user.password', process.env.GITHUB_TOKEN);
    await git.addConfig('user.name', process.env.GITHUB_NAME);
    await git.addConfig('user.email', process.env.GITHUB_EMAIL);
    await git.add(svgFilePath);
    await git.commit(commitMessage);
    logger.info(`${variation} git commit created.`);
  } catch (error) {
    logger.error(error.message);
  }
};

module.exports = createCommit;
