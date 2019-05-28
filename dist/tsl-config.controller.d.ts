import Datasource from './datasource';
export default class TslConfigCtrl {
    private backendSrv;
    private $routeParams;
    static templateUrl: string;
    current: Datasource;
    newExtraKey: any;
    newExtraVal: any;
    tslBackend: string;
    constructor(backendSrv: any, $routeParams: any);
    _loadDatasourceConfig(): void;
    _addExtraVar(): void;
    _delExtraVar(key: any): void;
    _editKey(key: any): void;
}
