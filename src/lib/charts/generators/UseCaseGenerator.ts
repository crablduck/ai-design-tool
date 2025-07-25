// 用例图生成器 - 核心业务资产生成器

import type {
  BaseDocument,
  UseCaseModel,
  Actor,
  UseCase,
  Relationship,
  DocumentGenerator,
  GenerationOptions,
  ValidationResult,
  InputDefinition
} from '../../../types/document';
import { mermaidRenderer } from '../MermaidRenderer';

/**
 * 用例图输入数据接口
 */
export interface UseCaseInput {
  title: string;
  description?: string;
  actors: Omit<Actor, 'id'>[];
  useCases: Omit<UseCase, 'id'>[];
  relationships: Omit<Relationship, 'id'>[];
  metadata?: {
    author?: string;
    version?: string;
    tags?: string[];
  };
}

/**
 * 用例图生成器
 */
export class UseCaseGenerator implements DocumentGenerator {
  /**
   * 生成用例图文档
   */
  public async generate(
    input: UseCaseInput,
    options?: GenerationOptions
  ): Promise<UseCaseModel> {
    // 验证输入
    const validation = this.validate(input);
    if (!validation.valid) {
      throw new Error(`Input validation failed: ${validation.errors.map(e => e.message).join(', ')}`);
    }

    // 生成ID
    const actors = input.actors.map((actor, index) => ({
      ...actor,
      id: `actor_${index + 1}`
    }));

    const useCases = input.useCases.map((useCase, index) => ({
      ...useCase,
      id: `usecase_${index + 1}`
    }));

    const relationships = input.relationships.map((rel, index) => ({
      ...rel,
      id: `rel_${index + 1}`
    }));

    // 生成Mermaid代码
    const mermaidCode = this.generateMermaidCode(actors, useCases, relationships);

    // 创建用例图文档
    const useCaseModel: UseCaseModel = {
      id: `usecase_${Date.now()}`,
      type: 'usecase',
      title: input.title,
      content: {
        actors,
        useCases,
        relationships,
        mermaidCode
      },
      metadata: {
        version: input.metadata?.version || '1.0.0',
        author: input.metadata?.author || 'Unknown',
        tags: input.metadata?.tags || ['usecase', 'core-asset'],
        description: input.description || '',
        exportFormats: ['svg', 'png', 'json', 'markdown'],
        dependencies: []
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };

    return useCaseModel;
  }

  /**
   * 验证输入数据
   */
  public validate(input: any): ValidationResult {
    const errors: Array<{ field: string; message: string; code: string }> = [];
    const warnings: Array<{ field: string; message: string; suggestion?: string }> = [];

    // 检查必需字段
    if (!input.title || typeof input.title !== 'string') {
      errors.push({ field: 'title', message: 'Title is required and must be a string', code: 'REQUIRED_FIELD' });
    }

    if (!input.actors || !Array.isArray(input.actors)) {
      errors.push({ field: 'actors', message: 'Actors array is required', code: 'REQUIRED_FIELD' });
    } else if (input.actors.length === 0) {
      warnings.push({ 
        field: 'actors', 
        message: 'No actors defined',
        suggestion: 'Add at least one actor to make the use case diagram meaningful'
      });
    }

    if (!input.useCases || !Array.isArray(input.useCases)) {
      errors.push({ field: 'useCases', message: 'Use cases array is required', code: 'REQUIRED_FIELD' });
    } else if (input.useCases.length === 0) {
      warnings.push({ 
        field: 'useCases', 
        message: 'No use cases defined',
        suggestion: 'Add at least one use case to make the diagram useful'
      });
    }

    if (!input.relationships || !Array.isArray(input.relationships)) {
      errors.push({ field: 'relationships', message: 'Relationships array is required', code: 'REQUIRED_FIELD' });
    }

    // 验证actors
    if (input.actors && Array.isArray(input.actors)) {
      input.actors.forEach((actor: any, index: number) => {
        if (!actor.name || typeof actor.name !== 'string') {
          errors.push({ 
            field: `actors[${index}].name`, 
            message: 'Actor name is required and must be a string', 
            code: 'REQUIRED_FIELD' 
          });
        }

        if (!actor.type || !['primary', 'secondary', 'system'].includes(actor.type)) {
          errors.push({ 
            field: `actors[${index}].type`, 
            message: 'Actor type must be one of: primary, secondary, system', 
            code: 'INVALID_VALUE' 
          });
        }
      });
    }

    // 验证use cases
    if (input.useCases && Array.isArray(input.useCases)) {
      input.useCases.forEach((useCase: any, index: number) => {
        if (!useCase.name || typeof useCase.name !== 'string') {
          errors.push({ 
            field: `useCases[${index}].name`, 
            message: 'Use case name is required and must be a string', 
            code: 'REQUIRED_FIELD' 
          });
        }

        if (!useCase.description || typeof useCase.description !== 'string') {
          warnings.push({ 
            field: `useCases[${index}].description`, 
            message: 'Use case description is recommended',
            suggestion: 'Add a description to clarify the use case purpose'
          });
        }

        if (!useCase.priority || !['high', 'medium', 'low'].includes(useCase.priority)) {
          warnings.push({ 
            field: `useCases[${index}].priority`, 
            message: 'Use case priority should be one of: high, medium, low',
            suggestion: 'Set priority to help with development planning'
          });
        }

        if (!useCase.mainFlow || !Array.isArray(useCase.mainFlow) || useCase.mainFlow.length === 0) {
          warnings.push({ 
            field: `useCases[${index}].mainFlow`, 
            message: 'Main flow steps are recommended',
            suggestion: 'Define the main flow steps for better documentation'
          });
        }
      });
    }

    // 验证relationships
    if (input.relationships && Array.isArray(input.relationships)) {
      input.relationships.forEach((rel: any, index: number) => {
        if (!rel.type || !['association', 'include', 'extend', 'generalization'].includes(rel.type)) {
          errors.push({ 
            field: `relationships[${index}].type`, 
            message: 'Relationship type must be one of: association, include, extend, generalization', 
            code: 'INVALID_VALUE' 
          });
        }

        if (!rel.source || typeof rel.source !== 'string') {
          errors.push({ 
            field: `relationships[${index}].source`, 
            message: 'Relationship source is required and must be a string', 
            code: 'REQUIRED_FIELD' 
          });
        }

        if (!rel.target || typeof rel.target !== 'string') {
          errors.push({ 
            field: `relationships[${index}].target`, 
            message: 'Relationship target is required and must be a string', 
            code: 'REQUIRED_FIELD' 
          });
        }
      });
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * 获取所需输入定义
   */
  public getRequiredInputs(): InputDefinition[] {
    return [
      {
        name: 'title',
        type: 'string',
        required: true,
        description: '用例图标题',
        validation: {
          type: 'string',
          minLength: 1,
          maxLength: 100
        }
      },
      {
        name: 'description',
        type: 'string',
        required: false,
        description: '用例图描述',
        validation: {
          type: 'string',
          maxLength: 500
        }
      },
      {
        name: 'actors',
        type: 'array',
        required: true,
        description: '参与者列表',
        validation: {
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
        }
      },
      {
        name: 'useCases',
        type: 'array',
        required: true,
        description: '用例列表',
        validation: {
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
        }
      },
      {
        name: 'relationships',
        type: 'array',
        required: true,
        description: '关系列表',
        validation: {
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
      }
    ];
  }

  /**
   * 生成Mermaid代码
   */
  private generateMermaidCode(
    actors: Actor[],
    useCases: UseCase[],
    relationships: Relationship[]
  ): string {
    const lines: string[] = [];
    
    // 图表声明
    lines.push('graph TD');
    lines.push('');
    
    // 添加参与者节点
    lines.push('  %% 参与者');
    actors.forEach(actor => {
      const shape = this.getActorShape(actor.type);
      const style = this.getActorStyle(actor.type);
      lines.push(`  ${actor.id}${shape}`);
      if (style) {
        lines.push(`  class ${actor.id} ${style}`);
      }
    });
    
    lines.push('');
    
    // 添加用例节点
    lines.push('  %% 用例');
    useCases.forEach(useCase => {
      const priority = useCase.priority || 'medium';
      const shape = this.getUseCaseShape();
      const style = this.getUseCaseStyle(priority);
      lines.push(`  ${useCase.id}${shape}`);
      if (style) {
        lines.push(`  class ${useCase.id} ${style}`);
      }
    });
    
    lines.push('');
    
    // 添加关系
    lines.push('  %% 关系');
    relationships.forEach(rel => {
      const arrow = this.getRelationshipArrow(rel.type);
      const label = rel.label ? `|${rel.label}|` : '';
      lines.push(`  ${rel.source} ${arrow}${label} ${rel.target}`);
    });
    
    lines.push('');
    
    // 添加样式定义
    lines.push('  %% 样式定义');
    lines.push('  classDef primaryActor fill:#e1f5fe,stroke:#01579b,stroke-width:2px,color:#000');
    lines.push('  classDef secondaryActor fill:#f3e5f5,stroke:#4a148c,stroke-width:2px,color:#000');
    lines.push('  classDef systemActor fill:#e8f5e8,stroke:#1b5e20,stroke-width:2px,color:#000');
    lines.push('  classDef highPriority fill:#ffebee,stroke:#c62828,stroke-width:2px,color:#000');
    lines.push('  classDef mediumPriority fill:#fff3e0,stroke:#ef6c00,stroke-width:2px,color:#000');
    lines.push('  classDef lowPriority fill:#f1f8e9,stroke:#33691e,stroke-width:2px,color:#000');
    
    return lines.join('\n');
  }

  /**
   * 获取参与者形状
   */
  private getActorShape(type: Actor['type']): string {
    switch (type) {
      case 'primary':
        return '["👤 主要参与者"]';
      case 'secondary':
        return '["👥 次要参与者"]';
      case 'system':
        return '["🖥️ 系统"]';
      default:
        return '["参与者"]';
    }
  }

  /**
   * 获取参与者样式
   */
  private getActorStyle(type: Actor['type']): string {
    switch (type) {
      case 'primary':
        return 'primaryActor';
      case 'secondary':
        return 'secondaryActor';
      case 'system':
        return 'systemActor';
      default:
        return 'primaryActor';
    }
  }

  /**
   * 获取用例形状
   */
  private getUseCaseShape(): string {
    return '((用例))';
  }

  /**
   * 获取用例样式
   */
  private getUseCaseStyle(priority: UseCase['priority']): string {
    switch (priority) {
      case 'high':
        return 'highPriority';
      case 'medium':
        return 'mediumPriority';
      case 'low':
        return 'lowPriority';
      default:
        return 'mediumPriority';
    }
  }

  /**
   * 获取关系箭头
   */
  private getRelationshipArrow(type: Relationship['type']): string {
    switch (type) {
      case 'association':
        return '-->';
      case 'include':
        return '-.->'; // 虚线箭头表示include
      case 'extend':
        return '-.->'; // 虚线箭头表示extend
      case 'generalization':
        return '==>';
      default:
        return '-->';
    }
  }

  /**
   * 生成用例图的Markdown文档
   */
  public generateMarkdown(useCaseModel: UseCaseModel): string {
    const lines: string[] = [];
    
    lines.push(`# ${useCaseModel.title}`);
    lines.push('');
    
    if (useCaseModel.metadata.description) {
      lines.push(`## 描述`);
      lines.push(useCaseModel.metadata.description);
      lines.push('');
    }
    
    // 参与者列表
    lines.push('## 参与者');
    lines.push('');
    useCaseModel.content.actors.forEach(actor => {
      lines.push(`### ${actor.name} (${actor.type})`);
      if (actor.description) {
        lines.push(actor.description);
      }
      lines.push('');
    });
    
    // 用例列表
    lines.push('## 用例');
    lines.push('');
    useCaseModel.content.useCases.forEach(useCase => {
      lines.push(`### ${useCase.name}`);
      lines.push(`**优先级**: ${useCase.priority}`);
      lines.push('');
      lines.push(`**描述**: ${useCase.description}`);
      lines.push('');
      
      if (useCase.preconditions && useCase.preconditions.length > 0) {
        lines.push('**前置条件**:');
        useCase.preconditions.forEach(condition => {
          lines.push(`- ${condition}`);
        });
        lines.push('');
      }
      
      if (useCase.mainFlow && useCase.mainFlow.length > 0) {
        lines.push('**主流程**:');
        useCase.mainFlow.forEach((step, index) => {
          lines.push(`${index + 1}. ${step}`);
        });
        lines.push('');
      }
      
      if (useCase.postconditions && useCase.postconditions.length > 0) {
        lines.push('**后置条件**:');
        useCase.postconditions.forEach(condition => {
          lines.push(`- ${condition}`);
        });
        lines.push('');
      }
    });
    
    // 关系说明
    if (useCaseModel.content.relationships.length > 0) {
      lines.push('## 关系');
      lines.push('');
      useCaseModel.content.relationships.forEach(rel => {
        const label = rel.label ? ` (${rel.label})` : '';
        lines.push(`- ${rel.source} --${rel.type}--> ${rel.target}${label}`);
      });
      lines.push('');
    }
    
    return lines.join('\n');
  }
}

// 导出生成器实例
export const useCaseGenerator = new UseCaseGenerator();