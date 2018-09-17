const _ = require('lodash');
const fs = require('fs-extra');
const { logger } = require('./logger');
const path = require('path');
const SVGOptim = require('svgo');

const config = {
  plugins: [
    {
      convertPathData: {
        straightCurves: false,
        lineShorthands: false,
        curveSmoothShorthands: false,
        floatPrecision: 10,
        transformPrecision: 10,
      },
    },
    { removeTitle: false },
    { removeViewbox: true },
    { convertTransform: false },
    { mergePaths: false },
    {
      cleanupNumericValues: { floatPrecision: 10 },
    },
    {
      transformsWithOnePath: {
        width: 1000,
        height: 1000,
        scale: 10,
      },
    },
  ],
};

const optimizeSvg = file => {
  return new Promise((resolve, reject) => {
    const svgo = new SVGOptim(config);
    const fileContents = fs.readFileSync(file);

    svgo.optimize(fileContents, result => {
      if (result.error) {
        reject(logger.error('SVGO Error', result.error));
      }
      const fileData = result.data;
      const filename = `svg/${file.substring(file.lastIndexOf('/') + 1)}`;
      fs.writeFileSync(file, fileData);
      resolve(logger.info(`${file} optimized!`));
    });
  });
};

const optimizeSvgFiles = async iconInfo => {
  const { dir, variation } = iconInfo;
  const svg = path.resolve(dir, `${variation}.svg`);
  try {
    await fs.ensureDir(path.resolve('svg'));
    await optimizeSvg(svg);
    return logger.info(`${svg} optimized.`);
  } catch (error) {
    return logger.error(`Error, ${error.message}`);
  }
};

module.exports = optimizeSvgFiles;
