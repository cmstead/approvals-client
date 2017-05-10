var jasmine = (function () {
    var fullName = '';
    return {
        getEnv: function () {
            return {
                addReporter: function () { }
            };
        },
        currentTest: {
            get name () {
                return fullName;
            }
        },
        setTestName: function (nameStr) {
            fullName = nameStr;
        }
    };
})();
