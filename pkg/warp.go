package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strings"

	log "github.com/sirupsen/logrus"
)

// QueryResult The result of a Warp10 query
type QueryResult struct {
	Count   int          `json:"count"`
	Fetched int          `json:"fetched"`
	GTS     []TimeSeries `json:"gts"`
}

// TimeSeries as returned by Warp 10
// Format defined at https://www.warp10.io/content/03_Documentation/03_Interacting_with_Warp_10/03_Ingesting_data/02_GTS_input_format
type TimeSeries struct {
	// This is the class name of the Time Series.
	Class string `json:"c"`

	// This is an object containing the labels of the Time Series.
	Labels map[string]string `json:"l"`

	// This is an object containing the attributes (key/value) of the Time Series.
	Attrs map[string]string `json:"a"`

	// This is an id which is unique Time Series in the output (but not across outputs).
	// All chunks of a given Geo Time Serie will have the same id and can therefore easily be identified and merged.
	ID string `json:"i"`

	// Array of Time Series measurements.
	// Each measurement is itself an array containing 2, 3, 4 or 5 elements.
	// The first element of the array is the timestamp of the measurement in microseconds since the Unix Epoch.
	// The last element of the array is the value of the measurement, the type of this element varies with the type of the measurement.
	// Others elements are spatials value of the measurement (optional and not in used with TSL)
	Values [][]interface{} `json:"v"`
}

// Warp10Server is the abstraction of Warp10
type Warp10Server interface {
	QueryGTS(body string) (*QueryResult, error)
	Query(body string) (*http.Response, error)
}

// HTTPWarp10Server Concrete implementation
type HTTPWarp10Server struct {
	Endpoint string
	Protocol string
}

// QueryGTS is a simple query, given the metric name and tags, and the start/end timestamps
func (server *HTTPWarp10Server) QueryGTS(body string) (*QueryResult, error) {
	warp10Resp, err := server.Query(body)
	if err != nil {
		return nil, err
	}
	defer warp10Resp.Body.Close()
	// Einstein dumps the current stack (an array) as the result of the program execution.
	// It contains a single element, which is an array of query results.
	result := []QueryResult{}
	err = json.NewDecoder(warp10Resp.Body).Decode(&result)
	if err != nil {
		return nil, err
	}
	return &(result[0]), nil
}

// QueryGTSs convert the Warp 10 stack, as TSL expect only TimeSeries
// Expects a list (stack) of list of TimeSeries (tsl queries series results) as Warp 10 return
func (server *HTTPWarp10Server) QueryGTSs(body string) ([][]TimeSeries, error) {
	warp10Resp, err := server.Query(body)
	if err != nil {
		return nil, err
	}
	defer func() {
		if err := warp10Resp.Body.Close(); err != nil {
			log.
				WithError(err).
				Error("Cannot close Warp10 response body")
		}
	}()

	result := [][]TimeSeries{}
	err = json.
		NewDecoder(warp10Resp.Body).
		Decode(&result)
	if err != nil {
		return nil, err
	}
	return result, nil
}

// Query is performing a simple query, given the metric name and tags, and the start/end timestamps
func (server *HTTPWarp10Server) Query(body string) (*http.Response, error) {
	log.WithFields(log.Fields{
		"type": "query",
	}).Debug("Debug Query")

	log.Debug(body)

	out := strings.NewReader(body)
	warp10Resp, err := http.Post(server.Endpoint+"/api/v0/exec", "text/plain", out)

	if err != nil {
		wErr := ""
		if warp10Resp.StatusCode == http.StatusInternalServerError {
			wErr = warp10Resp.Header.Get("X-Warp10-Error-Message")
		}
		return nil, fmt.Errorf("WarpScript error: %s", wErr)
	}

	if warp10Resp.StatusCode == http.StatusInternalServerError {
		wErr := warp10Resp.Header.Get("X-Warp10-Error-Message")
		return nil, fmt.Errorf("WarpScript error: %s", wErr)
	}

	return warp10Resp, nil
}

// NewWarpServer is returning a new Warp server
func NewWarpServer(endpoint string, protocol string) *HTTPWarp10Server {
	return &HTTPWarp10Server{
		Endpoint: endpoint,
		Protocol: protocol,
	}
}
