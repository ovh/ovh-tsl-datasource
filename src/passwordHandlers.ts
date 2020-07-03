/**
 * Set of handlers for secure password field in Angular components. They handle backward compatibility with
 * passwords stored in plain text fields.
 */

import { SyntheticEvent } from 'react';

export enum PasswordFieldEnum {
    Password = 'password',
    BasicAuthPassword = 'basicAuthPassword',
}

/**
 * Basic shape for settings controllers in at the moment mostly angular datasource plugins.
 */
export type Ctrl = {
    current: {
        secureJsonFields: {};
        jsonData?: {};
    };
};

export const createResetHandler = (ctrl: Ctrl, field: PasswordFieldEnum) => (
    event: SyntheticEvent<HTMLInputElement>
) => {
    event.preventDefault();
    // Reset also normal plain text password to remove it and only save it in secureJsonData.
    ctrl.current[field] = null;
    ctrl.current.secureJsonFields[field] = false;
    ctrl.current.jsonData = ctrl.current.jsonData || {};
    ctrl.current.jsonData[field] = '';
};

export const createChangeHandler = (ctrl: any, field: PasswordFieldEnum) => (
    event: SyntheticEvent<HTMLInputElement>
) => {
    ctrl.current.jsonData = ctrl.current.jsonData || {};
    ctrl.current.jsonData[field] = event.currentTarget.value;
};