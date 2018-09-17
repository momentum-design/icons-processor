require('dotenv').config();
const config = require('../config');
const gitP = require('simple-git/promise')
const git = gitP(config.gitWorkingDir);
const remote = `https://${process.env.GITHUB_USER}:${process.env.GITHUB_TOKEN}@${process.env.GITHUB_URL}`;


const pushCommits = async () => {
  try {
    await git.raw([ 'remote', 'set-url', 'origin', remote ]);
    await git.pull('origin', 'master', {'--rebase': 'true'});
    await git.push('origin', 'master');
    const status = await git.status();
    console.log(status);
  } catch (error) {
    console.error(`Error: ${error.message}`);
  }
}

pushCommits();
