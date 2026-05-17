import '@testing-library/jest-dom/vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App.jsx'
import { LanguageProvider } from './contexts/LanguageContext.jsx'

function page(label) {
  return function MockPage() {
    return <h1 data-testid="route-page">{label}</h1>
  }
}

vi.mock('./components/Home', () => ({ default: page('Home page') }))
vi.mock('./components/Calculator', () => ({ default: page('Calculator page') }))
vi.mock('./components/MLPipeline', () => ({ default: page('ML page') }))
vi.mock('./components/Examples', () => ({ default: page('Examples page') }))
vi.mock('./components/ExampleCalculator', () => ({ default: page('Example calculator page') }))
vi.mock('./components/ExampleMLFusion', () => ({ default: page('Example ML page') }))
vi.mock('./components/Docs', () => ({ default: page('Docs page') }))

function createStorage() {
  const store = new Map()

  return {
    getItem: vi.fn(key => store.get(key) ?? null),
    setItem: vi.fn((key, value) => store.set(key, String(value))),
    removeItem: vi.fn(key => store.delete(key)),
    clear: vi.fn(() => store.clear()),
  }
}

function renderAt(path) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <LanguageProvider>
        <App />
      </LanguageProvider>
    </MemoryRouter>
  )
}

beforeEach(() => {
  Object.defineProperty(window, 'localStorage', {
    configurable: true,
    value: createStorage(),
  })
})

afterEach(() => {
  cleanup()
  document.documentElement.classList.remove('dark')
})

describe('App routes', () => {
  const routes = [
    ['/', 'Home page'],
    ['/calculator', 'Calculator page'],
    ['/ml', 'ML page'],
    ['/examples', 'Examples page'],
    ['/examples/calculator', 'Example calculator page'],
    ['/examples/ml', 'Example ML page'],
    ['/docs', 'Docs page'],
  ]

  it.each(routes)('renders %s inside the shared layout', (path, label) => {
    renderAt(path)

    expect(screen.getAllByText('Fusion Lab')).toHaveLength(1)
    expect(screen.getByTestId('route-page')).toHaveTextContent(label)
  })
})

describe('dark mode', () => {
  it('initializes from localStorage and toggles the stored document theme', () => {
    window.localStorage.setItem('darkMode', 'true')

    renderAt('/')

    expect(document.documentElement).toHaveClass('dark')

    fireEvent.click(screen.getByTitle('Light mode'))

    expect(document.documentElement).not.toHaveClass('dark')
    expect(window.localStorage.getItem('darkMode')).toBe('false')
  })
})
