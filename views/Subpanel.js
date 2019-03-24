import m from 'mithril';
import {mergeAttributes} from "../common";
import Icon from "../../app/views/Icon";
import Button from "./Button";

// ```
// m(Subpanel, {
//     id: 'string',
//     header: 'string'
//     attrsAll: {any attribute may be passed}
// }, contents)
// ```

// A box with a header. The header has a glyphicon chevron that shows/hides the contents.

export default class Subpanel {
    oninit() {
        this.show = true;
    }

    view({attrs, children}) {
        let {id, header} = attrs;

        return m(`div.card`, mergeAttributes({
                style: {'margin-bottom': '0px'}
            },
            attrs),
            m(".card-header", {onclick: () => this.show = !this.show},
                m("h4.card-title", {style: {'margin-bottom': '0'}}, header,
                    m(Icon, {style: 'margin:.25em 0 0 .5em;float:right', name: 'triangle-' + (this.show ? 'down' : 'up')}))),

                    // m(`span.glyphicon.glyphicon-large.glyphicon-chevron-${this.show ? 'down' : 'up'}`, {
                    //     style: {float: 'right', 'margin-left': '.5em'},
                    //     'data-toggle': 'collapse',
                    //     'data-target': `#${id}Body`,
                    //     'href': `#${id}Body`,
                    //     onclick: () => this.show = !this.show
                    // }))),
            m(`div#${id}Body`, this.show && m('div.card-body', children))
        );
    }
}