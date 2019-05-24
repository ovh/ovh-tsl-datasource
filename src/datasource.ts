export default class TslDatasource {
  basicAuth: boolean = false
  withCredentials: boolean = false
  id: number = null
  orgId: number = null
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

  secureJsonFields = {}
}