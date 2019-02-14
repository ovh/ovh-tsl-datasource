System.register([], function (exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var TslAnnotationQueryCtrl;
    return {
        setters: [],
        execute: function () {
            TslAnnotationQueryCtrl = /** @class */ (function () {
                function TslAnnotationQueryCtrl($scope, $injector) {
                    if (!this.annotation)
                        this.annotation = {};
                    if (!this.annotation.query)
                        this.annotation.query = '';
                }
                TslAnnotationQueryCtrl.templateUrl = 'template/annotation.html';
                return TslAnnotationQueryCtrl;
            }());
            exports_1("default", TslAnnotationQueryCtrl);
        }
    };
});
