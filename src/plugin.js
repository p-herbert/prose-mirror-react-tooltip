import { Plugin, PluginKey } from 'prosemirror-state';
import { Decoration, DecorationSet } from 'prosemirror-view';

export function createPlugin({ className, matcher, DropdownWrapper }) {
    const clearKey = `clear_${className}s`;
    let dropdown = null;

    function onExit({ view }) {
        const { state: { tr }, dispatch } = view;
        dropdown && dropdown.hide();
        dropdown = null;
        dispatch(clearPlugin(tr));
    }

    function onChange({ view, state }) {
        if (!dropdown) {
            return;
        }
        const { active, text, range } = state;
        if (!active) {
            dropdown.hide();
            return;
        }
        dropdown.update(view, text, range);
    }

    function onEnter({ view, state }) {
        const { text, range } = state;
        dropdown = new DropdownWrapper({ view });
        if (text && range) {
            dropdown.update(view, text, range);
        }
        dropdown.show(view);
    }

    function getPluginState(state) {
        return plugin.getState(state);
    }

    function clearPlugin(tr) {
        return tr.setMeta(clearKey, true);
    }

    const plugin = new Plugin({
        key: new PluginKey(`${className}s`),
        state: {
            init() {
                return {
                    active: false,
                    range: {},
                    $range: {},
                    text: null,
                };
            },
            apply(tr, prev) {
                if (tr.getMeta(clearKey)) {
                    return {
                        active: false,
                        range: {},
                        $range: {},
                        text: null,
                    };
                }

                const { selection } = tr;
                const { to, from, $to, $from } = selection;
                const next = { ...prev };

                // There is no selection
                if (from === to) {
                    next.active = false;
                    const match = matcher({ $position: $from });
                    if (match) {
                        next.active = true;
                        next.range = match.range;
                        next.$range = { $from, $to };
                        next.text = match.text;
                    } else {
                        next.range = {};
                        next.$range = {};
                        next.text = null;
                    }
                }
                return next;
            },
        },
        view() {
            return {
                update: (view, prevState) => {
                    const next = this.key.getState(view.state);
                    const prev = this.key.getState(prevState);

                    // See how the state changed
                    const moved = prev.active && next.active && prev.range.from !== next.range.from;
                    const started = !prev.active && next.active;
                    const stopped = prev.active && !next.active;
                    const changed = !started && !stopped && prev.text !== next.text;

                    // Trigger the hooks when necessary
                    if (stopped || moved) {
                        onExit({ view, state: prev });
                    }
                    if (changed && !moved) {
                        onChange({ view, state: next });
                    }

                    if (started || moved) {
                        onEnter({ view, state: next });
                    }
                },
            };
        },
        props: {
            decorations(state) {
                const { active, range: { from, to } } = this.getState(state);

                if (!active) {
                    return null;
                }

                return DecorationSet.create(state.doc, [
                    Decoration.inline(from, to, {
                        nodeName: 'span',
                        class: className,
                    }),
                ]);
            },
        },
    });

    return {
        plugin,
        getPluginState,
        closePlugin(tr) {
            dropdown && dropdown.hide();
            dropdown = null;
            return clearPlugin(tr);
        },
    };
}

