# Service Worker (sw.js)

This document describes the service worker (`public/sw.js`) used in the Tournado project.

## Overview

The service worker currently provides basic install, activate, and fetch event handling. It is designed to be minimal and developer-friendly, with the potential for future PWA (Progressive Web App) features.

## Logging Control: `SW_DEBUG`

A top-level variable, `SW_DEBUG`, controls the verbosity of service worker logging:

```js
const SW_DEBUG = false
```

- **Default (`false`)**: Only essential events are logged (install, activate, and errors).
- **Debug (`true`)**: Detailed logs are enabled, including every fetch event handled by the service worker.

### How to Enable Debug Logging

To enable detailed logging, set the variable at the top of `public/sw.js`:

```js
const SW_DEBUG = true
```

This is useful for debugging fetch handling or diagnosing service worker issues. **Do not leave this enabled in production unless necessary, as it will flood the console.**

## Future Extensibility

- This file is a good place to document any future PWA features, such as offline caching, push notifications, or background sync.
- If you add new features or configuration options, please update this document for other developers.

## Related Files

- `public/sw.js`: The service worker script.

---

_Last updated: [DATE]_
