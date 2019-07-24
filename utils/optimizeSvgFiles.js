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
  const svgo = new SVGOptim(config);
  const fileContents = fs.readFileSync(file);
  const filename = `svg/${file.substring(file.lastIndexOf('/') + 1)}`;

  svgo
    .optimize(fileContents, {path: file})
    .then(result => {
      const fileData = result.data;
      return logger.info(`${file} optimized!`);
    })
    .catch(error => logger.error('SVGO Error', result.error));
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
