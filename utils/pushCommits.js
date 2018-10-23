require('dotenv').config();
const config = require('../config');
const cron = require('node-cron');
const gitP = require('simple-git/promise');
const git = gitP(config.gitWorkingDir);
const remote = `https://${process.env.GITHUB_USER}:${process.env.GITHUB_TOKEN}@${process.env.GITHUB_URL}`;

const checkForSvgFileChanges = async (changedFiles) => {
  for (const file of changedFiles) {
    return file.path.includes('.svg');
  }
};

const pushCommits = async () => {
  try {
    await git.raw(['remote', 'set-url', 'origin', remote]);
    await git.fetch();
    const status = await git.status();
    if(!status.ahead) return logger.info('No commits to push.');
    if(status.files) {
      const uncommittedSvgs = await checkForSvgFileChanges(status.files);
      if (uncommittedSvgs) return logger.error('Error: There uncommitted SVG changes!');
      logger.info('Stashing non-svg changes.');
      await git.stash();
    }
    if(status.behind) {
      await git.pull('origin', 'master', { '--rebase': 'true' });
    }
    await git.push('origin', 'master');
    logger.info('Commits Pushed');
  } catch (error) {
    logger.error(`Error: ${error.message}`);
  }
};

module.exports = pushCommits;

