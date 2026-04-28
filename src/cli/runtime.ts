import { CrossReferenceAdapter } from '../adapters/cross-reference-adapter.js';
import { CrossFileRuleAdapter } from '../adapters/cross-file-rule-adapter.js';
import { ContentPolicyAdapter } from '../adapters/content-policy-adapter.js';
import { FileSchemaAdapter } from '../adapters/file-schema-adapter.js';
import { FilenameAdapter } from '../adapters/filename-adapter.js';
import { FolderStructureAdapter } from '../adapters/folder-structure-adapter.js';
import { FrontmatterSchemaAdapter } from '../adapters/frontmatter-schema-adapter.js';
import { GuidanceAdapter } from '../adapters/guidance-adapter.js';
import { MarkdownTemplateAdapter } from '../adapters/markdown-template-adapter.js';
import { PathPolicyAdapter } from '../adapters/path-policy-adapter.js';
import { ValidationEngine } from '../core/validator-framework.js';

export function createDefaultEngine(): ValidationEngine {
  return new ValidationEngine([
    new FilenameAdapter(),
    new PathPolicyAdapter(),
    new FolderStructureAdapter(),
    new MarkdownTemplateAdapter(),
    new FrontmatterSchemaAdapter(),
    new FileSchemaAdapter(),
    new CrossReferenceAdapter(),
    new CrossFileRuleAdapter(),
    new ContentPolicyAdapter(),
    new GuidanceAdapter(),
  ]);
}
