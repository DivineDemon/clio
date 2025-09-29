import type { ReadmeJob, ReadmeVersion, Repository } from "@prisma/client";

export interface ReadmeJobWithRelations extends ReadmeJob {
  repository?: Repository | null;
  versions?: ReadmeVersion[];
  user?: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  } | null;
}

export interface ReadmeVersionWithJob extends ReadmeVersion {
  job?: ReadmeJobWithRelations | null;
}
