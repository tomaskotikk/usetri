import { describe, it, expect } from 'vitest'
import {
  getGroupsForService,
  getPopularServices,
  getServiceBySlug,
  getServices,
} from './supabase-stub'

describe('supabase-stub', () => {
  it('getServices resolves the full catalogue', async () => {
    const list = await getServices()
    expect(list.length).toBeGreaterThan(30)
  })

  it('getServiceBySlug resolves the matching service', async () => {
    const found = await getServiceBySlug('spotify-family')
    expect(found?.name).toBe('Spotify')
  })

  it('getServiceBySlug resolves undefined for an unknown slug', async () => {
    expect(await getServiceBySlug('does-not-exist')).toBeUndefined()
  })

  it('getGroupsForService returns groups that never oversubscribe the plan', async () => {
    const groups = await getGroupsForService('netflix-premium')
    expect(groups.length).toBeGreaterThan(0)
    for (const g of groups) {
      expect(g.seatsTaken).toBeGreaterThan(0)
      expect(g.seatsTaken).toBeLessThan(g.seatsTotal + 1)
    }
  })

  it('getGroupsForService is deterministic across calls', async () => {
    const a = await getGroupsForService('spotify-family')
    const b = await getGroupsForService('spotify-family')
    expect(a).toEqual(b)
  })

  it('getPopularServices returns the most in-demand services first', async () => {
    const popular = await getPopularServices(5)
    expect(popular).toHaveLength(5)
    for (let i = 1; i < popular.length; i++) {
      expect(popular[i - 1].openGroups).toBeGreaterThanOrEqual(popular[i].openGroups)
    }
  })
})
