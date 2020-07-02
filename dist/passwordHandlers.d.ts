/**
 * Set of handlers for secure password field in Angular components. They handle backward compatibility with
 * passwords stored in plain text fields.
 */
import { SyntheticEvent } from 'react';
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
        jsonData?: {};
    };
};
export declare const createResetHandler: (ctrl: Ctrl, field: PasswordFieldEnum) => (event: SyntheticEvent<HTMLInputElement>) => void;
export declare const createChangeHandler: (ctrl: any, field: PasswordFieldEnum) => (event: SyntheticEvent<HTMLInputElement>) => void;
