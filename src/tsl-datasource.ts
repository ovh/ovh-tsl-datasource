import QueryOptions from './interfaces/query-options'
import AnnotationOptions from './interfaces/annotation-options'
import GTS from './gts'
import { Table } from './table'
import { isGeoJson } from './geo'
import Query from './query'
import { String } from 'es6-shim';

export default class TslDatasource {

  constructor(private instanceSettings: any,
    private $q: any,
    private backendSrv: any,
    private templateSrv: any,
    private $log: any) {}

  /**
   * used by panels to get data
   * @param options
   * @return {Promise<any>} Grafana datapoints set
   */
  query(opts: QueryOptions): Promise<any> {
    let queries = []

    let wsHeader = this.computeTimeVars(opts) + this.computeGrafanaContext() + this.computePanelRepeatVars(opts)
    opts.targets.forEach(queryRef => {
      let query = Object.assign({}, queryRef) // Deep copy
      if (!query.hide) {
        if (query.friendlyQuery)
          query.friendlyQuery = Object.assign(new Query(), query.friendlyQuery)
        // Grafana can send empty Object at the first time, we need to check if there is something
        if (query.expr || query.friendlyQuery) {
          if (query.advancedMode === undefined)
            query.advancedMode = false
          
          query.ws = `${wsHeader}\n${query.advancedMode ? query.expr : query.friendlyQuery.tslScript}`

          console.warn(query.ws)
          query.from = opts.range.from.toISOString()
          query.to = opts.range.to.toISOString()

          
          queries.push(query)
          console.debug('New Query: ', (query.advancedMode) ? query.expr : query.friendlyQuery) 
        }
      }
    })

    if (queries.length === 0) {
      let d = this.$q.defer();
      d.resolve({ data: [] });
      return d.promise;
    }

    queries = queries.map(this.executeExec.bind(this))

    return this.$q.all(queries)
      .then((responses) => {
        // Grafana formated GTS
        let data = []
        responses.forEach((res, i) => {
          if (res.data.type === 'error') {
            console.error(res.data.value)
            return
          }

          // is it for a Table graph ?
          if (res.data.length === 1 && res.data[0] && Table.isTable(res.data[0])) {
            const t = res.data[0]
            t.type = 'table'
            data.push(t)
            return
          }

          // World-map panel data type
          if (res.data.length === 1 && res.data[0] && isGeoJson(res.data[0])) {
            const t = res.data[0]
            t.type = 'table'
            data = t
            return
          }

          GTS.stackFilter(res.data).forEach(gts => {
            let grafanaGts = {
              target: (opts.targets[i].hideLabels) ? gts.c : gts.nameWithLabels,
              datapoints: []
            }
            // show attributes
            if (opts.targets[i].hideAttributes !== undefined && !opts.targets[i].hideAttributes) {
              grafanaGts.target += gts.formatedAttributes
            }

            gts.v.forEach(dp => {
              grafanaGts.datapoints.push([dp[dp.length - 1], dp[0] / 1000])
            })
            data.push(grafanaGts)
          })
        })
        return { data }
      })
      .catch((err) => {
        console.warn('[TSL] Failed to execute query', err)
        let d = this.$q.defer();
        d.resolve({ data: [] });
        return d.promise;
      })
  }

  /**
   * used by datasource configuration page to make sure the connection is working
   * @return {Promise<any>} response
   */
  testDatasource(): Promise<any> {
    return this.executeExec({ ws: 'create(series("test"))' })
      .then(res => {
        if (res.data.length !== 1) {
          return {
            status: 'error',
            message: JSON.parse(res.data) || res.data,
            title: 'Failed to execute basic tsl'
          }
        } else {
          return {
            status: 'success',
            message: 'Datasource is working',
            title: 'Success'
          }
        }
      })
      .catch((res) => {
        console.log('Error', res)
        return {
          status: 'error',
          message: `Status code: ${res.status}`,
          title: 'Failed to contact tsl platform'
        }
      })
  }

  /**
   * used by dashboards to get annotations
   * @param options
   * @return {Promise<any>} results
   */
  annotationQuery(opts: AnnotationOptions): Promise<any>{
    let ws = this.computeTimeVars(opts) + this.computeGrafanaContext() + opts.annotation.query

    return this.executeExec({ ws })
      .then((res) => {
        const annotations = []
        /*if (!) {
          console.error(`An annotation query must return exactly 1 GTS on top of the stack, annotation: ${ opts.annotation.name }`)
          var d = this.$q.defer()
          d.resolve([])
          return d.promise
        }*/

        for (let gts of GTS.stackFilter(res.data)) {
          let tags = []

          for (let label in gts.l) {
            tags.push(`${label}:${gts.l[label]}`)
          }

          gts.v.forEach(dp => {
            annotations.push({
              annotation: {
                name: opts.annotation.name,
                enabled: true,
                datasource: this.instanceSettings.name,
              },
              title: gts.c,
              time: Math.trunc(dp[0] / (1000)),
              text: dp[dp.length - 1],
              tags: (tags.length > 0) ? tags.join(',') : null
            })
          })
        }
        return annotations
      })
  }store

  /**
   * used by query editor to get metric suggestions and templating.
   * @param options
   * @return {Promise<any>}
   */
  metricFindQuery(ws: string): Promise<any> {
    return this.executeExec({ ws: this.computeGrafanaContext() + ws })
      .then((res) => {
        // only one object on the stack, good user
        if (res.data.length === 1 && typeof res.data[0] === 'object') {
          let entries = []
          res.data[0].forEach(key => {
            entries.push({
              text: key,
              value: res.data[0][key]
            })
          })
          return entries
        }
        // some elements on the stack, return all of them as entry
        return res.data.map((entry, i) => {
          return {
            text: entry.toString() || i,
            value: entry
          }
        })
      })
  }

  /**
   * Execute tsl
   * @param ws tsl string
   * @return {Promise<any>} Response
   */
  private executeExec(query: any): Promise<any> {

    let endpoint = this.instanceSettings.url
    if ((query.backend !== undefined) && (query.backend.length > 0)) {
      endpoint = query.backend;
    }

    if (endpoint.charAt(endpoint.length - 1) === '/') {
      endpoint = endpoint.substr(0, endpoint.length - 1);
    }

    let tslQueryRange = ''
    if ((query.from !== undefined) && (query.to  !== undefined)) {
      tslQueryRange = query.from + "," + query.to;
    }

    var auth = undefined
    if (this.instanceSettings.basicAuth !== undefined) {
      auth = this.instanceSettings.basicAuth;
    }

    return this.backendSrv.datasourceRequest({
      method: 'POST',
      url: endpoint + '/v0/query',
      data: query.ws,
      headers: {
        'Accept': undefined,
        'Content-Type': undefined,
        'TSL-Query-Range': tslQueryRange,
        Authorization: auth,
      }
    })
  }

  /**
   * Compute Datasource variables and templating variables, store it on top of the stack
   * @return {string} TSL header
   */
  private computeGrafanaContext(): string {
    let wsHeader = ''
    // Datasource vars
    for (let myVar in this.instanceSettings.jsonData) {
      let value = this.instanceSettings.jsonData[myVar]
      if (typeof value === 'string')
        value = value.replace(/'/g, '"')
      if (typeof value === 'string' && !value.startsWith('<%') && !value.endsWith('%>'))
        value = `'${value}'`
        wsHeader += ` ${myVar}=${value || 'NULL'} `
    }
    // Dashboad templating vars
    for (let myVar of this.templateSrv.variables) {
      let value = myVar.current.text

      if (myVar.current.value === '$__all' && myVar.allValue !== null)
        value = myVar.allValue

      if (isNaN(value) || value.startsWith('0'))
        value = `'${value}'`
        wsHeader += ` ${myVar.name}=${value || 'NULL'} `
    }
    return wsHeader
  }

  private computeTimeVars(opts): string {
    let vars: any = {
      startTick: opts.range.from.toDate().getTime() * 1000,
      startISO: opts.range.from.toISOString(),
      endTick: opts.range.to.toDate().getTime() * 1000,
      endISO: opts.range.to.toISOString(),
    }
    vars.interval = vars.endTick - vars.startTick
    vars.__interval = Math.floor(vars.interval / (opts.maxDataPoints || 1))
    vars.__interval_ms = Math.floor(vars.__interval / 1000)

    let str = ''
    for (let gVar in vars) {
      str += ` ${gVar}=${isNaN(vars[gVar]) ? `'${vars[gVar]}'` : vars[gVar]} `
    }

    return str
  }

  private computePanelRepeatVars(opts): string {
    let str = ''
    if (opts.scopedVars) {
      for (let k in opts.scopedVars) {
        let v = opts.scopedVars[k]
        if (v.selected) {
          str += ` ${k}='${v.value}' `
        }
      }
    }
    return str
  }
}
