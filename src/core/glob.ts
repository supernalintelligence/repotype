import { minimatch } from 'minimatch';

export function matchesGlob(pathValue: string, glob: string): boolean {
  return minimatch(pathValue, glob, { dot: true, nocase: false, nocomment: true });
}
