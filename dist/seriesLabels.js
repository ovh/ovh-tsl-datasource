System.register([], function (exports_1, context_1) {
    "use strict";
    var SeriesLabels;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [],
        execute: function () {
            SeriesLabels = /** @class */ (function () {
                function SeriesLabels(key, comparator, value) {
                    this.key = key;
                    this.comparator = comparator;
                    this.value = value;
                }
                return SeriesLabels;
            }());
            exports_1("default", SeriesLabels);
        }
    };
});
