import m from 'mithril';

import JSONSchema from "../views/JSONSchema";
import Button from "../views/Button";
import * as common from "../common";
import Table from "../views/Table";
import ListTags from "../views/ListTags";
import ButtonRadio from "../views/ButtonRadio";
import {glyph} from "../common";
import * as app from "../../app/app";
import ModalVanilla from "../views/ModalVanilla";
import PanelList from "../views/PanelList";
import TextField from "../views/TextField";
import Dropdown from "../views/Dropdown";

// maximum number of records to display at once
let resultLimit = 100;

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
    "title": "dataset",
    "description": "Metadata describing an entire dataset",
    "type": "object",
    "properties": {
        "materialization_arguments": {
            "description": "Arguments for the method to retrieve the dataset or parts of the dataset",
            "type": "object",
            "properties": {
                "url": {
                    "type": "string"
                },
                "file_type": {
                    "enum": ["csv", "html", "json", "excel"]
                }
            },
            "required": ["url"]
        },
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
            "type": "array",
            "items": {
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
            }
        },
        "additional_info": {
            "description": "Any other information which is useful",
            "type": [
                "object",
                "null"
            ]
        }
    },
    "required": [
        "materialization_arguments"
    ],
    "definitions": {
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
                "named_entities": {
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
                }
            }
        }
    }
};

let setDefault = (obj, id, value) => obj[id] = id in obj ? obj[id] : value;
let warn = (text) => m('[style=color:#dc3545;display:inline-block;margin-right:1em;]', text);

export default class Datamart {
    oninit(vnode) {
        // all menu state is held in preferences
        let {preferences} = vnode.attrs;

        // access information from NYU/ISI responses along these paths
        setDefault(preferences, 'infoPaths', {
            'ISI': {
                'id': ['datamart_id'],
                'name': ['metadata', 'title'],
                'score': ['score'],
                'description': ['metadata', 'description'],
                'keywords': ['metadata', 'keywords'],
                'data': ['metadata'],
                'join_columns': ['join_columns'],
                'union_columns': ['union_columns']
            },
            'NYU': {
                'id': ['id'],
                'name': ['metadata', 'name'],
                'score': ['score'],
                'description': ['metadata', 'description'],
                'keywords': undefined,
                'data': ['metadata'],
                'join_columns': ['join_columns'],
                'union_columns': ['union_columns']
            }
        });
        setDefault(preferences, 'getData', (result, attribute) => {
            let path = preferences.infoPaths[preferences.sourceMode][attribute];
            return path && path.reduce((out, term) => term in out && out[term], result)
        });

        // set default menu state
        setDefault(preferences, 'datamartMode', 'Search');
        setDefault(preferences, 'isSearching', {ISI: false, NYU: false});

        setDefault(preferences, 'error', {ISI: undefined, NYU: undefined});
        setDefault(preferences, 'success', {ISI: undefined, NYU: undefined});

        setDefault(preferences, 'sourceMode', 'ISI');
        setDefault(preferences, 'leftJoinVariables', new Set());
        setDefault(preferences, 'rightJoinVariables', new Set());

        setDefault(preferences, 'datamartIndexMode', 'File');

        setDefault(preferences, 'indexLink', ''); // https://archive.ics.uci.edu/ml/machine-learning-databases/iris/bezdekIris.data
        setDefault(preferences, 'indexFileType', 'csv');

        setDefault(preferences, 'indexScrape', ''); // https://www.w3schools.com/html/html_tables.asp

        setDefault(preferences, 'joinPairs', []);
        setDefault(preferences, 'exactMatch', true);
    }

    view(vnode) {
        let {
            preferences,
            dataPath, // where to load data from, to augment with
            labelWidth, // width of titles on left side of cards
            endpoint, // Django app url
        } = vnode.attrs;

        let {
            query, // https://datadrivendiscovery.org/wiki/display/work/Datamart+Query+API
            results, // list of matched metadata
            indices, // data to be attached to the upload
            cached, // summary info and paths related to materialized datasets
            getData
        } = preferences;

        let bold = value => m('div', {style: {'font-weight': 'bold', display: 'inline'}}, value);

        // ---------------------------
        // for debugging
        // ---------------------------
        let xmakeCard = ({key, color, summary}) => m('div', summary);
        // ---------------------------

        let makeCard = ({key, color, summary}) => m('table', {
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
                        'max-width': labelWidth || 0,
                        'word-break': 'break-word',
                        'border-right': common.borderColor
                    }
                }, bold(key)),
                m('td', {style: {width: 'calc(100% - 2em)'}}, summary))
        );

        let materializeData = async i => {
            let id = getData(results[preferences.sourceMode][i], 'id');
            preferences.selectedResult = results[preferences.sourceMode][i];

            if (!(id in cached)) {
                let sourceMode = preferences.sourceMode;

                let response = await m.request(endpoint + 'materialize', {
                    method: 'POST',
                    data: {
                        search_result: JSON.stringify(preferences.selectedResult),
                        source: preferences.sourceMode
                    }
                });
                if (response.success) {
                    cached[id] = response.data;
                    cached[id].data_preview = cached[id].data_preview
                        .split('\n').map(line => line.split(','));

                    console.log('Materialized:', response.data);

                    preferences.success[sourceMode] = 'Download initiated';
                    delete preferences.error[sourceMode];
                } else {
                    delete preferences.success[sourceMode];
                    preferences.error[sourceMode] = response.data;
                }
            }
            m.redraw();
        };

        let handleIndex = async index => {
            console.log('Datamart Index:', index);

            // preserve state after async is awaited
            let sourceMode = preferences.sourceMode;

            let response = await m.request(endpoint + 'get_metadata', {
                method: 'POST',
                data: {
                    custom: JSON.stringify(index),
                    source: sourceMode
                }
            });

            if (response.success) {
                delete preferences.error[sourceMode];
                preferences.indices.length = 0;
                preferences.indices.push(...response.data);
                preferences.success[sourceMode] = `Found ${response.data.length} potential dataset${response.data.length === 1 ? '' : 's'}. Please review the details.`
                console.warn("#debug after submission of new dataset, response.data");
                console.log(response.data);
            } else {
                preferences.error[sourceMode] = response.data;
                delete preferences.success[sourceMode]
            }
        };

        let buttonDownload = i => m(Button, {
            style: {'margin': '0em 0.25em'},
            onclick: async () => {
                let id = getData(results[preferences.sourceMode][i], 'id');

                await materializeData(i);

                // download the file
                let link = document.createElement('a');
                document.body.appendChild(link);
                link.href = cached[id].data_path;
                link.click();
            }
        }, 'Download');

        // TODO
        let buttonAugment = i => m(Button, {
            style: {'margin': '0em 0.25em'},
            onclick: async () => {
                preferences.selectedResult = results[preferences.sourceMode][i];

                if (preferences.sourceMode === 'ISI')
                    preferences.modalShown = 'augment';

                if (preferences.sourceMode === 'NYU') {
                    let response = await m.request(endpoint + 'augment', {
                        method: 'POST',
                        data: {
                            data_path: dataPath,
                            search_result: JSON.stringify(preferences.selectedResult),
                            source: preferences.sourceMode
                        }
                    });

                    if (!response.success)
                        this.error = response.data;
                }
            }
        }, 'Augment');

        let buttonMetadata = i => m(Button, {
            style: {'margin': '0em 0.25em'},
            onclick: () => {
                preferences.selectedResult = results[preferences.sourceMode][i];
                preferences.modalShown = 'metadata';
            }
        }, 'Metadata');

        let buttonPreview = i => m(Button, {
            id: 'buttonPreview' + i,
            class: 'ladda-label ladda-button',
            style: {'margin': '0em 0.25em', 'data-spinner-color': 'black', 'data-style': 'zoom-in'},
            onclick: async () => {
                let id = getData(results[preferences.sourceMode][i], 'id');
                preferences.selectedResult = results[preferences.sourceMode][i];
                let ladda = Ladda.create(document.getElementById('buttonPreview' + i));
                ladda.start();
                await materializeData(i);
                ladda.stop();

                if (id in cached)
                    preferences.modalShown = 'preview';
                m.redraw();
            }
        }, 'Preview');

        return m('div', {style: {width: '100%'}},
            m(ButtonRadio, {
                id: 'datamartButtonBar',
                onclick: state => preferences.datamartMode = state,
                activeSection: preferences.datamartMode,
                sections: [{value: 'Search'}, {value: 'Index'}]
            }),

            preferences.error[preferences.sourceMode] && m('div#errorMessage', {
                style: {
                    background: 'rgba(0,0,0,.05)',
                    'border-radius': '.5em',
                    'box-shadow': '0px 5px 10px rgba(0, 0, 0, .1)',
                    margin: '10px 0'
                }
            }, [
                m('div', {
                    style: {display: 'inline-block'},
                    onclick: () => delete preferences.error[preferences.sourceMode]
                }, glyph('remove', {style: {margin: '1em'}})),
                warn('Error:'), preferences.error[preferences.sourceMode]
            ]),

            preferences.success[preferences.sourceMode] && m('div#successMessage', {
                style: {
                    background: 'rgba(0,0,0,.05)',
                    'border-radius': '.5em',
                    'box-shadow': '0px 5px 10px rgba(0, 0, 0, .1)',
                    margin: '10px 0'
                }
            }, [
                m('div', {
                    style: {display: 'inline-block'},
                    onclick: () => delete preferences.success[preferences.sourceMode]
                }, glyph('remove', {style: {margin: '1em'}})),
                preferences.success[preferences.sourceMode]
            ]),

            preferences.datamartMode === 'Search' && [
                m(`div[style=background:${common.menuColor}]`, m(JSONSchema, {
                    data: query,
                    schema: inputSchema
                })),

                m(ButtonRadio, {
                    id: 'dataSourceButtonBar',
                    onclick: state => {
                        preferences.sourceMode = state;
                        preferences.selectedResult = undefined;
                    },
                    activeSection: preferences.sourceMode,
                    sections: [{value: 'ISI'}, {value: 'NYU'}],
                    attrsAll: {style: {margin: '1em', width: 'auto'}}
                }),
                m(Button, {
                    style: {float: 'right', margin: '1em'},
                    disabled: preferences.isSearching[preferences.sourceMode],
                    onclick: async () => {
                        console.log('Datamart Query', JSON.stringify(query));

                        // preserve state after async is awaited
                        let sourceMode = preferences.sourceMode;
                        results[sourceMode].length = 0;

                        // enable spinner
                        preferences.isSearching[sourceMode] = true;
                        m.redraw();

                        let response = await m.request(endpoint + 'search', {
                            method: 'POST',
                            data: {
                                data_path: dataPath,
                                query: JSON.stringify(query),
                                source: preferences.sourceMode,
                                limit: resultLimit
                            }
                        });

                        preferences.isSearching[sourceMode] = false;

                        if (response.success) {
                            console.log('results are back! ' + JSON.stringify(response));
                            // (moved sort to server side)
                            // clear array and add results
                            results[sourceMode].length = 0;
                            results[sourceMode].push(...response.data);

                            console.log('Num results: ' + results[sourceMode].length);

                            if (results[sourceMode].length === 0) {
                                // No datasets found
                                //
                                delete preferences.success[sourceMode]; // remove "success"
                                preferences.error[sourceMode] = 'No datasets found.';
                            } else {
                                // Datasets found!
                                //
                                delete preferences.error[sourceMode]; // remove error

                                let numDatasetMsg = '';
                                if (results[sourceMode].length > resultLimit){
                                  numDatasetMsg = 'Over ';
                                }
                                numDatasetMsg += `${results[sourceMode].length} datasets found.`;
                                preferences.success[sourceMode] = numDatasetMsg;
                                console.log('msg: ' + numDatasetMsg);
                            }
                        } else {
                            // show the error message
                            delete preferences.success[sourceMode]; // remove "success"
                            preferences.error[sourceMode] = response.message;
                        }
                        m.redraw();
                    }
                }, 'Submit'),

                preferences.isSearching[preferences.sourceMode] && m('#loading.loader', {
                    style: {
                        margin: 'auto',
                        'margin-top': '5em',
                        position: 'relative',
                        top: '40%',
                        transform: 'translateY(-50%)'
                    }
                }),

                m('div#datamartResults', results[preferences.sourceMode]
                     .map((result, i) => makeCard({
                        key: m('', m('', getData(result, 'name') || ''),
                                    m('p[style=font-weight:normal]', `(#${i+1})`)),
                        color: preferences.selectedResult === result ? common.selVarColor : common.grayColor,
                        summary: m('div',
                            m('label[style=width:100%]', 'Score: ' + getData(result, 'score')),
                            buttonPreview(i),
                            // buttonDownload(i), # download isn't working yet
                            buttonAugment(i),
                            buttonMetadata(i),
                            m(Table, {
                                data: {
                                    description: getData(result, 'description'),
                                    keywords: getData(result, 'keywords') && m(ListTags, {
                                        tags: getData(result, 'keywords'),
                                        readonly: true
                                    })
                                }
                            }))
                    }))
                 )
             ],
            preferences.datamartMode === 'Index' && [
                m('h5', 'Indexing is for adding your own datasets to datamart. You may upload a file or extract data from a link.'),
                m(ButtonRadio, {
                    id: 'datamartIndexMode',
                    onclick: state => preferences.datamartIndexMode = state,
                    activeSection: preferences.datamartIndexMode,
                    sections: [{value: 'File'}, {value: 'Link'}, {value: 'Scrape'}]
                }),
                preferences.datamartIndexMode === 'File' && [
                    m('label.btn.btn-default.btn-file', {style: {margin: '1em', display: 'inline-block'}}, [
                        m('input', {
                            hidden: true,
                            type: 'file',
                            style: {display: 'none'},
                            onchange: async e => {

                                // preserve state after async is awaited
                                let sourceMode = preferences.sourceMode;

                                let file = e.target.files[0];

                                let data = new FormData();
                                data.append("source_file", file);

                                // initial upload
                                let response = await m.request({
                                    method: "POST",
                                    url: endpoint + "upload",
                                    data: data
                                });

                                if (!response.success) {
                                    preferences.error[sourceMode] = response.data;
                                    return;
                                }
                            }
                        })
                    ], 'Browse')
                ],

                preferences.datamartIndexMode === 'Link' && [
                    m(TextField, {
                        style: {margin: '1em', width: 'calc(100% - 15em)', display: 'inline-block'},
                        id: 'datamartLinkTextField',
                        value: preferences.indexLink,
                        placeholder: 'Url to file',
                        oninput: value => preferences.indexLink = value,
                        onblur: value => preferences.indexLink = value
                    }),
                    m('div', {style: {margin: '1em', 'margin-left': '0px', display: 'inline-block'}}, m(Dropdown, {
                        id: 'fileTypeDropdown',
                        items: ['csv', 'excel'],
                        activeItem: preferences.indexFileType,
                        onclickChild: value => preferences.indexFileType = value
                    })),
                    m(Button, {
                        style: {
                            float: 'right',
                            margin: '1em',
                            'margin-left': '0px',
                            'max-width': '10em',
                            display: 'inline-block'
                        },
                        onclick: () => handleIndex({
                            materialization_arguments: {
                                url: preferences.indexLink,
                                file_type: preferences.indexFileType
                            }
                        })
                    }, 'Submit')
                ],

                preferences.datamartIndexMode === 'Scrape' && [
                    m(TextField, {
                        style: {margin: '1em', width: 'calc(100% - 10em)', display: 'inline-block'},
                        id: 'datamartScrapeTextField',
                        value: preferences.indexScrape,
                        placeholder: 'Url to webpage with tables',
                        oninput: value => preferences.indexScrape = value,
                        onblur: value => preferences.indexScrape = value
                    }),
                    m(Button, {
                        style: {float: 'right', margin: '1em', 'max-width': '10em', display: 'inline-block'},
                        onclick: () => handleIndex({
                            materialization_arguments: {
                                url: preferences.indexScrape,
                                file_type: 'html'
                            }
                        })
                    }, 'Submit')
                ],
                indices.map(index => m(`div[style=background:${common.menuColor}]`, m(JSONSchema, {
                    data: index,
                    schema: indexSchema
                }))),

                indices.length > 0 && m(Button, {
                    onclick: async () => {
                        // preserve state after async is awaited
                        let sourceMode = preferences.sourceMode;

                        let responses = [];
                        let promises = indices.map((index, i) => m.request(endpoint + 'index', {
                            method: 'POST',
                            data: {
                                indices: JSON.stringify(index),
                                source: sourceMode
                            }
                        }).then(response => responses[i] = response));

                        await Promise.all(promises);

                        preferences.success[sourceMode] = 'Index ' + responses
                            .reduce((out, response, i) => response.success ? [...out, i] : out, []).join(', ') + ' successful.';

                        preferences.indices = indices.filter((index, i) => !responses[i].success)

                        if (preferences.indices.length) {
                            preferences.error[sourceMode] = 'Some datasets failed uploading to datamart. The failed datasets are listed below.';
                            delete preferences.success[sourceMode]
                        } else
                            preferences.success[sourceMode] = `Dataset${responses.length === 1 ? '' : 's'} successfully indexed.`

                        m.redraw()
                    }
                }, 'Submit')
            ]
        )
    }
}


// additional menus for displaying tables, augment columns and metadata
export class ModalDatamart {
    view(vnode) {
        let {
            preferences,
            endpoint,
            dataPath, // where to load data from, to augment with
        } = vnode.attrs;

        let {
            cached, // summary info and paths related to materialized datasets
            getData,
            selectedResult
        } = preferences;

        if (!getData || !preferences.modalShown)
            return;

        return getData && preferences.modalShown && m(ModalVanilla, {
            id: 'datamartModal',
            setDisplay: () => preferences.modalShown = false
        }, [
            preferences.modalShown === 'preview' && [
                m('h4', (preferences.getData(selectedResult, 'name') || '') + ' Preview'),
                m('div', {style: {width: '100%', overflow: 'auto'}},
                    m(Table, {
                        headers: cached[preferences.getData(selectedResult, 'id')].data_preview[0],
                        data: cached[preferences.getData(selectedResult, 'id')].data_preview.slice(1)
                    }))
            ],

            preferences.modalShown === 'metadata' && [
              m('h4', (getData(selectedResult, 'name') || '') + ' Metadata'),
              m('label[style=width:100%]', 'Score: ' + getData(selectedResult, 'score') || 0),
              m(Table, {
                  data: {
                      'Join Columns': getData(selectedResult, 'join_columns') || '(no join columns)',
                      'Union Columns': getData(selectedResult, 'union_columns') || '(no join columns)'
                  },
                  tableTags: m('colgroup',
                      m('col', {span: 1}),
                      m('col', {span: 1, width: '30%'}))
              }),
              m('div[style=width:100%;overflow:auto]',
                m(Table, {
                    data: getData(selectedResult, 'data'),
                    // attrsCells: {'class': 'text-left'}, // {class: "text-left"},
                  }
                ),
              ),
            ],


            preferences.modalShown === 'augment' && [

                preferences.error[preferences.sourceMode] && m('div#errorMessage', {
                    style: {
                        background: 'rgba(0,0,0,.05)',
                        'border-radius': '.5em',
                        'box-shadow': '0px 5px 10px rgba(0, 0, 0, .1)',
                        margin: '10px 0'
                    }
                }, [
                    m('div', {
                        style: {display: 'inline-block'},
                        onclick: () => delete preferences.error[preferences.sourceMode]
                    }, glyph('remove', {style: {margin: '1em'}})),
                    warn('Error:'), preferences.error[preferences.sourceMode]
                ]),

                preferences.joinPairs.map((pair, i) => m('div#pairContainer' + i, {
                    style: {
                        background: 'rgba(0,0,0,.05)',
                        'border-radius': '.5em',
                        'box-shadow': '0px 5px 10px rgba(0, 0, 0, .1)',
                        margin: '10px 0'
                    }
                }, [
                    m('div', {
                        style: {display: 'inline-block'},
                        onclick: () => preferences.joinPairs.splice(preferences.joinPairs.findIndex(elem => elem === pair), 1)
                    }, glyph('remove', {style: {margin: '1em'}})),
                    `Joining [${pair[0].join(', ')}] with [${pair[1].join(', ')}]`
                ])),

                m('div',
                    m(Button, {
                        style: {margin: '1em'},
                        title: 'supply variables from both the left and right datasets',
                        disabled: !preferences.leftJoinVariables.size || !preferences.rightJoinVariables.size,
                        onclick: () => {
                            if (!preferences.leftJoinVariables.size || !preferences.rightJoinVariables.size)
                                return;

                            preferences.joinPairs.push([
                                [...preferences.leftJoinVariables],
                                [...preferences.rightJoinVariables]]);

                            preferences.leftJoinVariables = new Set();
                            preferences.rightJoinVariables = new Set();
                        }
                    }, 'Add Pairing'),

                    m('label[style=margin-right:1em]', 'Exact Match:'),
                    m(ButtonRadio, {
                        id: 'exactMatchButtonBar',
                        attrsAll: {style: {display: 'inline-block', width: 'auto'}},
                        onclick: state => preferences.exactMatch = state === 'true',
                        activeSection: String(preferences.exactMatch),
                        sections: [{value: 'true'}, {value: 'false'}]
                    }),

                    m(Button, {
                        id: 'augmentButton',
                        style: {margin: '1em', float: 'right', 'data-spinner-color': 'black', 'data-style': 'zoom-in'},
                        class: 'ladda-label ladda-button',
                        disabled: !preferences.joinPairs.length,
                        onclick: async () => {
                            let sourceMode = preferences.sourceMode;

                            let originalLeftColumns = Object.keys(app.preprocess);
                            let originalRightColumns = preferences.selectedResult.metadata.variables.map(row => row.name);

                            let joinLeftColumns = [];
                            let joinRightColumns = [];

                            preferences.joinPairs.forEach(pair => {
                                joinLeftColumns.push(pair[0]
                                    .map(leftCol => originalLeftColumns.indexOf(leftCol)));
                                joinRightColumns.push(pair[1]
                                    .map(rightCol => originalRightColumns.indexOf(rightCol)));
                            });

                            let ladda = Ladda.create(document.getElementById('augmentButton'));
                            ladda.start();

                            let response = await m.request(endpoint + 'augment', {
                                method: 'POST',
                                data: {
                                    data_path: dataPath,
                                    search_result: JSON.stringify(preferences.selectedResult),
                                    source: preferences.sourceMode,
                                    left_columns: JSON.stringify(joinLeftColumns),
                                    right_columns: JSON.stringify(joinRightColumns),
                                    exact_match: preferences.exactMatch
                                }
                            });
                            ladda.stop();

                            if (response.success) {
                                delete preferences.error[sourceMode];
                                preferences.success[sourceMode] = `Successful augmentation.`;
                            } else {
                                preferences.error[sourceMode] = response.data;
                                delete preferences.success[sourceMode]
                            }

                            console.warn("#debug response augment");
                            console.log(response);
                        }
                    }, 'Augment')),

                m('h4[style=width:calc(50% - 1em);display:inline-block]', 'Left Join Columns'),
                m('h4[style=width:calc(50% - 1em);display:inline-block]', 'Right Join Columns'),

                m('div', {style: {width: 'calc(50% - 1em)', display: 'inline-block', 'vertical-align': 'top'}},
                    m(PanelList, {
                        id: 'leftColumns',
                        items: app.valueKey,
                        colors: {
                            [app.hexToRgba(common.selVarColor)]: [...preferences.leftJoinVariables]
                        },
                        callback: variable => {
                            preferences.leftJoinVariables.has(variable)
                                ? preferences.leftJoinVariables.delete(variable)
                                : preferences.leftJoinVariables.add(variable);
                            setTimeout(m.redraw, 1000);
                        },
                        attrsAll: {
                            style: {
                                background: 'rgba(0,0,0,.025)',
                                'box-shadow': '0px 5px 10px rgba(0, 0, 0, .1)',
                                'max-width': '30em',
                                padding: '1em',
                                margin: 'auto'
                            }
                        }
                    })),
                m('div', {style: {width: 'calc(50% - 1em)', display: 'inline-block', 'vertical-align': 'top'}},
                    m(PanelList, {
                        id: 'rightColumns',
                        items: selectedResult.metadata.variables.map(variable => variable.name),
                        colors: {
                            [app.hexToRgba(common.selVarColor)]: [...preferences.rightJoinVariables]
                        },
                        callback: variable => {
                            preferences.rightJoinVariables.has(variable)
                                ? preferences.rightJoinVariables.delete(variable)
                                : preferences.rightJoinVariables.add(variable);
                            setTimeout(m.redraw, 1000);
                        },
                        attrsAll: {
                            style: {
                                background: 'rgba(0,0,0,.025)',
                                'box-shadow': '0px 5px 10px rgba(0, 0, 0, .1)',
                                'max-width': '30em',
                                padding: '1em',
                                margin: 'auto'
                            }
                        }
                    }))
            ]
        ])
    }
}
