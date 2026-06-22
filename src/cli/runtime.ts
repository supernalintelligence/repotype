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
import { BoardYamlCompletenessAdapter } from '../adapters/board-yaml-completeness-adapter.js';
import { BoardStoryCompletenessAdapter } from '../adapters/board-story-completeness-adapter.js';
import { CompanyYamlAdapter } from '../adapters/company-yaml-adapter.js';
import { GitignorePolicyAdapter } from '../adapters/gitignore-policy-adapter.js';
import { CronRegistryDriftAdapter } from '../adapters/cron-registry-drift-adapter.js';
import { SentinelContentAdapter } from '../adapters/sentinel-content-adapter.js';
import { SkillBestPracticesAdapter } from '../adapters/skill-best-practices-adapter.js';
import { WorkflowGateAdapter } from '../adapters/workflow-gate-adapter.js';
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
    new SentinelContentAdapter(),
    new WorkflowGateAdapter(),
    new GuidanceAdapter(),
    new BoardYamlCompletenessAdapter(),
    new BoardStoryCompletenessAdapter(),
    new CompanyYamlAdapter(),
    new GitignorePolicyAdapter(),
    new CronRegistryDriftAdapter(),
    new SkillBestPracticesAdapter(),
  ]);
}
