import SeriesLabels from './seriesLabels';
export default class TslQuery {
    readToken: string;
    className: string;
    _labels: SeriesLabels[];
    sampleAggregator: any;
    span: string;
    sampleByPercentile: number;
    groupByPercentile: number;
    sampleByJoin: string;
    groupByJoin: string;
    groupByWithout: boolean;
    sampleFill: string;
    sampleFillValue: string;
    sampleByRelative: boolean;
    groupByAggregator: any;
    groupByLabels: string[];
    queryOperators: string[];
    operatorsKind: string[];
    arithmeticOperators: string[];
    equalityOperators: string[];
    limitOperators: string[];
    timeOperators: string[];
    windowOperators: string[];
    transformOperators: string[];
    orderOperators: string[];
    metaOperators: string[];
    sampleAggregators: string[];
    groupByAggregators: string[];
    windowAggregators: string[];
    sortsAggregators: string[];
    sampleByFillPolicy: string[];
    comparators: string[];
    filterByNameComparators: string[];
    filterByLastValuesComparators: string[];
    filters: {
        name: string;
        type: string;
    }[];
    constructor();
    addLabel(key: string, comparator: string, val: string): void;
    delLabel(index: number): void;
    addGroupByLabel(key: string): void;
    delGroupByLabel(key: string): void;
    private static formatStringVar;
    get tslScript(): string;
    loadTSLLabels(): string;
    addOperator(operator: string, extraParams: string[]): void;
    delOperator(index: number): void;
    mvOperatorDown(index: number): void;
    mvOperatorUp(index: number): void;
}
