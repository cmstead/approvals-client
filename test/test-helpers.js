var approvalsClientConfig = {};

var defaultConfig = {
    host: 'localhost',
    port: '1338'
};

function noop() { }

function prettyJson(value) {
    return JSON.stringify(value, null, 4);
}

function isString(value) {
    return typeof value === 'string';
}

function isObject(value) {
    return typeof value === 'object' && value !== null;
}

function setConfig(config) {
    config = isObject(config) ? config : defaultConfig;

    approvalsClientConfig.host = config.host;
    approvalsClientConfig.port = config.port;
}

function setUpApprovals(frameworkName, config) {
    setConfig(config);

    frameworkName = isString(frameworkName) ? frameworkName : 'mocha';

    return approvalsClient(frameworkName);
}

function buildContext(testName) {
    return {
        test: {
            fullTitle: function () {
                return isString(testName) ? testName : 'testing'
            }
        }
    };
}

function buildExpectedCall(data, context, config) {
    config = isObject(config) ? config : { host: 'localhost', port: 1338 };

    var expected = {
        "action": ["http://", config.host, ':', config.port, '/verify'].join(''),
        "data": {
            "testName": context.test.fullTitle(),
            "data": isString(data) ? data : JSON.stringify(data)
        }
    };

    return prettyJson(expected);
}

function XMLHttpRequestFake () {}

XMLHttpRequestFake.prototype = {
    send: function () {},
    open: function () {}
};