System.register(["./gts", "./table", "./geo", "./query"], function (exports_1, context_1) {
    "use strict";
    var __assign = (this && this.__assign) || function () {
        __assign = Object.assign || function(t) {
            for (var s, i = 1, n = arguments.length; i < n; i++) {
                s = arguments[i];
                for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                    t[p] = s[p];
            }
            return t;
        };
        return __assign.apply(this, arguments);
    };
    var gts_1, table_1, geo_1, query_1, TslDatasource;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [
            function (gts_1_1) {
                gts_1 = gts_1_1;
            },
            function (table_1_1) {
                table_1 = table_1_1;
            },
            function (geo_1_1) {
                geo_1 = geo_1_1;
            },
            function (query_1_1) {
                query_1 = query_1_1;
            }
        ],
        execute: function () {
            TslDatasource = /** @class */ (function () {
                function TslDatasource(instanceSettings, $q, backendSrv, templateSrv, $log) {
                    this.instanceSettings = instanceSettings;
                    this.$q = $q;
                    this.backendSrv = backendSrv;
                    this.templateSrv = templateSrv;
                    this.$log = $log;
                }
                /**
                 * used by panels to get data
                 * @param options
                 * @return {Promise<any>} Grafana datapoints set
                 */
                TslDatasource.prototype.query = function (opts) {
                    var _this = this;
                    var queries = [];
                    var wsHeader = this.computeTimeVars(opts) + this.computeGrafanaContext() + this.computePanelRepeatVars(opts);
                    opts.targets.forEach(function (queryRef) {
                        var query = Object.assign({}, queryRef); // Deep copy
                        if (!query.hide) {
                            query.target = opts.targets;
                            query.from = opts.range.from.toISOString();
                            query.to = opts.range.to.toISOString();
                            query.ws = wsHeader + "\n";
                            query.target.forEach(function (element) {
                                if (element.friendlyQuery)
                                    element.friendlyQuery = Object.assign(new query_1.default(), element.friendlyQuery);
                                // Grafana can send empty Object at the first time, we need to check if there is something
                                if (element.expr || element.friendlyQuery) {
                                    element.tslHeader = wsHeader;
                                    if (element.advancedMode === undefined)
                                        element.advancedMode = false;
                                    if (element.hideLabels === undefined)
                                        element.hideLabels = false;
                                    if (element.hideAttributes === undefined)
                                        element.hideAttributes = false;
                                    query.ws = query.ws + "\n" + (element.advancedMode ? element.expr : element.friendlyQuery.tslScript);
                                }
                            });
                            console.debug('New Query: ', query);
                            queries.push(query);
                        }
                    });
                    if (queries.length === 0) {
                        var d = this.$q.defer();
                        d.resolve({ data: [] });
                        return d.promise;
                    }
                    queries = queries.map(this.executeExec.bind(this));
                    return this.$q.all(queries)
                        .then(function (responses) {
                        // Grafana formated GTS
                        var data = [];
                        responses.forEach(function (res, i) {
                            if (res.data.type === 'error') {
                                console.error(res.data.value);
                                return;
                            }
                            // is it for a Table graph ?
                            if (res.data.length === 1 && res.data[0] && table_1.Table.isTable(res.data[0])) {
                                var t = res.data[0];
                                t.type = 'table';
                                data.push(t);
                                return;
                            }
                            // World-map panel data type
                            if (res.data.length === 1 && res.data[0] && geo_1.isGeoJson(res.data[0])) {
                                var t = res.data[0];
                                t.type = 'table';
                                data = t;
                                return;
                            }
                            if (res.data.results) {
                                var keys = Object.keys(res.data.results);
                                keys.map(function (key) {
                                    if (res.data.results[key].series) {
                                        res.data.results[key].series.forEach(function (s) {
                                            data.push({ target: s.name + _this.nameWithTags(s), datapoints: s.points });
                                        });
                                    }
                                    if (res.data.results[key].tables) {
                                        res.data.results[key].tables.forEach(function (s) {
                                            data.push({ target: s.name, datapoints: s.points });
                                        });
                                    }
                                });
                                return { data: data };
                            }
                            gts_1.default.stackFilter(res.data).forEach(function (gts) {
                                var grafanaGts = {
                                    target: (opts.targets[i].hideLabels) ? gts.c : gts.nameWithLabels,
                                    datapoints: []
                                };
                                // show attributes
                                if (opts.targets[i].hideAttributes !== undefined && !opts.targets[i].hideAttributes) {
                                    grafanaGts.target += gts.formatedAttributes;
                                }
                                gts.v.forEach(function (dp) {
                                    grafanaGts.datapoints.push([dp[dp.length - 1], dp[0] / 1000]);
                                });
                                data.push(grafanaGts);
                            });
                        });
                        return { data: data };
                    })
                        .catch(function (err) {
                        console.warn('[TSL] Failed to execute query', err);
                        var d = _this.$q.defer();
                        d.resolve({ data: [] });
                        return d.promise;
                    });
                };
                TslDatasource.prototype.nameWithTags = function (series) {
                    if (!series.tags) {
                        return "";
                    }
                    var tags = series.tags;
                    var labelsString = "";
                    if (tags.l) {
                        tags.l = JSON.parse(tags.l);
                        var labelsValues = [];
                        for (var key in tags.l) {
                            if (key == ".app") {
                                continue;
                            }
                            labelsValues.push(key + "=" + tags.l[key]);
                        }
                        labelsString = "{" + labelsValues.join(',') + "}";
                    }
                    var attributeString = "";
                    if (tags.a) {
                        tags.a = JSON.parse(tags.a);
                        var attributesValues = [];
                        for (var key in tags.a) {
                            attributesValues.push(key + "=" + tags.a[key]);
                        }
                        attributeString = "{" + attributesValues.join(',') + "}";
                    }
                    return "" + labelsString + attributeString;
                };
                TslDatasource.prototype.doRequest = function (options) {
                    return this.backendSrv.datasourceRequest(options);
                };
                /**
                 * used by datasource configuration page to make sure the connection is working
                 * @return {Promise<any>} response
                 */
                TslDatasource.prototype.testDatasource = function () {
                    var useBackend = !!this.instanceSettings.jsonData.useBackend ? this.instanceSettings.jsonData.useBackend : false;
                    if (useBackend) {
                        return this.doRequest({
                            url: this.instanceSettings.url + '/api/v0/exec',
                            method: 'POST',
                            data: "NEWGTS 'test' RENAME"
                        }).then(function (res) {
                            if (res.data.length !== 1) {
                                return {
                                    status: 'error',
                                    message: JSON.parse(res.data) || res.data,
                                    title: 'Failed to execute basic tsl'
                                };
                            }
                            else {
                                return {
                                    status: 'success',
                                    message: 'Datasource is working',
                                    title: 'Success'
                                };
                            }
                        })
                            .catch(function (res) {
                            console.log('Error', res);
                            return {
                                status: 'error',
                                message: "Status code: " + res.status,
                                title: 'Failed to contact tsl platform'
                            };
                        });
                    }
                    else {
                        return this.executeExec({
                            ws: 'create(series("test"))'
                        })
                            .then(function (res) {
                            if (res.data.length !== 1) {
                                return {
                                    status: 'error',
                                    message: JSON.parse(res.data) || res.data,
                                    title: 'Failed to execute basic tsl'
                                };
                            }
                            else {
                                return {
                                    status: 'success',
                                    message: 'Datasource is working',
                                    title: 'Success'
                                };
                            }
                        })
                            .catch(function (res) {
                            console.log('Error', res);
                            return {
                                status: 'error',
                                message: "Status code: " + res.status,
                                title: 'Failed to contact tsl platform'
                            };
                        });
                    }
                };
                /*
                */
                /**
                 * used by dashboards to get annotations
                 * @param options
                 * @return {Promise<any>} results
                 */
                TslDatasource.prototype.annotationQuery = function (opts) {
                    var _this = this;
                    var ws = this.computeTimeVars(opts) + this.computeGrafanaContext() + opts.annotation.query;
                    return this.executeExec({ ws: ws })
                        .then(function (res) {
                        var annotations = [];
                        var _loop_1 = function (gts) {
                            var tags = [];
                            for (var label in gts.l) {
                                tags.push(label + ":" + gts.l[label]);
                            }
                            gts.v.forEach(function (dp) {
                                annotations.push({
                                    annotation: {
                                        name: opts.annotation.name,
                                        enabled: true,
                                        datasource: _this.instanceSettings.name,
                                    },
                                    title: gts.c,
                                    time: Math.trunc(dp[0] / (1000)),
                                    text: dp[dp.length - 1],
                                    tags: (tags.length > 0) ? tags.join(',') : null
                                });
                            });
                        };
                        for (var _i = 0, _a = gts_1.default.stackFilter(res.data); _i < _a.length; _i++) {
                            var gts = _a[_i];
                            _loop_1(gts);
                        }
                        return annotations;
                    });
                };
                /**
                 * used by query editor to get metric suggestions and templating.
                 * @param options
                 * @return {Promise<any>}
                 */
                TslDatasource.prototype.metricFindQuery = function (ws) {
                    return this.executeExec({ ws: this.computeGrafanaContext() + ws })
                        .then(function (res) {
                        // only one object on the stack, good user
                        if (res.data.length === 1 && typeof res.data[0] === 'object') {
                            var entries_1 = [];
                            res.data[0].forEach(function (key) {
                                entries_1.push({
                                    text: key,
                                    value: res.data[0][key]
                                });
                            });
                            return entries_1;
                        }
                        // some elements on the stack, return all of them as entry
                        return res.data.map(function (entry, i) {
                            return {
                                text: entry.toString() || i,
                                value: entry
                            };
                        });
                    });
                };
                /**
                 * Execute tsl
                 * @param ws tsl string
                 * @return {Promise<any>} Response
                 */
                TslDatasource.prototype.executeExec = function (query) {
                    var _this = this;
                    var endpoint = this.instanceSettings.url;
                    if ((query.backend !== undefined) && (query.backend.length > 0)) {
                        endpoint = query.backend;
                    }
                    if (endpoint.charAt(endpoint.length - 1) === '/') {
                        endpoint = endpoint.substr(0, endpoint.length - 1);
                    }
                    var auth = undefined;
                    if (this.instanceSettings.basicAuth !== undefined) {
                        auth = this.instanceSettings.basicAuth;
                    }
                    var useBackend = !!this.instanceSettings.jsonData.useBackend ? this.instanceSettings.jsonData.useBackend : false;
                    if (useBackend) {
                        query.target = query.target.map(function (el) { return (__assign({}, el, { datasourceId: _this.instanceSettings.id, auth: auth, tsl: !!el.friendlyQuery.tslScript ? el.friendlyQuery.tslScript : el.expr })); });
                        var tsdbRequestData = {
                            from: query.from.valueOf().toString(),
                            to: query.to.valueOf().toString(),
                            queries: query.target,
                        };
                        return this.backendSrv.datasourceRequest({
                            url: '/api/tsdb/query',
                            method: 'POST',
                            data: tsdbRequestData
                        });
                    }
                    else {
                        var tslQueryRange = '';
                        if ((query.from !== undefined) && (query.to !== undefined)) {
                            tslQueryRange = query.from + "," + query.to;
                        }
                        return this.backendSrv.datasourceRequest({
                            method: 'POST',
                            url: endpoint + '/v0/query',
                            data: query.ws,
                            headers: {
                                'Accept': undefined,
                                'Content-Type': undefined,
                                'TSL-Query-Range': tslQueryRange,
                                Authorization: auth,
                            }
                        });
                    }
                };
                /**
                 * Compute Datasource variables and templating variables, store it on top of the stack
                 * @return {string} TSL header
                 */
                TslDatasource.prototype.computeGrafanaContext = function () {
                    var wsHeader = '';
                    // Datasource vars
                    for (var myVar in this.instanceSettings.jsonData.var) {
                        var value = this.instanceSettings.jsonData.var[myVar];
                        if (typeof value === 'string')
                            value = value.replace(/'/g, '"');
                        if (typeof value === 'string' && !value.startsWith('<%') && !value.endsWith('%>'))
                            value = "'" + value + "'";
                        wsHeader += " " + myVar + "=" + (value || 'NULL') + " ";
                    }
                    // Dashboad templating vars
                    for (var _i = 0, _a = this.templateSrv.variables; _i < _a.length; _i++) {
                        var myVar = _a[_i];
                        var value = myVar.current.text;
                        if (myVar.current.value === '$__all' && myVar.allValue !== null)
                            value = myVar.allValue;
                        if (isNaN(value) || value.startsWith('0'))
                            value = "'" + value + "'";
                        wsHeader += " " + myVar.name + "=" + (value || 'NULL') + " ";
                    }
                    return wsHeader;
                };
                TslDatasource.prototype.computeTimeVars = function (opts) {
                    var vars = {
                        startTick: opts.range.from.toDate().getTime() * 1000,
                        startISO: opts.range.from.toISOString(),
                        endTick: opts.range.to.toDate().getTime() * 1000,
                        endISO: opts.range.to.toISOString(),
                    };
                    vars.interval = vars.endTick - vars.startTick;
                    vars.__interval = Math.floor(vars.interval / (opts.maxDataPoints || 1));
                    vars.__interval_ms = Math.floor(vars.__interval / 1000);
                    var str = '';
                    for (var gVar in vars) {
                        str += " " + gVar + "=" + (isNaN(vars[gVar]) ? "'" + vars[gVar] + "'" : vars[gVar]) + " ";
                    }
                    return str;
                };
                TslDatasource.prototype.computePanelRepeatVars = function (opts) {
                    var str = '';
                    if (opts.scopedVars) {
                        for (var k in opts.scopedVars) {
                            var v = opts.scopedVars[k];
                            if (v.selected) {
                                str += " " + k + "='" + v.value + "' ";
                            }
                        }
                    }
                    return str;
                };
                return TslDatasource;
            }());
            exports_1("default", TslDatasource);
        }
    };
});
