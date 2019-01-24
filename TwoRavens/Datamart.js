import m from 'mithril';

import JSONSchema from "../views/JSONSchema";
import Button from "../views/Button";
import * as common from "../common";
import Table from "../views/Table";
import ListTags from "../views/ListTags";
import ButtonRadio from "../views/ButtonRadio";

let inputSchema = {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "$id": "htty://www.isi.edu/datamart-query.schema.json",
    "title": "Datamart query schema",
    "description": "Domain-specific language to specify queries for searching datasets in Datamart.",
    "type": "object",
    "definitions": {
        "temporal_entity": {
            "type": "object",
            "description": "Describe columns containing temporal information.",
            "properties": {
                "type": {
                    "type": "string",
                    "enum": [
                        "temporal_entity"
                    ]
                },
                "start": {
                    "type": "string",
                    "description": "Requested dates are older than this date."
                },
                "end": {
                    "type": "string",
                    "description": "Requested dates are more recent than this date."
                },
                "granularity": {
                    "type": "string",
                    "description": "Requested dates are well matched with the requested granularity. For example, if 'day' is requested, the best match is a dataset with dates; however a dataset with hours is relevant too as hourly data can be aggregated into days.",
                    "enum": [
                        "year",
                        "month",
                        "day",
                        "hour",
                        "minute",
                        "second"
                    ]
                }
            },
            "required": [
                "type"
            ]
        },
        "geospatial_entity": {
            "type": "object",
            "description": "Describe columns containing geospatial entities such as cities, countries, etc.",
            "properties": {
                "type": {
                    "type": "string",
                    "enum": [
                        "geospatial_entity"
                    ]
                },
                "circle": {
                    "type": "object",
                    "description": "Geospatial circle area identified using a radius and a center point on the surface of the earth. ",
                    "properties": {
                        "latitude": {
                            "type": "number",
                            "description": "The latitude of the center point"
                        },
                        "longitude": {
                            "type": "number",
                            "description": "The longitude of the center point"
                        },
                        "radius": {
                            "type": "string",
                            "description": "A string specify the radius of the area. "
                        },
                        "granularity": {
                            "type": "string",
                            "description": "The granularity of the entities contained in a bounding box. ",
                            "enum": [
                                "country",
                                "state",
                                "city",
                                "county",
                                "postalcode"
                            ]
                        }
                    }
                },
                "bounding_box": {
                    "type": "object",
                    "description": "Geospatial bounding box identified using two points on the surface of the earth.",
                    "properties": {
                        "latitude1": {
                            "type": "number",
                            "description": "The latitude of the first point"
                        },
                        "longitude1": {
                            "type": "number",
                            "description": "The longitude of the first point"
                        },
                        "latitude2": {
                            "type": "number",
                            "description": "The latitude of the second point"
                        },
                        "longitude2": {
                            "type": "number",
                            "description": "The longitude of the second point"
                        },
                        "granularity": {
                            "type": "string",
                            "description": "The granularity of the entities contained in a bounding box. ",
                            "enum": [
                                "country",
                                "state",
                                "city",
                                "county",
                                "postalcode"
                            ]
                        }
                    }
                },
                "named_entities": {
                    "type": "object",
                    "description": "A set of names of geospatial entities. This should be used when the requestor doesn't know what type of geospatial entities are provided, they could be cities, states, countries, etc. A matching dataset should have a column containing the requested entities.",
                    "properties": {
                        "semantic_type": {
                            "type": "string",
                            "enum": [
                                "http://schema.org/AdministrativeArea",
                                "http://schema.org/Country",
                                "http://schema.org/City",
                                "http://schema.org/State"
                            ]
                        },
                        "items": {
                            "type": "array"
                        }
                    }
                }
            },
            "required": [
                "type"
            ]
        },
        "dataframe_columns": {
            "type": "object",
            "description": "Describe columns that a matching dataset should have in terms of columns of a known dataframe. ",
            "properties": {
                "type": {
                    "type": "string",
                    "enum": [
                        "dataframe_columns"
                    ]
                },
                "index": {
                    "type": "array",
                    "description": "A set of indices that identifies a set of columns in the known dataset. When multiple indices are provides, the matching dataset should contain columns corresponding to each of the given columns."
                },
                "names": {
                    "type": "array",
                    "description": "A set of column headers that identifies a set of columns in the known dataset. When multiple headers are provides, the matching dataset should contain columns corresponding to each of the given columns."
                },
                "relationship": {
                    "type": "string",
                    "description": "The relationship between a column in the known dataset and a column in a matching dataset. The default is 'contains'. ",
                    "enum": [
                        "contains",
                        "similar",
                        "correlated",
                        "anti-correlated",
                        "mutually-informative",
                        "mutually-uninformative"
                    ]
                }
            },
            "required": [
                "type"
            ]
        },
        "generic_entity": {
            "type": "object",
            "description": "A description of any entity that is not temporal or geospatial. Temporal and geospatial entities receive special treatment. Datamart can re-aggregate and disaggregate temporal and geo-spatial entities so that the granularity of the requested data and an existing dataset does not need to match exactly.",
            "properties": {
                "about": {
                    "type": "string",
                    "description": "A query sting that is matched with all information contained in a column including metadata and values. A matching dataset should contain a column whose metadata or values matches at least one of the words in the query string. The matching algorithm gives preference to phrases when possible. "
                },
                "type": {
                    "type": "string",
                    "enum": [
                        "generic_entity"
                    ]
                },
                "variable_name": {
                    "type": "array",
                    "description": "A set of header names. A matching dataset should have a column that matches closely one of the provided names."
                },
                "variable_metadata": {
                    "type": "array",
                    "description": "A set of keywords to be matched with all the words appearing in the metadata of a column. A matching dataset should contain a column whose metadata matches at least one of the keywords. "
                },
                "variable_description": {
                    "type": "array",
                    "description": "A set of keywords to be matched with all the words in the description of a column in a dataset. A matching dataset should contain a column whose description matches at least one of the keywords. "
                },
                "variable_syntactic_type": {
                    "type": "array",
                    "description": "A set of syntactic types. A matching dataset should contain a column with any of the provided syntactic types. Comment: this should be defined using an enum."
                },
                "variable_semantic_type": {
                    "type": "array",
                    "description": "A set of semantic types. A matching dataset should contain a column whose semantic types have a non empty intersection with the provided semantic types. "
                },
                "named_entities": {
                    "type": "array",
                    "description": "A set of entity names. A matching dataset should contain a column with the requested names. "
                },
                "column_values": {
                    "type": "object",
                    "descriptions": "A set of arbitrary values of any type, and the relationship to the values in a column in a matching dataset. ",
                    "properties": {
                        "items": {
                            "type": "array",
                            "description": "A set of arbitrary values of any type, string, number, date, etc. To be used with the caller doesn't know whether the values represent named entities. A matching dataset shold contain a column with the requested values. "
                        },
                        "relationship": {
                            "type": "string",
                            "description": "The relationship between the specified valuesand the values in a column in a matching dataset. The default is 'contains'. ",
                            "enum": [
                                "contains",
                                "similar",
                                "correlated",
                                "anti-correlated",
                                "mutually-informative",
                                "mutually-uninformative"
                            ]
                        }
                    }
                }
            },
            "dependencies": {
                "relationship": [
                    "named_entities"
                ]
            },
            "required": [
                "type"
            ]
        }
    },
    "properties": {
        "dataset": {
            "type": "object",
            "description": "An object to describe desired features in the metadata of a dataset. A query can specify multiple features, and a matching dataset should match at least one of the features. Datasets that match multiple features are ranked higher. The features correspond to the properties in http://schema.org/Dataset. ",
            "properties": {
                "about": {
                    "type": "string",
                    "description": "A query string that is matched with all information in a dataset, including all dataset and column metadata and all values. A matching dataset should match at least one of the words in the query string. The matching algorithm gives preference to phrases when possible. "
                },
                "name": {
                    "type": "array",
                    "description": "The names of a dataset (http://schema.org/name). "
                },
                "description": {
                    "type": "array",
                    "description": "The descriptions of a dataset (http://schema.org/description). "
                },
                "keywords": {
                    "type": "array",
                    "description": "The keywords of a dataset (http://schema.org/keywords). "
                },
                "creator": {
                    "type": "array",
                    "description": "The creators of a dataset (http://schema.org/creator). A creator can be a person or an organization; organizations can be specified using names of paylevel domains. Note: the creator and publisher ofa dataset may be different; for example, a NOAA dataset was created by NOAA and may be published in multiple web sites."
                },
                "date_published": {
                    "type": "object",
                    "description": "The date range to show when the dataset was published (http://schema.org/datePublished).",
                    "properties": {
                        "after": {
                            "type": "string",
                            "description": "The earliest date published (http://schema.org/datePublished)."
                        },
                        "before": {
                            "type": "string",
                            "description": "The latest date published (http://schema.org/datePublished)."
                        }
                    }
                },
                "date_created": {
                    "type": "object",
                    "description": "The date range to show when the dataset was created (http://schema.org/dateCreated).",
                    "properties": {
                        "after": {
                            "type": "string",
                            "description": "The earliest date created (http://schema.org/datePublished)."
                        },
                        "before": {
                            "type": "string",
                            "description": "The latest date created (http://schema.org/datePublished)."
                        }
                    }
                },
                "publisher": {
                    "type": "array",
                    "description": "The publishers of a dataset (http://schema.org/publisher). A publisher can be a person or an organization; organizations can be specified using names of paylevel domains."
                },
                "url": {
                    "type": "array",
                    "description": "The URLs where the dataset is published (http://schema.org/url). In case of RESTful APIs, a match of the URL up to the `?` is sufficient. More complete matches are ranked higher. "
                }
            }
        },
        "required_variables": {
            "type": "array",
            "description": "The 'required' section of a query describes a set of columns that a matching dataset must have. All items in the 'required' set must be match by at least one column in a matching dataset. It is possible that an item is matched using a combination of columns. For example, a temporal item with day resolution can be matched by a dataset that represents dates using multiple columns, for year, month and date.  Typically, the 'required' section is used to list columns to be used to perform a join.  The 'required' section is optional. ",
            "items": {
                "oneOf": [
                    {
                        "$ref": "#/definitions/temporal_entity"
                    },
                    {
                        "$ref": "#/definitions/geospatial_entity"
                    },
                    {
                        "$ref": "#/definitions/dataframe_columns"
                    },
                    {
                        "$ref": "#/definitions/generic_entity"
                    }
                ]
            }
        },
        "desired_variables": {
            "type": "array",
            "description": "The 'desired' section of a query describes the minimum set of columns that a matching dataset must have. A matching dataset must contain columns that match at least one of the 'desired' item. Typically, the 'desired' items are used to specify columns that will be used for augmentation. The 'desired' section is optional. ",
            "items": {
                "oneOf": [
                    {
                        "$ref": "#/definitions/temporal_entity"
                    },
                    {
                        "$ref": "#/definitions/geospatial_entity"
                    },
                    {
                        "$ref": "#/definitions/dataframe_columns"
                    },
                    {
                        "$ref": "#/definitions/generic_entity"
                    }
                ]
            }
        }
    }
};


let indexSchema = {
    "$schema": "http://json-schema.org/draft-06/schema#",
    "$id": "http://datamart.datadrivendiscovery.org/dataset.schema.json",
    "definitions": {
        "materialization": {
            "description": "Method to retrieve the dataset or parts of the dataset",
            "type": "object",
            "properties": {
                "python_path": {
                    "description": "The python class to materialize the dataset",
                    "type": "string"
                },
                "arguments": {
                    "description": "keyword arguments to the python __init__ method",
                    "type": [
                        "object",
                        "null"
                    ]
                }
            },
            "required": [
                "python_path"
            ]
        },
        "implicit_variable": {
            "description": "implicit variables about the whole dataset, like the time coverage and entity coverage of the entire dataset. eg. A dataset from trading economics is about certain stocktickers, cannot be known from the dataset, should put it here",
            "type": "object",
            "properties": {
                "name": {
                    "description": "name of the variable",
                    "type": "string"
                },
                "value": {
                    "description": "value of the variable",
                    "type": "string"
                },
                "semantic_type": {
                    "description": "List of D3M semantic types",
                    "type": [
                        "array",
                        "null"
                    ],
                    "items": {
                        "type": "string",
                        "format": "uri"
                    }
                }
            }
        },
        "variable_metadata": {
            "description": "Metadata describing a variable/column",
            "type": "object",
            "properties": {
                "name": {
                    "description": "The name given in the original dataset",
                    "type": [
                        "string",
                        "null"
                    ]
                },
                "semantic_type": {
                    "description": "List of D3M semantic types",
                    "type": [
                        "array",
                        "null"
                    ],
                    "items": {
                        "type": "string",
                        "format": "uri"
                    }
                },
                "named_entity": {
                    "description": "List of named entities referenced in column values",
                    "type": [
                        "array",
                        "null"
                    ],
                    "items": {
                        "type": "string"
                    }
                },
                "temporal_coverage": {
                    "description": "Temporal extent",
                    "type": [
                        "object",
                        "null"
                    ],
                    "properties": {
                        "start": {
                            "description": "Start of temporal coverage",
                            "anyOf": [
                                {
                                    "type": "string",
                                    "format": "date-time"
                                },
                                {
                                    "type": "string",
                                    "format": "date"
                                },
                                {
                                    "type": "null"
                                }
                            ]
                        },
                        "end": {
                            "description": "End of temporal coverage",
                            "anyOf": [
                                {
                                    "type": "string",
                                    "format": "date-time"
                                },
                                {
                                    "type": "string",
                                    "format": "date"
                                },
                                {
                                    "type": "null"
                                }
                            ]
                        }
                    }
                },
                "spatial_coverage": {
                    "description": "Spatial extent",
                    "type": [
                        "object",
                        "null"
                    ]
                },
                "variable_materialization": {
                    "$ref": "#/definitions/materialization"
                }
            }
        }
    },
    "title": "dataset",
    "description": "Metadata describing an entire dataset",
    "type": "object",
    "properties": {
        "title": {
            "description": "A short description of the dataset",
            "type": [
                "string",
                "null"
            ]
        },
        "description": {
            "description": "A long description of the dataset",
            "type": [
                "string",
                "null"
            ]
        },
        "url": {
            "description": "A url on the web where users can find more info if applicable",
            "type": [
                "string",
                "null"
            ],
            "format": "uri"
        },
        "keywords": {
            "description": "Any keywords or text useful for indexing and retrieval",
            "type": [
                "array",
                "null"
            ],
            "items": {
                "type": "string"
            }
        },
        "date_published": {
            "description": "Original publication date",
            "anyOf": [
                {
                    "type": "string",
                    "format": "date-time"
                },
                {
                    "type": "string",
                    "format": "date"
                },
                {
                    "type": "null"
                }
            ]
        },
        "date_updated": {
            "description": "Last updated date",
            "anyOf": [
                {
                    "type": "string",
                    "format": "date-time"
                },
                {
                    "type": "string",
                    "format": "date"
                },
                {
                    "type": "null"
                }
            ]
        },
        "license": {
            "description": "License under which the dataset is released (TBD)",
            "type": [
                "object",
                "null"
            ]
        },
        "provenance": {
            "description": "Provenance of the dataset (TBD)",
            "type": [
                "null",
                "object"
            ]
        },
        "original_identifier": {
            "description": "Original global unique id associate with the dataset if applicable, like id in wikidata",
            "type": [
                "string",
                "null"
            ]
        },
        "implicit_variables": {
            "description": "Description of each implicit variable of the dataset",
            "anyOf": [
                {
                    "type": "array",
                    "items": {
                        "$ref": "#/definitions/implicit_variable"
                    }
                },
                {
                    "type": "null"
                }
            ]
        },
        "variables": {
            "description": "Description of each variable/column of the dataset",
            "anyOf": [
                {
                    "type": "array",
                    "items": {
                        "$ref": "#/definitions/variable_metadata"
                    }
                },
                {
                    "type": "null"
                }
            ]
        },
        "additional_info": {
            "description": "Any other information which is useful",
            "type": [
                "object",
                "null"
            ]
        },
        "materialization": {
            "description": "Method to retrieve the dataset or parts of the dataset",
            "type": "object",
            "properties": {
                "python_path": {
                    "description": "The python class to materialize the dataset",
                    "type": "string"
                },
                "arguments": {
                    "description": "keyword arguments to the python __init__ method",
                    "type": [
                        "object",
                        "null"
                    ]
                }
            },
            "required": [
                "python_path"
            ]
        }
    },
    "required": [
        "materialization"
    ]
};

let warn = (text) => m('[style=color:#dc3545;display:inline-block;margin-left:1em;]', text);

export default class Datamart {
    oninit() {
        // stores temporary title, description, url, file type
        this.indexData = {};
        this.datamartMode = 'Search';
        this.isSearching = false;
    }

    view(vnode) {
        let {augmentState, augmentResults, indexState, dataPath, labelWidth, endpoint} = vnode.attrs;

        let bold = value => m('div', {style: {'font-weight': 'bold', display: 'inline'}}, value);

        let makeCard = ({key, color, content, summary}) => m('table', {
                ondblclick: () => this.key = this.key ? undefined : key,
                style: {
                    'background': common.menuColor,
                    'border': common.borderColor,
                    margin: '1em',
                    'box-shadow': '0px 5px 5px rgba(0, 0, 0, .2)',
                    width: 'calc(100% - 2em)'
                }
            },
            m('tr',
                m('td', {
                    style: {
                        background: color,
                        height: '100%',
                        padding: '1em',
                        width: labelWidth || 0, // by default, 0 makes div width wrap content
                        'border-right': common.borderColor
                    }
                }, bold(key)),
                m('td', {
                    style: {width: 'calc(100% - 2em)'}
                }, (this.key === key || !summary) ? content : summary)
            )
        );

        let buttonMaterialize = (datamart_id, i) => m(Button, {
            onclick: async (e) => {
                e.stopPropagation();

                let response = await m.request(endpoint + 'materialize', {
                    method: 'POST',
                    data: {index: i, datamart_id}
                });

                console.warn("#debug response");
                console.log(response);
            }
        }, 'Download');

        let buttonAugment = i => m(Button, {
            style: {'margin-left': '1em'},
            onclick: async () => console.log(await m.request(endpoint + 'augment', {
                method: 'POST',
                data: {index: i}
            }))
        }, 'Augment');

        return m('div', {style: {width: '100%'}},
            m(ButtonRadio, {
                id: 'datamartButtonBar',
                onclick: state => this.datamartMode = state,
                activeSection: this.datamartMode,
                sections: [{value: 'Search'}, {value: 'Index'}]
            }),
            this.error && warn(this.error),

            this.datamartMode === 'Index' && [
                m(`div[style=background:${common.menuColor}]`, m(JSONSchema, {
                    data: indexState,
                    schema: indexSchema
                })),
                m(Button, {
                    style: {float: 'right'},
                    onclick: async () => {
                        let response = await m.request(endpoint + 'upload', {
                            method: 'POST',
                            data: {
                                state: JSON.stringify(augmentState)
                            }
                        });

                        if (response.success) {
                            console.log('success');
                            delete this.error
                        } else this.error = response.data;
                    }
                }, 'Submit'),

                // m(Button, {
                //     onclick: () => console.log(JSON.stringify(indexState))
                // }, 'debug')
            ],

            this.datamartMode === 'Search' && [
                m(`div[style=background:${common.menuColor}]`, m(JSONSchema, {
                    data: augmentState,
                    schema: inputSchema
                })),
                m(Button, {
                    style: {float: 'right'},
                    onclick: async () => {
                        augmentResults.length = 0;

                        // enable spinner
                        this.isSearching = true;
                        m.redraw();

                        let response = await m.request(endpoint + 'search', {
                            method: 'POST',
                            data: {
                                data_path: dataPath,
                                query: JSON.stringify(augmentState)
                            }
                        });

                        this.isSearching = false;

                        if (response.success) {
                            augmentResults.push(...response.data);
                            delete this.error
                        } else this.error = response.data;
                    }
                }, 'Submit'),

                this.isSearching && m('#loading.loader', {
                    style: {
                        margin: 'auto',
                        position: 'relative',
                        top: '40%',
                        transform: 'translateY(-50%)'
                    }
                })
            ],

            m('div#datamartResults', augmentResults
                .sort(result => result._score)
                .map((result, i) => makeCard({
                    key: result._source.title,
                    color: this.key === result._source.title ? common.selVarColor : common.grayColor,
                    content: m('div',
                        m('label[style=width:100%]', 'Score: ' + result._score),
                        buttonAugment(i),
                        buttonMaterialize(result._source.datamart_id, i),
                        m(Table, {
                            data: result._source,
                            nest: true
                        })),
                    summary: m('div',
                        m('label[style=width:100%]', 'Score: ' + result._score),
                        buttonAugment(i),
                        buttonMaterialize(result._source.datamart_id, i),
                        m(Table, {
                            data: {
                                description: result._source.description,
                                keywords: m(ListTags, {
                                    tags: result._source.keywords,
                                    readonly: true
                                })
                            }
                        }))
                }))
            )
        )
    }
}