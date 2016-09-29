describe('Approvals Client', function () {

    var approvals;
    var assert = chai.assert;

    beforeEach(function () {
        XHR.post = sinon.spy();
        approvals = approvalsClient('mocha');
    });

    it('should call XHR.post', function () {
        var context = {
            test: {
                fullTitle: function () {
                    return 'testing';
                }
            }
        };
        approvals.verify('test', context, function () {});

        var result = JSON.stringify(XHR.post.args[0], null, 4);
        var expected = '[\n    {\n        "action": "http://localhost:1338/verify",\n        "data": {\n            "testName": "testing",\n            "data": "test"\n        }\n    },\n    null\n]';
        assert.equal(result, expected);
    });
});