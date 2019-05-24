import Datasource from './datasource'

export default class TslConfigCtrl {

  static templateUrl = 'template/config.html'
  current: Datasource

  // Dom needs
  newExtraKey: any
  newExtraVal: any

  constructor(private backendSrv: any, private $routeParams: any) {
    this.current = new Datasource()
    this.current.id = this.$routeParams.id
    if (this.current.id)
      this._loadDatasourceConfig()
    
    if (!this.current.jsonData.var) {
      this.current.jsonData.var = {}
    } 
  }

  _loadDatasourceConfig() {
    this.backendSrv.get('/api/datasources/' + this.current.id)
    .then((ds: any) => {
      Object.assign(this.current, ds)
    })
  }

  _addExtraVar() {
    if (!this.current.jsonData.var) {
      this.current.jsonData.var = {}
    }
    if (this.newExtraKey && this.newExtraVal) {
      this.current.jsonData.var[this.newExtraKey] = this.newExtraVal
      this.newExtraKey = ''
      this.newExtraVal = ''
    }
  }

  _delExtraVar(key) {
    delete this.current.jsonData.var[key]
  }

  _editKey(key) {
    this.newExtraKey = key
    this.newExtraVal = this.current.jsonData.var[key]
  }
}
