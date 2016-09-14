var approvalsClient = (function (approvalsClientConfig) {
    'use strict';

    var defaultConfig = {
        port: 1338,
        host: 'localhost'
    };

    var config = typeof approvalsClientConfig === 'object' ? approvalsClientConfig : defaultConfig;

    var xhrRequest = (function () {
        function readyStateHandler(xhr, testName, callback) {
            return function () {
                var status = xhr.status;
                if (xhr.readyState === XMLHttpRequest.DONE) {
                    var error = 199 < status && status < 300 ? null : new Error('Approval mismatch: ' + testName);
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

    var utils = (function () {

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

    var contextReaderFactory = (function (framework) {
        var contextReaders = {
            mocha: {
                readTestName: function (context) {
                    return context.test.fullTitle();
                }
            },
            fallback: {
                readTestName: function(context) {
                    return context;
                }
            }
        };

        var frameworkName = typeof contextReaders[framework] === 'undefined' ? 'fallback' : framework;

        return contextReaders[frameworkName];
    });

    var approvalsModule = (function (frameworkName) {

        var contextReader = contextReaderFactory(frameworkName);

        function verify(approvalString, context, callback) {
            var testName = contextReader.readTestName(context);

            var approvalData = utils.buildApprovalData(testName, approvalString);
            var request = utils.buildRequest(approvalData);
            
            var decoratedCallback = utils.failureDecorator(callback);

            xhrRequest.post(request, decoratedCallback);
        }

        return {
            verify: verify
        };

    });

    return approvalsModule;
})(approvalsClientConfig);

// Log to let user know client is loaded
console.log('~~~ Approvals client loaded ~~~');