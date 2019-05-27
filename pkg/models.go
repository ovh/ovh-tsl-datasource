package main

import (
	"net/http"

	"github.com/grafana/grafana/pkg/components/simplejson"
)

// PrometheusResponse structure
type PrometheusResponse struct {
	Status    string                 `json:"status"`
	Data      PrometheusDataResponse `json:"data,omitempty"`
	ErrorType string                 `json:"errorType,omitempty"`
	Error     string                 `json:"error,omitempty"`
}

// PrometheusDataResponse internal structure
type PrometheusDataResponse struct {
	ResultType string                     `json:"resultType"`
	Result     []PrometheusResultResponse `json:"result"`
}

// PrometheusResultResponse series structure
type PrometheusResultResponse struct {
	Metric map[string]string `json:"metric"`

	// Values are heterogen, hence the interface. One datapoint is looking like this:
	//[ 1435781460.781, "1" ]
	Values [][]interface{} `json:"values"`
}

// RemoteDatasourceRequest grafana request parsed structure
type RemoteDatasourceRequest struct {
	queryType string
	req       *http.Request
	queries   []*simplejson.Json
}
