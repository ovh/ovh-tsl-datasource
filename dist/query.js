System.register(["./seriesLabels"], function (exports_1, context_1) {
    "use strict";
    var seriesLabels_1, TslQuery;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [
            function (seriesLabels_1_1) {
                seriesLabels_1 = seriesLabels_1_1;
            }
        ],
        execute: function () {
            TslQuery = /** @class */ (function () {
                function TslQuery() {
                    this.readToken = '';
                    this.className = '';
                    this._labels = [];
                    this.sampleAggregator = null;
                    this.span = '1m';
                    this.sampleByPercentile = 50;
                    this.groupByPercentile = 50;
                    this.sampleByJoin = '';
                    this.groupByJoin = '';
                    this.groupByWithout = false;
                    this.sampleFill = '';
                    this.sampleFillValue = '';
                    this.sampleByRelative = true;
                    this.groupByAggregator = null;
                    this.groupByLabels = [];
                    this.queryOperators = [];
                    this.operatorsKind = [
                        'Arithmetic', 'Equality', 'Limit', 'Time', 'Window', 'Transform', 'Sorts', 'Meta',
                    ];
                    this.arithmeticOperators = [
                        'add', 'sub', 'mul', 'div', 'abs', 'ceil', 'floor', 'round', 'ln', 'log2', 'log10', 'logN', 'sqrt', 'finite',
                    ];
                    this.equalityOperators = [
                        'equal', 'notEqual', 'greaterThan', 'greaterOrEqual', 'lessThan', 'lessOrEqual',
                    ];
                    this.limitOperators = [
                        'maxWith', 'minWith',
                    ];
                    this.timeOperators = [
                        'shift', 'day', 'weekday', 'hour', 'minute', 'month', 'year', 'timestamp', 'keepLastValues', 'keepFirstValues', 'shrink', 'timeclip', 'timemodulo', 'timescale', 'timesplit'
                    ];
                    this.windowOperators = [
                        'window', 'cumulative',
                    ];
                    this.transformOperators = [
                        'rate', 'quantize', 'resets'
                    ];
                    this.orderOperators = [
                        'sort', 'sortDesc', 'sortBy', 'sortDescBy', 'topN', 'bottomN', 'topNBy', 'bottomNBy',
                    ];
                    this.metaOperators = [
                        'addPrefix', 'addSuffix', 'rename', 'renameBy', 'removeLabels', 'renameLabelKey', 'renameLabelValue', 'filterByLabels', 'filterByName', 'filterByLastValue'
                    ];
                    this.sampleAggregators = [
                        'max', 'mean', 'min', 'first', 'last', 'sum', 'join', 'median', 'count', 'and', 'or', 'percentile',
                    ];
                    this.groupByAggregators = [
                        'max', 'mean', 'min', 'sum', 'join', 'median', 'count', 'and', 'or', 'percentile',
                    ];
                    this.windowAggregators = [
                        'max', 'mean', 'min', 'first', 'last', 'sum', 'join', 'delta', 'stddev', 'stdvar', 'median', 'count', 'and', 'or', 'percentile',
                    ];
                    this.sortsAggregators = [
                        'max', 'mean', 'min', 'first', 'last', 'sum', 'median', 'count', 'and', 'or', 'percentile',
                    ];
                    this.sampleByFillPolicy = [
                        'interpolate', 'next', 'previous', 'none', 'fill',
                    ];
                    this.comparators = [
                        '~', '!=', '!~'
                    ];
                    this.filterByNameComparators = [
                        '~'
                    ];
                    this.filterByLastValuesComparators = [
                        '<=', "<", "!=", ">=", ">"
                    ];
                    this.filters = [
                        { name: 'byclass', type: 'S' },
                        { name: 'bylabels', type: 'M' },
                        { name: 'last.eq', type: 'N' },
                        { name: 'last.ne', type: 'N' },
                        { name: 'last.gt', type: 'N' },
                        { name: 'last.ge', type: 'N' },
                        { name: 'last.lt', type: 'N' },
                        { name: 'last.le', type: 'N' }
                    ];
                    if (!this._labels) {
                        this._labels = [];
                    }
                }
                TslQuery.prototype.addLabel = function (key, comparator, val) {
                    var label = new seriesLabels_1.default(key, comparator, val);
                    this._labels.push(label);
                };
                TslQuery.prototype.delLabel = function (index) {
                    if (index != -1)
                        this._labels.splice(index, 1);
                };
                TslQuery.prototype.addGroupByLabel = function (key) {
                    this.groupByLabels.push(key);
                };
                TslQuery.prototype.delGroupByLabel = function (key) {
                    var i = this.groupByLabels.indexOf(key);
                    if (i != -1)
                        this.groupByLabels.splice(i, 1);
                };
                TslQuery.formatStringVar = function (s) {
                    return s.startsWith('$') ? s : "'" + s + "'";
                };
                Object.defineProperty(TslQuery.prototype, "tslScript", {
                    get: function () {
                        var f = TslQuery.formatStringVar;
                        var q = '';
                        if (this.className == '') {
                            return q;
                        }
                        q = "select(" + f(this.className) + ")";
                        var labelsSize = Object.keys(this._labels).length;
                        if (labelsSize == 1) {
                            q += ".where(" + this.loadTSLLabels() + ")";
                        }
                        else if (labelsSize > 1) {
                            q += ".where([" + this.loadTSLLabels() + "])";
                        }
                        if (this.sampleAggregator) {
                            var aggregator = this.sampleAggregator;
                            // Manage particuliar operator as percentile and join expect a parameter
                            if (aggregator == "percentile") {
                                aggregator += ", " + this.sampleByPercentile;
                            }
                            else if (aggregator == "join") {
                                aggregator += ", '" + this.sampleByJoin + "'";
                            }
                            if (this.sampleFill) {
                                if (this.sampleFill === "fill") {
                                    var fillValue = '0';
                                    if (this.sampleFillValue) {
                                        fillValue = this.sampleFillValue;
                                    }
                                    aggregator += ", " + this.sampleFill + "(" + fillValue + ")";
                                }
                                else {
                                    aggregator += ", '" + this.sampleFill + "'";
                                }
                            }
                            if (!this.sampleByRelative) {
                                aggregator += ", false";
                            }
                            q += ".sampleBy(" + this.span + ", " + aggregator + ")";
                        }
                        if (this.groupByAggregator) {
                            var aggregator = this.groupByAggregator;
                            // Manage particuliar operator as percentile and join expect a parameter
                            if (aggregator === "percentile") {
                                aggregator += ", " + this.groupByPercentile;
                            }
                            else if (aggregator === "join") {
                                aggregator += ", '" + this.groupByJoin + "'";
                            }
                            var group = "groupBy";
                            if (this.groupByWithout) {
                                group = "groupWithout";
                            }
                            var groupByLabelsSize = this.groupByLabels.length;
                            if (groupByLabelsSize == 0) {
                                q += ".group(" + aggregator + ")";
                            }
                            else if (groupByLabelsSize == 1) {
                                q += "." + group + "('" + this.groupByLabels[0] + "', " + aggregator + ")";
                            }
                            else {
                                var labelsStr = '';
                                var prefix = '';
                                for (var label in this.groupByLabels) {
                                    labelsStr += prefix + "'" + this.groupByLabels[label] + "'";
                                    prefix = ", ";
                                }
                                q += "." + group + "([" + labelsStr + "], " + aggregator + ")";
                            }
                        }
                        for (var index in this.queryOperators) {
                            q += '.' + this.queryOperators[index];
                        }
                        return q;
                    },
                    enumerable: false,
                    configurable: true
                });
                TslQuery.prototype.loadTSLLabels = function () {
                    var labelsStr = '';
                    var prefix = '';
                    this._labels.forEach(function (label) {
                        var comparator = label.comparator;
                        if (!label.comparator) {
                            comparator = '=';
                        }
                        labelsStr += prefix + "'" + label.key + comparator + label.value + "'";
                        prefix = ", ";
                    });
                    return labelsStr;
                };
                TslQuery.prototype.addOperator = function (operator, extraParams) {
                    var operatorString = operator;
                    operatorString += "(";
                    var prefix = "";
                    for (var param in extraParams) {
                        operatorString += "" + prefix + extraParams[param];
                        prefix = ", ";
                    }
                    operatorString += ")";
                    this.queryOperators.push(operatorString);
                };
                TslQuery.prototype.delOperator = function (index) {
                    if (index != -1)
                        this.queryOperators.splice(index, 1);
                };
                TslQuery.prototype.mvOperatorDown = function (index) {
                    if (this.queryOperators.length - 1 >= index + 1) {
                        var operator = this.queryOperators[index];
                        this.queryOperators[index] = this.queryOperators[index + 1];
                        this.queryOperators[index + 1] = operator;
                    }
                };
                TslQuery.prototype.mvOperatorUp = function (index) {
                    if (index - 1 >= 0) {
                        var operator = this.queryOperators[index];
                        this.queryOperators[index] = this.queryOperators[index - 1];
                        this.queryOperators[index - 1] = operator;
                    }
                };
                return TslQuery;
            }());
            exports_1("default", TslQuery);
        }
    };
});
