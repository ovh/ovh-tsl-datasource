System.register(["./passwordHandlers"], function (exports_1, context_1) {
    "use strict";
    var passwordHandlers_1, TslConfigCtrl;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [
            function (passwordHandlers_1_1) {
                passwordHandlers_1 = passwordHandlers_1_1;
            }
        ],
        execute: function () {
            TslConfigCtrl = /** @class */ (function () {
                function TslConfigCtrl(backendSrv, $routeParams) {
                    this.backendSrv = backendSrv;
                    this.$routeParams = $routeParams;
                    console.debug('[TSL] ConfigController', this);
                    this.onPasswordReset = passwordHandlers_1.createResetHandler(this, passwordHandlers_1.PasswordFieldEnum.Password);
                    this.onPasswordChange = passwordHandlers_1.createChangeHandler(this, passwordHandlers_1.PasswordFieldEnum.Password);
                    if (this.current.id) {
                        this._loadDatasourceConfig();
                    }
                    if (!this.current.jsonData.var) {
                        this.current.jsonData.var = {};
                    }
                    if (!this.current.secureJsonFields) {
                        this.current.secureJsonFields = {};
                    }
                    if (!this.current.secureJsonData) {
                        this.current.secureJsonData = {};
                    }
                    if (this.current.jsonData[passwordHandlers_1.PasswordFieldEnum.Password] != undefined) {
                        this.current.secureJsonFields[passwordHandlers_1.PasswordFieldEnum.Password] = true;
                    }
                }
                TslConfigCtrl.prototype._loadDatasourceConfig = function () {
                    var _this = this;
                    this.backendSrv.get('/api/datasources/' + this.current.id)
                        .then(function (ds) {
                        Object.assign(_this.current, ds);
                    });
                };
                TslConfigCtrl.prototype._addExtraVar = function () {
                    if (!this.current.jsonData.var) {
                        this.current.jsonData.var = {};
                    }
                    if (this.newExtraKey && this.newExtraVal) {
                        this.current.jsonData.var[this.newExtraKey] = this.newExtraVal;
                        this.newExtraKey = '';
                        this.newExtraVal = '';
                    }
                };
                TslConfigCtrl.prototype._delExtraVar = function (key) {
                    delete this.current.jsonData.var[key];
                };
                TslConfigCtrl.prototype._editKey = function (key) {
                    this.newExtraKey = key;
                    this.newExtraVal = this.current.jsonData.var[key];
                };
                TslConfigCtrl.templateUrl = 'template/config.html';
                return TslConfigCtrl;
            }());
            exports_1("default", TslConfigCtrl);
        }
    };
});
