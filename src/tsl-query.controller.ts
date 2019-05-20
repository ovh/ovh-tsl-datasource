///<reference path="../node_modules/grafana-sdk-mocks/app/headers/common.d.ts" />

import { QueryCtrl }   from 'app/plugins/sdk'
import Query from './query'
import initTslAceMode from './ace-mode-tsl'
import SeriesLabels from './seriesLabels';

initTslAceMode()

export default class TslQueryCtrl extends QueryCtrl {

  static templateUrl = 'template/query.html'
  target: {
    friendlyQuery: Query,
    hide: boolean,
    expr: string
  }
  changeTicker: any
  staticQuery: Query

  extraLabelKey: string
  extraLabelValue: string
  extraComparator: string
  extraGroupByLabel: string
  extraFilterLabel: string
  extraFilterParamMapKey: string
  extraFilterParamMapValue: string
  extraOperatorKind: string
  extraArithmeticParam: number
  extraArithmeticOperator: string
  extraEqualityParam: number
  extraEqualityOperator: string
  extraLimitParam: number
  extraLimitOperator: string
  extraTimeParamDuration: string
  extraTimeParamNumber: number
  extraTimeParamEnd: string
  extraTimeOperator: string
  extraWindowOperator: string
  extraWindowAggregator: string
  extraWindowPre: string
  extraWindowPost: string
  extraWindowParamPercentile: number
  extraWindowParamJoin: string
  extraTransformOperator: string
  extraTransformQuantizeLabel: string
  extraTransformQuantizeStep: string
  extraTransformQuantizeChunk: string
  extraTransformParam: string
  extraSortsOperator: string
  extraSortsParamNumber: number
  extraSortsParamAggregator: string
  extraSortsParamPercentile: number
  extraMetaParam: string
  extraMetaParamRegexpValue: string
  extraMetaParamNewValue: string
  extraMetaParamRemoveLabels: string[] = []
  extraMetaOperator: string
  extraMetaParamComparator: string
  extraRemoveLabelsLabel: string
  extraMetalabels: SeriesLabels[] = []
  extraMetaLabelKey: string
  extraMetaLabelComparator: string
  extraMetaLabelValue: string

  readOnly: boolean

  constructor(public $scope: any, private uiSegmentSrv: any, $injector: any) {
    super($scope, $injector)
    this.target.friendlyQuery = Object.assign(new Query(), this.target.friendlyQuery)
    // acces to static members from dom
    this.staticQuery = new Query()

    // prevent wrapped ace-editor to crash
    if (!this.target.expr) this.target.expr = ''

    if (!this.target.expr && this.target.friendlyQuery) {
      this.target.expr = this.target.friendlyQuery.tslScript
    }
  }

  _addLabel() {
    if (!this.extraLabelKey || !this.extraLabelValue) return
    this.target.friendlyQuery.addLabel(this.extraLabelKey, this.extraComparator, this.extraLabelValue)
    this.extraLabelKey = ''
    this.extraLabelValue = ''
    this.extraComparator = ''
  }

  _delLabel(index) {
    this.target.friendlyQuery.delLabel(index)
  }

  _addGroupByLabel() {
    if (!this.extraGroupByLabel) return
    this.target.friendlyQuery.addGroupByLabel(this.extraGroupByLabel)
    this.extraGroupByLabel = ''
  }

  _delGroupByLabel(label) {
    this.target.friendlyQuery.delGroupByLabel(label)
  }

  _buildQuery() {
    this._addLabel()
    this._addGroupByLabel()
  }

  getCompleter(...o) {
    console.debug('[TslQuery] COMPLETER called', o)
  }

  toggleEditorMode() {
    console.debug('Toggle readonly', this.readOnly)
    this.readOnly = !this.readOnly
  }

  onChangeInternal = () => {
    this.refresh()
  }

  _addArithmeticOperator() {

    if (!this.extraArithmeticOperator) return

    let operator = this.extraArithmeticOperator
    if (["mul", "add", "sub", "div", "logN"].indexOf(operator) > -1 ) {
      if (!this.extraArithmeticParam) return
      this.target.friendlyQuery.addOperator(operator, [ this.extraArithmeticParam.toString() ])
    } else {
      this.target.friendlyQuery.addOperator(operator, [])
    }

    this.extraArithmeticOperator = ''
    this.extraArithmeticParam = null
  }

  _addEqualityOperator() {

    if (!this.extraEqualityOperator || !this.extraEqualityParam) return
    
    this.target.friendlyQuery.addOperator(this.extraEqualityOperator, [ this.extraEqualityParam.toString() ])

    this.extraEqualityOperator = ''
    this.extraEqualityParam = null
  }

  _addLimitOperator() {

    if (!this.extraLimitOperator || !this.extraLimitParam) return
    
    this.target.friendlyQuery.addOperator(this.extraLimitOperator, [ this.extraLimitParam.toString() ])

    this.extraLimitOperator = ''
    this.extraLimitParam = null
  }

  _addTimeOperator() {

    if (!this.extraTimeOperator) return

    let operator = this.extraTimeOperator
    if (["shift"].indexOf(operator) > -1 ) {
      if (!this.extraTimeParamDuration) return
      this.target.friendlyQuery.addOperator(operator, [ this.extraTimeParamDuration ])
    } else if (["keepLastValues", "keepFirstValues", "shrink", "timescale"].indexOf(operator) > -1 ) {
      if (!this.extraTimeParamNumber) return
      this.target.friendlyQuery.addOperator(operator, [ this.extraTimeParamNumber.toString() ])
    } else if (["timemodulo"].indexOf(operator) > -1 ) {
      if (!this.extraTimeParamDuration || !this.extraTimeParamNumber) return
      this.target.friendlyQuery.addOperator(operator, [ this.extraTimeParamNumber.toString(), "'" + this.extraTimeParamDuration + "'" ])
    } else if (["timeclip"].indexOf(operator) > -1 ) {
      if (!this.extraTimeParamEnd || !this.extraTimeParamDuration) return
      this.target.friendlyQuery.addOperator(operator, [ this.extraTimeParamEnd, this.extraTimeParamDuration ])
    } else if (["timesplit"].indexOf(operator) > -1 ) {
      if (!this.extraTimeParamDuration || !this.extraTimeParamNumber) return
      this.target.friendlyQuery.addOperator(operator, [ this.extraTimeParamEnd, this.extraTimeParamNumber.toString(), "'" + this.extraTimeParamDuration + "'" ])
    } else {
      this.target.friendlyQuery.addOperator(operator, [])
    }

    

    this.extraTimeOperator = ''
    this.extraTimeParamNumber = null
    this.extraTimeParamDuration = ''
    this.extraTimeParamEnd = ''
  }

  _addWindowOperator() {

    if (!this.extraWindowOperator || !this.extraWindowAggregator) return

    let operator = this.extraWindowOperator

    let params = [ this.extraWindowAggregator ]
    if (["window"].indexOf(operator) > -1 ) {
      if (this.extraWindowAggregator === "percentile") {
        if (!this.extraWindowParamPercentile) return
        params.push(this.extraWindowParamPercentile.toString())
      } else if (this.extraWindowAggregator === "join") {
        if (!this.extraWindowParamJoin) return
        params.push("'" + this.extraWindowParamJoin + "'")
      }

      if (this.extraWindowPre) {
        params.push(this.extraWindowPre)
      } else if (this.extraWindowPost) {
        params.push("0")
      }

      if (this.extraWindowPost) {
         params.push(this.extraWindowPost)
      }
    }
    this.target.friendlyQuery.addOperator(operator, params)

    this.extraWindowOperator = ''
    this.extraWindowAggregator = ''
    this.extraWindowPre = ''
    this.extraWindowPost = ''
    this.extraWindowParamJoin = ''
    this.extraWindowParamPercentile = null
  }

  _addTransformOperator() {

    if (!this.extraTransformOperator) return

    if (this.extraTransformOperator === "quantize" ) {
      if (!this.extraTransformQuantizeLabel || !this.extraTransformQuantizeStep) return

      let params = [ "'" + this.extraTransformQuantizeLabel + "'", this.extraTransformQuantizeStep]
      if (this.extraTransformQuantizeChunk) {
        params.push(this.extraTransformQuantizeChunk)
      }
      this.target.friendlyQuery.addOperator(this.extraTransformOperator, params)
    } else if ((this.extraTransformParam) && (this.extraTransformOperator === "rate")) {
      this.target.friendlyQuery.addOperator(this.extraTransformOperator, [ this.extraTransformParam.toString() ])
    } else {
      this.target.friendlyQuery.addOperator(this.extraTransformOperator, [])
    }

    this.extraTransformOperator = ''
    this.extraTransformParam = null
  }

  _addSortsOperator() {

    if (!this.extraSortsOperator) return
    
    let operator = this.extraSortsOperator

    let params = []
    if (["topN", "bottomN", "topNBy", "bottomNBy"].indexOf(operator) > -1 ) {
      if (!this.extraSortsParamNumber) return
      params.push(this.extraSortsParamNumber)
    }

    if (["sortBy", "sortDescBy", "topNBy", "bottomNBy"].indexOf(operator) > -1 ) {
      if (!this.extraSortsParamAggregator) return
      params.push(this.extraSortsParamAggregator)

      if (this.extraSortsParamAggregator === "percentile") {
        if (!this.extraSortsParamPercentile) return
        params.push(this.extraSortsParamPercentile)
      }
    }

    this.target.friendlyQuery.addOperator(operator, params)

    this.extraSortsOperator = ''
    this.extraSortsParamAggregator = ''
    this.extraSortsParamNumber = null
    this.extraSortsParamPercentile = null
  }

  _addMetaOperator() {
    if (!this.extraMetaOperator) return
    
    if (this.extraMetaOperator != "removeLabels") {
      if (!this.extraMetaParam) return
    }

    let extraParam = this.extraMetaParam

    if (this.extraMetaOperator === "filterByName") {

      if (this.extraMetaParamComparator) {
        extraParam = this.extraMetaParamComparator + extraParam
      }
    } else if (this.extraMetaOperator === "filterByLastValue") {

      if (this.extraMetaParamComparator) {
        extraParam = this.extraMetaParamComparator + extraParam
      } else {
        extraParam = "=" + extraParam
      }
    }
    let params = []
    params.push("'" + extraParam + "'")

    if (this.extraMetaOperator === "removeLabels") {

      if (!this.extraMetaParamRemoveLabels) return
      
      if (this.extraMetaParamRemoveLabels.length < 1) return

      params = []
      for(let index in this.extraMetaParamRemoveLabels) { 
        params.push("'" +this.extraMetaParamRemoveLabels[index]+ "'")
      }

    } else if (this.extraMetaOperator === "renameLabelKey") {
      if (!this.extraMetaParamNewValue) return
      params.push("'" + this.extraMetaParamNewValue + "'")
    } else if (this.extraMetaOperator === "renameLabelValue") {
      if (this.extraMetaParamRegexpValue) {
        params.push("'" + this.extraMetaParamRegexpValue + "'")
      }

      if (!this.extraMetaParamNewValue) return
      params.push("'" + this.extraMetaParamNewValue + "'")
    }

    this.target.friendlyQuery.addOperator(this.extraMetaOperator, params)

    this.extraMetaOperator = ''
    this.extraMetaParam = ''
    this.extraMetaParamNewValue = ''
    this.extraMetaParamRegexpValue = ''
    this.extraMetaParamRemoveLabels = []
    this.extraMetalabels = []
    this.extraMetaParamComparator = ''
  }

  _addFilterByLabelsOperator() {
    if (!this.extraMetalabels) return
    if (this.extraMetalabels.length === 0) return

    
    let params = []

    for(let index in this.extraMetalabels) { 

      let labelStr = ''
      let comparator = this.extraMetalabels[index].comparator
      if (!comparator) {
        comparator = '='
      }
      labelStr = `'${this.extraMetalabels[index].key}${comparator}${this.extraMetalabels[index].value}'`
      params.push(labelStr)
    }

    this.target.friendlyQuery.addOperator(this.extraMetaOperator, params)

    this.extraMetaOperator = ''
    this.extraMetaParam = ''
    this.extraMetaParamNewValue = ''
    this.extraMetaParamRegexpValue = ''
    this.extraMetaParamRemoveLabels = []
    this.extraMetalabels = []
    this.extraMetaParamComparator = ''
  }

  _addRemoveLabelsLabel() {
    if (!this.extraRemoveLabelsLabel) return

    if (!this.extraMetaParamRemoveLabels) {
      this.extraMetaParamRemoveLabels = []
    }

    this.extraMetaParamRemoveLabels.push(this.extraRemoveLabelsLabel)

    this.extraRemoveLabelsLabel = ''
  }

  _delRemoveLabelsLabel(label) {
    let i = this.extraMetaParamRemoveLabels.indexOf(label)
    if (i != -1)
      this.extraMetaParamRemoveLabels.splice(i, 1)
  }

  _delOperator(index) {
    this.target.friendlyQuery.delOperator(index)
  }

  _mvOperatorDown(index) {
    this.target.friendlyQuery.mvOperatorDown(index)
  }
  
  _mvOperatorUp(index) {
    this.target.friendlyQuery.mvOperatorUp(index)
  }

  _addMetaLabel() {
    let label = new SeriesLabels(this.extraMetaLabelKey, this.extraMetaLabelComparator, this.extraMetaLabelValue)
    this.extraMetalabels.push(label)

    this.extraMetaLabelKey = ''
    this.extraMetaLabelValue = ''
    this.extraMetaLabelComparator = ''
  }

  _delMetaLabel(index: number) {
    if (index != -1)
      this.extraMetalabels.splice(index, 1)
  }
}
