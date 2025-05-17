/// <reference types="vite/client" />

// CSS modules
type CSSModuleClasses = { readonly [key: string]: string }
declare module '*.module.css' {
  const classes: CSSModuleClasses
  export default classes
}

declare module '*.css' {
  const css: string
  export default css
}
