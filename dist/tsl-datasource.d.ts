import AnnotationOptions from './interfaces/annotation-options';
import QueryOptions from './interfaces/query-options';
export default class TslDatasource {
    private instanceSettings;
    private $q;
    private backendSrv;
    private templateSrv;
    private $log;
    constructor(instanceSettings: any, $q: any, backendSrv: any, templateSrv: any, $log: any);
    /**
     * used by panels to get data
     * @param options
     * @return {Promise<any>} Grafana datapoints set
     */
    query(opts: QueryOptions): Promise<any>;
    nameWithTags(series: any): string;
    doRequest(options: any): any;
    performInstantQuery(query: any, time: any): any;
    promNativeRequest(url: any, data: any, requestId: any): any;
    prometheusRequest(): any;
    warp10Request(): any;
    /**
     * used by datasource configuration page to make sure the connection is working
     * @return {Promise<any>} response
     */
    testDatasource(): Promise<any>;
    /**
     * used by dashboards to get annotations
     * @param options
     * @return {Promise<any>} results
     */
    annotationQuery(opts: AnnotationOptions): Promise<any>;
    /**
     * used by query editor to get metric suggestions and templating.
     * @param options
     * @return {Promise<any>}
     */
    metricFindQuery(ws: string): Promise<any>;
    /**
     * Execute tsl
     * @param ws tsl string
     * @return {Promise<any>} Response
     */
    private executeExec;
    /**
     * Compute Datasource variables and templating variables, store it on top of the stack
     * @return {string} TSL header
     */
    private computeGrafanaContext;
    private computeTimeVars;
    private computePanelRepeatVars;
}
