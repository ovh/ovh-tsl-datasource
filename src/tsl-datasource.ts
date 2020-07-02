import { isGeoJson } from './geo'
import GTS from './gts'
import AnnotationOptions from './interfaces/annotation-options'
import QueryOptions from './interfaces/query-options'
import Query from './query'
import { Table } from './table'

/** @ngInject */
export default class TslDatasource {
  basicAuth: any;

  constructor(private instanceSettings: any,
    private $q: any,
    private backendSrv: any,
    private templateSrv: any,
    private $log: any) {
    this.basicAuth = instanceSettings.basicAuth;
  }

  /**
   * used by panels to get data
   * @param options
   * @return {Promise<any>} Grafana datapoints set
   */
  query(opts: QueryOptions): Promise<any> {
    let queries = []

    let wsHeader = this.computeTimeVars(opts) + this.computeGrafanaContext() + this.computePanelRepeatVars(opts)

    let query = Object.assign({}, opts.targets) // Deep copy
    if (!query.hide) {

      query.target = opts.targets
      query.from = opts.range.from.toISOString()
      query.to = opts.range.to.toISOString()

      query.ws = `${wsHeader}\n`

      query.target.forEach(element => {
        if (element.friendlyQuery)
          element.friendlyQuery = Object.assign(new Query(), element.friendlyQuery)

        // Grafana can send empty Object at the first time, we need to check if there is something
        if (element.expr || element.friendlyQuery) {
          element.tslHeader = wsHeader
          if (element.advancedMode === undefined)
            element.advancedMode = false
          if (element.hideLabels === undefined)
            element.hideLabels = false
          if (element.hideAttributes === undefined)
            element.hideAttributes = false
          query.ws = `${query.ws}\n${element.advancedMode ? element.expr : element.friendlyQuery.tslScript}`
        }
      })

      console.debug('New Query: ', query)
      queries.push(query)
    }

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

          if (res.data.results) {
            let keys = Object.keys(res.data.results)
            keys.map(key => {
              if (res.data.results[key].series) {
                res.data.results[key].series.forEach(s => {
                  data.push({ target: s.name + this.nameWithTags(s), datapoints: s.points })
                })
              }
              if (res.data.results[key].tables) {
                res.data.results[key].tables.forEach(s => {
                  data.push({ target: s.name, datapoints: s.points })
                })
              }
            })
            return { data }
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

  nameWithTags(series): string {
    if (!series.tags) {
      return ""
    }
    let tags = series.tags

    let labelsString = ""
    if (tags.l) {
      tags.l = JSON.parse(tags.l)
      let labelsValues = []
      for (let key in tags.l) {
        if (key == ".app") {
          continue
        }
        labelsValues.push(`${key}=${tags.l[key]}`)
      }
      labelsString = `{${labelsValues.join(',')}}`
    }

    let attributeString = ""
    if (tags.a) {
      tags.a = JSON.parse(tags.a)
      let attributesValues = []
      for (let key in tags.a) {
        attributesValues.push(`${key}=${tags.a[key]}`)
      }
      attributeString = `{${attributesValues.join(',')}}`
    }
    return `${labelsString}${attributeString}`
  }

  doRequest(options) {
    return this.backendSrv.datasourceRequest(options);
  }

  performInstantQuery(query, time) {
    const url = '/api/v1/query';
    const data = {
      query: query.expr,
      time: time,
    };
    data['timeout'] = "60s";
    return this.promNativeRequest(url, data, { requestId: query.requestId });
  }

  promNativeRequest(url, data, requestId) {
    let options = {
      requestId: requestId, url: this.instanceSettings.url + url, method: "GET", withCredentials: false, headers: {}
    }

    if (options.method === 'GET') {
      options.url =
        options.url +
        '?'

      let query = []
      for (let k in data) {
        let v = data[k]
        query.push(encodeURIComponent(k) + '=' + encodeURIComponent(v))
      }

      options.url = options.url + query.join('&')
    }

    if (this.instanceSettings.basicAuth || this.instanceSettings.withCredentials) {
      options.withCredentials = true;
    }

    if (this.instanceSettings.basicAuth) {
      options.headers = {
        Authorization: this.instanceSettings.basicAuth,
      };
    }

    return this.backendSrv.datasourceRequest(options);
  }

  prometheusRequest() {
    const now = new Date().getTime();
    return this.performInstantQuery({ expr: '1+1' }, now / 1000).then(response => {
      if (response.data.status === 'success') {
        return { status: 'success', message: 'Data source is working' };
      } else {
        return { status: 'error', message: response.error };
      }
    });
  }

  warp10Request() {
    return this.doRequest({
      url: this.instanceSettings.url + '/api/v0/exec',
      method: 'POST',
      data: "NEWGTS 'test' RENAME"
    }).then(res => {
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
   * used by datasource configuration page to make sure the connection is working
   * @return {Promise<any>} response
   */
  testDatasource(): Promise<any> {
    let useBackend = !!this.instanceSettings.jsonData.useBackend ? this.instanceSettings.jsonData.useBackend : false

    if (useBackend) {
      if (!this.instanceSettings.jsonData.tslBackend) {
        return this.warp10Request()
      } else {
        return this.prometheusRequest()
      }
    } else {
      return this.executeExec({
        ws: 'create(series("test"))'
      })
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
  }

  /*
  */

  /**
   * used by dashboards to get annotations
   * @param options
   * @return {Promise<any>} results
   */
  annotationQuery(opts: AnnotationOptions): Promise<any> {
    let ws = this.computeTimeVars(opts) + this.computeGrafanaContext() + opts.annotation.query

    return this.executeExec({ ws })
      .then((res) => {
        const annotations = []

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
  }

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

    var auth = undefined
    if (this.instanceSettings.basicAuth !== undefined) {
      auth = this.instanceSettings.basicAuth;
    } else if (this.instanceSettings.jsonData.password !== undefined) {
      auth = "Basic " + btoa("m:" + this.instanceSettings.jsonData.password);
    }

    let useBackend = !!this.instanceSettings.jsonData.useBackend ? this.instanceSettings.jsonData.useBackend : false

    if (useBackend) {
      let tslBackend = !!this.instanceSettings.jsonData.tslBackend ? this.instanceSettings.jsonData.tslBackend : "warp10"
      query.target = query.target.map(el => ({
        ...el, tslBackend: tslBackend, datasourceId: this.instanceSettings.id, auth: auth, tsl: !!el.friendlyQuery.tslScript ? el.friendlyQuery.tslScript : el.expr
      }))
      const tsdbRequestData = {
        from: query.from.valueOf().toString(),
        to: query.to.valueOf().toString(),
        queries: query.target,
      };
      return this.backendSrv.datasourceRequest({
        url: '/api/tsdb/query',
        method: 'POST',
        data: tsdbRequestData
      });
    } else {
      let tslQueryRange = ''
      if ((query.from !== undefined) && (query.to !== undefined)) {
        tslQueryRange = query.from + "," + query.to;
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
      });
    }
  }

  /**
   * Compute Datasource variables and templating variables, store it on top of the stack
   * @return {string} TSL header
   */
  private computeGrafanaContext(): string {
    let wsHeader = ''
    // Datasource vars
    for (let myVar in this.instanceSettings.jsonData.var) {
      let value = this.instanceSettings.jsonData.var[myVar]
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
