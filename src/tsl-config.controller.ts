import Datasource from './datasource'

export default class TslConfigCtrl {

  static templateUrl = 'template/config.html'
  current: Datasource

  // Dom needs
  newExtraKey: any
  newExtraVal: any

  constructor(private backendSrv: any, private $routeParams: any) {
    console.debug('[Tsl] ConfigController', this)

    if (!this.current.secureJsonData) {
      this.current.secureJsonData = {}
    }
    if (!this.current.secureJsonFields) {
      this.current.secureJsonFields = {}
    }
  }

  _addExtraVar() {
    if (this.newExtraKey && this.newExtraVal) {
      this.current.jsonData[this.newExtraKey] = this.newExtraVal
      this.newExtraKey = ''
      this.newExtraVal = ''
    }
  }

  _delExtraVar(key) {
    delete this.current.jsonData[key]
  }

  _editKey(key) {
    this.newExtraKey = key
    this.newExtraVal = this.current.jsonData[key]
  }
}
