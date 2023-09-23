const version = '${version}';
const packageName = process.env.npm_package_name;
const scope = packageName.split('/')[1];

module.exports = {
  git: {
    push: true,
    tagName: `${packageName}-v${version}`,
    tagAnnotation: `Release ${packageName} v${version}`,
    pushRepo: 'git@github.com:fasenderos/bitify.git',
    commitsPath: '.',
    commitMessage: `build(${scope}): released version v${version} [no ci]`,
    requireCommits: true,
    requireCommitsFail: false,
    requireCleanWorkingDir: true,
  },
  npm: {
    publish: false,
  },
  github: {
    release: true,
    releaseName: `${packageName}-v${version}`,
    commitArgs: ['-S'],
    tagArgs: ['-s'],
  },
  plugins: {
    '@release-it/conventional-changelog': {
      path: '.',
      header: '# Changelog',
      infile: 'CHANGELOG.md',
      preset: {
        name: 'conventionalcommits',
        types: [
          { type: 'feat', section: 'Features' },
          { type: 'fix', section: 'Bug Fixes' },
          { type: 'chore', section: 'Chore' },
          { type: 'docs', section: 'Documentation' },
          { type: 'refactor', section: 'Refactoring' },
          { type: 'perf', section: 'Performance Improvement' },
          { type: 'test', section: 'Test' },
          { type: 'style', hidden: true },
        ],
      },
      gitRawCommitsOpts: {
        path: '.',
      },
    },
  },
  hooks: {
    // Format the generated changelog befor commit to avoid problem with lint-staged
    'before:npm:init': 'npm run format:fix',
  },
};
