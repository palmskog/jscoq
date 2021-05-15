
class SettingsPanel {
    html() {
        return `
        <div class="settings-panel">
            <div>
                <label for="settings--theme">
                    <div class="setting">
                        Light switch</label>
                        <input id="settings--theme" type="checkbox" class="switch">
                    </div>
                </label>
                <label for="settings--company">
                    <div class="setting">
                        Enable company-coq
                        <input id="settings--company" type="checkbox" class="switch">
                    </div>
                </label>
            </div>
            <div class="links">
                <a href="https://coq.zulipchat.com/#narrow/stream/256336-jsCoq" title="Zulip" class="link-to-zulip"></a>
                <a href="https://github.com/jscoq/jscoq" title="GitHub" class="link-to-github"></a>
            </div>
        </div>
        `;
    }

    constructor(model) {
        this.el = $(this.html());
        this.model = model || new CoqSettings();

        this.el.find('#settings--theme').on('change', ev => {
            this.model.theme.value = ev.target.checked ? 'light' : 'dark';
        });
        this.el.find('#settings--company').on('change', ev => {
            this.model.company.value = ev.target.checked;
        });
    }

    configure(options) {
        var v;
        if (v = options.theme) {
            this.el.attr('data-theme', v);
            this.model.theme.value = v;
            this.el.find('#settings--theme').attr('checked', v == 'light');
        }
        if ((v = options.company) !== undefined) {
            this.model.theme.company = v;
            this.el.find('#settings--company').attr('checked', v);
        }
    }

    show() {
        if (this.el.parent().length == 0)
            $(document.body).append(this.el);
        this.el.show();
    }

    hide() {
        this.el.hide();
    }

    toggle() {
        if (this.isVisible()) this.hide();
        else this.show();
        return this.isVisible();
    }

    isVisible() {
        return this.el.is(':visible');
    }
}


class CoqSettings {
    constructor() {
        this.theme = new ReactiveVar('light');
        this.company = new ReactiveVar(true);
    }
}

class ReactiveVar {
    constructor(value) {
        this._value = value;
        this.observers = [];
    }

    get value() { return this._value; }
    set value(val) {
        if (val !== this._value) {  // do not trigger for nothing
            this._value = val;
            for (let o of this.observers) {
                o(val);
            }
        }
    }

    observe(callback) {
        this.observers.push(callback);
    }
}