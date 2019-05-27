package main

import (
	"bytes"
	"context"
	"encoding/base64"
	"encoding/json"
	"net/http"
	"net/url"
	"strconv"
	"strings"

	"github.com/grafana/grafana-plugin-model/go/datasource"
	"github.com/grafana/grafana/pkg/components/simplejson"
	hclog "github.com/hashicorp/go-hclog"
	plugin "github.com/hashicorp/go-plugin"
	"github.com/ovh/tsl/proxy"
	"github.com/pkg/errors"
)

// TslDatasource is the grafana backend plugin implementation for TSL
type TslDatasource struct {
	plugin.NetRPCUnsupportedPlugin
	logger hclog.Logger
}

// Query function called by Grafana when executing a query
func (tsl *TslDatasource) Query(ctx context.Context, tsdbReq *datasource.DatasourceRequest) (*datasource.DatasourceResponse, error) {
	tsl.logger.Debug("Query", "datasource", tsdbReq.Datasource.Name, "TimeRange", tsdbReq.TimeRange)

	queryType, err := GetQueryType(tsdbReq)
	if err != nil {
		return nil, err
	}

	tsl.logger.Debug("createRequest", "queryType", queryType)

	return tsl.MetricQuery(ctx, tsdbReq)
}

// MetricQuery corresponds to graph query for TSL
func (tsl *TslDatasource) MetricQuery(ctx context.Context, tsdbReq *datasource.DatasourceRequest) (*datasource.DatasourceResponse, error) {
	jsonQueries, err := parseJSONQueries(tsdbReq)

	if err != nil {
		resultSet := make([]*datasource.QueryResult, 1)
		resultSet[0] = tsl.GetErrorMessage(err, "")
		return nil, nil
	}
	params := map[string]string{"TSL-Query-Range": tsdbReq.TimeRange.FromRaw + "," + tsdbReq.TimeRange.ToRaw, "TSL-Line-Start": "1"}

	resultSet := make([]*datasource.QueryResult, len(jsonQueries))

	for index, item := range jsonQueries {

		hide, err := item.Get("hide").Bool()
		if err != nil {
			hide = false
		}

		hideAttributes, err := item.Get("hideAttributes").Bool()
		if err != nil {
			hideAttributes = false
		}

		hideLabels, err := item.Get("hideLabels").Bool()
		if err != nil {
			hideAttributes = false
		}

		refID, err := item.Get("refId").String()
		if err != nil {
			resultSet := make([]*datasource.QueryResult, 1)
			resultSet[0] = tsl.GetErrorMessage(errors.New("Couldn't parse a Grafana RefId"), "")
			continue
		}

		if hide {
			resultSet[index] = &datasource.QueryResult{RefId: refID}
			continue
		}

		tslHeader, err := item.Get("tslHeader").String()
		if err != nil {
			resultSet[index] = tsl.GetErrorMessage(errors.New("Couldn't parse Grafana Request Headers setting Data-source and Grafana variables"), refID)
			continue
		}

		script, err := item.Get("tsl").String()
		if err != nil {
			resultSet[index] = tsl.GetErrorMessage(errors.New("Couldn't parse TSL script"), refID)
			continue
		}

		tslString := tslHeader + "\n" + script

		basicAuth, err := item.Get("auth").String()
		token := ""
		if err == nil {
			token = tsl.GetTokenFromAuth(basicAuth)
		}

		backendType, err := item.Get("tslBackend").String()
		if err != nil {
			resultSet[index] = tsl.GetErrorMessage(errors.New("Couldn't parse Grafana TSL backend type"), refID)
			continue
		}

		queryScript, err := proxy.GenerateNativeQueriesWithParams(backendType, tslString, token, true, params)

		if err != nil {
			resultSet[index] = tsl.GetErrorMessage(err, refID)
			continue
		}

		switch backendType {
		case "warp10":
			resultSet[index] = tsl.GetWarp10Result(tsdbReq.Datasource.Url, queryScript, refID, hide, hideAttributes, hideLabels)
			break
		case "prometheus":
			resultSet[index] = tsl.GetPromResult(tsdbReq.Datasource.Url, queryScript, refID, basicAuth, hide, hideAttributes, hideLabels)
			break
		default:
			resultSet[index] = tsl.GetErrorMessage(errors.New("Couldn't find Grafana TSL backend type"), refID)
		}

	}
	result := &datasource.DatasourceResponse{Results: resultSet}

	return result, nil
}

// GetPromResult execute TSL native Queries on a Prometheus backend
func (tsl *TslDatasource) GetPromResult(endpoint, promScript, refID, basicAuth string, hide, hideAttributes, hideLabels bool) *datasource.QueryResult {
	promQueries := strings.Split(promScript, "\n")

	seriesSet := make([]*datasource.TimeSeries, 0)
	for _, query := range promQueries {

		if query == "" {
			continue
		}
		res, err := tsl.execProm(endpoint, query, basicAuth)
		if err != nil {
			return tsl.GetErrorMessage(err, refID)
		}

		promResponse := &PrometheusResponse{}
		err = json.Unmarshal([]byte(res), promResponse)
		if err != nil {
			return tsl.GetErrorMessage(errors.New("Couldn't unmarshall prometheus response"), refID)
		}

		if promResponse.Status == "error" {
			return tsl.GetErrorMessage(errors.New(res), refID)
		}

		for _, series := range promResponse.Data.Result {
			metrics := series.Metric
			seriesName := metrics["__name__"]

			tags := make(map[string]string)
			if !hideLabels {
				delete(metrics, "__name__")
				delete(metrics, ".app")
				labels, err := json.Marshal(metrics)
				if err != nil {
					return tsl.GetErrorMessage(errors.New("Couldn't unmarshall time series labels"), refID)
				}
				tags["l"] = string(labels)
			}

			// Parse series data points
			seriesPoint := make([]*datasource.Point, len(series.Values))
			for dpIndex, dp := range series.Values {
				hasTimestamp := false
				timestamp := int64(-1)
				switch tick := dp[0].(type) {
				case float64:
					timestamp = int64(tick) * 1000
					hasTimestamp = true
					break
				case int64:
					timestamp = tick * 1000
					hasTimestamp = true
					break
				case int:
					timestamp = int64(tick) * 1000
					hasTimestamp = true
					break
				}

				hasValue := false
				value := float64(-1)
				switch val := dp[1].(type) {
				case float64:
					value = val
					hasValue = true
					break
				case string:
					value, err = strconv.ParseFloat(val, 64)
					if err != nil {
						hasValue = false
						break
					}
					hasValue = true
					break
				case int64:
					value = float64(val)
					hasValue = true
					break
				case int:
					value = float64(val)
					hasValue = true
					break
				}

				if hasTimestamp && hasValue {
					seriesPoint[dpIndex] = &datasource.Point{Timestamp: timestamp, Value: value}
				} else {
					// Break in case of error
					if !hasTimestamp {
						return tsl.GetErrorMessage(errors.New("Unvalid time series timestamp type"), refID)
					} else if !hasValue {
						return tsl.GetErrorMessage(errors.New("Unvalid time series value type"), refID)
					}
				}
			}

			series := &datasource.TimeSeries{Name: seriesName, Tags: tags, Points: seriesPoint}

			seriesSet = append(seriesSet, series)
		}
	}
	return &datasource.QueryResult{Series: seriesSet, RefId: refID}
}

// Execute PromQL on prometheus metrics backend
func (tsl *TslDatasource) execProm(endpoint, query, basicAuth string) (string, error) {

	u, err := url.Parse(endpoint + query)

	if err != nil {
		return "", err
	}

	httpReq, err := http.NewRequest("GET", u.String(), nil)

	httpReq.Header.Add("Authorization", basicAuth)

	if err != nil {
		return "", err
	}

	res, err := http.DefaultClient.Do(httpReq)
	if err != nil {
		return "", err
	}

	defer res.Body.Close()

	buf := new(bytes.Buffer)
	buf.ReadFrom(res.Body)

	if res.StatusCode != http.StatusOK {
		//return "",
		var message proxy.PromError
		json.Unmarshal(buf.Bytes(), &message)
		return buf.String(), errors.New("Fail to execute Prom request: " + message.Error)
	}

	return buf.String(), nil
}

// GetWarp10Result execute TSL native Queries on a Warp10 backend
func (tsl *TslDatasource) GetWarp10Result(endpoint, warpScript, refID string, hide, hideAttributes, hideLabels bool) *datasource.QueryResult {
	warpServer := NewWarpServer(endpoint, "warp10")
	resp, err := warpServer.QueryGTSs(warpScript)

	if err != nil {
		return tsl.GetErrorMessage(err, refID)
	}

	gtsSet := resp[0]
	seriesSet := make([]*datasource.TimeSeries, len(gtsSet))

	for i, gts := range gtsSet {

		// Parse series tags
		tags := make(map[string]string)

		if !hideLabels {
			labels, err := json.Marshal(gts.Labels)
			if err != nil {
				return tsl.GetErrorMessage(errors.New("Couldn't unmarshall time series labels"), refID)
			}
			tags["l"] = string(labels)
		}

		if !hideAttributes {
			attributes, err := json.Marshal(gts.Attrs)
			if err != nil {
				return tsl.GetErrorMessage(errors.New("Couldn't unmarshall time series attributes"), refID)
			}
			tags["a"] = string(attributes)
		}

		// Parse series data points
		seriesPoint := make([]*datasource.Point, len(gts.Values))
		for dpIndex, dp := range gts.Values {
			hasTimestamp := false
			timestamp := int64(-1)
			switch tick := dp[0].(type) {
			case float64:
				timestamp = int64(tick) / 1000
				hasTimestamp = true
				break
			case int64:
				timestamp = tick / 1000
				hasTimestamp = true
				break
			case int:
				timestamp = int64(tick) / 1000
				hasTimestamp = true
				break
			}

			hasValue := false
			value := float64(-1)
			switch val := dp[len(dp)-1].(type) {
			case float64:
				value = val
				hasValue = true
				break
			case int64:
				value = float64(val)
				hasValue = true
				break
			case int:
				value = float64(val)
				hasValue = true
				break
			}

			if hasTimestamp && hasValue {
				seriesPoint[dpIndex] = &datasource.Point{Timestamp: timestamp, Value: value}
			} else {
				// Break in case of error
				if !hasTimestamp {
					return tsl.GetErrorMessage(errors.New("Unvalid time series timestamp type"), refID)
				} else if !hasValue {
					return tsl.GetErrorMessage(errors.New("Unvalid time series value type"), refID)
				}
			}
		}

		// Return series
		series := &datasource.TimeSeries{Name: gts.Class, Tags: tags, Points: seriesPoint}
		seriesSet[i] = series
	}
	return &datasource.QueryResult{Series: seriesSet, RefId: refID}
}

// GetErrorMessage generate a Query Result error message based on a golang error
func (tsl *TslDatasource) GetErrorMessage(err error, refID string) *datasource.QueryResult {
	if refID != "" {
		return &datasource.QueryResult{Error: err.Error(), RefId: refID}
	}
	return &datasource.QueryResult{Error: err.Error()}
}

// GetTokenFromAuth is fetching the token from the request basic auth
func (tsl *TslDatasource) GetTokenFromAuth(basicAuth string) string {

	// Getting token from BasicAuth
	s := strings.SplitN(basicAuth, " ", 2)
	if len(s) != 2 {
		return ""
	}
	b, err := base64.StdEncoding.DecodeString(s[1])
	if err != nil {
		return ""
	}
	pair := strings.SplitN(string(b), ":", 2)
	if len(pair) != 2 {
		return ""
	}

	return pair[1]
}

// GetQueryType return current query type
func GetQueryType(tsdbReq *datasource.DatasourceRequest) (string, error) {
	queryType := "query"
	if len(tsdbReq.Queries) > 0 {
		firstQuery := tsdbReq.Queries[0]
		queryJSON, err := simplejson.NewJson([]byte(firstQuery.ModelJson))
		if err != nil {
			return "", err
		}
		queryType = queryJSON.Get("queryType").MustString("query")
	}
	return queryType, nil
}

func parseJSONQueries(tsdbReq *datasource.DatasourceRequest) ([]*simplejson.Json, error) {
	jsonQueries := make([]*simplejson.Json, 0)
	for _, query := range tsdbReq.Queries {
		json, err := simplejson.NewJson([]byte(query.ModelJson))
		if err != nil {
			return nil, err
		}

		jsonQueries = append(jsonQueries, json)
	}
	return jsonQueries, nil
}
