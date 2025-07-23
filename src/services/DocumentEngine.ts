// 可扩展文档生成引擎 - 核心服务

import type {
  BaseDocument,
  DocumentTypeDefinition,
  DocumentGenerator,
  DocumentRenderer,
  DocumentExporter,
  DocumentValidator,
  GenerationOptions,
  ValidationResult,
  ExportFormat,
  ExportResult,
  Plugin,
  UseCaseModel,
  DomainModel,
  RenderOptions,
  RenderedDocument,
  ExportFormatOptions
} from '../types/document';

// 文档引擎核心类
export class DocumentEngine {
  private documentTypes: Map<string, DocumentTypeDefinition> = new Map();
  private plugins: Map<string, Plugin> = new Map();
  private generators: Map<string, DocumentGenerator> = new Map();
  private renderers: Map<string, DocumentRenderer> = new Map();
  private exporters: Map<string, DocumentExporter> = new Map();
  private validators: Map<string, DocumentValidator> = new Map();

  constructor() {
    this.initializeCoreDocumentTypes();
  }

  // 初始化核心文档类型
  private initializeCoreDocumentTypes() {
    // 注册用例图文档类型
    this.registerDocumentType({
      type: 'usecase',
      name: 'Use Case Diagram',
      description: 'UML Use Case diagram for capturing functional requirements',
      icon: 'users',
      category: 'core-asset',
      schema: this.getUseCaseSchema(),
      generator: new UseCaseGenerator(),
      renderer: new MermaidRenderer(),
      exporter: new StandardExporter(),
      validator: new UseCaseValidator()
    });

    // 注册领域模型文档类型
    this.registerDocumentType({
      type: 'domain-model',
      name: 'Domain Model',
      description: 'Domain-driven design model with entities, value objects, and aggregates',
      icon: 'network',
      category: 'core-asset',
      schema: this.getDomainModelSchema(),
      generator: new DomainModelGenerator(),
      renderer: new MermaidRenderer(),
      exporter: new StandardExporter(),
      validator: new DomainModelValidator()
    });

    // 注册其他核心文档类型
    this.registerCoreDocumentTypes();
  }

  // 注册文档类型
  registerDocumentType(definition: DocumentTypeDefinition): void {
    this.documentTypes.set(definition.type, definition);
    this.generators.set(definition.type, definition.generator);
    this.renderers.set(definition.type, definition.renderer);
    this.exporters.set(definition.type, definition.exporter);
    
    if (definition.validator) {
      this.validators.set(definition.type, definition.validator);
    }
  }

  // 获取所有文档类型
  getDocumentTypes(): DocumentTypeDefinition[] {
    return Array.from(this.documentTypes.values());
  }

  // 获取特定类别的文档类型
  getDocumentTypesByCategory(category: string): DocumentTypeDefinition[] {
    return Array.from(this.documentTypes.values())
      .filter(type => type.category === category);
  }

  // 生成文档
  async generateDocument(
    type: string, 
    input: Record<string, unknown>, 
    options?: GenerationOptions
  ): Promise<BaseDocument> {
    const generator = this.generators.get(type);
    if (!generator) {
      throw new Error(`No generator found for document type: ${type}`);
    }

    // 验证输入
    const validation = generator.validate(input);
    if (!validation.valid) {
      throw new Error(`Invalid input: ${validation.errors.map(e => e.message).join(', ')}`);
    }

    // 生成文档
    const document = await generator.generate(input, options);
    
    // 验证生成的文档
    const validator = this.validators.get(type);
    if (validator) {
      const docValidation = await validator.validate(document);
      if (!docValidation.valid) {
        console.warn('Generated document has validation warnings:', docValidation.warnings);
      }
    }

    return document;
  }

  // 渲染文档
  async renderDocument(
    document: BaseDocument, 
    format: ExportFormat = 'html'
  ): Promise<string> {
    const renderer = this.renderers.get(document.type);
    if (!renderer) {
      throw new Error(`No renderer found for document type: ${document.type}`);
    }

    const rendered = await renderer.render(document, { format });
    return typeof rendered.content === 'string' ? rendered.content : rendered.content.toString();
  }

  // 导出文档
  async exportDocument(
    document: BaseDocument, 
    format: ExportFormat
  ): Promise<ExportResult> {
    const exporter = this.exporters.get(document.type);
    if (!exporter) {
      throw new Error(`No exporter found for document type: ${document.type}`);
    }

    return await exporter.export(document, format);
  }

  // 验证文档
  async validateDocument(document: BaseDocument): Promise<ValidationResult> {
    const validator = this.validators.get(document.type);
    if (!validator) {
      return { valid: true, errors: [], warnings: [] };
    }

    return await validator.validate(document);
  }

  // 安装插件
  async installPlugin(plugin: Plugin): Promise<void> {
    // 验证插件依赖
    for (const dep of plugin.dependencies || []) {
      if (!this.plugins.has(dep)) {
        throw new Error(`Plugin dependency not found: ${dep}`);
      }
    }

    // 注册插件提供的文档类型
    for (const docType of plugin.documentTypes) {
      this.registerDocumentType(docType);
    }

    this.plugins.set(plugin.id, plugin);
  }

  // 获取已安装的插件
  getInstalledPlugins(): Plugin[] {
    return Array.from(this.plugins.values());
  }

  // 启用/禁用插件
  togglePlugin(pluginId: string, enabled: boolean): void {
    const plugin = this.plugins.get(pluginId);
    if (plugin) {
      plugin.enabled = enabled;
      
      if (enabled) {
        // 重新注册插件的文档类型
        for (const docType of plugin.documentTypes) {
          this.registerDocumentType(docType);
        }
      } else {
        // 移除插件的文档类型
        for (const docType of plugin.documentTypes) {
          this.documentTypes.delete(docType.type);
          this.generators.delete(docType.type);
          this.renderers.delete(docType.type);
          this.exporters.delete(docType.type);
          this.validators.delete(docType.type);
        }
      }
    }
  }

  // 获取用例图JSON Schema
  private getUseCaseSchema(): Record<string, unknown> {
    return {
      type: 'object',
      properties: {
        requirements: {
          type: 'string',
          description: 'Natural language requirements description'
        },
        actors: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              type: { enum: ['primary', 'secondary', 'system'] },
              description: { type: 'string' }
            },
            required: ['name', 'type']
          }
        },
        useCases: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              description: { type: 'string' },
              priority: { enum: ['high', 'medium', 'low'] }
            },
            required: ['name', 'description']
          }
        }
      },
      required: ['requirements']
    };
  }

  // 获取领域模型JSON Schema
  private getDomainModelSchema(): Record<string, unknown> {
    return {
      type: 'object',
      properties: {
        businessContext: {
          type: 'string',
          description: 'Business domain context description'
        },
        entities: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              attributes: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    name: { type: 'string' },
                    type: { type: 'string' },
                    required: { type: 'boolean' }
                  },
                  required: ['name', 'type']
                }
              },
              isAggregateRoot: { type: 'boolean' }
            },
            required: ['name']
          }
        }
      },
      required: ['businessContext']
    };
  }

  // 注册其他核心文档类型
  private registerCoreDocumentTypes(): void {
    // 序列图
    this.registerDocumentType({
      type: 'sequence',
      name: 'Sequence Diagram',
      description: 'UML Sequence diagram for interaction flows',
      icon: 'flow',
      category: 'diagram',
      schema: { type: 'object', properties: { interactions: { type: 'array' } } },
      generator: new SequenceGenerator(),
      renderer: new MermaidRenderer(),
      exporter: new StandardExporter()
    });

    // 类图
    this.registerDocumentType({
      type: 'class',
      name: 'Class Diagram',
      description: 'UML Class diagram for system structure',
      icon: 'hierarchy',
      category: 'diagram',
      schema: { type: 'object', properties: { classes: { type: 'array' } } },
      generator: new ClassGenerator(),
      renderer: new MermaidRenderer(),
      exporter: new StandardExporter()
    });

    // API文档
    this.registerDocumentType({
      type: 'api-spec',
      name: 'API Specification',
      description: 'RESTful API documentation',
      icon: 'api',
      category: 'specification',
      schema: { type: 'object', properties: { endpoints: { type: 'array' } } },
      generator: new APISpecGenerator(),
      renderer: new MarkdownRenderer(),
      exporter: new StandardExporter()
    });

    // 数据库设计
    this.registerDocumentType({
      type: 'database',
      name: 'Database Design',
      description: 'Database schema and relationships',
      icon: 'database',
      category: 'specification',
      schema: { type: 'object', properties: { tables: { type: 'array' } } },
      generator: new DatabaseGenerator(),
      renderer: new MermaidRenderer(),
      exporter: new StandardExporter()
    });
  }
}

// 用例图生成器
class UseCaseGenerator implements DocumentGenerator {
  async generate(input: Record<string, unknown>, _options?: GenerationOptions): Promise<UseCaseModel> {
    const { requirements, actors = [], useCases = [] } = input;
    
    // 这里可以集成AI服务来分析需求并生成用例图
    const generatedActors = (actors as any)?.length > 0 ? actors : this.extractActorsFromRequirements(requirements);
    const generatedUseCases = (useCases as any)?.length > 0 ? useCases : this.extractUseCasesFromRequirements(requirements);
    const relationships = this.generateRelationships(generatedActors as Array<Record<string, unknown>>, generatedUseCases as Array<Record<string, unknown>>);
    
    const mermaidCode = this.generateMermaidCode(generatedActors as Array<Record<string, unknown>>, generatedUseCases as Array<Record<string, unknown>>, relationships as Array<Record<string, unknown>>);
    
    return {
      id: `usecase-${Date.now()}`,
      type: 'usecase',
      title: 'Use Case Diagram',
      content: {
        actors: generatedActors as any,
        useCases: generatedUseCases as any,
        relationships: relationships as any,
        mermaidCode
      },
      metadata: {
        version: '1.0',
        author: 'System',
        tags: ['usecase', 'requirements'],
        exportFormats: ['svg', 'png', 'json', 'markdown']
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  validate(input: Record<string, unknown>): ValidationResult {
    const errors = [];
    const warnings = [];
    
    if (!input.requirements || typeof input.requirements !== 'string') {
      errors.push('Requirements description is required');
    }
    
    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  getRequiredInputs() {
    return [
      {
        name: 'requirements',
        type: 'string' as const,
        required: true,
        description: 'Natural language description of system requirements'
      }
    ];
  }

  private extractActorsFromRequirements(requirements: string | unknown): Array<Record<string, unknown>> {
    // 简单的关键词提取，实际应该使用AI服务
    const actors: Array<Record<string, unknown>> = [];
    const reqStr = String(requirements);
    if (reqStr.includes('用户') || reqStr.includes('user')) {
      actors.push({ id: 'user', name: 'User', type: 'primary' });
    }
    if (reqStr.includes('管理员') || reqStr.includes('admin')) {
      actors.push({ id: 'admin', name: 'Administrator', type: 'primary' });
    }
    if (reqStr.includes('系统') || reqStr.includes('system')) {
      actors.push({ id: 'system', name: 'System', type: 'system' });
    }
    return actors;
  }

  private extractUseCasesFromRequirements(requirements: string | unknown): Array<Record<string, unknown>> {
    // 简单的用例提取，实际应该使用AI服务
    const useCases: Array<Record<string, unknown>> = [];
    const reqStr = String(requirements);
    if (reqStr.includes('登录') || reqStr.includes('login')) {
      useCases.push({
        id: 'login',
        name: 'Login',
        description: 'User authentication',
        preconditions: ['User has account'],
        postconditions: ['User is authenticated'],
        mainFlow: ['Enter credentials', 'Validate credentials', 'Grant access'],
        priority: 'high'
      });
    }
    return useCases;
  }

  private generateRelationships(actors: Array<Record<string, unknown>>, useCases: Array<Record<string, unknown>>): Array<Record<string, unknown>> {
    // 生成基本的关联关系
    const relationships: Array<Record<string, unknown>> = [];
    for (const actor of actors) {
      for (const useCase of useCases) {
        relationships.push({
          id: `${actor.id}-${useCase.id}`,
          type: 'association',
          source: actor.id,
          target: useCase.id
        });
      }
    }
    return relationships;
  }

  private generateMermaidCode(actors: Array<Record<string, unknown>>, useCases: Array<Record<string, unknown>>, relationships: Array<Record<string, unknown>>): string {
    let code = 'graph TD\n';
    
    // 添加参与者
    for (const actor of actors) {
      code += `    ${actor.id}["${actor.name}"]\n`;
    }
    
    // 添加用例
    for (const useCase of useCases) {
      code += `    ${useCase.id}(("${useCase.name}"))\n`;
    }
    
    // 添加关系
    for (const rel of relationships) {
      code += `    ${rel.source} --> ${rel.target}\n`;
    }
    
    return code;
  }
}

// 领域模型生成器
class DomainModelGenerator implements DocumentGenerator {
  async generate(input: Record<string, unknown>, _options?: GenerationOptions): Promise<DomainModel> {
    const { businessContext, entities = [] } = input;
    
    const generatedEntities = (entities as any)?.length > 0 ? entities as Array<Record<string, unknown>> : this.extractEntitiesFromContext(businessContext);
    const valueObjects = this.generateValueObjects(generatedEntities);
    const aggregates = this.generateAggregates(generatedEntities);
    const relationships = this.generateDomainRelationships(generatedEntities);
    
    const mermaidCode = this.generateDomainMermaidCode(generatedEntities, relationships);
    
    return {
      id: `domain-${Date.now()}`,
      type: 'domain-model',
      title: 'Domain Model',
      content: {
        entities: generatedEntities as any,
        valueObjects: valueObjects as any,
        aggregates: aggregates as any,
        relationships: relationships as any,
        mermaidCode
      },
      metadata: {
        version: '1.0',
        author: 'System',
        tags: ['domain', 'model', 'ddd'],
        exportFormats: ['svg', 'png', 'json', 'markdown']
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  validate(input: Record<string, unknown>): ValidationResult {
    const errors = [];
    const warnings = [];
    
    if (!input.businessContext || typeof input.businessContext !== 'string') {
      errors.push('Business context description is required');
    }
    
    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  getRequiredInputs() {
    return [
      {
        name: 'businessContext',
        type: 'string' as const,
        required: true,
        description: 'Business domain context and requirements'
      }
    ];
  }

  private extractEntitiesFromContext(context: string | unknown): Array<Record<string, unknown>> {
    // 简单的实体提取，实际应该使用AI服务
    const entities: Array<Record<string, unknown>> = [];
    const contextStr = String(context);
    if (contextStr.includes('用户') || contextStr.includes('user')) {
      entities.push({
        id: 'user',
        name: 'User',
        attributes: [
          { name: 'id', type: 'string', required: true },
          { name: 'name', type: 'string', required: true },
          { name: 'email', type: 'string', required: true }
        ],
        methods: [],
        isAggregateRoot: true
      });
    }
    return entities;
  }

  private generateValueObjects(_entities: Array<Record<string, unknown>>): Array<Record<string, unknown>> {
    return [];
  }

  private generateAggregates(entities: Array<Record<string, unknown>>): Array<Record<string, unknown>> {
    return entities
      .filter(e => e.isAggregateRoot)
      .map(e => ({
        id: `${e.id}-aggregate`,
        name: `${e.name}Aggregate`,
        root: e.id,
        entities: [e.id],
        valueObjects: [],
        boundaryRules: [`${e.name} aggregate boundary`]
      }));
  }

  private generateDomainRelationships(_entities: Array<Record<string, unknown>>): Array<Record<string, unknown>> {
    return [];
  }

  private generateDomainMermaidCode(entities: Array<Record<string, unknown>>, _relationships: Array<Record<string, unknown>>): string {
    let code = 'classDiagram\n';
    
    for (const entity of entities) {
      code += `    class ${entity.name} {\n`;
      if (entity.attributes && Array.isArray(entity.attributes)) {
        for (const attr of entity.attributes as any[]) {
          code += `        ${attr.type} ${attr.name}\n`;
        }
      }
      if (entity.methods && Array.isArray(entity.methods)) {
        for (const method of entity.methods as any[]) {
          code += `        ${method.name}()\n`;
        }
      }
      code += '    }\n';
    }
    
    return code;
  }
}

// 其他生成器的简单实现
class SequenceGenerator implements DocumentGenerator {
  async generate(input: Record<string, unknown>): Promise<BaseDocument> {
    return {
      id: `sequence-${Date.now()}`,
      type: 'sequence',
      title: 'Sequence Diagram',
      content: input,
      metadata: {
        version: '1.0',
        author: 'System',
        tags: ['sequence'],
        exportFormats: ['svg', 'png']
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  validate(_input: Record<string, unknown>): ValidationResult {
    return { valid: true, errors: [], warnings: [] };
  }

  getRequiredInputs() {
    return [];
  }
}

class ClassGenerator implements DocumentGenerator {
  async generate(input: Record<string, unknown>): Promise<BaseDocument> {
    return {
      id: `class-${Date.now()}`,
      type: 'class',
      title: 'Class Diagram',
      content: input,
      metadata: {
        version: '1.0',
        author: 'System',
        tags: ['class'],
        exportFormats: ['svg', 'png']
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  validate(_input: Record<string, unknown>): ValidationResult {
    return { valid: true, errors: [], warnings: [] };
  }

  getRequiredInputs() {
    return [];
  }
}

class APISpecGenerator implements DocumentGenerator {
  async generate(input: Record<string, unknown>): Promise<BaseDocument> {
    return {
      id: `api-${Date.now()}`,
      type: 'api-spec',
      title: 'API Specification',
      content: input,
      metadata: {
        version: '1.0',
        author: 'System',
        tags: ['api'],
        exportFormats: ['json', 'markdown']
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  validate(_input: Record<string, unknown>): ValidationResult {
    return { valid: true, errors: [], warnings: [] };
  }

  getRequiredInputs() {
    return [];
  }
}

class DatabaseGenerator implements DocumentGenerator {
  async generate(input: Record<string, unknown>): Promise<BaseDocument> {
    return {
      id: `db-${Date.now()}`,
      type: 'database',
      title: 'Database Design',
      content: input,
      metadata: {
        version: '1.0',
        author: 'System',
        tags: ['database'],
        exportFormats: ['svg', 'json']
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  validate(_input: Record<string, unknown>): ValidationResult {
    return { valid: true, errors: [], warnings: [] };
  }

  getRequiredInputs() {
    return [];
  }
}

// 渲染器实现
class MermaidRenderer implements DocumentRenderer {
  async render(document: BaseDocument, options?: RenderOptions): Promise<RenderedDocument> {
    return {
      content: document.content.mermaidCode || '',
      format: options?.format || 'svg',
      metadata: {
        size: 0,
        generatedAt: new Date(),
        renderTime: 0
      }
    };
  }

  async getPreview(document: BaseDocument): Promise<string> {
    return document.content.mermaidCode || '';
  }

  getSupportedFormats(): ExportFormat[] {
    return ['svg', 'png'];
  }
}

class MarkdownRenderer implements DocumentRenderer {
  async render(document: BaseDocument, options?: RenderOptions): Promise<RenderedDocument> {
    return {
      content: `# ${document.title}\n\n${JSON.stringify(document.content, null, 2)}`,
      format: options?.format || 'markdown',
      metadata: {
        size: 0,
        generatedAt: new Date(),
        renderTime: 0
      }
    };
  }

  async getPreview(document: BaseDocument): Promise<string> {
    return `# ${document.title}`;
  }

  getSupportedFormats(): ExportFormat[] {
    return ['markdown', 'html'];
  }
}

// 导出器实现
class StandardExporter implements DocumentExporter {
  async export(document: BaseDocument, format: ExportFormat): Promise<ExportResult> {
    const content = JSON.stringify(document, null, 2);
    const data = Buffer.from(content, 'utf-8');
    
    return {
      data,
      filename: `${document.title}.${format}`,
      mimeType: this.getMimeType(format),
      size: data.length
    };
  }

  getSupportedFormats(): ExportFormat[] {
    return ['json', 'markdown', 'html', 'svg', 'png'];
  }

  getFormatOptions(_format: ExportFormat): ExportFormatOptions {
    return {
      supportedQuality: ['medium', 'high'],
      supportsCustomTemplate: true,
      supportsWatermark: false
    };
  }

  private getMimeType(format: ExportFormat): string {
    const mimeTypes = {
      json: 'application/json',
      markdown: 'text/markdown',
      html: 'text/html',
      svg: 'image/svg+xml',
      png: 'image/png',
      pdf: 'application/pdf',
      docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    };
    return mimeTypes[format] || 'application/octet-stream';
  }
}

// 验证器实现
class UseCaseValidator implements DocumentValidator {
  async validate(document: BaseDocument): Promise<ValidationResult> {
    const errors = [];
    const warnings = [];
    
    const content = document.content;
    if (!content.actors || content.actors.length === 0) {
      warnings.push({
        field: 'actors',
        message: 'No actors defined in use case diagram',
        suggestion: 'Add at least one actor'
      });
    }
    
    if (!content.useCases || content.useCases.length === 0) {
      warnings.push({
        field: 'useCases',
        message: 'No use cases defined',
        suggestion: 'Add at least one use case'
      });
    }
    
    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  async validateContent(content: Record<string, unknown>): Promise<ValidationResult> {
    return this.validate({ content } as BaseDocument);
  }

  getValidationRules() {
    return [
      {
        name: 'has-actors',
        description: 'Use case diagram should have at least one actor',
        severity: 'warning' as const,
        check: (doc: BaseDocument) => doc.content.actors?.length > 0
      }
    ];
  }
}

class DomainModelValidator implements DocumentValidator {
  async validate(document: BaseDocument): Promise<ValidationResult> {
    const errors = [];
    const warnings = [];
    
    const content = document.content;
    if (!content.entities || content.entities.length === 0) {
      warnings.push({
        field: 'entities',
        message: 'No entities defined in domain model',
        suggestion: 'Add at least one entity'
      });
    }
    
    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  async validateContent(content: Record<string, unknown>): Promise<ValidationResult> {
    return this.validate({ content } as BaseDocument);
  }

  getValidationRules() {
    return [
      {
        name: 'has-entities',
        description: 'Domain model should have at least one entity',
        severity: 'warning' as const,
        check: (doc: BaseDocument) => doc.content.entities?.length > 0
      }
    ];
  }
}

// 导出单例实例
export const documentEngine = new DocumentEngine();