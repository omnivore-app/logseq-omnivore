const pluginName = require('./package.json').name

module.exports = {
  branches: 'release',
  plugins: [
    '@semantic-release/commit-analyzer',
    '@semantic-release/release-notes-generator',
    '@semantic-release/changelog',
    ['@semantic-release/npm', { npmPublish: false }],
    [
      '@semantic-release/git',
      {
        assets: ['CHANGELOG.md', 'package.json'],
        message:
          'chore(release): ${nextRelease.version}\n\n${nextRelease.notes}',
      },
    ],
    [
      '@semantic-release/exec',
      {
        prepareCmd:
          'zip -qq -r ' + pluginName + '-${nextRelease.version}.zip package.json public/icon.png README.md dist/',
      },
    ],
    [
      '@semantic-release/github',
      {
        assets: [`${pluginName}-*.zip`],
      },
    ],
  ],
}
