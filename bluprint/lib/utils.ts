/**
 * Format bytes to human-readable string
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
}

/**
 * Storage helper for localStorage with type safety
 */
export const storage = {
  get<T>(key: string): T | null {
    if (typeof window === "undefined") return null;
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch {
      return null;
    }
  },

  set<T>(key: string, value: T): void {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error("Error saving to localStorage:", error);
    }
  },

  remove(key: string): void {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(key);
  },
};

export interface Project {
  id: string;
  roomType: string;
  files: Array<{
    name: string;
    type: string;
    size: number;
    preview?: string; // base64 preview for images
  }>;
  createdAt: number;
}

const PROJECTS_KEY = "bluprint_projects";

export const projectStorage = {
  getAll(): Project[] {
    return storage.get<Project[]>(PROJECTS_KEY) || [];
  },

  getById(id: string): Project | null {
    const projects = this.getAll();
    return projects.find((p) => p.id === id) || null;
  },

  save(project: Project): void {
    const projects = this.getAll();
    const existingIndex = projects.findIndex((p) => p.id === project.id);
    if (existingIndex >= 0) {
      projects[existingIndex] = project;
    } else {
      projects.push(project);
    }
    storage.set(PROJECTS_KEY, projects);
  },

  delete(id: string): void {
    const projects = this.getAll();
    const filtered = projects.filter((p) => p.id !== id);
    storage.set(PROJECTS_KEY, filtered);
  },
};
