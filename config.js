config = {
  tempPath: '.temp',
  iconsDirectory: 'icons/',
  baseFormats: ['.eps', '.pdf', '.svg'],
  iosFormats: ['@3x*ios.png', '@2x*ios.png', '*ios.png'],
  androidFormats: [
    '*adr_hdpi.png',
    '*adr_mdpi.png',
    '*adr_xhdpi.png',
    '*adr_xxhdpi.png',
    '*adr_xxxhdpi.png',
  ],
  svgDirectory: '../automatetest/svg',
  backupDirectory: './backup',
  gitWorkingDir: '../automatetest',
  logsDirectory: './logs'
};

module.exports = config;
