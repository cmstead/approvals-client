var assert = chai.assert;

describe('Approvals Client', function () {

    var xhrPost;

    beforeEach(function () {
        xhrPost = XHR.post;

        setConfig(defaultConfig);

        xhrFactory.build = function () {
            return new XMLHttpRequestFake();
        }
    });

    afterEach(function () {
        XHR.post = xhrPost;
    });

    describe('verify', function () {
        it('should call XHR.post with correctly constructed approvals request object', function () {
            XHR.post = sinon.spy();

            var approvals = setUpApprovals('mocha', null);
            var context = buildContext('testing');
            var expected = buildExpectedCall('test', context);

            approvals.verify('test', context, noop);

            var result = XHR.post.args[0][0];

            assert.equal(prettyJson(result), expected);
        });

        it('should call XHR.post with correctly constructed approvals request object when in jasmine 2', function () {
            XHR.post = sinon.spy();

            var testName = 'This is testing Jasmine\'s crappy API hack';
            var approvals = setUpApprovals('jasmine2', null);
            var context = buildContext(testName);
            var expected = buildExpectedCall('test', context);

            jasmine.setTestName(testName);

            approvals.verify('test', context, noop);

            var result = XHR.post.args[0][0];

            assert.equal(prettyJson(result), expected);
        });

        it('should call send approvals request using custom configuration values', function () {
            var customConfig = {
                host: 'foo',
                port: 1337
            };
            XHR.post = sinon.spy();


            var approvals = setUpApprovals('mocha', customConfig);
            var context = buildContext('testing');
            var expected = buildExpectedCall('test', context, customConfig);

            approvals.verify('test', context, noop);

            var result = XHR.post.args[0][0];

            assert.equal(prettyJson(result), expected);
        });

        it('should require title directly if not in mocha', function () {
            XHR.post = sinon.spy();

            var approvals = setUpApprovals('other', null);
            var testContext = buildContext('testing');
            var expected = buildExpectedCall('test', testContext, null);

            approvals.verify('test', 'testing', noop);

            var result = XHR.post.args[0][0];

            assert.equal(prettyJson(result), expected);
        });

        it('should throw an error when test data is not a string', function () {
            var approvals = setUpApprovals('mocha', null);
            var context = buildContext('testing');
            var expected = buildExpectedCall('test', context);

            assert.throws(approvals.verify.bind(null, null, context, noop), '[Approvals Client] Cannot verify non-string object: null');
        });

        it('should throw an error if approval fails', function () {
            var approvals = setUpApprovals('mocha', null);
            var context = buildContext('testing');
            var expected = buildExpectedCall('test', context);

            var xhr = approvals.verify('test', context, noop);

            xhr.status = 400;
            xhr.readyState = XMLHttpRequest.DONE;

            assert.throws(xhr.onreadystatechange);
        });
    });

});