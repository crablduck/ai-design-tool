// 文档类型定义 - 可扩展文档生成引擎核心

// 基础文档类型
export interface BaseDocument {
  id: string;
  type: string;
  title: string;
  content: any;
  metadata: DocumentMetadata;
  createdAt: Date;
  updatedAt: Date;
}

// 文档元数据
export interface DocumentMetadata {
  version: string;
  author: string;
  tags: string[];
  description?: string;
  exportFormats: ExportFormat[];
  dependencies?: string[]; // 依赖的其他文档类型
}

// 导出格式
export type ExportFormat = 'json' | 'markdown' | 'html' | 'pdf' | 'svg' | 'png' | 'docx';

// 核心业务资产类型
export interface UseCaseModel extends BaseDocument {
  type: 'usecase';
  content: {
    actors: Actor[];
    useCases: UseCase[];
    relationships: Relationship[];
    mermaidCode: string;
  };
}

export interface DomainModel extends BaseDocument {
  type: 'domain-model';
  content: {
    entities: Entity[];
    valueObjects: ValueObject[];
    aggregates: Aggregate[];
    relationships: DomainRelationship[];
    mermaidCode: string;
    knowledgeGraph?: KnowledgeGraphNode[];
  };
}

// 用例图相关类型
export interface Actor {
  id: string;
  name: string;
  type: 'primary' | 'secondary' | 'system';
  description?: string;
}

export interface UseCase {
  id: string;
  name: string;
  description: string;
  preconditions: string[];
  postconditions: string[];
  mainFlow: string[];
  alternativeFlows?: AlternativeFlow[];
  priority: 'high' | 'medium' | 'low';
}

export interface AlternativeFlow {
  id: string;
  name: string;
  steps: string[];
  condition: string;
}

export interface Relationship {
  id: string;
  type: 'association' | 'include' | 'extend' | 'generalization';
  source: string;
  target: string;
  label?: string;
}

// 领域模型相关类型
export interface Entity {
  id: string;
  name: string;
  attributes: Attribute[];
  methods: Method[];
  isAggregateRoot: boolean;
}

export interface ValueObject {
  id: string;
  name: string;
  attributes: Attribute[];
  invariants: string[];
}

export interface Aggregate {
  id: string;
  name: string;
  root: string; // Entity ID
  entities: string[]; // Entity IDs
  valueObjects: string[]; // ValueObject IDs
  boundaryRules: string[];
}

export interface Attribute {
  name: string;
  type: string;
  required: boolean;
  description?: string;
  constraints?: string[];
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

export interface DomainRelationship {
  id: string;
  type: 'composition' | 'aggregation' | 'association' | 'inheritance' | 'dependency';
  source: string;
  target: string;
  cardinality?: string;
  label?: string;
}

// 知识图谱节点
export interface KnowledgeGraphNode {
  id: string;
  label: string;
  type: 'concept' | 'entity' | 'relationship' | 'attribute' | 'event';
  properties: Record<string, any>;
  connections: KnowledgeGraphEdge[];
}

export interface KnowledgeGraphEdge {
  target: string;
  relationship: string;
  weight?: number;
  properties?: Record<string, any>;
}

// 领域词汇管理相关类型
export interface DomainVocabulary extends BaseDocument {
  type: 'domain-vocabulary';
  content: {
    terms: VocabularyTerm[];
    relationships: VocabularyRelationship[];
    categories: VocabularyCategory[];
    glossary: string; // Markdown格式的词汇表
  };
}

export interface VocabularyTerm {
  id: string;
  name: string;
  definition: string;
  category: string;
  aliases: string[];
  synonyms: string[];
  relatedTerms: string[]; // 相关术语ID列表
  examples: string[];
  tags: string[];
  aiEnhanced?: {
    semanticEmbedding?: number[];
    contextualDefinitions?: string[];
    usagePatterns?: string[];
  };
  classNamingReference?: {
    suggestedClassName: string;
    namingConvention: 'PascalCase' | 'camelCase' | 'snake_case';
    codeExamples: string[];
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface VocabularyRelationship {
  id: string;
  sourceTermId: string; // 源术语ID
  targetTermId: string; // 目标术语ID
  relationshipType: 'synonym' | 'antonym' | 'related' | 'parent' | 'child' | 'example';
  description?: string;
  createdAt: Date;
}

export interface VocabularyCategory {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  parentCategory?: string;
}

// 智能问答系统相关类型
export interface KnowledgeBase extends BaseDocument {
  type: 'knowledge-base';
  content: {
    entries: KnowledgeEntry[];
    categories: KnowledgeCategory[];
    searchIndex: SearchIndex;
  };
}

export interface KnowledgeEntry {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  source?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface KnowledgeCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  parentCategory?: string;
}

export interface SearchIndex {
  termFrequency: Record<string, number>;
  documentFrequency: Record<string, number>;
  semanticVectors: Record<string, number[]>;
}

export interface QASession {
  id: string;
  userId?: string;
  question: string;
  answer: string;
  sources: string[];
  confidence: number;
  feedback?: 'helpful' | 'not_helpful';
  timestamp: Date;
}

// 3D可视化相关类型
export interface DomainModel3D {
  id: string;
  domainModelId?: string;
  entities: Entity3D[];
  relationships: Relationship3D[];
  layout: Layout3D;
  viewSettings: ViewSettings3D;
  createdAt: Date;
  updatedAt: Date;
}

export interface Entity3D {
  id: string;
  name: string;
  position: Vector3D;
  scale: Vector3D;
  rotation: Vector3D;
  color: string;
  geometry: 'box' | 'sphere' | 'cylinder' | 'pyramid';
  metadata?: any;
}

export interface Relationship3D {
  id: string;
  sourceEntityId: string;
  targetEntityId: string;
  relationshipType: string;
  points: Vector3D[];
  color: string;
  style: 'solid' | 'dashed' | 'dotted';
}

export interface Vector3D {
  x: number;
  y: number;
  z: number;
}

export interface Layout3D {
  type: 'force' | 'hierarchical' | 'circular' | 'grid';
  spacing: number;
  levels: number;
}

export interface ViewSettings3D {
  camera: {
    position: Vector3D;
    target: Vector3D;
    fov: number;
  };
  lighting: {
    ambient: number;
    directional: {
      intensity: number;
      position: Vector3D;
    };
  };
  background: {
    type: 'color' | 'gradient' | 'skybox';
    value: string | string[];
  };
  controls: {
    enableRotation: boolean;
    enableZoom: boolean;
    enablePan: boolean;
    autoRotate: boolean;
  };
}

export interface Animation3D {
  type: 'rotation' | 'scale' | 'position' | 'color';
  duration: number;
  easing: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out';
  loop: boolean;
  keyframes: AnimationKeyframe[];
}

export interface AnimationKeyframe {
  time: number; // 0-1
  value: any;
}

// 可扩展文档类型注册
export interface DocumentTypeDefinition {
  id: string;
  type: string;
  name: string;
  description: string;
  icon: string;
  category: DocumentCategory;
  schema: any; // JSON Schema
  generator: DocumentGenerator;
  renderer: DocumentRenderer;
  exporter: DocumentExporter;
  validator?: DocumentValidator;
}

export type DocumentCategory = 'core-asset' | 'diagram' | 'specification' | 'analysis' | 'custom';

// 文档生成器接口
export interface DocumentGenerator {
  id?: string;
  name?: string;
  description?: string;
  generate(input: any, options?: GenerationOptions): Promise<BaseDocument>;
  validate(input: any): ValidationResult;
  getRequiredInputs(): InputDefinition[];
}

export interface GenerationOptions {
  template?: string;
  customFields?: Record<string, any>;
  exportFormats?: ExportFormat[];
  aiEnhanced?: boolean;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface ValidationWarning {
  field: string;
  message: string;
  suggestion?: string;
}

export interface InputDefinition {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array' | 'file';
  required: boolean;
  description: string;
  validation?: any; // JSON Schema
  defaultValue?: any;
}

// 文档渲染器接口
export interface DocumentRenderer {
  render(document: BaseDocument, options?: RenderOptions): Promise<RenderedDocument>;
  getPreview(document: BaseDocument): Promise<string>;
  getSupportedFormats(): ExportFormat[];
}

export interface RenderOptions {
  format: ExportFormat;
  theme?: string;
  customStyles?: Record<string, any>;
  includeMetadata?: boolean;
}

export interface RenderedDocument {
  content: string | Buffer;
  format: ExportFormat;
  metadata: {
    size: number;
    generatedAt: Date;
    renderTime: number;
  };
}

// 文档导出器接口
export interface DocumentExporter {
  export(document: BaseDocument, format: ExportFormat, options?: ExportOptions): Promise<ExportResult>;
  getSupportedFormats(): ExportFormat[];
  getFormatOptions(format: ExportFormat): ExportFormatOptions;
}

export interface ExportOptions {
  quality?: 'low' | 'medium' | 'high';
  includeMetadata?: boolean;
  customTemplate?: string;
  watermark?: boolean;
}

export interface ExportResult {
  data: Buffer;
  filename: string;
  mimeType: string;
  size: number;
}

export interface ExportFormatOptions {
  supportedQuality: ('low' | 'medium' | 'high')[];
  supportsCustomTemplate: boolean;
  supportsWatermark: boolean;
  maxSize?: number;
}

// 文档验证器接口
export interface DocumentValidator {
  validate(document: BaseDocument): Promise<ValidationResult>;
  validateContent(content: any): Promise<ValidationResult>;
  getValidationRules(): ValidationRule[];
}

export interface ValidationRule {
  name: string;
  description: string;
  severity: 'error' | 'warning' | 'info';
  check: (document: BaseDocument) => boolean | Promise<boolean>;
}

// Mermaid图表相关类型
export interface MermaidChart {
  id: string;
  type: MermaidChartType;
  code: string;
  title?: string;
  config?: MermaidConfig;
}

export type MermaidChartType = 
  | 'flowchart' 
  | 'sequence' 
  | 'class' 
  | 'state' 
  | 'entity-relationship' 
  | 'user-journey' 
  | 'gantt' 
  | 'pie' 
  | 'requirement' 
  | 'gitgraph'
  | 'mindmap'
  | 'timeline'
  | 'custom';

export interface MermaidConfig {
  theme?: 'default' | 'dark' | 'forest' | 'neutral';
  themeVariables?: Record<string, string>;
  flowchart?: {
    diagramPadding?: number;
    htmlLabels?: boolean;
    curve?: 'basis' | 'linear' | 'cardinal';
  };
  sequence?: {
    diagramMarginX?: number;
    diagramMarginY?: number;
    actorMargin?: number;
    width?: number;
    height?: number;
  };
  class?: {
    titleTopMargin?: number;
    arrowMarkerAbsolute?: boolean;
  };
}

// 插件系统类型
export interface Plugin {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  category: PluginCategory;
  documentTypes: DocumentTypeDefinition[];
  dependencies?: string[];
  config?: PluginConfig;
  enabled: boolean;
  
  // 生命周期方法
  onRegister?: (context: PluginContext) => Promise<void> | void;
  onUnregister?: (context: PluginContext) => Promise<void> | void;
  onEnable?: (context: PluginContext) => Promise<void> | void;
  onDisable?: (context: PluginContext) => Promise<void> | void;
}

export type PluginCategory = 'generator' | 'renderer' | 'exporter' | 'validator' | 'integration' | 'utility';

export interface PluginConfig {
  settings: Record<string, any>;
  permissions: PluginPermission[];
  resources: PluginResource[];
}

export interface PluginPermission {
  type: 'file-read' | 'file-write' | 'network' | 'system' | 'ai-service';
  scope: string;
  required: boolean;
}

export interface PluginResource {
  type: 'template' | 'schema' | 'asset' | 'config';
  path: string;
  required: boolean;
}

export interface PluginContext {
  plugin: Plugin;
  api: PluginAPI;
  storage: PluginStorage;
  logger: PluginLogger;
}

export interface PluginAPI {
  registerDocumentType: (type: DocumentTypeDefinition) => void;
  unregisterDocumentType: (id: string) => void;
  registerGenerator: (generator: DocumentGenerator) => void;
  unregisterGenerator: (id: string) => void;
  registerRenderer: (renderer: DocumentRenderer) => void;
  unregisterRenderer: (id: string) => void;
  registerExporter: (exporter: DocumentExporter) => void;
  unregisterExporter: (id: string) => void;
  registerValidator: (validator: DocumentValidator) => void;
  unregisterValidator: (id: string) => void;
  addHook: (event: string, callback: Function) => void;
  removeHook: (event: string, callback: Function) => void;
  triggerEvent: (event: string, data?: any) => Promise<void>;
}

export interface PluginStorage {
  get: (key: string) => Promise<any>;
  set: (key: string, value: any) => Promise<void>;
  delete: (key: string) => Promise<void>;
  clear: () => Promise<void>;
  keys: () => Promise<string[]>;
}

export interface PluginLogger {
  debug: (message: string, ...args: any[]) => void;
  info: (message: string, ...args: any[]) => void;
  warn: (message: string, ...args: any[]) => void;
  error: (message: string, ...args: any[]) => void;
}

export interface PluginManifest {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  category: PluginCategory;
  main: string;
  dependencies?: string[];
  permissions?: PluginPermission[];
  resources?: PluginResource[];
  config?: Record<string, any>;
}

export interface PluginHook {
  event: string;
  callback: Function;
  priority?: number;
  once?: boolean;
}

export interface PluginInstance {
  plugin: Plugin;
  context?: PluginContext;
  loaded: boolean;
  enabled: boolean;
  error?: string;
}

export interface PluginEvent {
  type: 'install' | 'uninstall' | 'enable' | 'disable' | 'error' | string;
  data?: any;
  timestamp: Date;
}

// MCP协议相关类型
export interface MCPRequest {
  id: string;
  method: string;
  params: any;
  timestamp: Date;
}

export interface MCPResponse {
  id: string;
  result?: any;
  error?: MCPError;
  timestamp: Date;
}

export interface MCPError {
  code: number;
  message: string;
  data?: any;
}

export interface MCPCapability {
  name: string;
  version: string;
  description: string;
  methods: string[];
  schemas: Record<string, any>;
}