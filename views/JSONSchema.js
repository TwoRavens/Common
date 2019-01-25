import m from 'mithril';

import Table from "./Table";
import TextField from "./TextField";
import Dropdown from "./Dropdown";
import TextFieldSuggestion from "./TextFieldSuggestion";
import {glyph} from '../common.js';

// Generic component that constructs menus that mutate an instance of a JSON schema
// There are a number of features in the JSON schema spec that aren't supported... but this is a good start

// Interface specification

// ```
// m(JSONSchema, {
//     schema: JSON object
//     data: JSON object
//     })
//  ```

let nestedStyle = {
    style: {
        background: 'rgba(0,0,0,.05)',
        'border-radius': '.5em',
        'box-shadow': '0px 5px 10px rgba(0, 0, 0, .1)',
        margin: '10px 0'
    }
};

let capitalizeFirst = text => text.slice(0, 1).toUpperCase() + text.slice(1);
let prettifyText = text => text.replace(/_/g, ' ').split(' ').map(capitalizeFirst).join(' ');

export default class Schema {
    oninit(vnode) {
        this.schema = vnode.attrs.schema;
    }

    view(vnode) {
        let {data} = vnode.attrs;
        return this.recurse(this.schema.properties, data);
    }

    recurse(schema, data) {
        // construct values for the current tree
        let value = key => {
            if (typeof data[key] === 'object' && 'type' in data[key] && data[key].type in this.schema.definitions)
                return this.recurse(this.schema.definitions[data[key].type].properties, data[key]);

            // sometimes the type is a list, support the most general form
            let types = Array.isArray(schema[key].type) ? schema[key].type : [schema[key].type];

            if (types.includes('string')) {
                if ('enum' in schema[key]) {
                    if (schema[key].enum.length === 1) data[key] = schema[key].enum[0];
                    return m(TextFieldSuggestion, {
                        value: data[key],
                        suggestions: schema[key].enum,
                        enforce: true,
                        oninput: val => data[key] = val,
                        onblur: val => data[key] = val
                    });
                }
                return m(TextField, {
                    value: data[key],
                    placeholder: {
                        'date-time': 'YYYY-MM-DDThh:mm:ssZ',
                        'date': 'YYYY-MM-DD',
                        'time': 'hh:mm:ss',
                        'utc-millisec': 'milliseconds since epoch'
                    }[schema[key]] || '',
                    oninput: val => data[key] = val,
                    onblur: val => data[key] = val
                });
            }
            if (types.includes('number')) return m(TextField, {
                value: data[key],
                class: typeof data[key] !== 'number' && 'is-invalid',
                oninput: val => data[key] = parseFloat(val) || val,
                onblur: val => data[key] = parseFloat(val) || val
            });
            if (types.includes('array')) return this.recurse(schema[key], data[key]);
            if (types.includes('object')) return this.recurse(schema[key].properties, data[key]);
        };

        // construct keys for the current tree
        if (Array.isArray(data)) return m(Table, {
            attrsCells: {valign: "top"},
            attrsAll: nestedStyle,
            data: 'items' in schema ? [
                ...data.map((elem, i) => [
                    value(i),
                    m('div', {onclick: () => data.splice(i, 1)}, glyph('remove', {style: {margin: '1em 1em 1em 0em'}}))
                ]),
                [
                    m(Dropdown, {
                        style: {float: 'left'},
                        items: [
                            'Add',
                            ...(schema.items.oneOf || [])
                                .map(item => item.$ref.split('/').slice(-1)[0]),
                            ...(schema.items.anyOf || [])
                                .map(item => item.$ref.split('/').slice(-1)[0])
                        ],
                        activeItem: 'Add',
                        onclickChild: child => {
                            if (child === 'Add') return;
                            data.push({
                                type: child
                            })
                        }
                    }),
                    undefined
                ]
            ] : [
                ...data.map((elem, i) => [
                    m(TextField, {value: elem, oninput: val => data[i] = val}),
                    m('div', {onclick: () => data.splice(i, 1)}, glyph('remove', {style: {margin: '1em 0px'}}))
                ]),
                [m(TextField, {value: '', oninput: val => data.push(val)}), undefined]
            ]
        });

        if (typeof data === 'object') return m(Table, {
            attrsAll: nestedStyle,
            attrsCells: {valign: "top"},
            data: Object.keys(data).map(key => [
                m('div', {title: schema[key].description || '', style: {'margin-top': '1em', 'font-weight': 'bold'}}, prettifyText(key)),
                value(key),
                m('div', {onclick: () => delete data[key]}, glyph('remove', {style: {margin: '1em 0px'}}))
            ]).concat(Object.keys(data).length === Object.keys(schema).length ? [] : [[
                m(Dropdown, {
                    style: {float: 'left'},
                    items: ['Add', ...Object.keys(schema).filter(key => !(key in data))],
                    activeItem: 'Add',
                    onclickChild: child => {
                        if (!(child in schema)) return;
                        data[child] = {
                            'string': '',
                            'object': {},
                            'array': [],
                            'number': ''
                        }[schema[child].type]
                    }
                }), undefined, undefined
            ]])
        });
    }
}