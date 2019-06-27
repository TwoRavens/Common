import m from 'mithril';
import {mergeAttributes} from "../common";
import Icon from "./Icon";
import Button from "./Button";

// ```
// m(Subpanel, {
//     id: 'string',
//     header: 'string'
//     attrsAll: {any attribute may be passed}
// }, contents)
// ```

// A box with a header. The header has a chevron that shows/hides the contents.

export default class Subpanel {
    oninit({attrs}) {
        if (attrs.defaultShown !== undefined)
            this.shown = attrs.defaultShown;
        else this.shown = true;
        this.id = attrs.id;
    }

    view({attrs, children}) {
        let {id, header, shown, setShown, attrsBody} = attrs;

        // if id is set, re-init if changed (side effect of dom node reuse)
        if (this.id !== id) this.oninit({attrs});

        setShown = setShown || (state => this.shown = state);

        // set state from attrs if defined
        if (shown !== undefined) this.shown = shown;

        return m(`div.card`, mergeAttributes({
                style: {'margin-bottom': '0px'}
            },
            attrs),
            m(".card-header", {onclick: () => setShown(!this.shown)},
                m("h4.card-title", {style: {'margin-bottom': '0'}}, header,
                    m(Icon, {
                        style: 'margin:.25em 0 0 .5em;float:right',
                        name: 'triangle-' + (this.shown ? 'down' : 'up')
                    }))),
            m(`div#${id}Body`, this.shown && m('div.card-body', attrsBody, children))
        );
    }
}