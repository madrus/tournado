# Data Freshness

When editing or adding tournaments/teams, navigating back to the list page using the browser's back/forward buttons could show stale data due to route-level caching in React Router.

To ensure the list always shows fresh data after edits/additions:

- In the tournaments and teams list pages, a `popstate` event listener is added.
- When the user navigates back (or forward) using the browser's navigation, the event triggers a data refetch (revalidation) for the list page.
- This is implemented using React Router's `useRevalidator` hook (or a similar custom refetch logic if not using Remix).

**Example:**

```js
import { useEffect } from 'react'
import { useRevalidator } from 'react-router'

const revalidator = useRevalidator()
useEffect(() => {
	const handlePopState = () => {
		revalidator.revalidate()
	}
	window.addEventListener('popstate', handlePopState)
	return () => window.removeEventListener('popstate', handlePopState)
}, [revalidator])
```

### Result

- Navigating back to the list page always triggers a fresh data load, ensuring users see the latest tournament or team information.
- Navigating via app links or context menu always fetches fresh data by default.
