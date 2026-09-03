## Variant: Terminal-native

### Design stance
The portfolio IS a shell session — the visitor operates it with commands, not clicks.

### Key choices
- Layout: single terminal window, boot log → ASCII mark → scrollback → prompt.
- Typography: JetBrains Mono everywhere, one size, tabular rhythm.
- Color: near-black paper, bone text, single amber accent; dim/faint grays for metadata.
- Interaction: real command parser (`help/about/stack/projects/articles/contact/clear`), clickable `$ chips` as command shortcuts, autofocus on click.

### Trade-offs
- Strong at: memorability, technical credibility, playfulness for developers.
- Weak at: skimmability for non-technical hirers; content hidden behind commands; SEO/accessibility needs extra care.

### Best for
- Audience of backend/dev-tool engineers who live in terminals.
