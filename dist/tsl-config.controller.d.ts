import Datasource from './datasource';
import { createChangeHandler, createResetHandler } from './passwordHandlers';
export default class TslConfigCtrl {
    private backendSrv;
    private $routeParams;
    static templateUrl: string;
    current: Datasource;
    newExtraKey: any;
    newExtraVal: any;
    onPasswordReset: ReturnType<typeof createResetHandler>;
    onPasswordChange: ReturnType<typeof createChangeHandler>;
    constructor(backendSrv: any, $routeParams: any);
    _loadDatasourceConfig(): void;
    _addExtraVar(): void;
    _delExtraVar(key: any): void;
    _editKey(key: any): void;
}
