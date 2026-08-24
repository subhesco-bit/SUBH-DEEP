import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import MarketplacePage from '../pages/MarketplacePage'
import * as api from '../services/api'
import { useQuery } from '@tanstack/react-query'

// Vitest 4 / modern ESM enforce immutable module namespace objects, so
// `vi.spyOn(namespace, 'export')` on @tanstack/react-query no longer works
// (see https://vitest.dev/guide/browser/#limitations). Mock the module
// instead of spying on its namespace export.
vi.mock('@tanstack/react-query', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    useQuery: vi.fn(),
  }
})

describe('MarketplacePage', () => {
  it('renders product cards from API', async () => {
    const mockData = {
      products: [
        { id: 'p1', name: 'Test Grain', base_price: 100, unit_symbol: 'kg', category_name: 'Grains', state_name: 'Assam' },
      ],
      pagination: { total: 1, totalPages: 1 }
    }

    vi.mocked(useQuery).mockReturnValue({ data: mockData, isLoading: false, error: null })

    render(<MarketplacePage />)

    expect(screen.getByText('Marketplace')).toBeInTheDocument()
    expect(screen.getByText('Test Grain')).toBeInTheDocument()
  })
})
