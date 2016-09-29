module.exports = function(config) {
  config.set({
    basePath: '../',
    frameworks: ['mocha'],
    browsers: ['PhantomJS'],
    files: [
        'approvals-client.js',
        './test/approvals-client.test.js'
    ],

    colors: true,
    reporters: ['progress'],

    singleRun: true,
    autoWatch: false
  });
};