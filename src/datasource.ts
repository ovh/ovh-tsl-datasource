export default class TslDatasource {
  id: number = null
  orgId: number = null
  basicAuth: boolean = false
  withCredentials: boolean = false

  isDefault = false
  name = ''
  type = 'grafana-tsl-datasource'
  access = 'direct'

  user = ''
  password = ''

  url = ''
  typeLogoUrl = ''

  //basicAuth = true
  //basicAuthUser = ''
  //basicAuthPassword = ''

  database = ''
  jsonData: any = { var: {}, useBackend: false}
  secureJsonData: any = {}

  secureJsonFields = {}
}
