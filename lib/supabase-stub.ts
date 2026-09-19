import { getService, services, type Service } from '@/types/service'
import { groupsForService, type ServiceGroup } from './service-groups'

/**
 * Stand-in for the future Supabase client. Signatures match what the real
 * queries will look like, so swapping the bodies out later doesn't touch
 * any component.
 */

export async function getServices(): Promise<Service[]> {
  return services
}

export async function getServiceBySlug(slug: string): Promise<Service | undefined> {
  return getService(slug)
}

export async function getGroupsForService(slug: string): Promise<ServiceGroup[]> {
  const service = getService(slug)
  return service ? groupsForService(service) : []
}

export async function getPopularServices(limit = 8): Promise<Service[]> {
  return [...services].sort((a, b) => b.openGroups - a.openGroups).slice(0, limit)
}
