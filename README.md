# Approvals Client

A client-side approvals library for making calls to a running Approvals Server instance. This 
has a peer dependency on [Approvals Server](https://www.npmjs.com/package/approvals-server).

## Setup

By default, Approvals Client comes preconfigured to connect with Approvals Server without any configuration. The 
client configuration assumes your connection will be localhost:1338. If this is not how your server is configured,
you can create a new configuration:

~~~
var approvalsClientConfig = {
    port: 1338, // your port goes here
    host: 'localhost' // your host name goes here
}
~~~

This configuration should be made global as the module assumes your configuration will be available at the top-level scope
in your browser.

## Using Approvals Client in your tests

Approvals client is currently designed to work with Mocha test framework. It will be expanded in the future to work with
Jasmine (and others). If you want to help expand support, pull requests are gladly accepted.

When writing tests, Approvals Client needs to be initialized with the test framework name.  A suggested method is as follows:

~~~
describe('My mocha test suite', function () {
    var approvals = approvalsClient('mocha');

    describe('some novel functionality', function () {

        it('should approve my object', function (done) {
            var myObj = {
                foo: 'bar',
                baz: 'quux'
            };

            approvals.verify(JSON.stringify(myObj), this, done);
        });

    });
});
~~~

**Important note:** Verify MUST be called with a string, the test context (this) and a done function. Approvals Client
uses the test context to construct file names, so providing the context allows the client to pass values to the
server correctly. Mocha's done function is needed because approvals requests are asynchronous and Mocha needs to be
alerted when any async behavior is complete.