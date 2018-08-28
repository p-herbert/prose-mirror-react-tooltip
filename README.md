# prose-mirror-react-tooltip

General purpose ProseMirror tooltip using React. Based on [quartzy/prosemirror-suggestions](https://github.com/quartzy/prosemirror-suggestions).

# Usage

```js
import { MentionDropdown } from 'path/to/react/component';
import { createPlugin, DropdownWrapper } from 'prose-mirror-react-tooltip';

class MentionDropdownWrapper extends DropdownWrapper {
    constructor({ view }) {
        super({view, DropDownComponent: MentionDropdown });
    }
}

function matcher({ $position }) {
    const textFrom = $position.before();
    const textTo = $position.end();

    const text = $position.doc.textBetween(textFrom, textTo, '\0', '\0');
    // Allow first and last name
    const regex = /\B(\@+)([\w\-]*)( [\w\-]*){0,1}/gim;

    let from;
    let to;
    let symbol;
    let handle;
    let match = regex.exec(text);

    // Get the last match
    while (match) {
        // The absolute position of the match in the document
        from = match.index + $position.start();
        to = from + match[0].length;

        // Get capture groups
        symbol = match[1];
        handle = match[2];

        // Handle space
        if (match[3]) {
            handle = `${handle} ${match[3]}`;
        }

        handle = handle.trim();

        match = regex.exec(text);
    }

    // Only allow single '@' symbol
    if (symbol && (symbol.match(/\@/g) || []).length <= 1) {
        if (from < $position.pos && to >= $position.pos) {
            return { range: { from, to }, text: handle };
        }
    }

    return null;
}

const {
    plugin: mentions,
    getPluginState: getMentionsState,
    closePlugin: closeMentionsPlugin,
    } = createPlugin({ className: 'mention', matcher, DropdownWrapper: MentionDropdownWrapper });
```

# Acknowledgments

Thanks to [Sunsama](https://sunsama.com) for allowing me to open source this project.

