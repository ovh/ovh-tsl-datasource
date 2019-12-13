System.register([], function (exports_1, context_1) {
    "use strict";
    var TslConfigCtrl;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [],
        execute: function () {
            TslConfigCtrl = /** @class */ (function () {
                function TslConfigCtrl(backendSrv, $routeParams) {
                    this.backendSrv = backendSrv;
                    this.$routeParams = $routeParams;
                    console.debug('[Tsl] ConfigController', this);
                    if (!this.current.secureJsonData) {
                        this.current.secureJsonData = {};
                    }
                    if (!this.current.secureJsonFields) {
                        this.current.secureJsonFields = {};
                    }
                }
                TslConfigCtrl.prototype._addExtraVar = function () {
                    if (this.newExtraKey && this.newExtraVal) {
                        this.current.jsonData[this.newExtraKey] = this.newExtraVal;
                        this.newExtraKey = '';
                        this.newExtraVal = '';
                    }
                };
                TslConfigCtrl.prototype._delExtraVar = function (key) {
                    delete this.current.jsonData[key];
                };
                TslConfigCtrl.prototype._editKey = function (key) {
                    this.newExtraKey = key;
                    this.newExtraVal = this.current.jsonData[key];
                };
                TslConfigCtrl.templateUrl = 'template/config.html';
                return TslConfigCtrl;
            }());
            exports_1("default", TslConfigCtrl);
        }
    };
});
