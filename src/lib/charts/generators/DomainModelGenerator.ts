// 领域模型生成器 - 核心业务资产生成器

import type {
  BaseDocument,
  DomainModel,
  Entity,
  ValueObject,
  Aggregate,
  DomainRelationship,
  KnowledgeGraphNode,
  DocumentGenerator,
  GenerationOptions,
  ValidationResult,
  InputDefinition
} from '../../../types/document';
import { mermaidRenderer } from '../MermaidRenderer';

/**
 * 领域模型输入数据接口
 */
export interface DomainModelInput {
  title: string;
  description?: string;
  entities: Omit<Entity, 'id'>[];
  valueObjects: Omit<ValueObject, 'id'>[];
  aggregates: Omit<Aggregate, 'id'>[];
  relationships: Omit<DomainRelationship, 'id'>[];
  knowledgeGraph?: Omit<KnowledgeGraphNode, 'id'>[];
  metadata?: {
    author?: string;
    version?: string;
    tags?: string[];
    domain?: string;
  };
}

/**
 * 领域模型生成器
 */
export class DomainModelGenerator implements DocumentGenerator {
  /**
   * 生成领域模型文档
   */
  public async generate(
    input: DomainModelInput,
    options?: GenerationOptions
  ): Promise<DomainModel> {
    // 验证输入
    const validation = this.validate(input);
    if (!validation.valid) {
      throw new Error(`Input validation failed: ${validation.errors.map(e => e.message).join(', ')}`);
    }

    // 生成ID
    const entities = input.entities.map((entity, index) => ({
      ...entity,
      id: `entity_${index + 1}`
    }));

    const valueObjects = input.valueObjects.map((vo, index) => ({
      ...vo,
      id: `vo_${index + 1}`
    }));

    const aggregates = input.aggregates.map((agg, index) => ({
      ...agg,
      id: `agg_${index + 1}`
    }));

    const relationships = input.relationships.map((rel, index) => ({
      ...rel,
      id: `rel_${index + 1}`
    }));

    const knowledgeGraph = input.knowledgeGraph?.map((node, index) => ({
      ...node,
      id: `kg_${index + 1}`
    })) || [];

    // 生成Mermaid代码
    const mermaidCode = this.generateMermaidCode(entities, valueObjects, aggregates, relationships);

    // 创建领域模型文档
    const domainModel: DomainModel = {
      id: `domain_${Date.now()}`,
      type: 'domain-model',
      title: input.title,
      content: {
        entities,
        valueObjects,
        aggregates,
        relationships,
        knowledgeGraph,
        mermaidCode
      },
      metadata: {
        version: input.metadata?.version || '1.0.0',
        author: input.metadata?.author || 'Unknown',
        tags: input.metadata?.tags || ['domain-model', 'core-asset'],
        description: input.description || '',
        exportFormats: ['svg', 'png', 'json', 'markdown'],
        dependencies: [],
        // domain属性不存在于DocumentMetadata中，移除此行
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };

    return domainModel;
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

    if (!input.entities || !Array.isArray(input.entities)) {
      errors.push({ field: 'entities', message: 'Entities array is required', code: 'REQUIRED_FIELD' });
    } else if (input.entities.length === 0) {
      warnings.push({ 
        field: 'entities', 
        message: 'No entities defined',
        suggestion: 'Add at least one entity to make the domain model meaningful'
      });
    }

    if (!input.valueObjects || !Array.isArray(input.valueObjects)) {
      input.valueObjects = []; // 值对象可以为空
    }

    if (!input.aggregates || !Array.isArray(input.aggregates)) {
      input.aggregates = []; // 聚合可以为空
    }

    if (!input.relationships || !Array.isArray(input.relationships)) {
      input.relationships = []; // 关系可以为空
    }

    // 验证实体
    if (input.entities && Array.isArray(input.entities)) {
      input.entities.forEach((entity: any, index: number) => {
        if (!entity.name || typeof entity.name !== 'string') {
          errors.push({ 
            field: `entities[${index}].name`, 
            message: 'Entity name is required and must be a string', 
            code: 'REQUIRED_FIELD' 
          });
        }

        if (!entity.description || typeof entity.description !== 'string') {
          warnings.push({ 
            field: `entities[${index}].description`, 
            message: 'Entity description is recommended',
            suggestion: 'Add a description to clarify the entity purpose'
          });
        }

        if (!entity.attributes || !Array.isArray(entity.attributes) || entity.attributes.length === 0) {
          warnings.push({ 
            field: `entities[${index}].attributes`, 
            message: 'Entity should have at least one attribute',
            suggestion: 'Define attributes to make the entity meaningful'
          });
        }

        // 验证属性
        if (entity.attributes && Array.isArray(entity.attributes)) {
          entity.attributes.forEach((attr: any, attrIndex: number) => {
            if (!attr.name || typeof attr.name !== 'string') {
              errors.push({ 
                field: `entities[${index}].attributes[${attrIndex}].name`, 
                message: 'Attribute name is required and must be a string', 
                code: 'REQUIRED_FIELD' 
              });
            }

            if (!attr.type || typeof attr.type !== 'string') {
              errors.push({ 
                field: `entities[${index}].attributes[${attrIndex}].type`, 
                message: 'Attribute type is required and must be a string', 
                code: 'REQUIRED_FIELD' 
              });
            }
          });
        }

        // 验证方法
        if (entity.methods && Array.isArray(entity.methods)) {
          entity.methods.forEach((method: any, methodIndex: number) => {
            if (!method.name || typeof method.name !== 'string') {
              errors.push({ 
                field: `entities[${index}].methods[${methodIndex}].name`, 
                message: 'Method name is required and must be a string', 
                code: 'REQUIRED_FIELD' 
              });
            }

            if (!method.returnType || typeof method.returnType !== 'string') {
              warnings.push({ 
                field: `entities[${index}].methods[${methodIndex}].returnType`, 
                message: 'Method return type is recommended',
                suggestion: 'Specify return type for better documentation'
              });
            }
          });
        }
      });
    }

    // 验证值对象
    if (input.valueObjects && Array.isArray(input.valueObjects)) {
      input.valueObjects.forEach((vo: any, index: number) => {
        if (!vo.name || typeof vo.name !== 'string') {
          errors.push({ 
            field: `valueObjects[${index}].name`, 
            message: 'Value object name is required and must be a string', 
            code: 'REQUIRED_FIELD' 
          });
        }

        if (!vo.attributes || !Array.isArray(vo.attributes) || vo.attributes.length === 0) {
          warnings.push({ 
            field: `valueObjects[${index}].attributes`, 
            message: 'Value object should have at least one attribute',
            suggestion: 'Define attributes to make the value object meaningful'
          });
        }
      });
    }

    // 验证聚合
    if (input.aggregates && Array.isArray(input.aggregates)) {
      input.aggregates.forEach((agg: any, index: number) => {
        if (!agg.name || typeof agg.name !== 'string') {
          errors.push({ 
            field: `aggregates[${index}].name`, 
            message: 'Aggregate name is required and must be a string', 
            code: 'REQUIRED_FIELD' 
          });
        }

        if (!agg.rootEntity || typeof agg.rootEntity !== 'string') {
          errors.push({ 
            field: `aggregates[${index}].rootEntity`, 
            message: 'Aggregate root entity is required and must be a string', 
            code: 'REQUIRED_FIELD' 
          });
        }

        if (!agg.entities || !Array.isArray(agg.entities) || agg.entities.length === 0) {
          warnings.push({ 
            field: `aggregates[${index}].entities`, 
            message: 'Aggregate should contain at least one entity',
            suggestion: 'Add entities to make the aggregate meaningful'
          });
        }
      });
    }

    // 验证关系
    if (input.relationships && Array.isArray(input.relationships)) {
      input.relationships.forEach((rel: any, index: number) => {
        if (!rel.type || !['association', 'composition', 'aggregation', 'inheritance', 'dependency'].includes(rel.type)) {
          errors.push({ 
            field: `relationships[${index}].type`, 
            message: 'Relationship type must be one of: association, composition, aggregation, inheritance, dependency', 
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
        description: '领域模型标题',
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
        description: '领域模型描述',
        validation: {
          type: 'string',
          maxLength: 500
        }
      },
      {
        name: 'entities',
        type: 'array',
        required: true,
        description: '实体列表',
        validation: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string', minLength: 1 },
              description: { type: 'string' },
              attributes: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    name: { type: 'string', minLength: 1 },
                    type: { type: 'string', minLength: 1 },
                    required: { type: 'boolean' },
                    description: { type: 'string' }
                  },
                  required: ['name', 'type']
                }
              },
              methods: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    name: { type: 'string', minLength: 1 },
                    returnType: { type: 'string' },
                    parameters: { type: 'array' },
                    description: { type: 'string' }
                  },
                  required: ['name']
                }
              }
            },
            required: ['name', 'description']
          }
        }
      },
      {
        name: 'valueObjects',
        type: 'array',
        required: false,
        description: '值对象列表',
        validation: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string', minLength: 1 },
              description: { type: 'string' },
              attributes: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    name: { type: 'string', minLength: 1 },
                    type: { type: 'string', minLength: 1 },
                    required: { type: 'boolean' }
                  },
                  required: ['name', 'type']
                }
              }
            },
            required: ['name', 'description']
          }
        }
      },
      {
        name: 'aggregates',
        type: 'array',
        required: false,
        description: '聚合列表',
        validation: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string', minLength: 1 },
              description: { type: 'string' },
              rootEntity: { type: 'string', minLength: 1 },
              entities: {
                type: 'array',
                items: { type: 'string' }
              },
              valueObjects: {
                type: 'array',
                items: { type: 'string' }
              }
            },
            required: ['name', 'description', 'rootEntity']
          }
        }
      },
      {
        name: 'relationships',
        type: 'array',
        required: false,
        description: '关系列表',
        validation: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              type: { type: 'string', enum: ['association', 'composition', 'aggregation', 'inheritance', 'dependency'] },
              source: { type: 'string', minLength: 1 },
              target: { type: 'string', minLength: 1 },
              label: { type: 'string' },
              multiplicity: { type: 'string' }
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
    entities: Entity[],
    valueObjects: ValueObject[],
    aggregates: Aggregate[],
    relationships: DomainRelationship[]
  ): string {
    const lines: string[] = [];
    
    // 图表声明
    lines.push('classDiagram');
    lines.push('');
    
    // 添加实体类
    lines.push('  %% 实体');
    entities.forEach(entity => {
      lines.push(`  class ${entity.name} {`);
      
      // 添加属性
      if (entity.attributes && entity.attributes.length > 0) {
        entity.attributes.forEach(attr => {
          const required = attr.required ? '+' : '-';
          lines.push(`    ${required}${attr.type} ${attr.name}`);
        });
      }
      
      // 添加方法
      if (entity.methods && entity.methods.length > 0) {
        entity.methods.forEach(method => {
          const params = method.parameters?.map(p => `${p.type} ${p.name}`).join(', ') || '';
          lines.push(`    +${method.name}(${params}) ${method.returnType || 'void'}`);
        });
      }
      
      lines.push('  }');
      lines.push('');
    });
    
    // 添加值对象类
    if (valueObjects.length > 0) {
      lines.push('  %% 值对象');
      valueObjects.forEach(vo => {
        lines.push(`  class ${vo.name} {`);
        lines.push('    <<ValueObject>>');
        
        if (vo.attributes && vo.attributes.length > 0) {
          vo.attributes.forEach(attr => {
            const required = attr.required ? '+' : '-';
            lines.push(`    ${required}${attr.type} ${attr.name}`);
          });
        }
        
        lines.push('  }');
        lines.push('');
      });
    }
    
    // 添加聚合注释
    if (aggregates.length > 0) {
      lines.push('  %% 聚合边界');
      aggregates.forEach(agg => {
        lines.push(`  note for ${agg.root} "聚合根: ${agg.name}"`);
      });
      lines.push('');
    }
    
    // 添加关系
    if (relationships.length > 0) {
      lines.push('  %% 关系');
      relationships.forEach(rel => {
        const arrow = this.getRelationshipArrow(rel.type);
        const label = rel.label ? ` : ${rel.label}` : '';
        const multiplicity = rel.cardinality ? ` "${rel.cardinality}"` : '';
        lines.push(`  ${rel.source} ${arrow} ${rel.target}${label}${multiplicity}`);
      });
    }
    
    return lines.join('\n');
  }

  /**
   * 获取关系箭头
   */
  private getRelationshipArrow(type: DomainRelationship['type']): string {
    switch (type) {
      case 'association':
        return '-->';
      case 'composition':
        return '*--';
      case 'aggregation':
        return 'o--';
      case 'inheritance':
        return '--|>';
      case 'dependency':
        return '..>';
      default:
        return '-->';
    }
  }

  /**
   * 生成领域模型的Markdown文档
   */
  public generateMarkdown(domainModel: DomainModel): string {
    const lines: string[] = [];
    
    lines.push(`# ${domainModel.title}`);
    lines.push('');
    
    if (domainModel.metadata.description) {
      lines.push(`## 描述`);
      lines.push(domainModel.metadata.description);
      lines.push('');
    }
    
    // 实体列表
    if (domainModel.content.entities.length > 0) {
      lines.push('## 实体');
      lines.push('');
      domainModel.content.entities.forEach(entity => {
        lines.push(`### ${entity.name}`);
        // Entity没有description属性，使用name作为描述
        lines.push(`实体: ${entity.name}`);
        lines.push('');
        
        if (entity.attributes && entity.attributes.length > 0) {
          lines.push('**属性**:');
          entity.attributes.forEach(attr => {
            const required = attr.required ? ' (必需)' : ' (可选)';
            const desc = attr.description ? ` - ${attr.description}` : '';
            lines.push(`- ${attr.name}: ${attr.type}${required}${desc}`);
          });
          lines.push('');
        }
        
        if (entity.methods && entity.methods.length > 0) {
          lines.push('**方法**:');
          entity.methods.forEach(method => {
            const params = method.parameters?.map(p => `${p.name}: ${p.type}`).join(', ') || '';
            const returnType = method.returnType || 'void';
            const desc = method.description ? ` - ${method.description}` : '';
            lines.push(`- ${method.name}(${params}): ${returnType}${desc}`);
          });
          lines.push('');
        }
      });
    }
    
    // 值对象列表
    if (domainModel.content.valueObjects.length > 0) {
      lines.push('## 值对象');
      lines.push('');
      domainModel.content.valueObjects.forEach(vo => {
        lines.push(`### ${vo.name}`);
        // ValueObject没有description属性，使用name作为描述
        lines.push(`值对象: ${vo.name}`);
        lines.push('');
        
        if (vo.attributes && vo.attributes.length > 0) {
          lines.push('**属性**:');
          vo.attributes.forEach(attr => {
            const required = attr.required ? ' (必需)' : ' (可选)';
            lines.push(`- ${attr.name}: ${attr.type}${required}`);
          });
          lines.push('');
        }
      });
    }
    
    // 聚合列表
    if (domainModel.content.aggregates.length > 0) {
      lines.push('## 聚合');
      lines.push('');
      domainModel.content.aggregates.forEach(agg => {
        lines.push(`### ${agg.name}`);
        // Aggregate没有description属性，使用name作为描述
        lines.push(`聚合: ${agg.name}`);
        lines.push('');
        
        lines.push(`**聚合根**: ${agg.root}`);
        lines.push('');
        
        if (agg.entities && agg.entities.length > 0) {
          lines.push('**包含实体**:');
          agg.entities.forEach(entity => {
            lines.push(`- ${entity}`);
          });
          lines.push('');
        }
        
        if (agg.valueObjects && agg.valueObjects.length > 0) {
          lines.push('**包含值对象**:');
          agg.valueObjects.forEach(vo => {
            lines.push(`- ${vo}`);
          });
          lines.push('');
        }
      });
    }
    
    // 关系说明
    if (domainModel.content.relationships.length > 0) {
      lines.push('## 关系');
      lines.push('');
      domainModel.content.relationships.forEach(rel => {
        const label = rel.label ? ` (${rel.label})` : '';
        const multiplicity = rel.cardinality ? ` [${rel.cardinality}]` : '';
        lines.push(`- ${rel.source} --${rel.type}--> ${rel.target}${label}${multiplicity}`);
      });
      lines.push('');
    }
    
    return lines.join('\n');
  }

  /**
   * 生成知识图谱
   */
  public generateKnowledgeGraph(domainModel: DomainModel): KnowledgeGraphNode[] {
    const nodes: KnowledgeGraphNode[] = [];
    
    // 为每个实体创建知识图谱节点
    domainModel.content.entities.forEach(entity => {
      nodes.push({
        id: `kg_entity_${entity.id}`,
        label: entity.name,
        type: 'entity',
        properties: {
          name: entity.name,
          description: entity.name || '',
          attributes: entity.attributes?.map(attr => attr.name) || [],
          methods: entity.methods?.map(method => method.name) || []
        },
        connections: []
      });
    });
    
    // 为每个值对象创建知识图谱节点
    domainModel.content.valueObjects.forEach(vo => {
      nodes.push({
        id: `kg_vo_${vo.id}`,
        label: vo.name,
        type: 'concept',
        properties: {
          name: vo.name,
          description: vo.name || '',
          attributes: vo.attributes?.map(attr => attr.name) || []
        },
        connections: []
      });
    });
    
    // 根据关系建立连接
    domainModel.content.relationships.forEach(rel => {
      const sourceNode = nodes.find(n => n.properties.name === rel.source);
      const targetNode = nodes.find(n => n.properties.name === rel.target);
      
      if (sourceNode && targetNode) {
        sourceNode.connections.push({
          target: targetNode.id,
          relationship: rel.type,
          weight: this.getRelationshipWeight(rel.type),
          properties: {
            label: rel.label
          }
        });
      }
    });
    
    return nodes;
  }

  /**
   * 获取关系权重
   */
  private getRelationshipWeight(type: DomainRelationship['type']): number {
    switch (type) {
      case 'composition':
        return 1.0; // 最强关系
      case 'aggregation':
        return 0.8;
      case 'inheritance':
        return 0.9;
      case 'association':
        return 0.6;
      case 'dependency':
        return 0.4; // 最弱关系
      default:
        return 0.5;
    }
  }
}

// 导出生成器实例
export const domainModelGenerator = new DomainModelGenerator();