import Datasource from './datasource';
import {
  createChangeHandler,
  createResetHandler,
  PasswordFieldEnum
} from './passwordHandlers';

export default class TslConfigCtrl {

  static templateUrl = 'template/config.html'
  current: Datasource

  // Dom needs
  newExtraKey: any
  newExtraVal: any

  onPasswordReset: ReturnType<typeof createResetHandler>;
  onPasswordChange: ReturnType<typeof createChangeHandler>;

  constructor(private backendSrv: any, private $routeParams: any) {
    console.debug('[TSL] ConfigController', this)
    this.onPasswordReset = createResetHandler(this, PasswordFieldEnum.Password);
    this.onPasswordChange = createChangeHandler(this, PasswordFieldEnum.Password);
    if (this.current.id) {
      this._loadDatasourceConfig()
    }
    if (!this.current.jsonData.var) {
      this.current.jsonData.var = {}
    }
    if (!this.current.secureJsonFields) {
      this.current.secureJsonFields = {}
    } if (!this.current.secureJsonData) {
      this.current.secureJsonData = {}
    }
    if (this.current.jsonData[PasswordFieldEnum.Password] != undefined) {
      this.current.secureJsonFields[PasswordFieldEnum.Password] = true
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
