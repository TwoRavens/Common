import m from "mithril";
import Popper from 'popper.js';
import * as common from '../common';

// Construct/place a popper upon hover of child content

// ```
// m(Popper, {
//         content: () => 'popper content',
//         options: {placement: 'left', ...}, // specification for options: https://popper.js.org/popper-documentation.html#Popper.Defaults
//         popperDuration: 100 // time in ms to delay load/unload
//     }, 'child content')
// ```

export default class PopperWrapper {
    constructor() {
        this.popper = undefined;
        this.popperDom = undefined;
        this.popperRoot = undefined;
        this.timeout = undefined;
    }

    onupdate() {
        if (this.popper) this.popper.update()
    }

    onremove() {
        if (this.popper) this.popper.destroy()
    }

    view({attrs, children}) {
        attrs.popperDuration = attrs.popperDuration || 100;

        // don't bother setting up the popper if the popper has no content
        if (!attrs.content) return children;

        return m('div',
            m('div', {
                style: {
                    // animations
                    position: 'absolute',
                    visibility: this.popper ? 'visible' : 'hidden',
                    opacity: this.popper ? 1 : 0,
                    'margin-top': this.popper ? '0px' : '10px',
                    'transition': 'opacity 0.4s ease, margin-top 0.4s ease',

                    // popover styling
                    'background-color': common.menuColor,
                    padding: '.5em',
                    'border-radius': '.5em',
                    'box-shadow': '0 1px 4px rgba(0, 0, 0, 0.4)',
                    'z-index': 10000
                },
                oncreate: ({dom}) => this.popperDom = dom,
                onmouseover: () => clearTimeout(this.timeout),
                onmouseout: () => this.timeout = setTimeout(() => {
                    this.popper = undefined;
                    m.redraw()
                }, attrs.popperDuration)
            }, this.popper && attrs.content()),
            m('div', {
                oncreate: ({dom}) => this.popperRoot = dom,
                onmouseover: () => {
                    clearTimeout(this.timeout);
                    this.timeout = setTimeout(
                        () => this.popper = this.popper || new Popper(
                            this.popperRoot, this.popperDom, attrs.options))
                },
                onmouseout: () => this.timeout = setTimeout(() => {
                    this.popper = undefined;
                    m.redraw()
                }, attrs.popperDuration)
            }, children)
        )
    }
}