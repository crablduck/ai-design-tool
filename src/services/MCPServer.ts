// MCP协议服务器 - AI Agent友好的接口

import type {
  MCPRequest,
  MCPResponse,
  MCPCapability,
  BaseDocument,
  UseCaseModel,
  DomainModel,
  MermaidChart,
  ExportFormat,
  DocumentTypeDefinition,
  DomainVocabulary,
  VocabularyTerm,
  VocabularyRelationship,
  VocabularyCategory,
  KnowledgeBase,
  KnowledgeEntry,
  QASession,
  DomainModel3D
} from '../types/document';
import { documentEngine } from './DocumentEngine';

// MCP服务器类
export class MCPServer {
  private capabilities: MCPCapability[];
  private requestHandlers: Map<string, (params: Record<string, unknown>) => Promise<unknown>>;

  constructor() {
    this.capabilities = [];
    this.requestHandlers = new Map();
    this.initializeCapabilities();
    this.registerHandlers();
  }

  // 初始化MCP能力
  private initializeCapabilities() {
    this.capabilities = [
      {
        name: 'smart-design-tool',
        version: '1.0.0',
        description: 'Intelligent software analysis and design tool with extensible document generation',
        methods: [
          'generateUseCase',
          'generateDomainModel',
          'generateDocument',
          'listDocumentTypes',
          'generateChart',
          'exportChart',
          'validateDocument',
          'getCapabilities',
          'installPlugin',
          'listPlugins',
          // 词汇管理相关方法
          'createVocabularyTerm',
          'updateVocabularyTerm',
          'deleteVocabularyTerm',
          'getVocabularyTerms',
          'searchVocabularyTerms',
          'createVocabularyRelationship',
          'getVocabularyGraph',
          // 智能问答相关方法
          'createKnowledgeEntry',
          'searchKnowledgeBase',
          'askQuestion',
          'getQAHistory',
          // 3D可视化相关方法
          'generate3DModel',
          'update3DModel',
          'export3DModel'
        ],
        schemas: {
          UseCaseInput: {
            type: 'object',
            properties: {
              requirements: {
                type: 'string',
                description: 'Natural language requirements description'
              },
              actors: {
                type: 'array',
                items: { $ref: '#/definitions/Actor' },
                description: 'Optional predefined actors'
              },
              useCases: {
                type: 'array',
                items: { $ref: '#/definitions/UseCase' },
                description: 'Optional predefined use cases'
              }
            },
            required: ['requirements']
          },
          DomainModelInput: {
            type: 'object',
            properties: {
              businessContext: {
                type: 'string',
                description: 'Business domain context description'
              },
              entities: {
                type: 'array',
                items: { $ref: '#/definitions/Entity' },
                description: 'Optional predefined entities'
              }
            },
            required: ['businessContext']
          },
          ChartGenerationInput: {
            type: 'object',
            properties: {
              type: {
                type: 'string',
                enum: ['flowchart', 'sequence', 'class', 'state', 'entity-relationship'],
                description: 'Type of chart to generate'
              },
              data: {
                type: 'object',
                description: 'Chart data and configuration'
              },
              title: {
                type: 'string',
                description: 'Chart title'
              }
            },
            required: ['type', 'data']
          }
        }
      }
    ];
  }

  // 注册请求处理器
  private registerHandlers() {
    // 核心业务资产生成
    this.requestHandlers.set('generateUseCase', this.handleGenerateUseCase.bind(this));
    this.requestHandlers.set('generateDomainModel', this.handleGenerateDomainModel.bind(this));
    
    // 可扩展文档生成
    this.requestHandlers.set('generateDocument', this.handleGenerateDocument.bind(this));
    this.requestHandlers.set('listDocumentTypes', this.handleListDocumentTypes.bind(this));
    
    // 图表生成
    this.requestHandlers.set('generateChart', this.handleGenerateChart.bind(this));
    this.requestHandlers.set('exportChart', this.handleExportChart.bind(this));
    
    // 文档验证
    this.requestHandlers.set('validateDocument', this.handleValidateDocument.bind(this));
    
    // 系统管理
    this.requestHandlers.set('getCapabilities', this.handleGetCapabilities.bind(this));
    this.requestHandlers.set('installPlugin', this.handleInstallPlugin.bind(this));
    this.requestHandlers.set('listPlugins', this.handleListPlugins.bind(this));
    
    // 词汇管理
    this.requestHandlers.set('createVocabularyTerm', this.handleCreateVocabularyTerm.bind(this));
    this.requestHandlers.set('updateVocabularyTerm', this.handleUpdateVocabularyTerm.bind(this));
    this.requestHandlers.set('deleteVocabularyTerm', this.handleDeleteVocabularyTerm.bind(this));
    this.requestHandlers.set('getVocabularyTerms', this.handleGetVocabularyTerms.bind(this));
    this.requestHandlers.set('searchVocabularyTerms', this.handleSearchVocabularyTerms.bind(this));
    this.requestHandlers.set('createVocabularyRelationship', this.handleCreateVocabularyRelationship.bind(this));
    this.requestHandlers.set('getVocabularyGraph', this.handleGetVocabularyGraph.bind(this));
    
    // 智能问答
    this.requestHandlers.set('createKnowledgeEntry', this.handleCreateKnowledgeEntry.bind(this));
    this.requestHandlers.set('searchKnowledgeBase', this.handleSearchKnowledgeBase.bind(this));
    this.requestHandlers.set('askQuestion', this.handleAskQuestion.bind(this));
    this.requestHandlers.set('getQAHistory', this.handleGetQAHistory.bind(this));
    
    // 3D可视化
    this.requestHandlers.set('generate3DModel', this.handleGenerate3DModel.bind(this));
    this.requestHandlers.set('update3DModel', this.handleUpdate3DModel.bind(this));
    this.requestHandlers.set('export3DModel', this.handleExport3DModel.bind(this));
  }

  // 处理MCP请求
  async handleRequest(request: MCPRequest): Promise<MCPResponse> {
    try {
      const handler = this.requestHandlers.get(request.method);
      if (!handler) {
        throw new Error(`Unknown method: ${request.method}`);
      }

      const result = await handler(request.params || {});
      
      return {
        id: request.id,
        result,
        timestamp: new Date()
      };
    } catch (error) {
      return {
        id: request.id,
        error: {
          code: -1,
          message: error instanceof Error ? error.message : 'Unknown error',
          data: error
        },
        timestamp: new Date()
      };
    }
  }

  // 生成用例图
  private async handleGenerateUseCase(params: Record<string, unknown>): Promise<UseCaseModel> {
    const { requirements, actors, useCases } = params;
    
    if (!requirements || typeof requirements !== 'string') {
      throw new Error('Requirements parameter is required and must be a string');
    }

    const useCaseModel = await documentEngine.generateDocument('usecase', {
      requirements,
      actors,
      useCases
    }) as UseCaseModel;

    return useCaseModel;
  }

  // 生成领域模型
  private async handleGenerateDomainModel(params: Record<string, unknown>): Promise<DomainModel> {
    const { businessContext, entities } = params;
    
    if (!businessContext || typeof businessContext !== 'string') {
      throw new Error('BusinessContext parameter is required and must be a string');
    }

    const domainModel = await documentEngine.generateDocument('domain-model', {
      businessContext,
      entities
    }) as DomainModel;

    return domainModel;
  }

  // 生成自定义文档
  private async handleGenerateDocument(params: Record<string, unknown>): Promise<BaseDocument> {
    const { type, input, options } = params;
    
    if (!type || typeof type !== 'string') {
      throw new Error('Type parameter is required and must be a string');
    }

    if (!input) {
      throw new Error('Input parameter is required');
    }

    const document = await documentEngine.generateDocument(type as string, input as Record<string, unknown>, options as Record<string, unknown>);
    return document;
  }

  // 列出文档类型
  private async handleListDocumentTypes(params: Record<string, unknown>): Promise<DocumentTypeDefinition[]> {
    const { category } = params;
    
    if (category) {
      return documentEngine.getDocumentTypesByCategory(category as string);
    }
    
    return documentEngine.getDocumentTypes();
  }

  // 生成图表
  private async handleGenerateChart(params: Record<string, unknown>): Promise<MermaidChart> {
    const { type, data, title, config } = params;
    
    if (!type || typeof type !== 'string') {
      throw new Error('Type parameter is required and must be a string');
    }

    if (!data) {
      throw new Error('Data parameter is required');
    }

    // 根据类型和数据生成Mermaid代码
    const mermaidCode = this.generateMermaidCode(type, data as Record<string, unknown>);
    
    const chart: MermaidChart = {
      id: `chart-${Date.now()}`,
      type: type as any,
      code: mermaidCode,
      title: (title as string) || `${type} Chart`,
      config: config as Record<string, unknown>
    };

    return chart;
  }

  // 导出图表
  private async handleExportChart(params: Record<string, unknown>): Promise<Buffer> {
    const { chartId, format } = params;
    
    if (!chartId || typeof chartId !== 'string') {
      throw new Error('ChartId parameter is required and must be a string');
    }

    if (!format || typeof format !== 'string') {
      throw new Error('Format parameter is required and must be a string');
    }

    // 这里应该实现实际的图表导出逻辑
    // 目前返回模拟数据
    const mockData = Buffer.from(`Exported chart ${chartId} as ${format}`);
    return mockData;
  }

  // 验证文档
  private async handleValidateDocument(params: Record<string, unknown>): Promise<Record<string, unknown>> {
    const { document } = params;
    
    if (!document) {
      throw new Error('Document parameter is required');
    }

    const validation = await documentEngine.validateDocument(document as BaseDocument);
    return validation as unknown as Record<string, unknown>;
  }

  // 获取能力
  private async handleGetCapabilities(_params: Record<string, unknown>): Promise<MCPCapability[]> {
    return this.capabilities;
  }

  // 安装插件
  private async handleInstallPlugin(params: Record<string, unknown>): Promise<void> {
    const { plugin } = params;
    
    if (!plugin) {
      throw new Error('Plugin parameter is required');
    }

    const fullPlugin = {
      ...(plugin as any),
      id: (plugin as any).name || 'unknown',
      version: '1.0.0',
      author: 'Unknown',
      category: 'general' as const,
      tags: [],
      dependencies: []
    };
    await documentEngine.installPlugin(fullPlugin);
  }

  // 列出插件
  private async handleListPlugins(_params: Record<string, unknown>): Promise<Record<string, unknown>[]> {
    return documentEngine.getInstalledPlugins() as unknown as Record<string, unknown>[];
  }

  // ===== 词汇管理相关方法 =====
  
  // 创建词汇术语
  private async handleCreateVocabularyTerm(params: Record<string, unknown>): Promise<VocabularyTerm> {
    const { name, definition, category, synonyms, relatedTerms, examples, tags } = params;
    
    if (!name || typeof name !== 'string') {
      throw new Error('Name parameter is required and must be a string');
    }
    
    if (!definition || typeof definition !== 'string') {
      throw new Error('Definition parameter is required and must be a string');
    }
    
    const term: VocabularyTerm = {
      id: `term-${Date.now()}`,
      name: name as string,
      definition: definition as string,
      category: (category as string) || 'general',
      aliases: [],
      synonyms: (synonyms as string[]) || [],
      relatedTerms: (relatedTerms as string[]) || [],
      examples: (examples as string[]) || [],
      tags: (tags as string[]) || [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // 这里应该保存到数据库或存储系统
    return term;
  }
  
  // 更新词汇术语
  private async handleUpdateVocabularyTerm(params: Record<string, unknown>): Promise<VocabularyTerm> {
    const { id, ...updates } = params;
    
    if (!id || typeof id !== 'string') {
      throw new Error('Id parameter is required and must be a string');
    }
    
    // 模拟更新逻辑
    const updatedTerm: VocabularyTerm = {
      id: id as string,
      name: (updates.name as string) || 'Updated Term',
      definition: (updates.definition as string) || 'Updated definition',
      category: (updates.category as string) || 'general',
      aliases: (updates.aliases as string[]) || [],
      synonyms: (updates.synonyms as string[]) || [],
      relatedTerms: (updates.relatedTerms as string[]) || [],
      examples: (updates.examples as string[]) || [],
      tags: (updates.tags as string[]) || [],
      createdAt: new Date(Date.now() - 86400000), // 1 day ago
      updatedAt: new Date()
    };
    
    return updatedTerm;
  }
  
  // 删除词汇术语
  private async handleDeleteVocabularyTerm(params: Record<string, unknown>): Promise<{ success: boolean }> {
    const { id } = params;
    
    if (!id || typeof id !== 'string') {
      throw new Error('Id parameter is required and must be a string');
    }
    
    // 模拟删除逻辑
    return { success: true };
  }
  
  // 获取词汇术语列表
  private async handleGetVocabularyTerms(params: Record<string, unknown>): Promise<VocabularyTerm[]> {
    const { category, limit = 50, offset = 0 } = params;
    
    // 模拟数据
    const mockTerms: VocabularyTerm[] = [
      {
        id: 'term-1',
        name: 'Domain Model',
        definition: 'A conceptual model of the domain that incorporates both behavior and data',
        category: 'software-architecture',
        aliases: [],
        synonyms: ['Domain Object Model'],
        relatedTerms: ['Entity', 'Value Object', 'Aggregate'],
        examples: ['User entity in e-commerce domain'],
        tags: ['DDD', 'modeling'],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'term-2',
        name: 'Use Case',
        definition: 'A description of how a user will interact with a system to achieve a goal',
        category: 'requirements',
        aliases: [],
        synonyms: ['User Story', 'Scenario'],
        relatedTerms: ['Actor', 'System Boundary'],
        examples: ['Login use case', 'Purchase product use case'],
        tags: ['UML', 'requirements'],
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    
    let filteredTerms = mockTerms;
    if (category) {
      filteredTerms = mockTerms.filter(term => term.category === category);
    }
    
    const start = offset as number;
    const end = start + (limit as number);
    return filteredTerms.slice(start, end);
  }
  
  // 搜索词汇术语
  private async handleSearchVocabularyTerms(params: Record<string, unknown>): Promise<VocabularyTerm[]> {
    const { query, category } = params;
    
    if (!query || typeof query !== 'string') {
      throw new Error('Query parameter is required and must be a string');
    }
    
    // 模拟搜索逻辑
    const allTerms = await this.handleGetVocabularyTerms({ category });
    const searchQuery = (query as string).toLowerCase();
    
    return allTerms.filter(term => 
      term.name.toLowerCase().includes(searchQuery) ||
      term.definition.toLowerCase().includes(searchQuery) ||
      term.synonyms.some(synonym => synonym.toLowerCase().includes(searchQuery))
    );
  }
  
  // 创建词汇关系
  private async handleCreateVocabularyRelationship(params: Record<string, unknown>): Promise<VocabularyRelationship> {
    const { sourceTermId, targetTermId, relationshipType, description } = params;
    
    if (!sourceTermId || !targetTermId || !relationshipType) {
      throw new Error('sourceTermId, targetTermId, and relationshipType are required');
    }
    
    const relationship: VocabularyRelationship = {
      id: `rel-${Date.now()}`,
      sourceTermId: sourceTermId as string,
      targetTermId: targetTermId as string,
      relationshipType: relationshipType as 'synonym' | 'antonym' | 'related' | 'parent' | 'child' | 'example',
      description: description as string,
      createdAt: new Date()
    };
    
    return relationship;
  }
  
  // 获取词汇关系图谱
  private async handleGetVocabularyGraph(params: Record<string, unknown>): Promise<{ nodes: any[], edges: any[] }> {
    const { termId, depth = 2 } = params;
    
    // 模拟图谱数据
    const nodes = [
      { id: 'term-1', label: 'Domain Model', category: 'software-architecture' },
      { id: 'term-2', label: 'Entity', category: 'software-architecture' },
      { id: 'term-3', label: 'Value Object', category: 'software-architecture' },
      { id: 'term-4', label: 'Aggregate', category: 'software-architecture' }
    ];
    
    const edges = [
      { from: 'term-1', to: 'term-2', label: 'contains', type: 'related' },
      { from: 'term-1', to: 'term-3', label: 'contains', type: 'related' },
      { from: 'term-1', to: 'term-4', label: 'contains', type: 'related' }
    ];
    
    return { nodes, edges };
  }
  
  // ===== 智能问答相关方法 =====
  
  // 创建知识条目
  private async handleCreateKnowledgeEntry(params: Record<string, unknown>): Promise<KnowledgeEntry> {
    const { title, content, category, tags, source } = params;
    
    if (!title || !content) {
      throw new Error('Title and content are required');
    }
    
    const entry: KnowledgeEntry = {
      id: `kb-${Date.now()}`,
      title: title as string,
      content: content as string,
      category: (category as string) || 'general',
      tags: (tags as string[]) || [],
      source: source as string,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    return entry;
  }
  
  // 搜索知识库
  private async handleSearchKnowledgeBase(params: Record<string, unknown>): Promise<KnowledgeEntry[]> {
    const { query, category, limit = 10 } = params;
    
    if (!query || typeof query !== 'string') {
      throw new Error('Query parameter is required and must be a string');
    }
    
    // 模拟知识库数据
    const mockEntries: KnowledgeEntry[] = [
      {
        id: 'kb-1',
        title: 'Domain-Driven Design Principles',
        content: 'DDD is an approach to software development that centers the development on programming a domain model...',
        category: 'software-architecture',
        tags: ['DDD', 'architecture', 'design'],
        source: 'Eric Evans - Domain-Driven Design',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'kb-2',
        title: 'Use Case Modeling Best Practices',
        content: 'Use cases are a technique for capturing functional requirements...',
        category: 'requirements',
        tags: ['use-cases', 'requirements', 'UML'],
        source: 'Alistair Cockburn - Writing Effective Use Cases',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    
    const searchQuery = (query as string).toLowerCase();
    let results = mockEntries.filter(entry => 
      entry.title.toLowerCase().includes(searchQuery) ||
      entry.content.toLowerCase().includes(searchQuery) ||
      entry.tags.some(tag => tag.toLowerCase().includes(searchQuery))
    );
    
    if (category) {
      results = results.filter(entry => entry.category === category);
    }
    
    return results.slice(0, limit as number);
  }
  
  // 提问
  private async handleAskQuestion(params: Record<string, unknown>): Promise<{ answer: string; sources: string[]; confidence: number }> {
    const { question, context } = params;
    
    if (!question || typeof question !== 'string') {
      throw new Error('Question parameter is required and must be a string');
    }
    
    // 模拟AI回答
    const mockAnswer = {
      answer: `Based on the knowledge base, here's the answer to "${question}": This is a simulated AI response that would provide relevant information based on the domain knowledge and context provided.`,
      sources: ['Domain-Driven Design by Eric Evans', 'Clean Architecture by Robert Martin'],
      confidence: 0.85
    };
    
    return mockAnswer;
  }
  
  // 获取问答历史
  private async handleGetQAHistory(params: Record<string, unknown>): Promise<QASession[]> {
    const { userId, limit = 20 } = params;
    
    // 模拟问答历史
    const mockSessions: QASession[] = [
      {
        id: 'qa-1',
        userId: (userId as string) || 'user-1',
        question: 'What is Domain-Driven Design?',
        answer: 'Domain-Driven Design (DDD) is an approach to software development...',
        sources: ['Eric Evans - Domain-Driven Design'],
        confidence: 0.9,
        feedback: 'helpful',
        timestamp: new Date()
      }
    ];
    
    return mockSessions.slice(0, limit as number);
  }
  
  // ===== 3D可视化相关方法 =====
  
  // 生成3D模型
  private async handleGenerate3DModel(params: Record<string, unknown>): Promise<DomainModel3D> {
    const { domainModel, layoutType = 'force', viewSettings } = params;
    
    if (!domainModel) {
      throw new Error('DomainModel parameter is required');
    }
    
    // 模拟3D模型生成
    const model3D: DomainModel3D = {
      id: `3d-${Date.now()}`,
      domainModelId: 'domain-1',
      entities: [
        {
          id: 'entity-1',
          name: 'User',
          position: { x: 0, y: 0, z: 0 },
          scale: { x: 1, y: 1, z: 1 },
          rotation: { x: 0, y: 0, z: 0 },
          color: '#4F46E5',
          geometry: 'box',
          metadata: { type: 'entity', attributes: ['id', 'name', 'email'] }
        },
        {
          id: 'entity-2',
          name: 'Order',
          position: { x: 5, y: 0, z: 0 },
          scale: { x: 1, y: 1, z: 1 },
          rotation: { x: 0, y: 0, z: 0 },
          color: '#059669',
          geometry: 'box',
          metadata: { type: 'entity', attributes: ['id', 'userId', 'total'] }
        }
      ],
      relationships: [
        {
          id: 'rel-1',
          sourceEntityId: 'entity-1',
          targetEntityId: 'entity-2',
          relationshipType: 'one-to-many',
          points: [
            { x: 2.5, y: 0, z: 0 },
            { x: 2.5, y: 1, z: 0 },
            { x: 2.5, y: 0, z: 0 }
          ],
          color: '#6B7280',
          style: 'solid'
        }
      ],
      layout: {
        type: layoutType as 'force' | 'hierarchical' | 'circular' | 'grid',
        spacing: 5,
        levels: 3
      },
      viewSettings: {
        camera: {
          position: { x: 10, y: 10, z: 10 },
          target: { x: 0, y: 0, z: 0 },
          fov: 75
        },
        lighting: {
          ambient: { intensity: 0.4, color: '#ffffff' },
          directional: {
            intensity: 0.8,
            color: '#ffffff',
            position: { x: 10, y: 10, z: 5 }
          }
        },
        background: '#f8fafc',
        showGrid: true,
        showAxes: false,
        ...(viewSettings as any)
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    return model3D;
  }
  
  // 更新3D模型
  private async handleUpdate3DModel(params: Record<string, unknown>): Promise<DomainModel3D> {
    const { modelId, updates } = params;
    
    if (!modelId) {
      throw new Error('ModelId parameter is required');
    }
    
    // 模拟更新逻辑
    const existingModel = await this.handleGenerate3DModel({ domainModel: {} });
    const updatedModel: DomainModel3D = {
      ...existingModel,
      ...(updates as Partial<DomainModel3D>),
      updatedAt: new Date()
    };
    
    return updatedModel;
  }
  
  // 导出3D模型
  private async handleExport3DModel(params: Record<string, unknown>): Promise<{ format: string; data: string }> {
    const { modelId, format = 'gltf' } = params;
    
    if (!modelId) {
      throw new Error('ModelId parameter is required');
    }
    
    // 模拟导出逻辑
    const exportData = {
      format: format as string,
      data: `Exported 3D model ${modelId} in ${format} format`
    };
    
    return exportData;
  }

  // 生成Mermaid代码
  private generateMermaidCode(type: string, data: Record<string, unknown>): string {
    switch (type) {
      case 'flowchart':
        return this.generateFlowchartCode(data);
      case 'sequence':
        return this.generateSequenceCode(data);
      case 'class':
        return this.generateClassCode(data);
      case 'state':
        return this.generateStateCode(data);
      case 'entity-relationship':
        return this.generateERCode(data);
      default:
        throw new Error(`Unsupported chart type: ${type}`);
    }
  }

  // 生成流程图代码
  private generateFlowchartCode(data: Record<string, unknown>): string {
    const { nodes, edges } = data;
    let code = 'graph TD\n';
    
    // 添加节点
    if (nodes && Array.isArray(nodes)) {
      for (const node of nodes as any[]) {
        const shape = this.getNodeShape(node.type || 'default');
        code += `    ${node.id}${shape}\n`;
      }
    }
    
    // 添加边
    if (edges && Array.isArray(edges)) {
      for (const edge of edges as any[]) {
        const arrow = edge.type === 'dashed' ? '-..->' : '-->';
        const label = edge.label ? `|${edge.label}|` : '';
        code += `    ${edge.source} ${arrow}${label} ${edge.target}\n`;
      }
    }
    
    return code;
  }

  // 生成序列图代码
  private generateSequenceCode(data: Record<string, unknown>): string {
    const { participants, messages } = data;
    let code = 'sequenceDiagram\n';
    
    // 添加参与者
    if (participants && Array.isArray(participants)) {
      for (const participant of participants as any[]) {
        code += `    participant ${participant.id} as ${participant.name}\n`;
      }
    }
    
    // 添加消息
    if (messages && Array.isArray(messages)) {
      for (const message of messages as any[]) {
        const arrow = message.type === 'async' ? '-)' : '->';
        code += `    ${message.from}${arrow}${message.to}: ${message.text}\n`;
      }
    }
    
    return code;
  }

  // 生成类图代码
  private generateClassCode(data: Record<string, unknown>): string {
    const { classes, relationships } = data;
    let code = 'classDiagram\n';
    
    // 添加类
    if (classes && Array.isArray(classes)) {
      for (const cls of classes as any[]) {
        code += `    class ${cls.name} {\n`;
        
        // 添加属性
        if (cls.attributes && Array.isArray(cls.attributes)) {
          for (const attr of cls.attributes as any[]) {
            const visibility = attr.visibility || '+';
            code += `        ${visibility}${attr.type} ${attr.name}\n`;
          }
        }
        
        // 添加方法
        if (cls.methods && Array.isArray(cls.methods)) {
          for (const method of cls.methods as any[]) {
            const visibility = method.visibility || '+';
            const params = method.parameters ? method.parameters.join(', ') : '';
            code += `        ${visibility}${method.name}(${params}) ${method.returnType || 'void'}\n`;
          }
        }
        
        code += '    }\n';
      }
    }
    
    // 添加关系
    if (relationships && Array.isArray(relationships)) {
      for (const rel of relationships as any[]) {
        let arrow = '';
        switch (rel.type) {
          case 'inheritance':
            arrow = '--|>';
            break;
          case 'composition':
            arrow = '*--';
            break;
          case 'aggregation':
            arrow = 'o--';
            break;
          case 'association':
            arrow = '-->';
            break;
          default:
            arrow = '--';
        }
        code += `    ${rel.source} ${arrow} ${rel.target}\n`;
      }
    }
    
    return code;
  }

  // 生成状态图代码
  private generateStateCode(data: Record<string, unknown>): string {
    const { states, transitions } = data;
    let code = 'stateDiagram-v2\n';
    
    // 添加状态
    if (states && Array.isArray(states)) {
      for (const state of states as any[]) {
        if (state.type === 'start') {
          code += `    [*] --> ${state.id}\n`;
        } else if (state.type === 'end') {
          code += `    ${state.id} --> [*]\n`;
        } else {
          code += `    state "${state.name || state.id}" as ${state.id}\n`;
        }
      }
    }
    
    // 添加转换
    if (transitions && Array.isArray(transitions)) {
      for (const transition of transitions as any[]) {
        const label = transition.label ? ` : ${transition.label}` : '';
        code += `    ${transition.from} --> ${transition.to}${label}\n`;
      }
    }
    
    return code;
  }

  // 生成ER图代码
  private generateERCode(data: Record<string, unknown>): string {
    const { entities, relationships } = data;
    let code = 'erDiagram\n';
    
    // 添加实体
    if (entities && Array.isArray(entities)) {
      for (const entity of entities as any[]) {
        code += `    ${entity.name} {\n`;
        
        if (entity.attributes && Array.isArray(entity.attributes)) {
          for (const attr of entity.attributes as any[]) {
            const type = attr.type || 'string';
            const key = attr.isPrimaryKey ? ' PK' : attr.isForeignKey ? ' FK' : '';
            code += `        ${type} ${attr.name}${key}\n`;
          }
        }
        
        code += '    }\n';
      }
    }
    
    // 添加关系
    if (relationships && Array.isArray(relationships)) {
      for (const rel of relationships as any[]) {
        const cardinality = rel.cardinality || '||--o{';
        code += `    ${rel.source} ${cardinality} ${rel.target} : "${rel.label || 'relates to'}"\n`;
      }
    }
    
    return code;
  }

  // 获取节点形状
  private getNodeShape(type: string): string {
    const shapes = {
      'start': '([Start])',
      'end': '([End])',
      'process': '[Process]',
      'decision': '{Decision}',
      'data': '[/Data/]',
      'default': '[Default]'
    };
    return shapes[type as keyof typeof shapes] || shapes.default;
  }

  // 启动MCP服务器
  start(port: number = 3001): void {
    console.log(`MCP Server starting on port ${port}`);
    console.log('Available capabilities:', this.capabilities.map(c => c.name));
    console.log('Available methods:', Array.from(this.requestHandlers.keys()));
  }

  // 停止MCP服务器
  stop(): void {
    console.log('MCP Server stopped');
  }
}

// MCP客户端类（用于测试和集成）
export class MCPClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  // 发送请求
  async sendRequest(method: string, params: Record<string, unknown>): Promise<unknown> {
    const request: MCPRequest = {
      id: `req-${Date.now()}`,
      method,
      params,
      timestamp: new Date()
    };

    try {
      const response = await fetch(`${this.baseUrl}/mcp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const mcpResponse: MCPResponse = await response.json();
      
      if (mcpResponse.error) {
        throw new Error(mcpResponse.error.message);
      }

      return mcpResponse.result;
    } catch (error) {
      console.error('MCP request failed:', error);
      throw error;
    }
  }

  // 生成用例图
  async generateUseCase(requirements: string): Promise<UseCaseModel> {
    return this.sendRequest('generateUseCase', { requirements }) as Promise<UseCaseModel>;
  }

  // 生成领域模型
  async generateDomainModel(businessContext: string): Promise<DomainModel> {
    return this.sendRequest('generateDomainModel', { businessContext }) as Promise<DomainModel>;
  }

  // 生成自定义文档
  async generateDocument(type: string, input: Record<string, unknown>): Promise<BaseDocument> {
    return this.sendRequest('generateDocument', { type, input }) as Promise<BaseDocument>;
  }

  // 列出文档类型
  async listDocumentTypes(): Promise<DocumentTypeDefinition[]> {
    return this.sendRequest('listDocumentTypes', {}) as Promise<DocumentTypeDefinition[]>;
  }

  // 生成图表
  async generateChart(type: string, data: Record<string, unknown>): Promise<MermaidChart> {
    return this.sendRequest('generateChart', { type, data }) as Promise<MermaidChart>;
  }

  // 导出图表
  async exportChart(chartId: string, format: ExportFormat): Promise<Buffer> {
    return this.sendRequest('exportChart', { chartId, format }) as Promise<Buffer>;
  }

  // 获取能力
  async getCapabilities(): Promise<MCPCapability[]> {
    return this.sendRequest('getCapabilities', {}) as Promise<MCPCapability[]>;
  }

  // ===== 词汇管理相关方法 =====
  
  // 创建词汇术语
  async createVocabularyTerm(name: string, definition: string, options?: {
    category?: string;
    synonyms?: string[];
    relatedTerms?: string[];
    examples?: string[];
    tags?: string[];
  }): Promise<VocabularyTerm> {
    return this.sendRequest('createVocabularyTerm', {
      name,
      definition,
      ...options
    }) as Promise<VocabularyTerm>;
  }
  
  // 更新词汇术语
  async updateVocabularyTerm(id: string, updates: Partial<VocabularyTerm>): Promise<VocabularyTerm> {
    return this.sendRequest('updateVocabularyTerm', {
      id,
      ...updates
    }) as Promise<VocabularyTerm>;
  }
  
  // 删除词汇术语
  async deleteVocabularyTerm(id: string): Promise<{ success: boolean }> {
    return this.sendRequest('deleteVocabularyTerm', { id }) as Promise<{ success: boolean }>;
  }
  
  // 获取词汇术语列表
  async getVocabularyTerms(options?: {
    category?: string;
    limit?: number;
    offset?: number;
  }): Promise<VocabularyTerm[]> {
    return this.sendRequest('getVocabularyTerms', options || {}) as Promise<VocabularyTerm[]>;
  }
  
  // 搜索词汇术语
  async searchVocabularyTerms(query: string, category?: string): Promise<VocabularyTerm[]> {
    return this.sendRequest('searchVocabularyTerms', {
      query,
      category
    }) as Promise<VocabularyTerm[]>;
  }
  
  // 创建词汇关系
  async createVocabularyRelationship(
    sourceTermId: string,
    targetTermId: string,
    relationshipType: 'synonym' | 'antonym' | 'related' | 'parent' | 'child' | 'example',
    description?: string
  ): Promise<VocabularyRelationship> {
    return this.sendRequest('createVocabularyRelationship', {
      sourceTermId,
      targetTermId,
      relationshipType,
      description
    }) as Promise<VocabularyRelationship>;
  }
  
  // 获取词汇关系图谱
  async getVocabularyGraph(termId?: string, depth?: number): Promise<{ nodes: any[], edges: any[] }> {
    return this.sendRequest('getVocabularyGraph', {
      termId,
      depth
    }) as Promise<{ nodes: any[], edges: any[] }>;
  }
  
  // ===== 智能问答相关方法 =====
  
  // 创建知识条目
  async createKnowledgeEntry(
    title: string,
    content: string,
    options?: {
      category?: string;
      tags?: string[];
      source?: string;
    }
  ): Promise<KnowledgeEntry> {
    return this.sendRequest('createKnowledgeEntry', {
      title,
      content,
      ...options
    }) as Promise<KnowledgeEntry>;
  }
  
  // 搜索知识库
  async searchKnowledgeBase(
    query: string,
    options?: {
      category?: string;
      limit?: number;
    }
  ): Promise<KnowledgeEntry[]> {
    return this.sendRequest('searchKnowledgeBase', {
      query,
      ...options
    }) as Promise<KnowledgeEntry[]>;
  }
  
  // 提问
  async askQuestion(
    question: string,
    context?: string
  ): Promise<{ answer: string; sources: string[]; confidence: number }> {
    return this.sendRequest('askQuestion', {
      question,
      context
    }) as Promise<{ answer: string; sources: string[]; confidence: number }>;
  }
  
  // 获取问答历史
  async getQAHistory(userId?: string, limit?: number): Promise<QASession[]> {
    return this.sendRequest('getQAHistory', {
      userId,
      limit
    }) as Promise<QASession[]>;
  }
  
  // ===== 3D可视化相关方法 =====
  
  // 生成3D模型
  async generate3DModel(
    domainModel: any,
    options?: {
      layoutType?: 'force' | 'hierarchical' | 'circular' | 'grid';
      viewSettings?: any;
    }
  ): Promise<DomainModel3D> {
    return this.sendRequest('generate3DModel', {
      domainModel,
      ...options
    }) as Promise<DomainModel3D>;
  }
  
  // 更新3D模型
  async update3DModel(modelId: string, updates: any): Promise<DomainModel3D> {
    return this.sendRequest('update3DModel', {
      modelId,
      updates
    }) as Promise<DomainModel3D>;
  }
  
  // 导出3D模型
  async export3DModel(
    modelId: string,
    format?: string
  ): Promise<{ format: string; data: string }> {
    return this.sendRequest('export3DModel', {
      modelId,
      format
    }) as Promise<{ format: string; data: string }>;
  }
}

// 导出单例实例
export const mcpServer = new MCPServer();

// 使用示例
export const MCPExamples = {
  // Cursor Agent调用示例
  cursorAgentExample: `
// Cursor Agent调用示例
const mcpClient = new MCPClient('http://localhost:3001');

// 生成用例图
const useCase = await mcpClient.generateUseCase(
  "用户登录系统，包含注册、登录、密码重置功能"
);

// 生成领域模型
const domainModel = await mcpClient.generateDomainModel(
  "电商平台，包含用户、商品、订单、支付等业务领域"
);

// 自定义文档生成
const customDoc = await mcpClient.generateDocument('api-spec', {
  endpoints: [
    { path: '/users', method: 'GET', description: 'Get all users' },
    { path: '/users', method: 'POST', description: 'Create user' }
  ],
  schemas: {
    User: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        name: { type: 'string' },
        email: { type: 'string' }
      }
    }
  }
});

// 生成流程图
const flowchart = await mcpClient.generateChart('flowchart', {
  nodes: [
    { id: 'start', type: 'start', name: 'Start' },
    { id: 'process1', type: 'process', name: 'Process Data' },
    { id: 'decision1', type: 'decision', name: 'Valid?' },
    { id: 'end', type: 'end', name: 'End' }
  ],
  edges: [
    { source: 'start', target: 'process1' },
    { source: 'process1', target: 'decision1' },
    { source: 'decision1', target: 'end', label: 'Yes' }
  ]
});
  `,
  
  // MCP服务器配置示例
  serverConfigExample: `
// MCP服务器配置示例
import { mcpServer } from './MCPServer';

// 启动服务器
mcpServer.start(3001);

// 处理请求示例
const request = {
  id: 'req-123',
  method: 'generateUseCase',
  params: {
    requirements: '用户管理系统需求'
  },
  timestamp: new Date()
};

const response = await mcpServer.handleRequest(request);
console.log('MCP Response:', response);
  `
};