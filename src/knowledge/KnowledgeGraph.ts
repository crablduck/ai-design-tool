import {
  TechStack,
  TechCategory,
  KnowledgeGraph as IKnowledgeGraph,
  KnowledgeNode,
  KnowledgeEdge,
  NodeType,
  EdgeType,
  LearningPath,
  LearningNode,
  LearningNodeType,
  DifficultyLevel,
  UserProfile,
  SkillGap
} from '../types/knowledge';

/**
 * 知识图谱管理器
 * 负责技术栈关系管理、学习路径生成等功能
 */
export class KnowledgeGraph {
  private nodes: Map<string, KnowledgeNode> = new Map();
  private edges: Map<string, KnowledgeEdge> = new Map();
  private techStacks: Map<string, TechStack> = new Map();
  private adjacencyList: Map<string, Set<string>> = new Map(); // 邻接表
  private eventListeners: Map<string, Function[]> = new Map();

  constructor() {
    this.initializeEventSystem();
    this.loadDefaultTechStacks();
  }

  /**
   * 初始化事件系统
   */
  private initializeEventSystem(): void {
    const events = [
      'node.added',
      'node.updated',
      'node.removed',
      'edge.added',
      'edge.removed',
      'graph.updated'
    ];
    
    events.forEach(event => {
      this.eventListeners.set(event, []);
    });
  }

  /**
   * 加载默认技术栈
   */
  private async loadDefaultTechStacks(): Promise<void> {
    const defaultTechStacks = [
      // 前端技术栈
      {
        name: 'JavaScript',
        category: TechCategory.PROGRAMMING_LANGUAGE,
        description: '动态编程语言，Web开发的核心技术',
        popularity: 95,
        learningCurve: DifficultyLevel.INTERMEDIATE,
        tags: ['programming', 'web', 'frontend', 'backend']
      },
      {
        name: 'TypeScript',
        category: TechCategory.PROGRAMMING_LANGUAGE,
        description: 'JavaScript的超集，添加了静态类型',
        popularity: 85,
        learningCurve: DifficultyLevel.INTERMEDIATE,
        tags: ['programming', 'web', 'types', 'microsoft']
      },
      {
        name: 'React',
        category: TechCategory.FRAMEWORK,
        description: '用于构建用户界面的JavaScript库',
        popularity: 90,
        learningCurve: DifficultyLevel.INTERMEDIATE,
        tags: ['frontend', 'ui', 'facebook', 'spa']
      },
      {
        name: 'Vue.js',
        category: TechCategory.FRAMEWORK,
        description: '渐进式JavaScript框架',
        popularity: 80,
        learningCurve: DifficultyLevel.BEGINNER,
        tags: ['frontend', 'ui', 'progressive', 'spa']
      },
      {
        name: 'Angular',
        category: TechCategory.FRAMEWORK,
        description: '全功能的前端框架',
        popularity: 70,
        learningCurve: DifficultyLevel.ADVANCED,
        tags: ['frontend', 'ui', 'google', 'spa', 'typescript']
      },
      
      // 后端技术栈
      {
        name: 'Node.js',
        category: TechCategory.PLATFORM,
        description: '基于Chrome V8引擎的JavaScript运行时',
        popularity: 85,
        learningCurve: DifficultyLevel.INTERMEDIATE,
        tags: ['backend', 'javascript', 'server', 'runtime']
      },
      {
        name: 'Express.js',
        category: TechCategory.FRAMEWORK,
        description: 'Node.js的Web应用框架',
        popularity: 80,
        learningCurve: DifficultyLevel.BEGINNER,
        tags: ['backend', 'web', 'api', 'nodejs']
      },
      {
        name: 'NestJS',
        category: TechCategory.FRAMEWORK,
        description: '构建高效、可扩展的Node.js服务器端应用程序的框架',
        popularity: 60,
        learningCurve: DifficultyLevel.ADVANCED,
        tags: ['backend', 'typescript', 'decorators', 'enterprise']
      },
      
      // 数据库
      {
        name: 'MongoDB',
        category: TechCategory.DATABASE,
        description: 'NoSQL文档数据库',
        popularity: 75,
        learningCurve: DifficultyLevel.INTERMEDIATE,
        tags: ['database', 'nosql', 'document', 'json']
      },
      {
        name: 'PostgreSQL',
        category: TechCategory.DATABASE,
        description: '开源关系型数据库',
        popularity: 80,
        learningCurve: DifficultyLevel.INTERMEDIATE,
        tags: ['database', 'sql', 'relational', 'acid']
      },
      {
        name: 'Redis',
        category: TechCategory.DATABASE,
        description: '内存数据结构存储',
        popularity: 70,
        learningCurve: DifficultyLevel.BEGINNER,
        tags: ['database', 'cache', 'memory', 'nosql']
      },
      
      // 工具和平台
      {
        name: 'Docker',
        category: TechCategory.TOOL,
        description: '容器化平台',
        popularity: 85,
        learningCurve: DifficultyLevel.INTERMEDIATE,
        tags: ['devops', 'container', 'deployment']
      },
      {
        name: 'Kubernetes',
        category: TechCategory.PLATFORM,
        description: '容器编排平台',
        popularity: 75,
        learningCurve: DifficultyLevel.ADVANCED,
        tags: ['devops', 'orchestration', 'container', 'google']
      },
      {
        name: 'Git',
        category: TechCategory.TOOL,
        description: '分布式版本控制系统',
        popularity: 95,
        learningCurve: DifficultyLevel.BEGINNER,
        tags: ['vcs', 'collaboration', 'development']
      }
    ];

    // 创建技术栈节点
    for (const techData of defaultTechStacks) {
      await this.createTechStackNode(techData);
    }

    // 建立依赖关系
    await this.createDefaultRelationships();
  }

  /**
   * 创建默认关系
   */
  private async createDefaultRelationships(): Promise<void> {
    const relationships = [
      // TypeScript 依赖 JavaScript
      { from: 'TypeScript', to: 'JavaScript', type: EdgeType.EXTENDS },
      
      // React 依赖 JavaScript
      { from: 'React', to: 'JavaScript', type: EdgeType.DEPENDS_ON },
      
      // Vue.js 依赖 JavaScript
      { from: 'Vue.js', to: 'JavaScript', type: EdgeType.DEPENDS_ON },
      
      // Angular 依赖 TypeScript
      { from: 'Angular', to: 'TypeScript', type: EdgeType.DEPENDS_ON },
      
      // Express.js 依赖 Node.js
      { from: 'Express.js', to: 'Node.js', type: EdgeType.DEPENDS_ON },
      
      // NestJS 依赖 Node.js 和 TypeScript
      { from: 'NestJS', to: 'Node.js', type: EdgeType.DEPENDS_ON },
      { from: 'NestJS', to: 'TypeScript', type: EdgeType.DEPENDS_ON },
      
      // Node.js 依赖 JavaScript
      { from: 'Node.js', to: 'JavaScript', type: EdgeType.DEPENDS_ON },
      
      // Kubernetes 依赖 Docker
      { from: 'Kubernetes', to: 'Docker', type: EdgeType.DEPENDS_ON },
      
      // 相关技术
      { from: 'React', to: 'Vue.js', type: EdgeType.ALTERNATIVE_TO },
      { from: 'Vue.js', to: 'Angular', type: EdgeType.ALTERNATIVE_TO },
      { from: 'MongoDB', to: 'PostgreSQL', type: EdgeType.ALTERNATIVE_TO },
      { from: 'Express.js', to: 'NestJS', type: EdgeType.ALTERNATIVE_TO }
    ];

    for (const rel of relationships) {
      const fromNode = this.findNodeByName(rel.from);
      const toNode = this.findNodeByName(rel.to);
      
      if (fromNode && toNode) {
        await this.createDependencyRelation(fromNode.id, toNode.id, rel.type);
      }
    }
  }

  /**
   * 创建技术栈节点
   */
  async createTechStackNode(techStackData: Omit<TechStack, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const id = this.generateId();
    const now = new Date();
    
    const techStack: TechStack = {
      ...techStackData,
      id,
      createdAt: now,
      updatedAt: now
    };

    // 保存技术栈
    this.techStacks.set(id, techStack);

    // 创建知识图谱节点
    const node: KnowledgeNode = {
      id,
      type: NodeType.TECH_STACK,
      label: techStack.name,
      description: techStack.description,
      properties: {
        category: techStack.category,
        popularity: techStack.popularity,
        learningCurve: techStack.learningCurve,
        tags: techStack.tags
      }
    };

    this.nodes.set(id, node);
    this.adjacencyList.set(id, new Set());

    this.emit('node.added', { id, node, techStack });
    
    console.log(`Tech stack node created: ${techStack.name} (${id})`);
    return id;
  }

  /**
   * 创建依赖关系
   */
  async createDependencyRelation(fromId: string, toId: string, type: EdgeType): Promise<string> {
    const edgeId = this.generateId();
    
    const edge: KnowledgeEdge = {
      id: edgeId,
      source: fromId,
      target: toId,
      type,
      weight: this.calculateEdgeWeight(type)
    };

    this.edges.set(edgeId, edge);
    
    // 更新邻接表
    this.adjacencyList.get(fromId)?.add(toId);
    this.adjacencyList.get(toId)?.add(fromId);

    this.emit('edge.added', { id: edgeId, edge });
    
    console.log(`Dependency relation created: ${fromId} -> ${toId} (${type})`);
    return edgeId;
  }

  /**
   * 生成学习路径
   */
  async generateLearningPath(userProfile: UserProfile, targetSkills: string[]): Promise<LearningPath> {
    // 分析用户当前技能
    const currentSkills = userProfile.skills.map(skill => skill.name);
    
    // 计算技能差距
    const skillGaps = this.calculateSkillGaps(currentSkills, targetSkills);
    
    // 生成学习节点
    const learningNodes: LearningNode[] = [];
    let order = 1;

    for (const gap of skillGaps) {
      const path = this.findShortestPath(gap.from, gap.to);
      
      for (const nodeId of path) {
        const techStack = this.techStacks.get(nodeId);
        if (techStack && !learningNodes.find(n => n.skillId === nodeId)) {
          const learningNode: LearningNode = {
            id: this.generateId(),
            skillId: nodeId,
            title: `学习 ${techStack.name}`,
            description: techStack.description,
            type: this.getLearningNodeType(techStack),
            estimatedTime: this.estimateTime(techStack),
            difficulty: techStack.learningCurve,
            resources: [],
            prerequisites: this.getPrerequisites(nodeId),
            order: order++
          };
          
          learningNodes.push(learningNode);
        }
      }
    }

    // 排序学习节点
    learningNodes.sort((a, b) => {
      // 按依赖关系排序
      if (a.prerequisites.includes(b.skillId)) return 1;
      if (b.prerequisites.includes(a.skillId)) return -1;
      
      // 按难度排序
      const difficultyOrder = {
        [DifficultyLevel.BEGINNER]: 1,
        [DifficultyLevel.INTERMEDIATE]: 2,
        [DifficultyLevel.ADVANCED]: 3,
        [DifficultyLevel.EXPERT]: 4
      };
      
      return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
    });

    // 重新分配顺序
    learningNodes.forEach((node, index) => {
      node.order = index + 1;
    });

    const learningPath: LearningPath = {
      id: this.generateId(),
      title: `学习路径: ${targetSkills.join(', ')}`,
      description: `为掌握 ${targetSkills.join(', ')} 而定制的学习路径`,
      targetAudience: this.getTargetAudience(userProfile),
      estimatedDuration: learningNodes.reduce((total, node) => total + node.estimatedTime, 0),
      difficulty: this.calculatePathDifficulty(learningNodes),
      nodes: learningNodes,
      prerequisites: this.getPathPrerequisites(learningNodes),
      outcomes: targetSkills,
      createdBy: 'System',
      createdAt: new Date(),
      updatedAt: new Date(),
      tags: this.generatePathTags(targetSkills)
    };

    return learningPath;
  }

  /**
   * 查找最短路径（使用BFS）
   */
  findShortestPath(startNodeName: string, endNodeName: string): string[] {
    const startNode = this.findNodeByName(startNodeName);
    const endNode = this.findNodeByName(endNodeName);
    
    if (!startNode || !endNode) {
      return [];
    }

    if (startNode.id === endNode.id) {
      return [startNode.id];
    }

    const queue: Array<{ nodeId: string; path: string[] }> = [
      { nodeId: startNode.id, path: [startNode.id] }
    ];
    const visited = new Set<string>([startNode.id]);

    while (queue.length > 0) {
      const { nodeId, path } = queue.shift()!;
      
      const neighbors = this.adjacencyList.get(nodeId) || new Set();
      
      for (const neighborId of neighbors) {
        if (neighborId === endNode.id) {
          return [...path, neighborId];
        }
        
        if (!visited.has(neighborId)) {
          visited.add(neighborId);
          queue.push({
            nodeId: neighborId,
            path: [...path, neighborId]
          });
        }
      }
    }

    // 如果没有找到路径，直接返回目标节点
    return [endNode.id];
  }

  /**
   * 查找相关技术
   */
  findRelatedTechnologies(techId: string, depth: number = 2): TechStack[] {
    const visited = new Set<string>();
    const related: TechStack[] = [];
    
    const dfs = (nodeId: string, currentDepth: number) => {
      if (currentDepth > depth || visited.has(nodeId)) {
        return;
      }
      
      visited.add(nodeId);
      
      if (nodeId !== techId) {
        const techStack = this.techStacks.get(nodeId);
        if (techStack) {
          related.push(techStack);
        }
      }
      
      const neighbors = this.adjacencyList.get(nodeId) || new Set();
      for (const neighborId of neighbors) {
        dfs(neighborId, currentDepth + 1);
      }
    };
    
    dfs(techId, 0);
    
    // 按流行度排序
    return related.sort((a, b) => b.popularity - a.popularity);
  }

  /**
   * 获取知识图谱
   */
  getKnowledgeGraph(): IKnowledgeGraph {
    return {
      nodes: Array.from(this.nodes.values()),
      edges: Array.from(this.edges.values()),
      metadata: {
        version: '1.0.0',
        createdAt: new Date(),
        updatedAt: new Date(),
        nodeCount: this.nodes.size,
        edgeCount: this.edges.size,
        categories: this.getCategories()
      }
    };
  }

  /**
   * 获取技术栈
   */
  getTechStack(id: string): TechStack | null {
    return this.techStacks.get(id) || null;
  }

  /**
   * 搜索技术栈
   */
  searchTechStacks(query: string, filters: any = {}): TechStack[] {
    let results = Array.from(this.techStacks.values());

    // 文本搜索
    if (query) {
      const lowerQuery = query.toLowerCase();
      results = results.filter(tech => 
        tech.name.toLowerCase().includes(lowerQuery) ||
        tech.description.toLowerCase().includes(lowerQuery) ||
        tech.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
      );
    }

    // 分类过滤
    if (filters.category) {
      results = results.filter(tech => tech.category === filters.category);
    }

    // 难度过滤
    if (filters.difficulty) {
      results = results.filter(tech => tech.learningCurve === filters.difficulty);
    }

    // 流行度过滤
    if (filters.minPopularity) {
      results = results.filter(tech => tech.popularity >= filters.minPopularity);
    }

    // 按流行度排序
    return results.sort((a, b) => b.popularity - a.popularity);
  }

  // 辅助方法
  private findNodeByName(name: string): KnowledgeNode | null {
    for (const node of this.nodes.values()) {
      if (node.label === name) {
        return node;
      }
    }
    return null;
  }

  private calculateEdgeWeight(type: EdgeType): number {
    const weights = {
      [EdgeType.DEPENDS_ON]: 1.0,
      [EdgeType.EXTENDS]: 0.9,
      [EdgeType.USES]: 0.8,
      [EdgeType.RELATED_TO]: 0.6,
      [EdgeType.ALTERNATIVE_TO]: 0.4,
      [EdgeType.PART_OF]: 0.7,
      [EdgeType.IMPLEMENTS]: 0.8,
      [EdgeType.CREATED_BY]: 0.3,
      [EdgeType.MAINTAINED_BY]: 0.3,
      [EdgeType.PREREQUISITE]: 1.0
    };
    return weights[type] || 0.5;
  }

  private calculateSkillGaps(currentSkills: string[], targetSkills: string[]): SkillGap[] {
    return targetSkills.map(target => {
      const closest = this.findClosestSkill(currentSkills, target);
      return {
        from: closest || 'beginner',
        to: target,
        difficulty: this.getDifficultyForSkill(target),
        estimatedTime: this.getEstimatedTimeForSkill(target),
        resources: []
      };
    });
  }

  private findClosestSkill(currentSkills: string[], targetSkill: string): string | null {
    // 简化实现：查找是否有直接依赖关系
    const targetNode = this.findNodeByName(targetSkill);
    if (!targetNode) return null;

    for (const skill of currentSkills) {
      const skillNode = this.findNodeByName(skill);
      if (skillNode) {
        const path = this.findShortestPath(skill, targetSkill);
        if (path.length <= 3) { // 如果路径较短，认为是相关技能
          return skill;
        }
      }
    }
    
    return null;
  }

  private getDifficultyForSkill(skillName: string): DifficultyLevel {
    const node = this.findNodeByName(skillName);
    if (node && node.properties.learningCurve) {
      return node.properties.learningCurve;
    }
    return DifficultyLevel.INTERMEDIATE;
  }

  private getEstimatedTimeForSkill(skillName: string): number {
    const difficulty = this.getDifficultyForSkill(skillName);
    const timeMap = {
      [DifficultyLevel.BEGINNER]: 20,
      [DifficultyLevel.INTERMEDIATE]: 40,
      [DifficultyLevel.ADVANCED]: 80,
      [DifficultyLevel.EXPERT]: 120
    };
    return timeMap[difficulty] || 40;
  }

  private getLearningNodeType(techStack: TechStack): LearningNodeType {
    if (techStack.category === TechCategory.PROGRAMMING_LANGUAGE) {
      return LearningNodeType.CONCEPT;
    }
    if (techStack.category === TechCategory.FRAMEWORK || techStack.category === TechCategory.LIBRARY) {
      return LearningNodeType.TUTORIAL;
    }
    return LearningNodeType.PRACTICE;
  }

  private estimateTime(techStack: TechStack): number {
    return this.getEstimatedTimeForSkill(techStack.name);
  }

  private getPrerequisites(nodeId: string): string[] {
    const prerequisites: string[] = [];
    
    // 查找所有指向该节点的依赖边
    for (const edge of this.edges.values()) {
      if (edge.target === nodeId && 
          (edge.type === EdgeType.DEPENDS_ON || edge.type === EdgeType.PREREQUISITE)) {
        prerequisites.push(edge.source);
      }
    }
    
    return prerequisites;
  }

  private getTargetAudience(userProfile: UserProfile): string {
    const skillLevels = userProfile.skills.map(skill => skill.level);
    const avgLevel = skillLevels.length > 0 ? 
      skillLevels.reduce((sum, level) => {
        const levelMap = { 'none': 0, 'beginner': 1, 'intermediate': 2, 'advanced': 3, 'expert': 4 };
        return sum + (levelMap[level] || 0);
      }, 0) / skillLevels.length : 0;
    
    if (avgLevel < 1) return '初学者';
    if (avgLevel < 2) return '初级开发者';
    if (avgLevel < 3) return '中级开发者';
    return '高级开发者';
  }

  private calculatePathDifficulty(nodes: LearningNode[]): DifficultyLevel {
    if (nodes.length === 0) return DifficultyLevel.BEGINNER;
    
    const difficulties = nodes.map(node => node.difficulty);
    const maxDifficulty = difficulties.reduce((max, current) => {
      const difficultyOrder = {
        [DifficultyLevel.BEGINNER]: 1,
        [DifficultyLevel.INTERMEDIATE]: 2,
        [DifficultyLevel.ADVANCED]: 3,
        [DifficultyLevel.EXPERT]: 4
      };
      return difficultyOrder[current] > difficultyOrder[max] ? current : max;
    }, DifficultyLevel.BEGINNER);
    
    return maxDifficulty;
  }

  private getPathPrerequisites(nodes: LearningNode[]): string[] {
    const allPrerequisites = new Set<string>();
    
    nodes.forEach(node => {
      node.prerequisites.forEach(prereq => {
        if (!nodes.find(n => n.skillId === prereq)) {
          const techStack = this.techStacks.get(prereq);
          if (techStack) {
            allPrerequisites.add(techStack.name);
          }
        }
      });
    });
    
    return Array.from(allPrerequisites);
  }

  private generatePathTags(targetSkills: string[]): string[] {
    const tags = new Set<string>();
    
    targetSkills.forEach(skill => {
      const node = this.findNodeByName(skill);
      if (node && node.properties.tags) {
        node.properties.tags.forEach((tag: string) => tags.add(tag));
      }
    });
    
    return Array.from(tags);
  }

  private getCategories(): string[] {
    const categories = new Set<string>();
    
    this.techStacks.forEach(tech => {
      categories.add(tech.category);
    });
    
    return Array.from(categories);
  }

  private generateId(): string {
    return `kg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private emit(event: string, data: any): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(listener => {
        try {
          listener(data);
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error);
        }
      });
    }
  }

  /**
   * 事件监听
   */
  on(event: string, listener: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(listener);
  }
}

// 单例实例
export const knowledgeGraph = new KnowledgeGraph();