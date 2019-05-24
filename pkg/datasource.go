package main

import (
	"context"
	"encoding/base64"
	"encoding/json"
	"strings"

	"github.com/grafana/grafana-plugin-model/go/datasource"
	"github.com/grafana/grafana/pkg/components/simplejson"
	hclog "github.com/hashicorp/go-hclog"
	plugin "github.com/hashicorp/go-plugin"
	"github.com/ovh/tsl/proxy"
	"github.com/pkg/errors"
)

type TslDatasource struct {
	plugin.NetRPCUnsupportedPlugin
	logger hclog.Logger
}

func (tsl *TslDatasource) Query(ctx context.Context, tsdbReq *datasource.DatasourceRequest) (*datasource.DatasourceResponse, error) {
	tsl.logger.Debug("Query", "datasource", tsdbReq.Datasource.Name, "TimeRange", tsdbReq.TimeRange)

	queryType, err := GetQueryType(tsdbReq)
	if err != nil {
		return nil, err
	}

	tsl.logger.Debug("createRequest", "queryType", queryType)

	return tsl.MetricQuery(ctx, tsdbReq)
}

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

		warpScript, err := proxy.GenerateNativeQueriesWithParams("warp10", tslString, token, true, params)

		if err != nil {
			resultSet[index] = tsl.GetErrorMessage(err, refID)
			continue
		}

		warpServer := NewWarpServer(tsdbReq.Datasource.Url, "protocol")
		resp, err := warpServer.QueryGTSs(warpScript)

		if err != nil {
			resultSet[index] = tsl.GetErrorMessage(err, refID)
			continue
		}

		gtsSet := resp[0]
		seriesSet := make([]*datasource.TimeSeries, len(gtsSet))

		for i, gts := range gtsSet {

			// Parse series tags
			tags := make(map[string]string)

			if !hideLabels {
				labels, err := json.Marshal(gts.Labels)
				if err != nil {
					resultSet[index] = tsl.GetErrorMessage(errors.New("Couldn't unmarshall time series labels"), refID)
					goto Done
				}
				tags["l"] = string(labels)
			}

			if !hideAttributes {
				attributes, err := json.Marshal(gts.Attrs)
				if err != nil {
					resultSet[index] = tsl.GetErrorMessage(errors.New("Couldn't unmarshall time series attributes"), refID)
					goto Done
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
						resultSet[index] = tsl.GetErrorMessage(errors.New("Unvalid time series timestamp type"), refID)
						goto Done
					} else if !hasValue {
						resultSet[index] = tsl.GetErrorMessage(errors.New("Unvalid time series value type"), refID)
						goto Done
					}
				}
			}

			// Return series
			series := &datasource.TimeSeries{Name: gts.Class, Tags: tags, Points: seriesPoint}
			seriesSet[i] = series
		}
		resultSet[index] = &datasource.QueryResult{Series: seriesSet, RefId: refID}
	Done:
	}
	result := &datasource.DatasourceResponse{Results: resultSet}

	return result, nil
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
		queryJson, err := simplejson.NewJson([]byte(firstQuery.ModelJson))
		if err != nil {
			return "", err
		}
		queryType = queryJson.Get("queryType").MustString("query")
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