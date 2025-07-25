/*
 * @Author: KrabWW wei17306927526@gmail.com
 * @Date: 2025-07-23 21:39:33
 * @LastEditors: KrabWW wei17306927526@gmail.com
 * @LastEditTime: 2025-07-23 21:44:24
 * @FilePath: /ai-design-tool/src/lib/core/DocumentEngine.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
// 可扩展文档生成引擎核心实现

import type {
  BaseDocument,
  DocumentTypeDefinition,
  DocumentGenerator,
  GenerationOptions,
  ValidationResult,
  InputDefinition
} from '../../types/document';
import { generatorRegistry } from './GeneratorRegistry';
import { pluginSystem } from '../plugins/PluginSystem';

/**
 * 文档生成引擎 - 可扩展架构的核心
 * 支持插件化的文档类型注册和生成
 */
export class DocumentEngine {
  private documentTypes = new Map<string, DocumentTypeDefinition>();
  private generators = new Map<string, DocumentGenerator>();
  private static instance: DocumentEngine;

  private constructor() {
    this.initializeCoreTypes();
  }

  /**
   * 获取文档引擎单例实例
   */
  public static getInstance(): DocumentEngine {
    if (!DocumentEngine.instance) {
      DocumentEngine.instance = new DocumentEngine();
    }
    return DocumentEngine.instance;
  }

  /**
   * 注册文档类型
   */
  public registerDocumentType(definition: DocumentTypeDefinition): void {
    this.documentTypes.set(definition.type, definition);
    this.generators.set(definition.type, definition.generator);
    console.log(`Document type '${definition.type}' registered successfully`);
  }

  /**
   * 注销文档类型
   */
  public unregisterDocumentType(type: string): void {
    this.documentTypes.delete(type);
    this.generators.delete(type);
    console.log(`Document type '${type}' unregistered`);
  }

  /**
   * 获取文档类型定义
   */
  public getDocumentType(type: string): DocumentTypeDefinition | undefined {
    return this.documentTypes.get(type);
  }

  /**
   * 获取所有已注册的文档类型
   */
  public getRegisteredTypes(): DocumentTypeDefinition[] {
    return Array.from(this.documentTypes.values());
  }

  /**
   * 按类别获取文档类型
   */
  public getTypesByCategory(category: string): DocumentTypeDefinition[] {
    return Array.from(this.documentTypes.values())
      .filter(type => type.category === category);
  }

  /**
   * 生成文档
   */
  public async generateDocument(
    type: string,
    input: any,
    options?: GenerationOptions
  ): Promise<BaseDocument> {
    // 执行生成前钩子
    const hookContext = await pluginSystem.executeHook('before-document-generation', {
      type,
      input,
      options
    });

    const generator = this.generators.get(type);
    if (!generator) {
      throw new Error(`No generator found for document type: ${type}`);
    }

    // 验证输入
    const validation = generator.validate(hookContext.input);
    if (!validation.valid) {
      throw new Error(`Input validation failed: ${validation.errors.map(e => e.message).join(', ')}`);
    }

    // 生成文档
    try {
      const document = await generator.generate(hookContext.input, hookContext.options);
      
      // 执行生成后钩子
      const result = await pluginSystem.executeHook('after-document-generation', {
        type,
        input: hookContext.input,
        options: hookContext.options,
        document
      });
      
      console.log(`Document of type '${type}' generated successfully`);
      return result.document;
    } catch (error) {
      console.error(`Failed to generate document of type '${type}':`, error);
      throw error;
    }
  }

  /**
   * 验证输入数据
   */
  public validateInput(type: string, input: any): ValidationResult {
    const generator = this.generators.get(type);
    if (!generator) {
      return {
        valid: false,
        errors: [{ field: 'type', message: `Unknown document type: ${type}`, code: 'UNKNOWN_TYPE' }],
        warnings: []
      };
    }

    // 直接返回生成器的验证结果
    return generator.validate(input);
  }

  /**
   * 获取文档类型所需的输入定义
   */
  public getRequiredInputs(type: string): InputDefinition[] {
    const generator = this.generators.get(type);
    if (!generator) {
      throw new Error(`No generator found for document type: ${type}`);
    }

    return generator.getRequiredInputs();
  }

  /**
   * 检查文档类型是否存在
   */
  public hasDocumentType(type: string): boolean {
    return this.documentTypes.has(type);
  }

  /**
   * 获取文档类型统计信息
   */
  public getTypeStatistics(): Record<string, number> {
    const stats: Record<string, number> = {};
    
    for (const definition of this.documentTypes.values()) {
      const category = definition.category;
      stats[category] = (stats[category] || 0) + 1;
    }

    return stats;
  }

  /**
   * 初始化核心文档类型
   */
  private initializeCoreTypes(): void {
    // 从生成器注册中心获取内置文档类型
    this.syncWithGeneratorRegistry();
    console.log('DocumentEngine initialized with core types');
  }

  /**
   * 同步生成器注册中心
   */
  private syncWithGeneratorRegistry(): void {
    const generators = generatorRegistry.getAllGenerators();
    
    // 清除现有的映射
    this.documentTypes.clear();
    this.generators.clear();
    
    // 重新建立映射
    generators.forEach(gen => {
      this.documentTypes.set(gen.documentType.id, gen.documentType);
      this.generators.set(gen.documentType.id, gen.generator);
    });
  }

  /**
   * 刷新文档引擎
   */
  public refresh(): void {
    this.syncWithGeneratorRegistry();
  }

  /**
   * 重置引擎（主要用于测试）
   */
  public reset(): void {
    this.documentTypes.clear();
    this.generators.clear();
    this.initializeCoreTypes();
  }
}

// 导出单例实例
export const documentEngine = DocumentEngine.getInstance();