// TypeScript types for Dokploy API responses

export interface Domain {
  domainId: string;
  host: string;
  path: string;
  port: number;
  https: boolean;
  certificateType?: string;
}

export interface Application {
  applicationId: string;
  name: string;
  appName: string;
  description?: string;
  buildType?: string;
  dockerfile?: string;
  dockerImage?: string;
  sourceType?: string;
  repository?: string;
  branch?: string;
  buildPath?: string;
  command?: string;
  env?: string;
  domains?: Domain[];
  createdAt?: string;
  githubId?: string;
  registryId?: string;
  serverId?: string;
}

export interface Compose {
  composeId: string;
  name: string;
  appName: string;
  description?: string;
  composeFile?: string;
  sourceType?: string;
  repository?: string;
  branch?: string;
  env?: string;
  domains?: Domain[];
  createdAt?: string;
}

export interface Postgres {
  postgresId: string;
  name: string;
  appName: string;
  description?: string;
  databaseName?: string;
  databaseUser?: string;
  databasePassword?: string;
  dockerImage?: string;
  command?: string;
  env?: string;
  createdAt?: string;
}

export interface MySQL {
  mysqlId: string;
  name: string;
  appName: string;
  description?: string;
  databaseName?: string;
  databaseUser?: string;
  databasePassword?: string;
  databaseRootPassword?: string;
  dockerImage?: string;
  command?: string;
  env?: string;
  createdAt?: string;
}

export interface MariaDB {
  mariadbId: string;
  name: string;
  appName: string;
  description?: string;
  databaseName?: string;
  databaseUser?: string;
  databasePassword?: string;
  databaseRootPassword?: string;
  dockerImage?: string;
  command?: string;
  env?: string;
  createdAt?: string;
}

export interface Mongo {
  mongoId: string;
  name: string;
  appName: string;
  description?: string;
  databaseName?: string;
  databaseUser?: string;
  databasePassword?: string;
  dockerImage?: string;
  command?: string;
  env?: string;
  createdAt?: string;
}

export interface Redis {
  redisId: string;
  name: string;
  appName: string;
  description?: string;
  password?: string;
  dockerImage?: string;
  command?: string;
  env?: string;
  createdAt?: string;
}

export interface Environment {
  environmentId: string;
  name: string;
  applications?: Application[];
  compose?: Compose[];
  postgres?: Postgres[];
  mysql?: MySQL[];
  mariadb?: MariaDB[];
  mongo?: Mongo[];
  redis?: Redis[];
}

export interface Project {
  projectId: string;
  name: string;
  description?: string;
  environments: Environment[];
  createdAt?: string;
}

export interface DokployData {
  projects: Project[];
  totalApplications: number;
  totalDatabases: number;
  totalCompose: number;
}
