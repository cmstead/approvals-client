module.exports = function(config) {
  config.set({
    basePath: '../',
    frameworks: ['mocha'],
    browsers: ['PhantomJS'],
    files: [
        'approvals-client.js',
        './node_modules/sinon/pkg/sinon.js',
        './node_modules/chai/chai.js',
        './test/approvals-client.test.js'
    ],

    colors: true,
    reporters: ['progress'],

    singleRun: true,
    autoWatch: false
  });
};