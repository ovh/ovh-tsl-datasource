///<reference path="../node_modules/grafana-sdk-mocks/app/headers/common.d.ts" />

import { loadPluginCss } from 'app/plugins/sdk'
import AnnotationsQueryCtrl from './tsl-annotation.controller'
import ConfigCtrl from './tsl-config.controller'
import Datasource from './tsl-datasource'
import QueryCtrl from './tsl-query.controller'


function getCSSPath(sheet) {
  return `plugins/grafana-tsl-datasource/style/${sheet}.css`
}
loadPluginCss({
  dark: getCSSPath('dark'),
  light: getCSSPath('light')
})

export { Datasource, QueryCtrl, ConfigCtrl, AnnotationsQueryCtrl }
