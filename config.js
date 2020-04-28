config = {
  tempPath: '.temp',
  iconsDirectory: 'icons/',
  baseFormats: ['.pdf', '.svg'],
  iosFormats: ['@3x*ios.png', '@2x*ios.png', '*ios.png'],
  androidFormats: [
    '*adr_hdpi.png',
    '*adr_mdpi.png',
    '*adr_xhdpi.png',
    '*adr_xxhdpi.png',
    '*adr_xxxhdpi.png',
  ],
  svgDirectory: '../momentum-ui/icons/svg',
  backupDirectory: './backup',
  gitWorkingDir: '../momentum-ui/icons',
  logsDirectory: './logs'
};

module.exports = config;
