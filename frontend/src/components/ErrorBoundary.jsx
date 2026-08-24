import { Component } from 'react'

/**
 * Root error boundary for the app shell.
 *
 * This file was imported by App.jsx (`import ErrorBoundary from
 * './components/ErrorBoundary'`) but never actually existed anywhere in the
 * repo (confirmed via git history) — the import silently broke `vite build`
 * for every visitor, independent of and predating the C3 route-splitting
 * work in App.jsx. Recreated as a minimal, standard React error boundary so
 * the build can complete; not part of the C3/H9/H10/H11/M10 fix set this
 * session was scoped to.
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Unhandled error caught by ErrorBoundary:', error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen p-8">
          <div className="text-center max-w-md">
            <h1 className="text-xl font-semibold mb-2">Something went wrong</h1>
            <p className="text-sm text-muted-foreground mb-4">
              An unexpected error occurred. Try reloading the page.
            </p>
            <button
              type="button"
              onClick={() => {
                this.handleReset()
                window.location.reload()
              }}
              className="px-4 py-2 rounded bg-primary text-primary-foreground text-sm"
            >
              Reload
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
