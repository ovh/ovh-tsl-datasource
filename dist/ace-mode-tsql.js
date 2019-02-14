System.register([], function (exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    function default_1() {
        ace.define('ace/mode/tsql_keywords', function (require, exports, module) {
            var tsqlFunctions = "select|where|sampleBy|groupBy|rate";
            var tsqlControl = "last|last|mean|max|min|join";
            var tsqlConstants = "NULL|NaN|E|e|PI|pi|NOW|MAXLONG|MINLONG|TRUE|true|FALSE|false";
            var tsqlFrameworkFunctions = "max\.tick\.sliding\.window|max\.time\.sliding\.window|mapper\.replace|mapper\.gt|mapper\.ge|mapper\.eq|mapper\.ne|mapper\.le|mapper\.lt|mapper\.add|mapper\.mul|mapper\.pow|mapper\.sqrt|mapper\.exp|mapper\.log|mapper\.min\.x|mapper\.max\.x|mapper\.parsedouble|mapper\.tick|mapper\.year|mapper\.month|mapper\.day|mapper\.weekday|mapper\.hour|mapper\.minute|mapper\.second|mapper\.npdf|mapper\.dotproduct|mapper\.dotproduct\.tanh|mapper\.dotproduct\.sigmoid|mapper\.dotproduct\.positive|mapper\.kernel\.cosine|mapper\.kernel\.epanechnikov|mapper\.kernel\.gaussian|mapper\.kernel\.logistic|mapper\.kernel\.quartic|mapper\.kernel\.silverman|mapper\.kernel\.triangular|mapper\.kernel\.tricube|mapper\.kernel\.triweight|mapper\.kernel\.uniform|mapper\.percentile|filter\.byclass|filter\.bylabels|filter\.byattr|filter\.bylabelsattr|filter\.bymetadata|filter\.last\.eq|filter\.last\.ge|filter\.last\.gt|filter\.last\.le|filter\.last\.lt|filter\.last\.ne|filter\.latencies|mapper\.geo\.within|mapper\.geo\.outside|mapper\.geo\.approximate|bucketizer\.and|bucketizer\.first|bucketizer\.last|bucketizer\.min|bucketizer\.max|bucketizer\.mean|bucketizer\.median|bucketizer\.mad|bucketizer\.or|bucketizer\.sum|bucketizer\.join|bucketizer\.count|bucketizer\.percentile|bucketizer\.min\.forbid\-nulls|bucketizer\.max\.forbid\-nulls|bucketizer\.mean\.exclude\-nulls|bucketizer\.sum\.forbid\-nulls|bucketizer\.join\.forbid\-nulls|bucketizer\.count\.exclude\-nulls|bucketizer\.count\.include\-nulls|bucketizer\.count\.nonnull|bucketizer\.mean\.circular|bucketizer\.mean\.circular\.exclude\-nulls|mapper\.and|mapper\.count|mapper\.first|mapper\.last|mapper\.min|mapper\.max|mapper\.mean|mapper\.median|mapper\.mad|mapper\.or|mapper\.highest|mapper\.lowest|mapper\.sum|mapper\.join|mapper\.delta|mapper\.rate|mapper\.hspeed|mapper\.hdist|mapper\.truecourse|mapper\.vspeed|mapper\.vdist|mapper\.var|mapper\.sd|mapper\.abs|mapper\.ceil|mapper\.floor|mapper\.finite|mapper\.round|mapper\.toboolean|mapper\.tolong|mapper\.todouble|mapper\.tostring|mapper\.tanh|mapper\.sigmoid|mapper\.product|mapper\.geo\.clear|mapper\.count\.exclude\-nulls|mapper\.count\.include\-nulls|mapper\.count\.nonnull|mapper\.min\.forbid\-nulls|mapper\.max\.forbid\-nulls|mapper\.mean\.exclude\-nulls|mapper\.sum\.forbid\-nulls|mapper\.join\.forbid\-nulls|mapper\.var\.forbid\-nulls|mapper\.sd\.forbid\-nulls|mapper\.mean\.circular|mapper\.mean\.circular\.exclude\-nulls|mapper\.mod|reducer\.and|reducer\.and\.exclude\-nulls|reducer\.min|reducer\.min\.forbid\-nulls|reducer\.min\.nonnull|reducer\.max|reducer\.max\.forbid\-nulls|reducer\.max\.nonnull|reducer\.mean|reducer\.mean\.exclude\-nulls|reducer\.median|reducer\.mad|reducer\.or|reducer\.or\.exclude\-nulls|reducer\.sum|reducer\.sum\.forbid\-nulls|reducer\.sum\.nonnull|reducer\.join|reducer\.join\.forbid\-nulls|reducer\.join\.nonnull|reducer\.join\.urlencoded|reducer\.var|reducer\.var\.forbid\-nulls|reducer\.sd|reducer\.sd\.forbid\-nulls|reducer\.argmin|reducer\.argmax|reducer\.product|reducer\.count|reducer\.count\.include\-nulls|reducer\.count\.exclude\-nulls|reducer\.count\.nonnull|reducer\.shannonentropy\.0|reducer\.shannonentropy\.1|reducer\.percentile|reducer\.mean\.circular|reducer\.mean\.circular\.exclude\-nulls|op\.add|op\.add\.ignore\-nulls|op\.sub|op\.mul|op\.mul\.ignore\-nulls|op\.div|op\.mask|op\.negmask|op\.ne|op\.eq|op\.lt|op\.gt|op\.le|op\.ge|op\.and\.ignore\-nulls|op\.and|op\.or\.ignore\-nulls|op\.or|mapper\.distinct";
            exports.KeywordMap = {
                "constant.language": tsqlConstants,
                "keyword.control": tsqlControl,
                "keyword.other": tsqlFrameworkFunctions,
                "support.function": tsqlFunctions
            };
        });
        ace.define("ace/mode/tsql_highlight_rules", ["require", "exports", "module", "ace/lib/oop", "ace/mode/text_highlight_rules", "ace/mode/tsql_keywords"], function (require, exports, module) {
            var oop = require("../lib/oop");
            var TextHighlightRules = require("./text_highlight_rules").TextHighlightRules;
            var keywordMap = require("./tsql_keywords").KeywordMap;
            var tsqlHighlightRules = function () {
                this.keywordMapper = this.createKeywordMapper(keywordMap, "identifier", false);
                this.$rules = {
                    start: [{
                            token: "comment",
                            regex: /(?:#|\/\/)(?:[^?]|\?[^>])*/,
                        }, {
                            token: "comment",
                            regex: "\\/\\*",
                            next: "comment"
                        }, {
                            token: "string.quoted.single",
                            regex: /'[^']*'/
                        }, {
                            token: "constant.numeric",
                            regex: /[+-]?\d+(\.\d+)?([eE][+-]?\d+)?\b/
                        }, {
                            token: "duration",
                            regex: /^\s*[\d]+([smhdw]|[munp]s)\s*$/
                        }, {
                            token: this.keywordMapper,
                            regex: "[a-zA-Z_$][a-zA-Z0-9_$]*\\b",
                            caseInsensitive: false
                        }, {
                            token: "keyword.operator",
                            regex: /!=|!|%|&|&&|\*|\*\*|\+|\-|\/|<|<=|==|>|>=|\[|\]|\[\]|\^|\{\}|\{|\}|\||\|\||~=/
                        }, {
                            token: "paren.lparen",
                            regex: /[\[\{]/
                        }, {
                            token: "paren.rparen",
                            regex: /[\]\}]/
                        }, {
                            token: "text",
                            regex: /\s+/
                        }],
                    line_comment: [{
                            token: "comment",
                            regex: "$|^",
                            next: "start"
                        }, {
                            defaultToken: "comment",
                            caseInsensitive: true
                        }],
                    comment: [{
                            token: "comment",
                            regex: "\\*\\/",
                            next: "start"
                        }, {
                            defaultToken: "comment"
                        }]
                };
            };
            oop.inherits(tsqlHighlightRules, TextHighlightRules);
            exports.tsqlHighlightRules = tsqlHighlightRules;
        });
        ace.define("ace/mode/tsql_completions", ["require", "exports", "module", "ace/mode/tsql_keywords"], function (require, exports, module) {
            var keywordMap = require("./tsql_keywords").KeywordMap;
            var keywordList = [];
            for (var key in keywordMap) {
                keywordList = keywordList.concat(keywordMap[key].split(/\|/));
            }
            keywordList = keywordList.sort();
            var tsqlCompletions = function () { };
            (function () {
                this.getCompletions = function (state, session, pos, prefix) {
                    var matchingWords = [];
                    for (var word in keywordList) {
                        if (keywordList[word].search(prefix) > -1)
                            matchingWords.push(keywordList[word]);
                    }
                    var matchingWordsObjects = matchingWords.map(function (value) {
                        return {
                            caption: value,
                            snippet: value,
                            meta: "tsql",
                            score: Number.MAX_VALUE
                        };
                    });
                    return matchingWordsObjects;
                };
            }).call(tsqlCompletions.prototype);
            exports.tsqlCompletions = tsqlCompletions;
        });
        ace.define("ace/mode/tsql", ["require", "exports", "module", "ace/lib/oop", "ace/mode/text", "ace/mode/tsql_highlight_rules", "ace/range", "ace/mode/tsql_completions"], function (require, exports, module) {
            var oop = require("../lib/oop");
            var TextMode = require("./text").Mode;
            var tsqlHighlightRules = require("./tsql_highlight_rules").tsqlHighlightRules;
            var tsqlCompletions = require("./tsql_completions").tsqlCompletions;
            var Range = require("../range").Range;
            var Mode = function () {
                this.HighlightRules = tsqlHighlightRules;
                this.$completer = new tsqlCompletions();
            };
            oop.inherits(Mode, TextMode);
            (function () {
                this.lineCommentStart = "*";
                this.$id = "ace/mode/tsql";
                this.getCompletions = function (state, session, pos, prefix) {
                    var completerResponse = this.$completer.getCompletions(state, session, pos, prefix);
                    return completerResponse;
                };
            }).call(Mode.prototype);
            exports.Mode = Mode;
        });
        ace.define('ace/snippets/tsql', ["require", "exports", "module"], function (require, exports, module) {
            exports.scope = 'tsql';
            exports.snippets = [{
                    name: 'sample',
                    content: "select('${1}')\n.where(${2})\n.sampleBy(${3:1m}, ${4:mean})"
                }, {
                    name: 'groupBy',
                    content: "select('${1}')\n.where(${2})\n.sampleBy(${3:1m}, ${4:mean})\n.groupBy('${5}',${6:mean})"
                }];
        });
    }
    exports_1("default", default_1);
    return {
        setters: [],
        execute: function () {
        }
    };
});
