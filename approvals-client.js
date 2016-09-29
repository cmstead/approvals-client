var XHR = (function () {

    function isSuccess(status) {
        return 199 < status && status < 300;
    }

    function readyStateHandler(xhr, testName, callback) {
        return function () {
            var status = xhr.status;

            if (xhr.readyState === XMLHttpRequest.DONE) {
                var error = isSuccess(status) ? null : new Error('Approval mismatch: ' + testName);
                callback(error);
            }
        };
    }

    function post(request, callback) {
        var requestData = JSON.stringify(request.data);
        var xhr = new XMLHttpRequest();

        xhr.open('post', request.action);

        xhr.onreadystatechange = readyStateHandler(xhr, request.data.testName, callback)

        xhr.send(requestData);
    }

    return {
        post: post
    };
})();

var approvalsClient = (function () {
    'use strict';

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
            return function (error) {
                if (error) {
                    throw error;
                }

                callback();
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

            fallback: {
                readTestName: function (context) {
                    return context;
                }
            }
        };

        return function (framework) {
            var frameworkName = typeof contextReaders[framework] === 'undefined' ? 'fallback' : framework;

            return contextReaders[frameworkName];
        };

    })();

    var approvalsModule = (function () {

        function getVerifier(contextReader) {
            return function (approvalString, context, callback) {
                var testName = contextReader.readTestName(context);

                var approvalData = utils.buildApprovalData(testName, approvalString);
                var request = utils.buildRequest(approvalData);

                var decoratedCallback = utils.failureDecorator(callback);

                XHR.post(request, decoratedCallback);

            };
        }

        return function (frameworkName) {
            var contextReader = contextReaderFactory(frameworkName);

            return {
                verify: getVerifier(contextReader)
            };
        }

    })();

    return approvalsModule;
})();

// Log to let user know client is loaded
console.log('~~~ Approvals client loaded ~~~');