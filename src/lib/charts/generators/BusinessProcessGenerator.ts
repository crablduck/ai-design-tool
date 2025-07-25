// 业务流程图生成器 - 核心业务资产生成器

import type {
  DocumentGenerator,
  GenerationOptions,
  ValidationResult,
  InputDefinition,
  ExportFormat
} from '../../../types/document';
import { mermaidRenderer } from '../MermaidRenderer';

/**
 * 业务流程节点类型
 */
export type ProcessNodeType = 
  | 'start' 
  | 'end' 
  | 'process' 
  | 'decision' 
  | 'subprocess' 
  | 'data' 
  | 'document' 
  | 'manual' 
  | 'delay';

/**
 * 业务流程节点
 */
export interface ProcessNode {
  id: string;
  type: ProcessNodeType;
  name: string;
  description?: string;
  responsible?: string; // 负责人/角色
  duration?: string; // 预计耗时
  conditions?: string[]; // 决策节点的条件
  inputs?: string[]; // 输入
  outputs?: string[]; // 输出
  risks?: string[]; // 风险点
  controls?: string[]; // 控制措施
}

/**
 * 业务流程连接
 */
export interface ProcessConnection {
  id: string;
  source: string;
  target: string;
  label?: string;
  condition?: string; // 条件标签
  probability?: number; // 概率（0-1）
}

/**
 * 业务流程泳道
 */
export interface ProcessLane {
  id: string;
  name: string;
  description?: string;
  role: string; // 角色/部门
  nodes: string[]; // 包含的节点ID
}

/**
 * 业务流程模型
 */
export interface BusinessProcessModel {
  id: string;
  type: 'business-process';
  title: string;
  content: {
    nodes: ProcessNode[];
    connections: ProcessConnection[];
    lanes: ProcessLane[];
    mermaidCode: string;
  };
  metadata: {
    version: string;
    author: string;
    tags: string[];
    description: string;
    exportFormats: ExportFormat[];
    dependencies: string[];
    domain?: string;
    processType?: 'core' | 'support' | 'management';
    complexity?: 'low' | 'medium' | 'high';
    frequency?: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'ad-hoc';
  };
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 业务流程输入数据接口
 */
export interface BusinessProcessInput {
  title: string;
  description?: string;
  nodes: Omit<ProcessNode, 'id'>[];
  connections: Omit<ProcessConnection, 'id'>[];
  lanes?: Omit<ProcessLane, 'id' | 'nodes'>[];
  metadata?: {
    author?: string;
    version?: string;
    tags?: string[];
    domain?: string;
    processType?: 'core' | 'support' | 'management';
    complexity?: 'low' | 'medium' | 'high';
    frequency?: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'ad-hoc';
  };
}

/**
 * 业务流程图生成器
 */
export class BusinessProcessGenerator implements DocumentGenerator {
  /**
   * 生成业务流程图文档
   */
  public async generate(
    input: BusinessProcessInput,
    options?: GenerationOptions
  ): Promise<BusinessProcessModel> {
    // 验证输入
    const validation = this.validate(input);
    if (!validation.valid) {
      throw new Error(`Input validation failed: ${validation.errors.map(e => e.message).join(', ')}`);
    }

    // 生成ID
    const nodes = input.nodes.map((node, index) => ({
      ...node,
      id: `node_${index + 1}`
    }));

    const connections = input.connections.map((conn, index) => ({
      ...conn,
      id: `conn_${index + 1}`
    }));

    // 处理泳道
    const lanes = this.generateLanes(input.lanes || [], nodes);

    // 生成Mermaid代码
    const mermaidCode = this.generateMermaidCode(nodes, connections, lanes);

    // 创建业务流程图文档
    const businessProcess: BusinessProcessModel = {
      id: `process_${Date.now()}`,
      type: 'business-process',
      title: input.title,
      content: {
        nodes,
        connections,
        lanes,
        mermaidCode
      },
      metadata: {
        version: input.metadata?.version || '1.0.0',
        author: input.metadata?.author || 'Unknown',
        tags: input.metadata?.tags || ['business-process', 'core-asset'],
        description: input.description || '',
        exportFormats: ['svg' as ExportFormat, 'png' as ExportFormat, 'json' as ExportFormat, 'markdown' as ExportFormat],
        dependencies: [],
        domain: input.metadata?.domain || 'General',
        processType: input.metadata?.processType || 'core',
        complexity: input.metadata?.complexity || 'medium',
        frequency: input.metadata?.frequency || 'daily'
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };

    return businessProcess;
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

    if (!input.nodes || !Array.isArray(input.nodes)) {
      errors.push({ field: 'nodes', message: 'Nodes array is required', code: 'REQUIRED_FIELD' });
    } else if (input.nodes.length === 0) {
      errors.push({ field: 'nodes', message: 'At least one node is required', code: 'REQUIRED_FIELD' });
    }

    if (!input.connections || !Array.isArray(input.connections)) {
      errors.push({ field: 'connections', message: 'Connections array is required', code: 'REQUIRED_FIELD' });
    }

    // 验证节点
    if (input.nodes && Array.isArray(input.nodes)) {
      let hasStart = false;
      let hasEnd = false;

      input.nodes.forEach((node: any, index: number) => {
        if (!node.name || typeof node.name !== 'string') {
          errors.push({ 
            field: `nodes[${index}].name`, 
            message: 'Node name is required and must be a string', 
            code: 'REQUIRED_FIELD' 
          });
        }

        if (!node.type || !['start', 'end', 'process', 'decision', 'subprocess', 'data', 'document', 'manual', 'delay'].includes(node.type)) {
          errors.push({ 
            field: `nodes[${index}].type`, 
            message: 'Node type must be one of: start, end, process, decision, subprocess, data, document, manual, delay', 
            code: 'INVALID_VALUE' 
          });
        }

        if (node.type === 'start') hasStart = true;
        if (node.type === 'end') hasEnd = true;

        if (!node.description) {
          warnings.push({ 
            field: `nodes[${index}].description`, 
            message: 'Node description is recommended',
            suggestion: 'Add a description to clarify the node purpose'
          });
        }

        if (!node.responsible) {
          warnings.push({ 
            field: `nodes[${index}].responsible`, 
            message: 'Node responsible person/role is recommended',
            suggestion: 'Specify who is responsible for this step'
          });
        }

        if (node.type === 'decision' && (!node.conditions || !Array.isArray(node.conditions) || node.conditions.length === 0)) {
          warnings.push({ 
            field: `nodes[${index}].conditions`, 
            message: 'Decision node should have conditions defined',
            suggestion: 'Define the decision conditions for better clarity'
          });
        }
      });

      if (!hasStart) {
        warnings.push({ 
          field: 'nodes', 
          message: 'Process should have a start node',
          suggestion: 'Add a start node to clearly define the process beginning'
        });
      }

      if (!hasEnd) {
        warnings.push({ 
          field: 'nodes', 
          message: 'Process should have an end node',
          suggestion: 'Add an end node to clearly define the process completion'
        });
      }
    }

    // 验证连接
    if (input.connections && Array.isArray(input.connections)) {
      input.connections.forEach((conn: any, index: number) => {
        if (!conn.source || typeof conn.source !== 'string') {
          errors.push({ 
            field: `connections[${index}].source`, 
            message: 'Connection source is required and must be a string', 
            code: 'REQUIRED_FIELD' 
          });
        }

        if (!conn.target || typeof conn.target !== 'string') {
          errors.push({ 
            field: `connections[${index}].target`, 
            message: 'Connection target is required and must be a string', 
            code: 'REQUIRED_FIELD' 
          });
        }

        if (conn.probability !== undefined && (typeof conn.probability !== 'number' || conn.probability < 0 || conn.probability > 1)) {
          errors.push({ 
            field: `connections[${index}].probability`, 
            message: 'Connection probability must be a number between 0 and 1', 
            code: 'INVALID_VALUE' 
          });
        }
      });
    }

    // 验证泳道
    if (input.lanes && Array.isArray(input.lanes)) {
      input.lanes.forEach((lane: any, index: number) => {
        if (!lane.name || typeof lane.name !== 'string') {
          errors.push({ 
            field: `lanes[${index}].name`, 
            message: 'Lane name is required and must be a string', 
            code: 'REQUIRED_FIELD' 
          });
        }

        if (!lane.role || typeof lane.role !== 'string') {
          errors.push({ 
            field: `lanes[${index}].role`, 
            message: 'Lane role is required and must be a string', 
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
        description: '业务流程图标题',
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
        description: '业务流程图描述',
        validation: {
          type: 'string',
          maxLength: 500
        }
      },
      {
        name: 'nodes',
        type: 'array',
        required: true,
        description: '流程节点列表',
        validation: {
          type: 'array',
          minItems: 1,
          items: {
            type: 'object',
            properties: {
              name: { type: 'string', minLength: 1 },
              type: { type: 'string', enum: ['start', 'end', 'process', 'decision', 'subprocess', 'data', 'document', 'manual', 'delay'] },
              description: { type: 'string' },
              responsible: { type: 'string' },
              duration: { type: 'string' },
              conditions: { type: 'array', items: { type: 'string' } },
              inputs: { type: 'array', items: { type: 'string' } },
              outputs: { type: 'array', items: { type: 'string' } },
              risks: { type: 'array', items: { type: 'string' } },
              controls: { type: 'array', items: { type: 'string' } }
            },
            required: ['name', 'type']
          }
        }
      },
      {
        name: 'connections',
        type: 'array',
        required: true,
        description: '流程连接列表',
        validation: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              source: { type: 'string', minLength: 1 },
              target: { type: 'string', minLength: 1 },
              label: { type: 'string' },
              condition: { type: 'string' },
              probability: { type: 'number', minimum: 0, maximum: 1 }
            },
            required: ['source', 'target']
          }
        }
      },
      {
        name: 'lanes',
        type: 'array',
        required: false,
        description: '泳道列表（可选）',
        validation: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string', minLength: 1 },
              description: { type: 'string' },
              role: { type: 'string', minLength: 1 }
            },
            required: ['name', 'role']
          }
        }
      }
    ];
  }

  /**
   * 生成泳道
   */
  private generateLanes(
    inputLanes: Omit<ProcessLane, 'id' | 'nodes'>[],
    nodes: ProcessNode[]
  ): ProcessLane[] {
    if (inputLanes.length === 0) {
      // 如果没有定义泳道，根据节点的responsible字段自动生成
      const roles = new Set<string>();
      nodes.forEach(node => {
        if (node.responsible) {
          roles.add(node.responsible);
        }
      });

      return Array.from(roles).map((role, index) => ({
        id: `lane_${index + 1}`,
        name: role,
        description: `${role}负责的流程步骤`,
        role,
        nodes: nodes.filter(node => node.responsible === role).map(node => node.id)
      }));
    }

    // 使用用户定义的泳道
    return inputLanes.map((lane, index) => {
      const laneNodes = nodes.filter(node => node.responsible === lane.role);
      return {
        id: `lane_${index + 1}`,
        ...lane,
        nodes: laneNodes.map(node => node.id)
      };
    });
  }

  /**
   * 生成Mermaid代码
   */
  private generateMermaidCode(
    nodes: ProcessNode[],
    connections: ProcessConnection[],
    lanes: ProcessLane[]
  ): string {
    const lines: string[] = [];
    
    if (lanes.length > 0) {
      // 使用泳道图
      lines.push('graph TD');
      lines.push('');
      
      // 为每个泳道创建子图
      lanes.forEach(lane => {
        lines.push(`  subgraph ${lane.id}["${lane.name}"]`);
        
        // 添加泳道中的节点
        const laneNodes = nodes.filter(node => lane.nodes.includes(node.id));
        laneNodes.forEach(node => {
          const shape = this.getNodeShape(node.type, node.name);
          const style = this.getNodeStyle(node.type);
          lines.push(`    ${node.id}${shape}`);
          if (style) {
            lines.push(`    class ${node.id} ${style}`);
          }
        });
        
        lines.push('  end');
        lines.push('');
      });
      
      // 添加没有分配到泳道的节点
      const unassignedNodes = nodes.filter(node => 
        !lanes.some(lane => lane.nodes.includes(node.id))
      );
      
      if (unassignedNodes.length > 0) {
        lines.push('  %% 未分配泳道的节点');
        unassignedNodes.forEach(node => {
          const shape = this.getNodeShape(node.type, node.name);
          const style = this.getNodeStyle(node.type);
          lines.push(`  ${node.id}${shape}`);
          if (style) {
            lines.push(`  class ${node.id} ${style}`);
          }
        });
        lines.push('');
      }
    } else {
      // 普通流程图
      lines.push('flowchart TD');
      lines.push('');
      
      // 添加所有节点
      lines.push('  %% 流程节点');
      nodes.forEach(node => {
        const shape = this.getNodeShape(node.type, node.name);
        const style = this.getNodeStyle(node.type);
        lines.push(`  ${node.id}${shape}`);
        if (style) {
          lines.push(`  class ${node.id} ${style}`);
        }
      });
      lines.push('');
    }
    
    // 添加连接
    lines.push('  %% 流程连接');
    connections.forEach(conn => {
      const arrow = this.getConnectionArrow();
      const label = conn.label || conn.condition;
      const labelStr = label ? `|${label}|` : '';
      lines.push(`  ${conn.source} ${arrow}${labelStr} ${conn.target}`);
    });
    
    lines.push('');
    
    // 添加样式定义
    lines.push('  %% 样式定义');
    lines.push('  classDef startEnd fill:#e8f5e8,stroke:#2e7d32,stroke-width:3px,color:#000');
    lines.push('  classDef process fill:#e3f2fd,stroke:#1976d2,stroke-width:2px,color:#000');
    lines.push('  classDef decision fill:#fff3e0,stroke:#f57c00,stroke-width:2px,color:#000');
    lines.push('  classDef subprocess fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px,color:#000');
    lines.push('  classDef data fill:#e0f2f1,stroke:#00695c,stroke-width:2px,color:#000');
    lines.push('  classDef document fill:#fce4ec,stroke:#c2185b,stroke-width:2px,color:#000');
    lines.push('  classDef manual fill:#fff8e1,stroke:#ff8f00,stroke-width:2px,color:#000');
    lines.push('  classDef delay fill:#efebe9,stroke:#5d4037,stroke-width:2px,color:#000');
    
    return lines.join('\n');
  }

  /**
   * 获取节点形状
   */
  private getNodeShape(type: ProcessNodeType, name: string): string {
    switch (type) {
      case 'start':
        return `(["🚀 ${name}"])`;
      case 'end':
        return `(["🏁 ${name}"])`;
      case 'process':
        return `["⚙️ ${name}"]`;
      case 'decision':
        return `{"❓ ${name}"}`;
      case 'subprocess':
        return `[["📋 ${name}"]]`;
      case 'data':
        return `[("💾 ${name}")]`;
      case 'document':
        return `[/"📄 ${name}"/]`;
      case 'manual':
        return `["✋ ${name}"]`;
      case 'delay':
        return `["⏱️ ${name}"]`;
      default:
        return `["${name}"]`;
    }
  }

  /**
   * 获取节点样式
   */
  private getNodeStyle(type: ProcessNodeType): string {
    switch (type) {
      case 'start':
      case 'end':
        return 'startEnd';
      case 'process':
        return 'process';
      case 'decision':
        return 'decision';
      case 'subprocess':
        return 'subprocess';
      case 'data':
        return 'data';
      case 'document':
        return 'document';
      case 'manual':
        return 'manual';
      case 'delay':
        return 'delay';
      default:
        return 'process';
    }
  }

  /**
   * 获取连接箭头
   */
  private getConnectionArrow(): string {
    return '-->';
  }

  /**
   * 生成业务流程的Markdown文档
   */
  public generateMarkdown(processModel: BusinessProcessModel): string {
    const lines: string[] = [];
    
    lines.push(`# ${processModel.title}`);
    lines.push('');
    
    if (processModel.metadata.description) {
      lines.push(`## 描述`);
      lines.push(processModel.metadata.description);
      lines.push('');
    }
    
    // 流程信息
    lines.push('## 流程信息');
    lines.push(`- **流程类型**: ${processModel.metadata.processType}`);
    lines.push(`- **复杂度**: ${processModel.metadata.complexity}`);
    lines.push(`- **执行频率**: ${processModel.metadata.frequency}`);
    lines.push(`- **领域**: ${processModel.metadata.domain}`);
    lines.push('');
    
    // 泳道信息
    if (processModel.content.lanes.length > 0) {
      lines.push('## 参与角色');
      lines.push('');
      processModel.content.lanes.forEach(lane => {
        lines.push(`### ${lane.name}`);
        lines.push(`**角色**: ${lane.role}`);
        if (lane.description) {
          lines.push(`**描述**: ${lane.description}`);
        }
        lines.push(`**负责步骤**: ${lane.nodes.length}个`);
        lines.push('');
      });
    }
    
    // 流程步骤
    lines.push('## 流程步骤');
    lines.push('');
    processModel.content.nodes.forEach((node, index) => {
      lines.push(`### ${index + 1}. ${node.name} (${node.type})`);
      
      if (node.description) {
        lines.push(`**描述**: ${node.description}`);
      }
      
      if (node.responsible) {
        lines.push(`**负责人**: ${node.responsible}`);
      }
      
      if (node.duration) {
        lines.push(`**预计耗时**: ${node.duration}`);
      }
      
      if (node.inputs && node.inputs.length > 0) {
        lines.push('**输入**:');
        node.inputs.forEach(input => {
          lines.push(`- ${input}`);
        });
      }
      
      if (node.outputs && node.outputs.length > 0) {
        lines.push('**输出**:');
        node.outputs.forEach(output => {
          lines.push(`- ${output}`);
        });
      }
      
      if (node.conditions && node.conditions.length > 0) {
        lines.push('**决策条件**:');
        node.conditions.forEach(condition => {
          lines.push(`- ${condition}`);
        });
      }
      
      if (node.risks && node.risks.length > 0) {
        lines.push('**风险点**:');
        node.risks.forEach(risk => {
          lines.push(`- ${risk}`);
        });
      }
      
      if (node.controls && node.controls.length > 0) {
        lines.push('**控制措施**:');
        node.controls.forEach(control => {
          lines.push(`- ${control}`);
        });
      }
      
      lines.push('');
    });
    
    // 流程连接
    if (processModel.content.connections.length > 0) {
      lines.push('## 流程连接');
      lines.push('');
      processModel.content.connections.forEach(conn => {
        const sourceNode = processModel.content.nodes.find(n => n.id === conn.source);
        const targetNode = processModel.content.nodes.find(n => n.id === conn.target);
        const sourceName = sourceNode?.name || conn.source;
        const targetName = targetNode?.name || conn.target;
        
        let connectionDesc = `${sourceName} → ${targetName}`;
        
        if (conn.label) {
          connectionDesc += ` (${conn.label})`;
        }
        
        if (conn.condition) {
          connectionDesc += ` [条件: ${conn.condition}]`;
        }
        
        if (conn.probability !== undefined) {
          connectionDesc += ` [概率: ${(conn.probability * 100).toFixed(1)}%]`;
        }
        
        lines.push(`- ${connectionDesc}`);
      });
      lines.push('');
    }
    
    return lines.join('\n');
  }

  /**
   * 分析流程复杂度
   */
  public analyzeComplexity(processModel: BusinessProcessModel): {
    nodeCount: number;
    connectionCount: number;
    decisionPoints: number;
    parallelPaths: number;
    complexity: 'low' | 'medium' | 'high';
    suggestions: string[];
  } {
    const nodeCount = processModel.content.nodes.length;
    const connectionCount = processModel.content.connections.length;
    const decisionPoints = processModel.content.nodes.filter(n => n.type === 'decision').length;
    
    // 简单的并行路径检测（基于决策节点的输出连接数）
    let parallelPaths = 0;
    processModel.content.nodes.forEach(node => {
      if (node.type === 'decision') {
        const outgoingConnections = processModel.content.connections.filter(c => c.source === node.id);
        if (outgoingConnections.length > 1) {
          parallelPaths += outgoingConnections.length - 1;
        }
      }
    });
    
    // 计算复杂度
    let complexity: 'low' | 'medium' | 'high' = 'low';
    if (nodeCount > 20 || decisionPoints > 5 || parallelPaths > 3) {
      complexity = 'high';
    } else if (nodeCount > 10 || decisionPoints > 2 || parallelPaths > 1) {
      complexity = 'medium';
    }
    
    // 生成建议
    const suggestions: string[] = [];
    
    if (nodeCount > 15) {
      suggestions.push('考虑将流程分解为多个子流程以降低复杂度');
    }
    
    if (decisionPoints > 3) {
      suggestions.push('决策点较多，建议简化决策逻辑或使用决策表');
    }
    
    if (parallelPaths > 2) {
      suggestions.push('并行路径较多，注意同步点的设计');
    }
    
    const riskyNodes = processModel.content.nodes.filter(n => n.risks && n.risks.length > 0);
    if (riskyNodes.length > nodeCount * 0.3) {
      suggestions.push('风险节点较多，建议加强风险控制措施');
    }
    
    return {
      nodeCount,
      connectionCount,
      decisionPoints,
      parallelPaths,
      complexity,
      suggestions
    };
  }
}

// 导出生成器实例
export const businessProcessGenerator = new BusinessProcessGenerator();