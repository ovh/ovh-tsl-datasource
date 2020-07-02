///<reference path="../node_modules/grafana-sdk-mocks/app/headers/common.d.ts" />
System.register(["app/plugins/sdk", "./tsl-annotation.controller", "./tsl-config.controller", "./tsl-datasource", "./tsl-query.controller"], function (exports_1, context_1) {
    "use strict";
    var sdk_1, tsl_annotation_controller_1, tsl_config_controller_1, tsl_datasource_1, tsl_query_controller_1;
    var __moduleName = context_1 && context_1.id;
    function getCSSPath(sheet) {
        return "plugins/grafana-tsl-datasource/style/" + sheet + ".css";
    }
    return {
        setters: [
            function (sdk_1_1) {
                sdk_1 = sdk_1_1;
            },
            function (tsl_annotation_controller_1_1) {
                tsl_annotation_controller_1 = tsl_annotation_controller_1_1;
            },
            function (tsl_config_controller_1_1) {
                tsl_config_controller_1 = tsl_config_controller_1_1;
            },
            function (tsl_datasource_1_1) {
                tsl_datasource_1 = tsl_datasource_1_1;
            },
            function (tsl_query_controller_1_1) {
                tsl_query_controller_1 = tsl_query_controller_1_1;
            }
        ],
        execute: function () {///<reference path="../node_modules/grafana-sdk-mocks/app/headers/common.d.ts" />
            exports_1("AnnotationsQueryCtrl", tsl_annotation_controller_1.default);
            exports_1("ConfigCtrl", tsl_config_controller_1.default);
            exports_1("Datasource", tsl_datasource_1.default);
            exports_1("QueryCtrl", tsl_query_controller_1.default);
            sdk_1.loadPluginCss({
                dark: getCSSPath('dark'),
                light: getCSSPath('light')
            });
        }
    };
});
