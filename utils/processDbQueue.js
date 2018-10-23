const addIconToDb = require('./addIconToDb');

const processDbQueue = async (icon, cb) => {
  await addIconToDb(icon);
  cb();
};

module.exports = processDbQueue;
