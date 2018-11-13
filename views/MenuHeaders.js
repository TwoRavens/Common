import m from 'mithril';

// ```
// m(MenuHeaders, {
//     id: id,
//     sections: [...,
//         {
//             value: 'string',
//             contents: m(...),
//             idSuffix: (optional) suffix to add to generated id strings
//             attrsAll: {optional object of attributes}
//         }]
//     })
// ```

export default class MenuHeaders {
    view(vnode) {
        let {id, attrsAll, sections} = vnode.attrs;

        return m(`#${id.replace(/\W/g, '_')}`, attrsAll, sections
            .filter(section => section) // ignore undefined sections
            .map(section => m(`div#bin${section['idSuffix'] || section.value.replace(/\W/g, '_')}`,
                m(`#header${section['idSuffix'] || section.value.replace(/\W/g, '_')}.panel-heading`,
                    m("h3.panel-title", section.value)),
                section.contents))
        )
    }
}
