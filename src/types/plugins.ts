// MCP插件系统类型定义

export interface MCPPlugin {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  category: PluginCategory;
  dependencies: string[];
  permissions: PluginPermission[];
  icon?: string;
  homepage?: string;
  repository?: string;
  license: string;
  
  // 插件生命周期
  install(): Promise<void>;
  activate(): Promise<void>;
  deactivate(): Promise<void>;
  uninstall(): Promise<void>;
  
  // 插件功能
  execute(command: string, params: any): Promise<any>;
  getCommands(): PluginCommand[];
  getSchema(): JSONSchema7;
}

export enum PluginCategory {
  ANALYSIS = 'analysis',
  DOCUMENTATION = 'documentation',
  VISUALIZATION = 'visualization',
  ARCHITECTURE = 'architecture',
  CODE_GENERATION = 'code-generation',
  INTEGRATION = 'integration',
  UTILITY = 'utility',
  MODELING = 'modeling'
}

export enum PluginPermission {
  READ_FILES = 'read-files',
  WRITE_FILES = 'write-files',
  NETWORK_ACCESS = 'network-access',
  SYSTEM_INFO = 'system-info',
  USER_DATA = 'user-data',
  PROJECT_DATA = 'project-data',
  READ_PROJECT = 'read-project',
  GENERATE_DIAGRAMS = 'generate-diagrams',
  ANALYZE_CODE = 'analyze-code'
}

export interface PluginCommand {
  name: string;
  description: string;
  parameters: PluginParameter[];
  examples?: string[];
}

// 别名定义
export type MCPCommand = PluginCommand;
export type MCPParameter = PluginParameter;

export interface PluginParameter {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  description: string;
  required?: boolean;
  default?: any;
  enum?: string[];
  defaultValue?: any;
}

export interface PluginMetadata {
  id: string;
  name: string;
  version: string;
  status: PluginStatus;
  registeredAt: Date;
  installedAt?: Date;
  activatedAt?: Date;
  lastUsed?: Date;
  usageCount: number;
  rating?: number;
  reviews?: PluginReview[];
}

export enum PluginStatus {
  REGISTERED = 'registered',
  INSTALLING = 'installing',
  INSTALLED = 'installed',
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ERROR = 'error',
  UPDATING = 'updating',
  ACTIVATING = 'activating',
  DEACTIVATING = 'deactivating'
}

export interface PluginReview {
  id: string;
  userId: string;
  rating: number;
  comment: string;
  createdAt: Date;
}

export interface PluginInstallOptions {
  version?: string;
  force?: boolean;
  skipDependencies?: boolean;
}

export interface PluginSearchFilters {
  category?: PluginCategory;
  author?: string;
  minRating?: number;
  tags?: string[];
  sortBy?: 'popularity' | 'rating' | 'updated' | 'name';
  sortOrder?: 'asc' | 'desc';
}

export interface PluginMarketplaceItem {
  plugin: MCPPlugin;
  metadata: PluginMetadata;
  downloadCount: number;
  lastUpdated: Date;
  screenshots?: string[];
  documentation?: string;
  changelog?: PluginChangelog[];
}

export interface PluginChangelog {
  version: string;
  date: Date;
  changes: string[];
  breaking?: boolean;
}

export interface DomainModelingPlugin extends MCPPlugin {
  analyzeDomain(businessDescription: string, analysisDepth?: string): Promise<any>;
  identifyEntities(domainContext: string, includeValueObjects?: boolean): Promise<any>;
  designAggregates(entities: any[], businessRules?: any[]): Promise<any>;
  generateDomainModel(modelDefinition: any, language?: string, framework?: string): Promise<any>;
  createDomainDiagram(domainModel: any, diagramType?: string, format?: string): Promise<string>;
  suggestDomainServices(aggregates: any[], businessProcesses?: any[]): Promise<any[]>;
  validateDomainModel(domainModel: any): Promise<any>;
}

export interface ArchitectureDesignPlugin extends MCPPlugin {
  analyzeRequirements(requirements: any, constraints?: any): Promise<any>;
  designSystemArchitecture(systemType: string, scale: string, requirements: any): Promise<any>;
  designMicroservices(businessDomains: any[], decompositionStrategy?: string): Promise<any>;
  createArchitectureDiagram(architecture: any, diagramType?: string, format?: string): Promise<string>;
  evaluateArchitecture(architecture: any, criteria?: string[]): Promise<any>;
  suggestOptimizations(currentArchitecture: any, performanceIssues?: any[]): Promise<any[]>;
  generateApiDesign(services: any[], apiStyle?: string): Promise<any>;
  designDataArchitecture(dataRequirements: any, consistencyRequirements?: string): Promise<any>;
}

export interface UseCaseAnalysisPlugin extends MCPPlugin {
  analyzeRequirements(document: string, analysisType?: string): Promise<any>;
  generateUseCase(params: any): Promise<any>;
  createUseCaseDiagram(params: any): Promise<string>;
  validateUseCases(useCases: any[]): Promise<any>;
  suggestTestScenarios(useCase: any, coverage?: string): Promise<any[]>;
}

export interface DomainModelPlugin extends MCPPlugin {
  generateUseCaseDiagram(requirements: string): Promise<string>;
  extractActors(text: string): Promise<string[]>;
  identifyUseCases(text: string): Promise<UseCase[]>;
}

export interface DomainModelPlugin extends MCPPlugin {
  generateDomainModel(description: string): Promise<DomainModel>;
  extractEntities(text: string): Promise<Entity[]>;
  identifyRelationships(entities: Entity[]): Promise<Relationship[]>;
}

export interface CodeAnalysisPlugin extends MCPPlugin {
  analyzeCodeStructure(code: string, language: string): Promise<CodeStructure>;
  generateClassDiagram(code: string): Promise<string>;
  extractDependencies(code: string): Promise<Dependency[]>;
}

export interface DocumentPlugin extends MCPPlugin {
  generateDocument(template: string, data: any): Promise<string>;
  convertFormat(content: string, from: string, to: string): Promise<string>;
  validateDocument(content: string, schema: any): Promise<ValidationResult>;
}

export interface ArchitecturePlugin extends MCPPlugin {
  generateArchitectureDiagram(description: string): Promise<string>;
  analyzeArchitecturePatterns(description: string): Promise<ArchitecturePattern[]>;
  suggestImprovements(architecture: any): Promise<Suggestion[]>;
}

// 辅助类型
export interface UseCase {
  id: string;
  name: string;
  description: string;
  actor: string;
  preconditions: string[];
  steps: string[];
  postconditions: string[];
}

export interface DomainModel {
  entities: Entity[];
  relationships: Relationship[];
  valueObjects: ValueObject[];
  aggregates: Aggregate[];
}

export interface Entity {
  id: string;
  name: string;
  attributes: Attribute[];
  methods: Method[];
}

export interface Relationship {
  id: string;
  type: 'association' | 'aggregation' | 'composition' | 'inheritance';
  source: string;
  target: string;
  cardinality: string;
}

export interface ValueObject {
  id: string;
  name: string;
  attributes: Attribute[];
}

export interface Aggregate {
  id: string;
  name: string;
  root: string;
  entities: string[];
}

export interface Attribute {
  name: string;
  type: string;
  required: boolean;
  description?: string;
}

export interface Method {
  name: string;
  parameters: Parameter[];
  returnType: string;
  description?: string;
}

export interface Parameter {
  name: string;
  type: string;
  required: boolean;
}

export interface CodeStructure {
  classes: ClassInfo[];
  interfaces: InterfaceInfo[];
  functions: FunctionInfo[];
  modules: ModuleInfo[];
}

export interface ClassInfo {
  name: string;
  methods: Method[];
  properties: Attribute[];
  extends?: string;
  implements?: string[];
}

export interface InterfaceInfo {
  name: string;
  methods: Method[];
  extends?: string[];
}

export interface FunctionInfo {
  name: string;
  parameters: Parameter[];
  returnType: string;
  isAsync: boolean;
}

export interface ModuleInfo {
  name: string;
  exports: string[];
  imports: string[];
}

export interface Dependency {
  name: string;
  version?: string;
  type: 'production' | 'development' | 'peer';
  source: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  path: string;
  message: string;
  code: string;
}

export interface ValidationWarning {
  path: string;
  message: string;
  code: string;
}

export interface ArchitecturePattern {
  name: string;
  description: string;
  applicability: string;
  consequences: string[];
  implementation: string;
}

export interface Suggestion {
  type: 'improvement' | 'warning' | 'error';
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
  effort: 'low' | 'medium' | 'high';
  category: string;
}

// JSON Schema类型（简化版）
export interface JSONSchema7 {
  type?: string;
  properties?: { [key: string]: JSONSchema7 };
  required?: string[];
  items?: JSONSchema7;
  enum?: any[];
  description?: string;
}

// 插件错误类型
export class PluginError extends Error {
  constructor(
    message: string,
    public pluginId: string,
    public code: string
  ) {
    super(message);
    this.name = 'PluginError';
  }
}

export class PluginNotFoundError extends PluginError {
  constructor(pluginId: string) {
    super(`Plugin not found: ${pluginId}`, pluginId, 'PLUGIN_NOT_FOUND');
    this.name = 'PluginNotFoundError';
  }
}

export class PluginExecutionError extends PluginError {
  constructor(pluginId: string, originalError: string) {
    super(`Plugin execution failed: ${originalError}`, pluginId, 'PLUGIN_EXECUTION_ERROR');
    this.name = 'PluginExecutionError';
  }
}

export class PluginValidationError extends PluginError {
  constructor(pluginId: string, validationErrors: string[]) {
    super(`Plugin validation failed: ${validationErrors.join(', ')}`, pluginId, 'PLUGIN_VALIDATION_ERROR');
    this.name = 'PluginValidationError';
  }
}

export class PluginDependencyError extends PluginError {
  constructor(pluginId: string, missingDependencies: string[]) {
    super(`Missing dependencies: ${missingDependencies.join(', ')}`, pluginId, 'PLUGIN_DEPENDENCY_ERROR');
    this.name = 'PluginDependencyError';
  }
}