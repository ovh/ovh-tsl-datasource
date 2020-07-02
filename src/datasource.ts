export default class TslDatasource {
  id: number = null
  orgId: number = null
  isDefault = false
  name = ''
  type = 'grafana-tsl-datasource'
  access = 'direct'

  basicAuth: any;

  url = ''
  typeLogoUrl = ''

  database = ''
  jsonData: any = { var: {}, useBackend: false }

  secureJsonData: any = {}

  secureJsonFields = {}

}