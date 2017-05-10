var xhrFactory = {
    build: function () {
        return new XMLHttpRequest();
    }
};

var XHR = (function () {

    function isSuccess(status) {
        return 199 < status && status < 300;
    }

    function isDone(readyState) {
        return readyState === XMLHttpRequest.DONE;
    }

    function noop() { }

    function readyStateHandler(xhr, testName, callback) {
        return function () {
            var next = isDone(xhr.readyState) ? callback : noop;
            var error = isSuccess(xhr.status) ? null : new Error('Approval mismatch: ' + testName);

            next(error);
        };
    }

    function post(request, callback) {
        var xhr = xhrFactory.build();

        xhr.open('post', request.action);

        xhr.onreadystatechange = readyStateHandler(xhr, request.data.testName, callback)

        xhr.send(JSON.stringify(request.data));

        return xhr;
    }

    return {
        post: post
    };
})();

var approvalsClient = (function () {
    'use strict';

    function isTypeOf(typeStr) {
        return function (value) {
            return typeof value === typeStr;
        }
    }

    function throwError(error) {
        if (isTypeOf('object')(error)) {
            throw error;
        }
    }

    function throwErrorMessage(message) {
        throwError(new Error('[Approvals Client] ' + message));
    }

    function getConfig() {
        var defaultConfig = {
            port: 1338,
            host: 'localhost'
        };

        return typeof approvalsClientConfig === 'object' ? approvalsClientConfig : defaultConfig;
    }

    var utils = (function () {
        var config = getConfig();

        function failureDecorator(callback) {
            var cleanCallback = typeof callback === 'function' ? callback : function () { };
            return function (error) {
                if (error) {
                    throwError(error);
                }

                cleanCallback();
            };
        }

        function buildRequest(approvalData) {
            return {
                action: 'http://' + config.host + ':' + config.port + '/verify',
                data: approvalData
            };
        }

        function buildApprovalData(testName, approvalString) {
            return {
                testName: testName,
                data: approvalString
            };
        }

        return {
            buildApprovalData: buildApprovalData,
            buildRequest: buildRequest,
            failureDecorator: failureDecorator
        };

    })();

    var contextReaderFactory = (function () {
        var contextReaders = {
            mocha: {
                readTestName: function (context) {
                    return context.test.fullTitle();
                }
            },
            jasmine2: {
                readTestName: function () {
                    return jasmine.currentTest.name;
                }
            },
            fallback: {
                readTestName: function (context) {
                    return context;
                }
            }
        };

        return function (frameworkName) {
            var reader = contextReaders[frameworkName];

            return !isTypeOf('undefined')(reader) ? reader : contextReaders['fallback'];
        };

    })();

    var approvalsModule = (function () {

        function throwOnBadStringValue(approvalData) {
            if (!isTypeOf('string')(approvalData)) {
                throwErrorMessage('Cannot verify non-string object: ' + JSON.stringify(approvalData));
            }
        }

        function buildApprovalRequest(contextReader, context, approvalString) {
            var testName = contextReader.readTestName(context);
            var approvalData = utils.buildApprovalData(testName, approvalString)

            return utils.buildRequest(approvalData);
        }

        function sendPostRequest(request, callback) {
            return XHR.post(request, callback);
        }

        function getVerifier(contextReader) {
            return function (approvalString, context, callback) {
                throwOnBadStringValue(approvalString);

                return sendPostRequest(
                    buildApprovalRequest(contextReader, context, approvalString),
                    utils.failureDecorator(callback)
                );
            };
        }

        function runLameJasmineHack(frameworkName) {
            if (frameworkName === 'jasmine2') {
                jasmine.getEnv().addReporter({
                    specStarted: function (result) {
                        jasmine.currentTest = {
                            name: result.fullName
                        };
                    }
                });
            }
        }

        return function (frameworkName) {
            var contextReader = contextReaderFactory(frameworkName);

            runLameJasmineHack(frameworkName);

            return {
                verify: getVerifier(contextReader)
            };
        }

    })();

    return approvalsModule;
})();

// Log to let user know client is loaded
console.log('~~~ Approvals client loaded ~~~');