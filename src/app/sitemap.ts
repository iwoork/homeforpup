import { MetadataRoute } from 'next';

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://homeforpup.com';

async function fetchDynamicRoutes() {
  try {
    // Fetch public kennels
    const kennelsResponse = await fetch(`${baseUrl}/api/kennels`, {
      next: { revalidate: 86400 }, // Revalidate daily
    });
    const kennels = kennelsResponse.ok ? await kennelsResponse.json() : [];

    // Fetch public users (breeders and adopters)
    const usersResponse = await fetch(`${baseUrl}/api/users/available`, {
      next: { revalidate: 86400 }, // Revalidate daily
    });
    const users = usersResponse.ok ? await usersResponse.json() : [];

    return { kennels, users };
  } catch (error) {
    console.error('Error fetching dynamic routes for sitemap:', error);
    return { kennels: [], users: [] };
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { kennels, users } = await fetchDynamicRoutes();

  // Static routes
  const staticRoutes = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/browse`,
      lastModified: new Date(),
      changeFrequency: 'hourly' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/breeds`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/breeders`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/users`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    },
    {
      url: `${baseUrl}/adoption-guide`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/kennel-management`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    },
  ];

  // Dynamic kennel routes
  const kennelRoutes = kennels
    .filter((kennel: any) => kennel.isPublic)
    .map((kennel: any) => ({
      url: `${baseUrl}/kennels/${kennel.id}`,
      lastModified: new Date(kennel.updatedAt || kennel.createdAt),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));

  // Dynamic user routes
  const userRoutes = users.map((user: any) => ({
    url: `${baseUrl}/users/${user.userId}`,
    lastModified: new Date(user.updatedAt || user.createdAt),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }));

  // Dynamic breeder routes
  const breederRoutes = users
    .filter((user: any) => user.userType === 'dog-professional' || user.userType === 'both')
    .map((user: any) => ({
      url: `${baseUrl}/breeders/${user.userId}`,
      lastModified: new Date(user.updatedAt || user.createdAt),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));

  return [
    ...staticRoutes,
    ...kennelRoutes,
    ...userRoutes,
    ...breederRoutes,
  ];
}
