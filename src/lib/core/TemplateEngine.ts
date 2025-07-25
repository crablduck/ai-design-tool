// 模板引擎 - 支持JSON Schema驱动的文档模板系统

import type {
  BaseDocument,
  DocumentTypeDefinition,
  GenerationOptions,
  ValidationResult
} from '../../types/document';

/**
 * 模板数据接口
 */
export interface Template {
  id: string;
  name: string;
  description: string;
  documentType: string;
  schema: any; // JSON Schema
  template: string; // 模板内容（支持变量替换）
  variables: TemplateVariable[];
  metadata: TemplateMetadata;
  createdAt: Date;
  updatedAt: Date;
}

export interface TemplateVariable {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  description: string;
  required: boolean;
  defaultValue?: any;
  validation?: any; // JSON Schema validation
}

export interface TemplateMetadata {
  author: string;
  version: string;
  tags: string[];
  category: string;
  isBuiltin: boolean;
}

/**
 * 模板引擎 - 处理文档模板的渲染和管理
 */
export class TemplateEngine {
  private templates = new Map<string, Template>();
  private static instance: TemplateEngine;

  private constructor() {
    this.initializeBuiltinTemplates();
  }

  /**
   * 获取模板引擎单例实例
   */
  public static getInstance(): TemplateEngine {
    if (!TemplateEngine.instance) {
      TemplateEngine.instance = new TemplateEngine();
    }
    return TemplateEngine.instance;
  }

  /**
   * 注册模板
   */
  public registerTemplate(template: Template): void {
    // 验证模板
    const validation = this.validateTemplate(template);
    if (!validation.valid) {
      throw new Error(`Template validation failed: ${validation.errors.map(e => e.message).join(', ')}`);
    }

    this.templates.set(template.id, template);
    console.log(`Template '${template.name}' (${template.id}) registered successfully`);
  }

  /**
   * 注销模板
   */
  public unregisterTemplate(templateId: string): void {
    const template = this.templates.get(templateId);
    if (!template) {
      throw new Error(`Template not found: ${templateId}`);
    }

    if (template.metadata.isBuiltin) {
      throw new Error(`Cannot unregister builtin template: ${templateId}`);
    }

    this.templates.delete(templateId);
    console.log(`Template '${template.name}' (${templateId}) unregistered`);
  }

  /**
   * 获取模板
   */
  public getTemplate(templateId: string): Template | undefined {
    return this.templates.get(templateId);
  }

  /**
   * 获取所有模板
   */
  public getAllTemplates(): Template[] {
    return Array.from(this.templates.values());
  }

  /**
   * 按文档类型获取模板
   */
  public getTemplatesByDocumentType(documentType: string): Template[] {
    return Array.from(this.templates.values())
      .filter(template => template.documentType === documentType);
  }

  /**
   * 按类别获取模板
   */
  public getTemplatesByCategory(category: string): Template[] {
    return Array.from(this.templates.values())
      .filter(template => template.metadata.category === category);
  }

  /**
   * 渲染模板
   */
  public renderTemplate(
    templateId: string,
    data: Record<string, any>,
    options?: GenerationOptions
  ): string {
    const template = this.templates.get(templateId);
    if (!template) {
      throw new Error(`Template not found: ${templateId}`);
    }

    // 验证输入数据
    const validation = this.validateTemplateData(template, data);
    if (!validation.valid) {
      throw new Error(`Template data validation failed: ${validation.errors.map(e => e.message).join(', ')}`);
    }

    // 合并默认值
    const mergedData = this.mergeDefaultValues(template, data);

    // 渲染模板
    return this.processTemplate(template.template, mergedData, options);
  }

  /**
   * 验证模板数据
   */
  public validateTemplateData(template: Template, data: Record<string, any>): ValidationResult {
    const errors: Array<{ field: string; message: string; code: string }> = [];
    const warnings: Array<{ field: string; message: string; suggestion?: string }> = [];

    // 检查必需变量
    for (const variable of template.variables) {
      if (variable.required && !(variable.name in data)) {
        errors.push({
          field: variable.name,
          message: `Required variable '${variable.name}' is missing`,
          code: 'REQUIRED_VARIABLE'
        });
      }

      // 类型检查
      if (variable.name in data) {
        const value = data[variable.name];
        const expectedType = variable.type;
        const actualType = Array.isArray(value) ? 'array' : typeof value;

        if (actualType !== expectedType) {
          errors.push({
            field: variable.name,
            message: `Variable '${variable.name}' expected type '${expectedType}' but got '${actualType}'`,
            code: 'TYPE_MISMATCH'
          });
        }
      }
    }

    // 检查未知变量
    for (const key of Object.keys(data)) {
      const variable = template.variables.find(v => v.name === key);
      if (!variable) {
        warnings.push({
          field: key,
          message: `Unknown variable '${key}' will be ignored`,
          suggestion: 'Remove unused variables or add them to template definition'
        });
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * 验证模板数据（通过模板ID）
   */
  public validateData(templateId: string, data: Record<string, any>): ValidationResult {
    const template = this.templates.get(templateId);
    if (!template) {
      return {
        valid: false,
        errors: [{
          field: 'template',
          message: `Template '${templateId}' not found`,
          code: 'TEMPLATE_NOT_FOUND'
        }],
        warnings: []
      };
    }

    return this.validateTemplateData(template, data);
  }

  /**
   * 创建新模板
   */
  public createTemplate(
    name: string,
    documentType: string,
    templateContent: string,
    variables: TemplateVariable[],
    metadata: Partial<TemplateMetadata> = {}
  ): Template {
    const template: Template = {
      id: this.generateTemplateId(),
      name,
      description: (metadata as any).description || '',
      documentType,
      schema: this.generateSchemaFromVariables(variables),
      template: templateContent,
      variables,
      metadata: {
        author: metadata.author || 'Unknown',
        version: metadata.version || '1.0.0',
        tags: metadata.tags || [],
        category: metadata.category || 'custom',
        isBuiltin: false
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.registerTemplate(template);
    return template;
  }

  /**
   * 更新模板
   */
  public updateTemplate(templateId: string, updates: Partial<Template>): void {
    const template = this.templates.get(templateId);
    if (!template) {
      throw new Error(`Template not found: ${templateId}`);
    }

    if (template.metadata.isBuiltin) {
      throw new Error(`Cannot update builtin template: ${templateId}`);
    }

    const updatedTemplate = {
      ...template,
      ...updates,
      updatedAt: new Date()
    };

    this.templates.set(templateId, updatedTemplate);
    console.log(`Template '${template.name}' (${templateId}) updated`);
  }

  /**
   * 验证模板
   */
  private validateTemplate(template: Template): ValidationResult {
    const errors: Array<{ field: string; message: string; code: string }> = [];
    const warnings: Array<{ field: string; message: string; suggestion?: string }> = [];

    // 基本字段验证
    if (!template.id) {
      errors.push({ field: 'id', message: 'Template ID is required', code: 'REQUIRED_FIELD' });
    }

    if (!template.name) {
      errors.push({ field: 'name', message: 'Template name is required', code: 'REQUIRED_FIELD' });
    }

    if (!template.documentType) {
      errors.push({ field: 'documentType', message: 'Document type is required', code: 'REQUIRED_FIELD' });
    }

    if (!template.template) {
      errors.push({ field: 'template', message: 'Template content is required', code: 'REQUIRED_FIELD' });
    }

    // 检查ID冲突
    if (template.id && this.templates.has(template.id)) {
      errors.push({ field: 'id', message: `Template ID '${template.id}' already exists`, code: 'DUPLICATE_ID' });
    }

    // 检查模板语法
    if (template.template) {
      const syntaxCheck = this.checkTemplateSyntax(template.template);
      if (!syntaxCheck.valid) {
        errors.push({ field: 'template', message: syntaxCheck.error!, code: 'SYNTAX_ERROR' });
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * 合并默认值
   */
  private mergeDefaultValues(template: Template, data: Record<string, any>): Record<string, any> {
    const merged = { ...data };

    for (const variable of template.variables) {
      if (!(variable.name in merged) && variable.defaultValue !== undefined) {
        merged[variable.name] = variable.defaultValue;
      }
    }

    return merged;
  }

  /**
   * 处理模板内容
   */
  private processTemplate(
    templateContent: string,
    data: Record<string, any>,
    options?: GenerationOptions
  ): string {
    let result = templateContent;

    // 简单的变量替换（支持 {{variable}} 语法）
    result = result.replace(/\{\{\s*([^}]+)\s*\}\}/g, (match, variableName) => {
      const value = this.getNestedValue(data, variableName.trim());
      return value !== undefined ? String(value) : match;
    });

    // 支持条件语句 {{#if condition}} ... {{/if}}
    result = this.processConditionals(result, data);

    // 支持循环语句 {{#each array}} ... {{/each}}
    result = this.processLoops(result, data);

    return result;
  }

  /**
   * 获取嵌套对象的值
   */
  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : undefined;
    }, obj);
  }

  /**
   * 处理条件语句
   */
  private processConditionals(template: string, data: Record<string, any>): string {
    return template.replace(/\{\{#if\s+([^}]+)\}\}([\s\S]*?)\{\{\/if\}\}/g, (match, condition, content) => {
      const value = this.getNestedValue(data, condition.trim());
      return value ? content : '';
    });
  }

  /**
   * 处理循环语句
   */
  private processLoops(template: string, data: Record<string, any>): string {
    return template.replace(/\{\{#each\s+([^}]+)\}\}([\s\S]*?)\{\{\/each\}\}/g, (match, arrayPath, content) => {
      const array = this.getNestedValue(data, arrayPath.trim());
      if (!Array.isArray(array)) return '';

      return array.map((item, index) => {
        let itemContent = content;
        // 替换 {{this}} 为当前项
        itemContent = itemContent.replace(/\{\{this\}\}/g, String(item));
        // 替换 {{@index}} 为当前索引
        itemContent = itemContent.replace(/\{\{@index\}\}/g, String(index));
        // 如果item是对象，支持 {{property}} 语法
        if (typeof item === 'object' && item !== null) {
          itemContent = itemContent.replace(/\{\{\s*([^}@]+)\s*\}\}/g, (propMatch, propName) => {
            const value = item[propName.trim()];
            return value !== undefined ? String(value) : propMatch;
          });
        }
        return itemContent;
      }).join('');
    });
  }

  /**
   * 检查模板语法
   */
  private checkTemplateSyntax(template: string): { valid: boolean; error?: string } {
    try {
      // 检查括号匹配
      const openBrackets = (template.match(/\{\{/g) || []).length;
      const closeBrackets = (template.match(/\}\}/g) || []).length;
      
      if (openBrackets !== closeBrackets) {
        return { valid: false, error: 'Mismatched template brackets' };
      }

      // 检查条件语句匹配
      const ifStatements = (template.match(/\{\{#if/g) || []).length;
      const endIfStatements = (template.match(/\{\{\/if\}\}/g) || []).length;
      
      if (ifStatements !== endIfStatements) {
        return { valid: false, error: 'Mismatched if/endif statements' };
      }

      // 检查循环语句匹配
      const eachStatements = (template.match(/\{\{#each/g) || []).length;
      const endEachStatements = (template.match(/\{\{\/each\}\}/g) || []).length;
      
      if (eachStatements !== endEachStatements) {
        return { valid: false, error: 'Mismatched each/endeach statements' };
      }

      return { valid: true };
    } catch (error) {
      return { valid: false, error: `Template syntax error: ${error}` };
    }
  }

  /**
   * 从变量生成JSON Schema
   */
  private generateSchemaFromVariables(variables: TemplateVariable[]): any {
    const properties: Record<string, any> = {};
    const required: string[] = [];

    for (const variable of variables) {
      properties[variable.name] = {
        type: variable.type,
        description: variable.description,
        ...(variable.validation || {})
      };

      if (variable.required) {
        required.push(variable.name);
      }
    }

    return {
      type: 'object',
      properties,
      required
    };
  }

  /**
   * 生成模板ID
   */
  private generateTemplateId(): string {
    return `template_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 初始化内置模板
   */
  private initializeBuiltinTemplates(): void {
    // 这里会在后续实现中注册内置模板
    console.log('TemplateEngine initialized with builtin templates');
  }

  /**
   * 重置模板引擎（主要用于测试）
   */
  public reset(): void {
    this.templates.clear();
    this.initializeBuiltinTemplates();
  }
}

// 导出单例实例
export const templateEngine = TemplateEngine.getInstance();