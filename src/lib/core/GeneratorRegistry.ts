// 生成器注册中心 - 统一管理所有文档生成器

import type {
  DocumentGenerator,
  DocumentTypeDefinition,
  GenerationOptions,
  ValidationResult
} from '../../types/document';
import { useCaseGenerator } from '../charts/generators/UseCaseGenerator';
import { domainModelGenerator } from '../charts/generators/DomainModelGenerator';
import { businessProcessGenerator } from '../charts/generators/BusinessProcessGenerator';

/**
 * 生成器注册信息
 */
export interface GeneratorRegistration {
  id: string;
  name: string;
  description: string;
  category: string;
  generator: DocumentGenerator;
  documentType: DocumentTypeDefinition;
  version: string;
  author: string;
  tags: string[];
  dependencies: string[];
  enabled: boolean;
  priority: number; // 优先级，数字越小优先级越高
}

/**
 * 生成器注册中心
 */
export class GeneratorRegistry {
  private static instance: GeneratorRegistry;
  private generators = new Map<string, GeneratorRegistration>();
  private categories = new Set<string>();

  private constructor() {
    this.initializeBuiltinGenerators();
  }

  /**
   * 获取单例实例
   */
  public static getInstance(): GeneratorRegistry {
    if (!GeneratorRegistry.instance) {
      GeneratorRegistry.instance = new GeneratorRegistry();
    }
    return GeneratorRegistry.instance;
  }

  /**
   * 初始化内置生成器
   */
  private initializeBuiltinGenerators(): void {
    // 注册用例图生成器
    this.register({
      id: 'usecase-generator',
      name: '用例图生成器',
      description: '生成UML用例图，用于描述系统功能和用户交互',
      category: 'core-assets',
      generator: useCaseGenerator,
      documentType: {
        id: 'usecase',
        type: 'usecase',
        name: '用例图',
        description: 'UML用例图文档',
        icon: '👤',
        category: 'core-asset',
        schema: {
          type: 'object',
          properties: {
            title: { type: 'string', minLength: 1, maxLength: 100 },
            description: { type: 'string', maxLength: 500 },
            actors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string', minLength: 1 },
                  type: { type: 'string', enum: ['primary', 'secondary', 'system'] },
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
                  name: { type: 'string', minLength: 1 },
                  description: { type: 'string' },
                  priority: { type: 'string', enum: ['high', 'medium', 'low'] },
                  preconditions: { type: 'array', items: { type: 'string' } },
                  postconditions: { type: 'array', items: { type: 'string' } },
                  mainFlow: { type: 'array', items: { type: 'string' } }
                },
                required: ['name', 'description', 'priority']
              }
            },
            relationships: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  type: { type: 'string', enum: ['association', 'include', 'extend', 'generalization'] },
                  source: { type: 'string', minLength: 1 },
                  target: { type: 'string', minLength: 1 },
                  label: { type: 'string' }
                },
                required: ['type', 'source', 'target']
              }
            }
          },
          required: ['title', 'actors', 'useCases', 'relationships']
        },
        generator: useCaseGenerator,
        renderer: {} as any,
        exporter: {} as any
      },
      version: '1.0.0',
      author: 'System',
      tags: ['uml', 'usecase', 'core-asset', 'requirements'],
      dependencies: [],
      enabled: true,
      priority: 1
    });

    // 注册领域模型生成器
    this.register({
      id: 'domain-model-generator',
      name: '领域模型生成器',
      description: '生成DDD领域模型图，包括实体、值对象、聚合等',
      category: 'core-assets',
      generator: domainModelGenerator,
      documentType: {
        id: 'domain-model',
        type: 'domain-model',
        name: '领域模型',
        description: 'DDD领域模型文档',
        icon: '🏗️',
        category: 'core-asset',
        schema: {
          type: 'object',
          properties: {
            title: { type: 'string', minLength: 1, maxLength: 100 },
            description: { type: 'string', maxLength: 500 },
            entities: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string', minLength: 1 },
                  description: { type: 'string' },
                  attributes: { type: 'array' },
                  methods: { type: 'array' }
                },
                required: ['name', 'description']
              }
            },
            valueObjects: { type: 'array' },
            aggregates: { type: 'array' },
            relationships: { type: 'array' }
          },
          required: ['title', 'entities']
        },
        generator: domainModelGenerator,
        renderer: {} as any,
        exporter: {} as any
      },
      version: '1.0.0',
      author: 'System',
      tags: ['ddd', 'domain', 'model', 'core-asset', 'architecture'],
      dependencies: [],
      enabled: true,
      priority: 2
    });

    // 注册业务流程生成器
    this.register({
      id: 'business-process-generator',
      name: '业务流程生成器',
      description: '生成业务流程图，支持泳道、决策节点等',
      category: 'core-assets',
      generator: businessProcessGenerator,
      documentType: {
        id: 'business-process',
        type: 'business-process',
        name: '业务流程',
        description: '业务流程图文档',
        icon: '🔄',
        category: 'core-asset',
        schema: {
          type: 'object',
          properties: {
            title: { type: 'string', minLength: 1, maxLength: 100 },
            description: { type: 'string', maxLength: 500 },
            nodes: {
              type: 'array',
              minItems: 1,
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string', minLength: 1 },
                  type: { type: 'string', enum: ['start', 'end', 'process', 'decision', 'subprocess', 'data', 'document', 'manual', 'delay'] },
                  description: { type: 'string' },
                  responsible: { type: 'string' }
                },
                required: ['name', 'type']
              }
            },
            connections: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  source: { type: 'string', minLength: 1 },
                  target: { type: 'string', minLength: 1 },
                  label: { type: 'string' },
                  condition: { type: 'string' }
                },
                required: ['source', 'target']
              }
            },
            lanes: { type: 'array' }
          },
          required: ['title', 'nodes', 'connections']
        },
        generator: businessProcessGenerator,
        renderer: {} as any,
        exporter: {} as any
      },
      version: '1.0.0',
      author: 'System',
      tags: ['bpmn', 'process', 'workflow', 'core-asset', 'business'],
      dependencies: [],
      enabled: true,
      priority: 3
    });

    // 更新分类集合
    this.updateCategories();
  }

  /**
   * 注册生成器
   */
  public register(registration: GeneratorRegistration): void {
    this.generators.set(registration.id, registration);
    this.categories.add(registration.category);
  }

  /**
   * 注销生成器
   */
  public unregister(id: string): boolean {
    const result = this.generators.delete(id);
    if (result) {
      this.updateCategories();
    }
    return result;
  }

  /**
   * 获取生成器
   */
  public getGenerator(id: string): GeneratorRegistration | undefined {
    return this.generators.get(id);
  }

  /**
   * 获取所有生成器
   */
  public getAllGenerators(): GeneratorRegistration[] {
    return Array.from(this.generators.values())
      .filter(gen => gen.enabled)
      .sort((a, b) => a.priority - b.priority);
  }

  /**
   * 按分类获取生成器
   */
  public getGeneratorsByCategory(category: string): GeneratorRegistration[] {
    return Array.from(this.generators.values())
      .filter(gen => gen.enabled && gen.category === category)
      .sort((a, b) => a.priority - b.priority);
  }

  /**
   * 按标签搜索生成器
   */
  public searchGeneratorsByTag(tag: string): GeneratorRegistration[] {
    return Array.from(this.generators.values())
      .filter(gen => gen.enabled && gen.tags.includes(tag))
      .sort((a, b) => a.priority - b.priority);
  }

  /**
   * 搜索生成器
   */
  public searchGenerators(query: string): GeneratorRegistration[] {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.generators.values())
      .filter(gen => {
        if (!gen.enabled) return false;
        
        return (
          gen.name.toLowerCase().includes(lowerQuery) ||
          gen.description.toLowerCase().includes(lowerQuery) ||
          gen.tags.some(tag => tag.toLowerCase().includes(lowerQuery)) ||
          gen.category.toLowerCase().includes(lowerQuery)
        );
      })
      .sort((a, b) => a.priority - b.priority);
  }

  /**
   * 获取所有分类
   */
  public getCategories(): string[] {
    return Array.from(this.categories).sort();
  }

  /**
   * 启用生成器
   */
  public enableGenerator(id: string): boolean {
    const generator = this.generators.get(id);
    if (generator) {
      generator.enabled = true;
      return true;
    }
    return false;
  }

  /**
   * 禁用生成器
   */
  public disableGenerator(id: string): boolean {
    const generator = this.generators.get(id);
    if (generator) {
      generator.enabled = false;
      return true;
    }
    return false;
  }

  /**
   * 检查生成器是否存在
   */
  public hasGenerator(id: string): boolean {
    return this.generators.has(id);
  }

  /**
   * 获取生成器数量
   */
  public getGeneratorCount(): number {
    return this.generators.size;
  }

  /**
   * 获取启用的生成器数量
   */
  public getEnabledGeneratorCount(): number {
    return Array.from(this.generators.values()).filter(gen => gen.enabled).length;
  }

  /**
   * 验证生成器输入
   */
  public async validateInput(generatorId: string, input: any): Promise<ValidationResult> {
    const registration = this.generators.get(generatorId);
    if (!registration) {
      return {
        valid: false,
        errors: [{ field: 'generator', message: `Generator '${generatorId}' not found`, code: 'GENERATOR_NOT_FOUND' }],
        warnings: []
      };
    }

    if (!registration.enabled) {
      return {
        valid: false,
        errors: [{ field: 'generator', message: `Generator '${generatorId}' is disabled`, code: 'GENERATOR_DISABLED' }],
        warnings: []
      };
    }

    return registration.generator.validate(input);
  }

  /**
   * 生成文档
   */
  public async generateDocument(
    generatorId: string,
    input: any,
    options?: GenerationOptions
  ): Promise<any> {
    const registration = this.generators.get(generatorId);
    if (!registration) {
      throw new Error(`Generator '${generatorId}' not found`);
    }

    if (!registration.enabled) {
      throw new Error(`Generator '${generatorId}' is disabled`);
    }

    // 验证输入
    const validation = await this.validateInput(generatorId, input);
    if (!validation.valid) {
      throw new Error(`Input validation failed: ${validation.errors.map(e => e.message).join(', ')}`);
    }

    // 生成文档
    return registration.generator.generate(input, options);
  }

  /**
   * 获取生成器的输入定义
   */
  public getGeneratorInputs(generatorId: string) {
    const registration = this.generators.get(generatorId);
    if (!registration) {
      throw new Error(`Generator '${generatorId}' not found`);
    }

    return registration.generator.getRequiredInputs();
  }

  /**
   * 获取生成器统计信息
   */
  public getStatistics() {
    const total = this.generators.size;
    const enabled = this.getEnabledGeneratorCount();
    const disabled = total - enabled;
    const categories = this.getCategories();
    
    const categoryStats = categories.map(category => ({
      category,
      count: this.getGeneratorsByCategory(category).length
    }));

    return {
      total,
      enabled,
      disabled,
      categories: categories.length,
      categoryStats
    };
  }

  /**
   * 导出生成器配置
   */
  public exportConfiguration(): any {
    const generators = Array.from(this.generators.values()).map(gen => ({
      id: gen.id,
      name: gen.name,
      description: gen.description,
      category: gen.category,
      version: gen.version,
      author: gen.author,
      tags: gen.tags,
      dependencies: gen.dependencies,
      enabled: gen.enabled,
      priority: gen.priority,
      documentType: gen.documentType
    }));

    return {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      generators
    };
  }

  /**
   * 导入生成器配置
   */
  public importConfiguration(config: any): { success: number; failed: number; errors: string[] } {
    let success = 0;
    let failed = 0;
    const errors: string[] = [];

    if (!config.generators || !Array.isArray(config.generators)) {
      errors.push('Invalid configuration format');
      return { success, failed, errors };
    }

    config.generators.forEach((genConfig: any) => {
      try {
        // 验证配置
        if (!genConfig.id || !genConfig.name || !genConfig.documentType) {
          throw new Error('Missing required fields');
        }

        // 检查是否为内置生成器
        if (this.generators.has(genConfig.id)) {
          const existing = this.generators.get(genConfig.id)!;
          if (existing.author === 'System') {
            // 只更新启用状态和优先级
            existing.enabled = genConfig.enabled ?? existing.enabled;
            existing.priority = genConfig.priority ?? existing.priority;
          }
        } else {
          // 这里可以扩展支持外部生成器的导入
          errors.push(`External generator '${genConfig.id}' import not supported yet`);
          failed++;
          return;
        }

        success++;
      } catch (error) {
        failed++;
        errors.push(`Failed to import generator '${genConfig.id}': ${error}`);
      }
    });

    return { success, failed, errors };
  }

  /**
   * 更新分类集合
   */
  private updateCategories(): void {
    this.categories.clear();
    this.generators.forEach(gen => {
      this.categories.add(gen.category);
    });
  }

  /**
   * 重置为默认配置
   */
  public reset(): void {
    this.generators.clear();
    this.categories.clear();
    this.initializeBuiltinGenerators();
  }
}

// 导出单例实例
export const generatorRegistry = GeneratorRegistry.getInstance();