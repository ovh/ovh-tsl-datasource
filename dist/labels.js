System.register([], function (exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var Labels;
    return {
        setters: [],
        execute: function () {
            Labels = /** @class */ (function () {
                function Labels(key, comparator, value) {
                    this.key = key;
                    this.comparator = comparator;
                    this.value = value;
                }
                return Labels;
            }());
            exports_1("default", Labels);
        }
    };
});
