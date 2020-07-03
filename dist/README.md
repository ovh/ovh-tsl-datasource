TSL-Grafana Datasource Plugin
===

This repository contains the [TSL](https://github.com/ovh/tsl) grafana datasource.

# Install the plugin

Just clone the repository in the Grafana *plugins* folder
```sh
git clone https://github.com/ovh/ovh-tsl-datasource.git /var/lib/grafana/plugins/tsl
```
Grafana will use the *dist/* folder by default

# Add a new TSL Datasource

- go to the Grafana menu (top left) > "datasources" > "add data source"
- choose a name
- set TSL as type
- paste the TSL platform URL ( do not append /v0/query )
- with TSL configured to make **server** query set the default token in panel TSL read token
- with a browser set up you can use the basic-auth to set your default token for TSL queries

## Add execution variables

You can define variables at datasource level (~ organisation level) which can be available for all dashboards.
You can simply re-use variable using your their name inside a query.

# Make a query

On a new dashboard, in a graph edition, choose your previous datasource and click *add query*. 

You can write your TSL on the editor below to graph something on Grafana you need to return at least a single metric. By default the TSL engine will apply the queries on the Grafana time window. 

## TSL query example

```tsl
select('metric')
.where('label=test')
.sampleBy(5m, mean)
.groupBy('label', mean)
.rate(1s)
```

## Available variables
On your TSL you can use (all timestamps are in µSeconds):

| Name         | Description                                                   | Example                    |
| ------------ | ------------------------------------------------------------- | -------------------------- |
| **end**      | Timestamp of the most recent point in the Grafana time window | 1498038153276000           |
| **endISO**   | *end* value in ISO-8601 format                                | '2017-06-21T09:42:33.276Z' |
| **start**    | Timestamp of the less recent point in the Grafana time window | 1498034553276000           |
| **startISO** | *start* value in ISO-8601 format                              | '2017-06-21T08:42:33.276Z' |
| **interval** | Difference between *end* and *start*                          | 3600000000                 |


# Templating variable evaluation

To understand the variable resolution, this is how a query is built

- Inject dashboard variables (**end**, **interval**, etc...)
- Inject datasource variables
- Inject templating variables resoled in the configuration order (a templating variable can call the previous templating variables in its resolution)
- Inject user query (can use all previous variables)
- Use string template to reuse a variable directly in a string (example: _.where('host=$host')_)

## Add a variable based on a metrics label

You can add queries variables via the dashboard setting. This can be used for example to generate a variable list based on a metrics label values.

The TSL query would be to list all hosts of my.series:

```tsl
select('my.series').where(...).labels('host')
```

## Snippet

A few snippet generating codes were implementing in this Grafana plugin, you will retrieve:
 - *select* to load data with TSL
 - *sample* to load and sample your data with TSL
 - *groupBy* to load, sample and aggregate several metrics with TSL 

# Compile

To contribute and re-compile you plugin you can simply execute 

```sh
npm install
npm run build
```

and to start grafana-tsl

```sh
npm run start
```

# Build TSL grafana backend

The grafana backend is currently under development. 
To build the TSL backend you need to fetch this github repository in your $GOPATH.
Then execute
```sh
go build -i -o ./dist/tsl-plugin_linux_amd64 ./pkg
cp dist/tsl-plugin_linux_amd64 /path/to/grafana/data/plugins/tsl/dist/tsl-plugin_linux_amd64
```

# LICENSE

This plugin was published under the [MIT License](./LICENSE.md)