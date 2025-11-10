// API service for fetching Dokploy data
import type { Project, DokployData } from './types';

export class DokployAPI {
  private apiUrl: string;
  private apiKey: string;

  constructor(apiUrl: string, apiKey: string) {
    // Remove trailing slash if present
    this.apiUrl = apiUrl.endsWith('/') ? apiUrl.slice(0, -1) : apiUrl;
    this.apiKey = apiKey;
  }

  async fetchProjects(): Promise<Project[]> {
    try {
      const response = await fetch(`${this.apiUrl}/api/project.all`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'x-api-key': this.apiKey,
        },
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const projects = await response.json();
      return projects as Project[];
    } catch (error) {
      console.error('Failed to fetch projects:', error);
      throw error;
    }
  }

  async fetchAllData(): Promise<DokployData> {
    const projects = await this.fetchProjects();

    // Calculate totals
    let totalApplications = 0;
    let totalDatabases = 0;
    let totalCompose = 0;

    projects.forEach(project => {
      project.environments.forEach(env => {
        totalApplications += env.applications?.length || 0;
        totalCompose += env.compose?.length || 0;
        totalDatabases += (env.postgres?.length || 0) +
                         (env.mysql?.length || 0) +
                         (env.mariadb?.length || 0) +
                         (env.mongo?.length || 0) +
                         (env.redis?.length || 0);
      });
    });

    return {
      projects,
      totalApplications,
      totalDatabases,
      totalCompose,
    };
  }
}

export function createDokployAPI(): DokployAPI | null {
  // Try to get API credentials from various sources
  const apiUrl = import.meta.env.VITE_DOKPLOY_URL || 'https://dokploy.etdofresh.com';
  const apiKey = import.meta.env.VITE_DOKPLOY_API_KEY || '';

  if (!apiKey) {
    console.warn('No API key found. Please set VITE_DOKPLOY_API_KEY environment variable.');
    return null;
  }

  return new DokployAPI(apiUrl, apiKey);
}
