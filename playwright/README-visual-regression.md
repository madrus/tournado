# Visual Regression Testing

This document describes the visual regression tests implemented for the Tournado application.

## Overview

Visual regression tests capture screenshots of key pages and components in both light and dark themes to ensure visual consistency across theme changes and updates.

## Test Coverage

The visual regression tests cover:

1. **Tournaments List Page** - Admin tournaments management interface
2. **Teams List Page** - Admin teams management interface
3. **Forms with CustomDatePicker** - Tournament and team creation forms
4. **ActionLinkPanel Components** - Homepage panels with different color accents

## Running Visual Regression Tests

### Prerequisites

1. Ensure the development server is running:

   ```bash
   pnpm dev
   ```

2. Make sure you have the latest Playwright browsers installed:

   ```bash
   pnpm exec playwright install
   ```

### Running Tests

#### Run All Visual Regression Tests

```bash
pnpm exec playwright test visual-regression.spec.ts --project=visual-regression
```

#### Run Specific Test Groups

```bash
# Tournaments list tests only
pnpm exec playwright test visual-regression.spec.ts --grep "Tournaments List Page" --project=visual-regression

# Teams list tests only
pnpm exec playwright test visual-regression.spec.ts --grep "Teams List Page" --project=visual-regression

# Form tests only
pnpm exec playwright test visual-regression.spec.ts --grep "Forms with CustomDatePicker" --project=visual-regression

# ActionLinkPanel tests only
pnpm exec playwright test visual-regression.spec.ts --grep "ActionLinkPanel Components" --project=visual-regression
```

#### Run Light Theme Tests Only

```bash
pnpm exec playwright test visual-regression.spec.ts --grep "light theme" --project=visual-regression
```

#### Run Dark Theme Tests Only

```bash
pnpm exec playwright test visual-regression.spec.ts --grep "dark theme" --project=visual-regression
```

## Test Configuration

### Viewport Settings

- **Desktop**: 1280x720 pixels for consistent visual testing
- Tests use desktop viewport to capture full page layouts

### Theme Control

- Tests explicitly control theme by adding/removing `dark` class on `document.documentElement`
- Light theme: `document.documentElement.classList.remove('dark')`
- Dark theme: `document.documentElement.classList.add('dark')`

### Screenshot Settings

- **Full page**: `fullPage: true` to capture entire page content
- **Timeout**: 10 seconds for screenshot capture
- **Format**: PNG files with descriptive names

## Screenshot Files

The tests generate the following screenshot files:

### Tournaments List

- `tournaments-list-light-theme.png`
- `tournaments-list-dark-theme.png`

### Teams List

- `teams-list-light-theme.png`
- `teams-list-dark-theme.png`

### Tournament Form with DatePicker

- `tournament-form-datepicker-light-theme.png`
- `tournament-form-datepicker-dark-theme.png`

### Team Form

- `team-form-light-theme.png`
- `team-form-dark-theme.png`

### ActionLinkPanel Components

- `actionlinkpanel-light-theme.png`
- `actionlinkpanel-dark-theme.png`

## Test Structure

Each test follows this pattern:

1. **Navigate** to the target page
2. **Wait** for page load and hydration
3. **Set theme** (light or dark)
4. **Interact** with page (fill forms, open date pickers)
5. **Capture screenshot** with descriptive filename

## Maintenance

### Updating Screenshots

When making intentional UI changes, you may need to update the baseline screenshots:

1. Run the tests to see which screenshots need updating
2. Review the differences to ensure they're expected
3. Update the baseline screenshots by running:

   ```bash
   pnpm exec playwright test visual-regression.spec.ts --project=visual-regression --update-snapshots
   ```

### Adding New Tests

To add visual regression tests for new pages/components:

1. Add a new test group in `visual-regression.spec.ts`
2. Follow the existing pattern for navigation, theme control, and screenshot capture
3. Use descriptive test names and screenshot filenames
4. Include both light and dark theme variants

## Troubleshooting

### Common Issues

1. **Screenshots not matching**: Check if the page content has changed or if there are timing issues
2. **Theme not applying**: Ensure the `dark` class is being added/removed correctly
3. **Date picker not opening**: Check if the button selector has changed
4. **Page not loading**: Verify the development server is running and accessible

### Debug Mode

Run tests with debug mode to see what's happening:

```bash
pnpm exec playwright test visual-regression.spec.ts --project=visual-regression --debug
```

### View Screenshots

Screenshots are saved in the `test-results` directory. You can view them to understand what the tests are capturing.

## Integration with CI/CD

These visual regression tests are designed to run in CI/CD pipelines to catch visual regressions before they reach production. The tests will fail if screenshots don't match the baseline, indicating a potential visual regression.
