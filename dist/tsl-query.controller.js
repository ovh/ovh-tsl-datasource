///<reference path="../node_modules/grafana-sdk-mocks/app/headers/common.d.ts" />
System.register(["app/plugins/sdk", "./query", "./ace-mode-tsl", "./seriesLabels"], function (exports_1, context_1) {
    "use strict";
    var __extends = (this && this.__extends) || (function () {
        var extendStatics = function (d, b) {
            extendStatics = Object.setPrototypeOf ||
                ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
                function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
            return extendStatics(d, b);
        };
        return function (d, b) {
            extendStatics(d, b);
            function __() { this.constructor = d; }
            d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
        };
    })();
    var sdk_1, query_1, ace_mode_tsl_1, seriesLabels_1, TslQueryCtrl;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [
            function (sdk_1_1) {
                sdk_1 = sdk_1_1;
            },
            function (query_1_1) {
                query_1 = query_1_1;
            },
            function (ace_mode_tsl_1_1) {
                ace_mode_tsl_1 = ace_mode_tsl_1_1;
            },
            function (seriesLabels_1_1) {
                seriesLabels_1 = seriesLabels_1_1;
            }
        ],
        execute: function () {///<reference path="../node_modules/grafana-sdk-mocks/app/headers/common.d.ts" />
            ace_mode_tsl_1.default();
            TslQueryCtrl = /** @class */ (function (_super) {
                __extends(TslQueryCtrl, _super);
                function TslQueryCtrl($scope, uiSegmentSrv, $injector) {
                    var _this = _super.call(this, $scope, $injector) || this;
                    _this.$scope = $scope;
                    _this.uiSegmentSrv = uiSegmentSrv;
                    _this.extraMetaParamRemoveLabels = [];
                    _this.extraMetalabels = [];
                    _this.onChangeInternal = function () {
                        _this.refresh();
                    };
                    _this.target.friendlyQuery = Object.assign(new query_1.default(), _this.target.friendlyQuery);
                    // acces to static members from dom
                    _this.staticQuery = new query_1.default();
                    // prevent wrapped ace-editor to crash
                    if (!_this.target.expr)
                        _this.target.expr = '';
                    if (!_this.target.expr && _this.target.friendlyQuery) {
                        _this.target.expr = _this.target.friendlyQuery.tslScript;
                    }
                    return _this;
                }
                TslQueryCtrl.prototype._addLabel = function () {
                    if (!this.extraLabelKey || !this.extraLabelValue)
                        return;
                    this.target.friendlyQuery.addLabel(this.extraLabelKey, this.extraComparator, this.extraLabelValue);
                    this.extraLabelKey = '';
                    this.extraLabelValue = '';
                    this.extraComparator = '';
                };
                TslQueryCtrl.prototype._delLabel = function (index) {
                    this.target.friendlyQuery.delLabel(index);
                };
                TslQueryCtrl.prototype._addGroupByLabel = function () {
                    if (!this.extraGroupByLabel)
                        return;
                    this.target.friendlyQuery.addGroupByLabel(this.extraGroupByLabel);
                    this.extraGroupByLabel = '';
                };
                TslQueryCtrl.prototype._delGroupByLabel = function (label) {
                    this.target.friendlyQuery.delGroupByLabel(label);
                };
                TslQueryCtrl.prototype._buildQuery = function () {
                    this._addLabel();
                    this._addGroupByLabel();
                };
                TslQueryCtrl.prototype.getCompleter = function () {
                    var o = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        o[_i] = arguments[_i];
                    }
                    console.debug('[TslQuery] COMPLETER called', o);
                };
                TslQueryCtrl.prototype.toggleEditorMode = function () {
                    console.debug('Toggle readonly', this.readOnly);
                    this.readOnly = !this.readOnly;
                };
                TslQueryCtrl.prototype._addArithmeticOperator = function () {
                    if (!this.extraArithmeticOperator)
                        return;
                    var operator = this.extraArithmeticOperator;
                    if (["mul", "add", "sub", "div", "logN"].indexOf(operator) > -1) {
                        if (!this.extraArithmeticParam)
                            return;
                        this.target.friendlyQuery.addOperator(operator, [this.extraArithmeticParam.toString()]);
                    }
                    else {
                        this.target.friendlyQuery.addOperator(operator, []);
                    }
                    this.extraArithmeticOperator = '';
                    this.extraArithmeticParam = null;
                };
                TslQueryCtrl.prototype._addEqualityOperator = function () {
                    if (!this.extraEqualityOperator || !this.extraEqualityParam)
                        return;
                    this.target.friendlyQuery.addOperator(this.extraEqualityOperator, [this.extraEqualityParam.toString()]);
                    this.extraEqualityOperator = '';
                    this.extraEqualityParam = null;
                };
                TslQueryCtrl.prototype._addLimitOperator = function () {
                    if (!this.extraLimitOperator || !this.extraLimitParam)
                        return;
                    this.target.friendlyQuery.addOperator(this.extraLimitOperator, [this.extraLimitParam.toString()]);
                    this.extraLimitOperator = '';
                    this.extraLimitParam = null;
                };
                TslQueryCtrl.prototype._addTimeOperator = function () {
                    if (!this.extraTimeOperator)
                        return;
                    var operator = this.extraTimeOperator;
                    if (["shift"].indexOf(operator) > -1) {
                        if (!this.extraTimeParamDuration)
                            return;
                        this.target.friendlyQuery.addOperator(operator, [this.extraTimeParamDuration]);
                    }
                    else if (["keepLastValues", "keepFirstValues", "shrink", "timescale"].indexOf(operator) > -1) {
                        if (!this.extraTimeParamNumber)
                            return;
                        this.target.friendlyQuery.addOperator(operator, [this.extraTimeParamNumber.toString()]);
                    }
                    else if (["timemodulo"].indexOf(operator) > -1) {
                        if (!this.extraTimeParamDuration || !this.extraTimeParamNumber)
                            return;
                        this.target.friendlyQuery.addOperator(operator, [this.extraTimeParamNumber.toString(), "'" + this.extraTimeParamDuration + "'"]);
                    }
                    else if (["timeclip"].indexOf(operator) > -1) {
                        if (!this.extraTimeParamEnd || !this.extraTimeParamDuration)
                            return;
                        this.target.friendlyQuery.addOperator(operator, [this.extraTimeParamEnd, this.extraTimeParamDuration]);
                    }
                    else if (["timesplit"].indexOf(operator) > -1) {
                        if (!this.extraTimeParamDuration || !this.extraTimeParamNumber)
                            return;
                        this.target.friendlyQuery.addOperator(operator, [this.extraTimeParamEnd, this.extraTimeParamNumber.toString(), "'" + this.extraTimeParamDuration + "'"]);
                    }
                    else {
                        this.target.friendlyQuery.addOperator(operator, []);
                    }
                    this.extraTimeOperator = '';
                    this.extraTimeParamNumber = null;
                    this.extraTimeParamDuration = '';
                    this.extraTimeParamEnd = '';
                };
                TslQueryCtrl.prototype._addWindowOperator = function () {
                    if (!this.extraWindowOperator || !this.extraWindowAggregator)
                        return;
                    var operator = this.extraWindowOperator;
                    var params = [this.extraWindowAggregator];
                    if (["window"].indexOf(operator) > -1) {
                        if (this.extraWindowAggregator === "percentile") {
                            if (!this.extraWindowParamPercentile)
                                return;
                            params.push(this.extraWindowParamPercentile.toString());
                        }
                        else if (this.extraWindowAggregator === "join") {
                            if (!this.extraWindowParamJoin)
                                return;
                            params.push("'" + this.extraWindowParamJoin + "'");
                        }
                        if (this.extraWindowPre) {
                            params.push(this.extraWindowPre);
                        }
                        else if (this.extraWindowPost) {
                            params.push("0");
                        }
                        if (this.extraWindowPost) {
                            params.push(this.extraWindowPost);
                        }
                    }
                    this.target.friendlyQuery.addOperator(operator, params);
                    this.extraWindowOperator = '';
                    this.extraWindowAggregator = '';
                    this.extraWindowPre = '';
                    this.extraWindowPost = '';
                    this.extraWindowParamJoin = '';
                    this.extraWindowParamPercentile = null;
                };
                TslQueryCtrl.prototype._addTransformOperator = function () {
                    if (!this.extraTransformOperator)
                        return;
                    if (this.extraTransformOperator === "quantize") {
                        if (!this.extraTransformQuantizeLabel || !this.extraTransformQuantizeStep)
                            return;
                        var params = ["'" + this.extraTransformQuantizeLabel + "'", this.extraTransformQuantizeStep];
                        if (this.extraTransformQuantizeChunk) {
                            params.push(this.extraTransformQuantizeChunk);
                        }
                        this.target.friendlyQuery.addOperator(this.extraTransformOperator, params);
                    }
                    else if ((this.extraTransformParam) && (this.extraTransformOperator === "rate")) {
                        this.target.friendlyQuery.addOperator(this.extraTransformOperator, [this.extraTransformParam.toString()]);
                    }
                    else {
                        this.target.friendlyQuery.addOperator(this.extraTransformOperator, []);
                    }
                    this.extraTransformOperator = '';
                    this.extraTransformParam = null;
                };
                TslQueryCtrl.prototype._addSortsOperator = function () {
                    if (!this.extraSortsOperator)
                        return;
                    var operator = this.extraSortsOperator;
                    var params = [];
                    if (["topN", "bottomN", "topNBy", "bottomNBy"].indexOf(operator) > -1) {
                        if (!this.extraSortsParamNumber)
                            return;
                        params.push(this.extraSortsParamNumber);
                    }
                    if (["sortBy", "sortDescBy", "topNBy", "bottomNBy"].indexOf(operator) > -1) {
                        if (!this.extraSortsParamAggregator)
                            return;
                        params.push(this.extraSortsParamAggregator);
                        if (this.extraSortsParamAggregator === "percentile") {
                            if (!this.extraSortsParamPercentile)
                                return;
                            params.push(this.extraSortsParamPercentile);
                        }
                    }
                    this.target.friendlyQuery.addOperator(operator, params);
                    this.extraSortsOperator = '';
                    this.extraSortsParamAggregator = '';
                    this.extraSortsParamNumber = null;
                    this.extraSortsParamPercentile = null;
                };
                TslQueryCtrl.prototype._addMetaOperator = function () {
                    if (!this.extraMetaOperator)
                        return;
                    if (this.extraMetaOperator != "removeLabels") {
                        if (!this.extraMetaParam)
                            return;
                    }
                    var extraParam = this.extraMetaParam;
                    if (this.extraMetaOperator === "filterByName") {
                        if (this.extraMetaParamComparator) {
                            extraParam = this.extraMetaParamComparator + extraParam;
                        }
                    }
                    else if (this.extraMetaOperator === "filterByLastValue") {
                        if (this.extraMetaParamComparator) {
                            extraParam = this.extraMetaParamComparator + extraParam;
                        }
                        else {
                            extraParam = "=" + extraParam;
                        }
                    }
                    var params = [];
                    params.push("'" + extraParam + "'");
                    if (this.extraMetaOperator === "removeLabels") {
                        if (!this.extraMetaParamRemoveLabels)
                            return;
                        if (this.extraMetaParamRemoveLabels.length < 1)
                            return;
                        params = [];
                        for (var index in this.extraMetaParamRemoveLabels) {
                            params.push("'" + this.extraMetaParamRemoveLabels[index] + "'");
                        }
                    }
                    else if (this.extraMetaOperator === "renameLabelKey") {
                        if (!this.extraMetaParamNewValue)
                            return;
                        params.push("'" + this.extraMetaParamNewValue + "'");
                    }
                    else if (this.extraMetaOperator === "renameLabelValue") {
                        if (this.extraMetaParamRegexpValue) {
                            params.push("'" + this.extraMetaParamRegexpValue + "'");
                        }
                        if (!this.extraMetaParamNewValue)
                            return;
                        params.push("'" + this.extraMetaParamNewValue + "'");
                    }
                    this.target.friendlyQuery.addOperator(this.extraMetaOperator, params);
                    this.extraMetaOperator = '';
                    this.extraMetaParam = '';
                    this.extraMetaParamNewValue = '';
                    this.extraMetaParamRegexpValue = '';
                    this.extraMetaParamRemoveLabels = [];
                    this.extraMetalabels = [];
                    this.extraMetaParamComparator = '';
                };
                TslQueryCtrl.prototype._addFilterByLabelsOperator = function () {
                    if (!this.extraMetalabels)
                        return;
                    if (this.extraMetalabels.length === 0)
                        return;
                    var params = [];
                    for (var index in this.extraMetalabels) {
                        var labelStr = '';
                        var comparator = this.extraMetalabels[index].comparator;
                        if (!comparator) {
                            comparator = '=';
                        }
                        labelStr = "'" + this.extraMetalabels[index].key + comparator + this.extraMetalabels[index].value + "'";
                        params.push(labelStr);
                    }
                    this.target.friendlyQuery.addOperator(this.extraMetaOperator, params);
                    this.extraMetaOperator = '';
                    this.extraMetaParam = '';
                    this.extraMetaParamNewValue = '';
                    this.extraMetaParamRegexpValue = '';
                    this.extraMetaParamRemoveLabels = [];
                    this.extraMetalabels = [];
                    this.extraMetaParamComparator = '';
                };
                TslQueryCtrl.prototype._addRemoveLabelsLabel = function () {
                    if (!this.extraRemoveLabelsLabel)
                        return;
                    if (!this.extraMetaParamRemoveLabels) {
                        this.extraMetaParamRemoveLabels = [];
                    }
                    this.extraMetaParamRemoveLabels.push(this.extraRemoveLabelsLabel);
                    this.extraRemoveLabelsLabel = '';
                };
                TslQueryCtrl.prototype._delRemoveLabelsLabel = function (label) {
                    var i = this.extraMetaParamRemoveLabels.indexOf(label);
                    if (i != -1)
                        this.extraMetaParamRemoveLabels.splice(i, 1);
                };
                TslQueryCtrl.prototype._delOperator = function (index) {
                    this.target.friendlyQuery.delOperator(index);
                };
                TslQueryCtrl.prototype._mvOperatorDown = function (index) {
                    this.target.friendlyQuery.mvOperatorDown(index);
                };
                TslQueryCtrl.prototype._mvOperatorUp = function (index) {
                    this.target.friendlyQuery.mvOperatorUp(index);
                };
                TslQueryCtrl.prototype._addMetaLabel = function () {
                    var label = new seriesLabels_1.default(this.extraMetaLabelKey, this.extraMetaLabelComparator, this.extraMetaLabelValue);
                    this.extraMetalabels.push(label);
                    this.extraMetaLabelKey = '';
                    this.extraMetaLabelValue = '';
                    this.extraMetaLabelComparator = '';
                };
                TslQueryCtrl.prototype._delMetaLabel = function (index) {
                    if (index != -1)
                        this.extraMetalabels.splice(index, 1);
                };
                TslQueryCtrl.templateUrl = 'template/query.html';
                return TslQueryCtrl;
            }(sdk_1.QueryCtrl));
            exports_1("default", TslQueryCtrl);
        }
    };
});
