System.register([], function (exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    function default_1() {
        if (!window['ace']) {
            return;
        }
        ace.define('ace/mode/tsl_keywords', function (require, exports, module) {
            var tslFunctions = "select|where|sampleBy|groupBy|rate|from|last|group|window|cumulative|add|sub|mul|div|abs|ceil|floor|round|ln|log2|log10|logN|rate|sqrt|equal|notEqual|greaterThan|greaterOrEqual|lessThan|lessOrEqual|maxWith|minWith|shift|day|weekday|hour|minute|month|year|timestamp|sort|sortDesc|sortBy|sortDescBy|topN|bottomN|topNBy|bottomNBy|on|ignoring|connect|addNamePrefix|addNameSuffix|rename|renameBy|removeLabels|renameLabelKey|renameLabelValue";
            var tslControl = "last|first|mean|max|min|join|median|count|and|or|sum|delta|stddev|stdvar";
            var tslConstants = "TRUE|true|FALSE|false";
            var tslFrameworkFunctions = "to|from|date|timestamp|shift|span|aggregator|aggregator|relative|fill|count|mapperValue|pre|post|sampler|occurences|aggregator|keepDistinct|n";
            exports.KeywordMap = {
                "constant.language": tslConstants,
                "keyword.control": tslControl,
                "keyword.other": tslFrameworkFunctions,
                "support.function": tslFunctions
            };
        });
        ace.define("ace/mode/tsl_highlight_rules", ["require", "exports", "module", "ace/lib/oop", "ace/mode/text_highlight_rules", "ace/mode/tsl_keywords"], function (require, exports, module) {
            var oop = require("../lib/oop");
            var TextHighlightRules = require("./text_highlight_rules").TextHighlightRules;
            var keywordMap = require("./tsl_keywords").KeywordMap;
            var tslHighlightRules = function () {
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
            oop.inherits(tslHighlightRules, TextHighlightRules);
            exports.tslHighlightRules = tslHighlightRules;
        });
        ace.define("ace/mode/tsl_completions", ["require", "exports", "module", "ace/mode/tsl_keywords"], function (require, exports, module) {
            var keywordMap = require("./tsl_keywords").KeywordMap;
            var keywordList = [];
            for (var key in keywordMap) {
                keywordList = keywordList.concat(keywordMap[key].split(/\|/));
            }
            keywordList = keywordList.sort();
            var tslCompletions = function () { };
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
                            meta: "tsl",
                            score: Number.MAX_VALUE
                        };
                    });
                    return matchingWordsObjects;
                };
            }).call(tslCompletions.prototype);
            exports.tslCompletions = tslCompletions;
        });
        ace.define("ace/mode/tsl", ["require", "exports", "module", "ace/lib/oop", "ace/mode/text", "ace/mode/tsl_highlight_rules", "ace/range", "ace/mode/tsl_completions"], function (require, exports, module) {
            var oop = require("../lib/oop");
            var TextMode = require("./text").Mode;
            var tslHighlightRules = require("./tsl_highlight_rules").tslHighlightRules;
            var tslCompletions = require("./tsl_completions").tslCompletions;
            var Range = require("../range").Range;
            var Mode = function () {
                this.HighlightRules = tslHighlightRules;
                this.$completer = new tslCompletions();
            };
            oop.inherits(Mode, TextMode);
            (function () {
                this.lineCommentStart = "*";
                this.$id = "ace/mode/tsl";
                this.getCompletions = function (state, session, pos, prefix) {
                    var completerResponse = this.$completer.getCompletions(state, session, pos, prefix);
                    return completerResponse;
                };
            }).call(Mode.prototype);
            exports.Mode = Mode;
        });
        ace.define('ace/snippets/tsl', ["require", "exports", "module"], function (require, exports, module) {
            exports.scope = 'tsl';
            exports.snippets = [{
                    name: 'sample',
                    content: "select('${1}')\n.where('${2}=${3}')\n.sampleBy(${4:1m}, ${5:mean})"
                }, {
                    name: 'select',
                    content: "select('${1}')\n.where('${2}=${3}')\n"
                }, {
                    name: 'groupBy',
                    content: "select('${1}')\n.where('${2}=${3}')\n.sampleBy(${4:1m}, ${5:mean})\n.groupBy('${6}',${7:mean})"
                }];
        });
        return true;
    }
    exports_1("default", default_1);
    return {
        setters: [],
        execute: function () {
        }
    };
});
