
import Labels from './labels'

export default class TslQuery {

  readToken = ''
  className = ''
  labels: Labels[] = []
  sampleAggregator = null
  span = '1m'
  sampleByPercentile = 50
  groupByPercentile = 50
  sampleByJoin = ''
  groupByJoin = ''
  groupByWithout = false
  sampleFill = ''
  sampleFillValue = ''
  sampleByRelative = true
  groupByAggregator = null
  groupByLabels: string[] = []
  queryOperators: string[] = []

  operatorsKind = [
    'Arithmetic', 'Equality', 'Limit', 'Time', 'Window', 'Transform', 'Sorts', 'Meta',
  ]

  arithmeticOperators = [
    'add', 'sub', 'mul', 'div', 'abs', 'ceil', 'floor', 'round', 'ln', 'log2', 'log10', 'logN', 'sqrt', 'finite',
  ]

  equalityOperators = [
    'equal', 'notEqual', 'greaterThan', 'greaterOrEqual', 'lessThan', 'lessOrEqual',
  ]

  limitOperators = [
    'maxWith', 'minWith',
  ]

  timeOperators = [
     'shift', 'day', 'weekday', 'hour', 'minute', 'month', 'year', 'timestamp', 'keepLastValues', 'keepFirstValues', 'shrink', 'timeclip', 'timemodulo', 'timescale', 'timesplit'
  ]

  windowOperators = [
    'window', 'cumulative',
  ]

  transformOperators = [
    'rate', 'quantize', 'resets'
  ]

  orderOperators = [
    'sort', 'sortDesc', 'sortBy', 'sortDescBy', 'topN', 'bottomN', 'topNBy', 'bottomNBy',
  ]

  metaOperators = [
    'addPrefix', 'addSuffix', 'rename', 'renameBy', 'removeLabels', 'renameLabelKey', 'renameLabelValue', 'filterByLabels', 'filterByName', 'filterByLastValue'
  ]
  
  sampleAggregators = [
    'max', 'mean', 'min', 'first', 'last', 'sum', 'join', 'median', 'count', 'and', 'or', 'percentile',
  ]

  groupByAggregators = [
    'max', 'mean', 'min', 'sum', 'join', 'median', 'count', 'and', 'or', 'percentile',
  ]

  windowAggregators = [
    'max', 'mean', 'min', 'first', 'last', 'sum', 'join', 'delta', 'stddev', 'stdvar', 'median', 'count', 'and', 'or', 'percentile',
  ]

  sortsAggregators = [
    'max', 'mean', 'min', 'first', 'last', 'sum', 'median', 'count', 'and', 'or', 'percentile',
  ]

  sampleByFillPolicy = [
    'interpolate', 'next', 'previous', 'none', 'fill',
  ]

  comparators = [
    '~', '!=', '!~'
  ]
  
  filterByNameComparators = [
    '~'
  ]
  
  filterByLastValuesComparators = [
    '<=', "<", "!=", ">=", ">"
  ]

  filters = [
    { name: 'byclass',  type: 'S' },
    { name: 'bylabels', type: 'M' },
    { name: 'last.eq',  type: 'N' },
    { name: 'last.ne',  type: 'N' },
    { name: 'last.gt',  type: 'N' },
    { name: 'last.ge',  type: 'N' },
    { name: 'last.lt',  type: 'N' },
    { name: 'last.le',  type: 'N' }
  ]

  constructor() {}

  addLabel(key: string, comparator: string, val: string) {
    this.labels.push(new Labels(key, comparator, val))
  }

  delLabel(index: number) {
    if (index != -1)
      this.labels.splice(index, 1)
  }

  addGroupByLabel(key: string) {
    this.groupByLabels.push(key)
  }

  delGroupByLabel(key: string) {
    let i = this.groupByLabels.indexOf(key)
    if (i != -1)
      this.groupByLabels.splice(i, 1)
  }

  private static formatStringVar(s: string): string {
    return s.startsWith('$') ? s : `'${ s }'`
  }

  get tslScript(): string {
    const f = TslQuery.formatStringVar

    let q = ''

    if (this.className == '') {
      return q
    }
    
    q = `select(${ f(this.className) })`
    

    let labelsSize = Object.keys(this.labels).length

    if (labelsSize == 1) {
      q += `.where(${ this.loadTSLLabels() })`

    } else if (labelsSize > 1) {
      q += `.where([${ this.loadTSLLabels() }])`
    }

    if (this.sampleAggregator) {

      let aggregator = this.sampleAggregator

      // Manage particuliar operator as percentile and join expect a parameter
      if (aggregator == "percentile") {
        aggregator += ", " + this.sampleByPercentile
      } else if (aggregator == "join") {
        aggregator += ", '" + this.sampleByJoin  + "'"
      }

      if (this.sampleFill) {
        if (this.sampleFill === "fill") {
          let fillValue = '0' 

          if (this.sampleFillValue) {
            fillValue = this.sampleFillValue
          }
          aggregator += ", " + this.sampleFill + "(" + fillValue + ")"
        } else {
          aggregator += ", '" + this.sampleFill + "'"
        }
      }

      if (!this.sampleByRelative) {
        aggregator += ", false"
      }

      q+= `.sampleBy(${this.span}, ${aggregator})`
    }

    if (this.groupByAggregator) {

      let aggregator = this.groupByAggregator

      // Manage particuliar operator as percentile and join expect a parameter
      if (aggregator === "percentile") {
        aggregator += ", " + this.groupByPercentile
      } else if (aggregator === "join") {
        aggregator += ", '" + this.groupByJoin + "'"
      }

      let group = "groupBy"

      if (this.groupByWithout) {
        group = "groupWithout"
      }
      
      let groupByLabelsSize = this.groupByLabels.length
      if (groupByLabelsSize == 0) {
        q+= `.group(${aggregator})`
      } else if (groupByLabelsSize == 1) {
        q+= `.${group}('${this.groupByLabels[0]}', ${aggregator})`
      } else {
        let labelsStr = ''
        let prefix = ''
        for(let label in this.groupByLabels) {
          labelsStr += `${prefix}'${ this.groupByLabels[label] }'`
          prefix = ", "
        }
        q+= `.${group}([${labelsStr}], ${aggregator})`
      }
    }

    for(let index in this.queryOperators) {
      q+= '.' + this.queryOperators[index]
    }

    return q
  }

  loadTSLLabels(): string {

    let labelsStr = ''
    let prefix = ''

    this.labels.forEach( (label) => {

      let comparator = label.comparator
      if (!label.comparator) {
        comparator = '='
      }
      labelsStr += `${prefix}'${label.key}${comparator}${label.value}'`
      prefix = ", "
    })
    return labelsStr
  }

  addOperator(operator: string, extraParams: string[]) {
    let operatorString = operator
    operatorString += "("

    let prefix = ""

    for(let param in extraParams) {
      operatorString += `${prefix}${ extraParams[param] }`
      prefix = ", "
    }

    operatorString += ")"
    this.queryOperators.push(operatorString)
  }

  delOperator(index: number) {
    if (index != -1)
      this.queryOperators.splice(index, 1)
  }

  mvOperatorDown(index: number) {
    if (this.queryOperators.length - 1 >= index + 1) {
      let operator = this.queryOperators[index]
      this.queryOperators[index] = this.queryOperators[index+1]
      this.queryOperators[index+1] = operator
    }
  }

  mvOperatorUp(index: number) {
    if (index - 1 >= 0) {
      let operator = this.queryOperators[index]
      this.queryOperators[index] = this.queryOperators[index-1]
      this.queryOperators[index-1] = operator
    }
  }
}