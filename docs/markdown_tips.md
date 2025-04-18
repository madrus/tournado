# Markdown Tips

## Flexible Alerts

### Basics

Use [flexible alerts](https://github.com/fzankl/docsify-plugin-flexible-alerts) to highlight important information.

Modify or add a new blockquote so it matches required syntax with default style **"callout"** like shown in the following examples:

> [!NOTE]
> An alert of type 'note' using global style 'callout'.
> Sample alert using type TIP

> [!TIP]
> An alert of type 'tip' using global style 'callout'.
> Sample alert using type WARNING

> [!WARNING]
> An alert of type 'warning' using global style 'callout'.
> Sample alert using type ATTENTION

> [!ATTENTION]
> An alert of type 'attention' using global style 'callout'.

Same alerts using style **"flat"** look like this:

> [!NOTE|style:flat]
> An alert of type 'note' using global style 'callout'.
> Sample alert using type TIP

> [!TIP|style:flat]
> An alert of type 'tip' using global style 'callout'.
> Sample alert using type WARNING

> [!WARNING|style:flat]
> An alert of type 'warning' using global style 'callout'.
> Sample alert using type ATTENTION

> [!ATTENTION|style:flat]
> An alert of type 'attention' using global style 'callout'.

The style can be set globally in `docsify-settings.js`:

```js
'flexible-alerts': {
  // style: 'callout', // default
  style: 'flat',
},
```

### Customizations

To use the plugin just modify an existing blockquote and prepend a line matching pattern [!type]. By default types NOTE, TIP, WARNING and ATTENTION are supported. You can extend the available types by providing a valid configuration (see below for an example).

> [!NOTE]
> An alert of type 'note' using global style, e.g. 'callout'.

> [!NOTE|style:flat]
> An alert of type 'note' using alert specific style 'flat' which overrides global style 'callout'.
