export default class TslDatasource {
  basicAuth: string = ''
  withCredentials: boolean = false
  id: number = null
  orgId: number = null
  isDefault = false
  name = ''
  type = 'grafana-tsl-datasource'
  access = 'direct'

  user = ''
  password = ''

  url = 'https://tsl.domain.tld'
  typeLogoUrl = ''

  //basicAuth = true
  //basicAuthUser = ''
  //basicAuthPassword = ''

  database = ''
  jsonData: any = {}

  secureJsonFields = {}
}