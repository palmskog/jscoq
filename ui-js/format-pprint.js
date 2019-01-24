
/**
 * Render the pretty-print box output generated by Ocaml's Format module
 * (https://caml.inria.fr/pub/docs/manual-ocaml/libref/Format.html)
 */
class FormatPrettyPrint {

    // Simplifier to the "rich" format coq uses.
    richpp2HTML(msg) {

        // Elements are ...
        if (msg.constructor !== Array) {
            return msg;
        }

        var ret;
        var tag, ct, id, att, m;
        [tag, ct] = msg;

        switch (tag) {

        // Element(tag_of_element, att (single string), list of xml)
        case "Element":
            [id, att, m] = ct;
            let imm = m.map(this.richpp2HTML, this);
            ret = "".concat(...imm);
            ret = `<span class="${id}">` + ret + `</span>`;
            break;

        // PCData contains a string
        case "PCData":
            ret = ct;
            break;

        default:
            ret = msg;
        }
        return ret;
    }

    pp2HTML(msg, state) {

        // Elements are ...
        if (msg.constructor !== Array) {
            return msg;
        }

        state = state || {breakMode: 'horizontal'};

        var ret;
        var tag, ct;
        [tag, ct] = msg;

        switch (tag) {

        // Element(tag_of_element, att (single string), list of xml)

        // ["Pp_glue", [...elements]]
        case "Pp_glue":
            let imm = ct.map(x => this.pp2HTML(x, state));
            ret = "".concat(...imm);
            break;

        // ["Pp_string", string]
        case "Pp_string":
            if (ct.match(/^={4}=*$/)) {
                ret = "<hr/>";
                state.breakMode = 'skip-vertical';
            }
            else if (state.breakMode === 'vertical' && ct.match(/^\ +$/)) {
                ret = "";
                state.margin = ct;
            }
            else
                ret = ct;
            break;

        // ["Pp_box", ["Pp_vbox"/"Pp_hvbox"/"Pp_hovbox", _], content]
        case "Pp_box":
            var vmode = state.breakMode,
                margin = state.margin ? state.margin.length : 0;

            state.margin = null;

            switch(msg[1][0]) {
            case "Pp_vbox":
                state.breakMode = 'vertical';
                break;
            default:
                state.breakMode = 'horizontal';
            }

            ret = `<div class="Pp_box" data-mode="${state.breakMode}" data-margin="${margin}">` +
                  this.pp2HTML(msg[2], state) +
                  '</div>';
            state.breakMode = vmode;
            break;

        // ["Pp_tag", tag, content]
        case "Pp_tag":
            ret = this.pp2HTML(msg[2], state);
            ret = `<span class="${msg[1]}">` + ret + `</span>`;
            break;

        case "Pp_force_newline":
            ret = "<br/>";
            state.margin = null;
            break;

        // ["Pp_print_break", nspaces, indent-offset]
        case "Pp_print_break":
            ret = "";
            state.margin = null;
            if (state.breakMode === 'vertical'|| (msg[1] == 0 && msg[2] > 0 /* XXX need to count columns etc. */)) {
                ret = "<br/>";
            } else if (state.breakMode === 'horizontal') {
                ret = `<span class="Pp_break" data-break="${msg.slice(1)}"> </span>`;
            } else if (state.breakMode === 'skip-vertical') {
                state.breakMode = 'vertical';
            }
            break;
        
        case "Pp_empty":
            ret = "";
            break;

        default:
            console.warn("unhandled Format case", msg);
            ret = msg;
        }
        return ret;
    }

    adjustBreaks(jdom) {
        var width = jdom.width(),
            hboxes = jdom.find('.Pp_box[data-mode="horizontal"]');

        for (let el of hboxes) {
            let hbox = $(el);
            if (hbox.position().left + hbox.width() > width) {
                var brk;
                for (let el of hbox.children('.Pp_break')) {
                    let t = $(el);
                    if (t.position().left < width) brk = t;
                    else break;
                }
                if (brk) {
                    console.log(brk);
                    brk.text("\n");
                }
            }
        }
    }

}



// Local Variables:
// js-indent-level: 4
// End:
