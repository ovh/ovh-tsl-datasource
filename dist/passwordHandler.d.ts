/**
 * Set of handlers for secure password field in Angular components. They handle backward compatibility with
 * passwords stored in plain text fields.
 */
export declare enum PasswordFieldEnum {
    Password = "password",
    BasicAuthPassword = "basicAuthPassword"
}
/**
 * Basic shape for settings controllers in at the moment mostly angular datasource plugins.
 */
export declare type Ctrl = {
    current: {
        secureJsonFields: {};
        secureJsonData?: {};
    };
};
export declare const createResetHandler: (ctrl: Ctrl, field: PasswordFieldEnum) => (event: any) => void;
export declare const createChangeHandler: (ctrl: any, field: PasswordFieldEnum) => (event: any) => void;
