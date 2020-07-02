/**
 * Set of handlers for secure password field in Angular components. They handle backward compatibility with
 * passwords stored in plain text fields.
 */
System.register([], function (exports_1, context_1) {
    "use strict";
    var PasswordFieldEnum, createResetHandler, createChangeHandler;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [],
        execute: function () {/**
             * Set of handlers for secure password field in Angular components. They handle backward compatibility with
             * passwords stored in plain text fields.
             */
            (function (PasswordFieldEnum) {
                PasswordFieldEnum["Password"] = "password";
                PasswordFieldEnum["BasicAuthPassword"] = "basicAuthPassword";
            })(PasswordFieldEnum || (PasswordFieldEnum = {}));
            exports_1("PasswordFieldEnum", PasswordFieldEnum);
            exports_1("createResetHandler", createResetHandler = function (ctrl, field) { return function (event) {
                event.preventDefault();
                // Reset also normal plain text password to remove it and only save it in secureJsonData.
                ctrl.current[field] = null;
                ctrl.current.secureJsonFields[field] = false;
                ctrl.current.secureJsonData = ctrl.current.secureJsonData || {};
                ctrl.current.secureJsonData[field] = '';
            }; });
            exports_1("createChangeHandler", createChangeHandler = function (ctrl, field) { return function (event) {
                ctrl.current.secureJsonData = ctrl.current.secureJsonData || {};
                ctrl.current.secureJsonData[field] = event.currentTarget.value;
            }; });
        }
    };
});
