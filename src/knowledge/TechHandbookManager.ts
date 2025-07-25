import {
  TechHandbook,
  HandbookCategory,
  HandbookStatus,
  SearchFilters,
  SearchResult,
  Version,
  KnowledgeBaseManager
} from '../types/knowledge';

/**
 * 技术手册管理器
 * 负责技术手册的创建、更新、搜索、版本控制等功能
 */
export class TechHandbookManager {
  private handbooks: Map<string, TechHandbook> = new Map();
  private searchIndex: Map<string, Set<string>> = new Map(); // 关键词 -> 手册ID集合
  private versions: Map<string, Version[]> = new Map(); // 手册ID -> 版本列表
  private eventListeners: Map<string, Function[]> = new Map();

  constructor() {
    this.initializeEventSystem();
    this.loadDefaultHandbooks();
  }

  /**
   * 初始化事件系统
   */
  private initializeEventSystem(): void {
    const events = [
      'handbook.created',
      'handbook.updated',
      'handbook.deleted',
      'handbook.published',
      'handbook.archived'
    ];
    
    events.forEach(event => {
      this.eventListeners.set(event, []);
    });
  }

  /**
   * 加载默认技术手册
   */
  private async loadDefaultHandbooks(): Promise<void> {
    // 创建一些默认的技术手册
    const defaultHandbooks = [
      {
        title: 'React 开发指南',
        content: this.getReactHandbookContent(),
        category: HandbookCategory.FRONTEND,
        tags: ['react', 'javascript', 'frontend', 'hooks', 'components'],
        author: 'Tech Team',
        version: '1.0.0',
        status: HandbookStatus.PUBLISHED,
        metadata: {
          readingTime: 45,
          difficulty: 'intermediate' as any,
          prerequisites: ['JavaScript基础', 'HTML/CSS'],
          relatedTopics: ['Vue.js', 'Angular', 'TypeScript']
        }
      },
      {
        title: 'Node.js 后端开发',
        content: this.getNodeHandbookContent(),
        category: HandbookCategory.BACKEND,
        tags: ['nodejs', 'javascript', 'backend', 'express', 'api'],
        author: 'Tech Team',
        version: '1.0.0',
        status: HandbookStatus.PUBLISHED,
        metadata: {
          readingTime: 60,
          difficulty: 'intermediate' as any,
          prerequisites: ['JavaScript基础', 'HTTP协议'],
          relatedTopics: ['Express.js', 'Koa.js', 'NestJS']
        }
      },
      {
        title: 'TypeScript 最佳实践',
        content: this.getTypeScriptHandbookContent(),
        category: HandbookCategory.BEST_PRACTICES,
        tags: ['typescript', 'javascript', 'types', 'best-practices'],
        author: 'Tech Team',
        version: '1.0.0',
        status: HandbookStatus.PUBLISHED,
        metadata: {
          readingTime: 30,
          difficulty: 'advanced' as any,
          prerequisites: ['JavaScript进阶'],
          relatedTopics: ['JavaScript', 'Flow', '类型系统']
        }
      }
    ];

    for (const handbook of defaultHandbooks) {
      await this.createHandbook(handbook);
    }
  }

  /**
   * 创建技术手册
   */
  async createHandbook(handbook: Omit<TechHandbook, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const id = this.generateId();
    const now = new Date();
    
    const newHandbook: TechHandbook = {
      ...handbook,
      id,
      createdAt: now,
      updatedAt: now
    };

    // 保存手册
    this.handbooks.set(id, newHandbook);
    
    // 建立搜索索引
    this.indexHandbook(newHandbook);
    
    // 创建初始版本
    this.createVersion(id, newHandbook, 'Initial version');
    
    // 发布事件
    this.emit('handbook.created', { id, handbook: newHandbook });
    
    console.log(`Handbook created: ${newHandbook.title} (${id})`);
    return id;
  }

  /**
   * 更新技术手册
   */
  async updateHandbook(id: string, updates: Partial<TechHandbook>, message: string = 'Updated'): Promise<void> {
    const handbook = this.handbooks.get(id);
    if (!handbook) {
      throw new Error(`Handbook not found: ${id}`);
    }

    // 应用更新
    const updatedHandbook: TechHandbook = {
      ...handbook,
      ...updates,
      id, // 确保ID不被覆盖
      updatedAt: new Date()
    };

    // 保存更新
    this.handbooks.set(id, updatedHandbook);
    
    // 更新搜索索引
    this.removeFromIndex(handbook);
    this.indexHandbook(updatedHandbook);
    
    // 创建新版本
    this.createVersion(id, updatedHandbook, message);
    
    // 发布事件
    this.emit('handbook.updated', { id, handbook: updatedHandbook, changes: updates });
    
    console.log(`Handbook updated: ${updatedHandbook.title}`);
  }

  /**
   * 删除技术手册
   */
  async deleteHandbook(id: string): Promise<void> {
    const handbook = this.handbooks.get(id);
    if (!handbook) {
      throw new Error(`Handbook not found: ${id}`);
    }

    // 从索引中移除
    this.removeFromIndex(handbook);
    
    // 删除手册和版本
    this.handbooks.delete(id);
    this.versions.delete(id);
    
    // 发布事件
    this.emit('handbook.deleted', { id, handbook });
    
    console.log(`Handbook deleted: ${handbook.title}`);
  }

  /**
   * 获取技术手册
   */
  getHandbook(id: string): TechHandbook | null {
    return this.handbooks.get(id) || null;
  }

  /**
   * 搜索技术手册
   */
  searchHandbooks(query: string, filters: SearchFilters = {}): SearchResult[] {
    let results: SearchResult[] = [];

    if (query.trim()) {
      // 文本搜索
      const keywords = query.toLowerCase().split(/\s+/);
      const matchingIds = new Set<string>();

      // 查找匹配的手册ID
      keywords.forEach(keyword => {
        const ids = this.searchIndex.get(keyword);
        if (ids) {
          ids.forEach(id => matchingIds.add(id));
        }
      });

      // 构建搜索结果
      results = Array.from(matchingIds)
        .map(id => this.handbooks.get(id)!)
        .filter(handbook => handbook) // 确保手册存在
        .map(handbook => this.createSearchResult(handbook, keywords))
        .filter(result => result.relevanceScore > 0);
    } else {
      // 无查询词时返回所有手册
      results = Array.from(this.handbooks.values())
        .map(handbook => this.createSearchResult(handbook, []));
    }

    // 应用过滤器
    results = this.applyFilters(results, filters);

    // 按相关性排序
    results.sort((a, b) => b.relevanceScore - a.relevanceScore);

    return results;
  }

  /**
   * 获取手册版本历史
   */
  getHandbookVersions(id: string): Version[] {
    return this.versions.get(id) || [];
  }

  /**
   * 获取特定版本的手册
   */
  getHandbookVersion(id: string, version: string): TechHandbook | null {
    const versions = this.versions.get(id);
    if (!versions) return null;

    const versionInfo = versions.find(v => v.version === version);
    if (!versionInfo) return null;

    // 这里简化处理，实际应该存储每个版本的完整内容
    return this.handbooks.get(id);
  }

  /**
   * 发布手册
   */
  async publishHandbook(id: string): Promise<void> {
    const handbook = this.handbooks.get(id);
    if (!handbook) {
      throw new Error(`Handbook not found: ${id}`);
    }

    if (handbook.status === HandbookStatus.PUBLISHED) {
      throw new Error(`Handbook is already published: ${id}`);
    }

    await this.updateHandbook(id, {
      status: HandbookStatus.PUBLISHED,
      publishedAt: new Date()
    }, 'Published handbook');

    this.emit('handbook.published', { id, handbook });
  }

  /**
   * 归档手册
   */
  async archiveHandbook(id: string): Promise<void> {
    const handbook = this.handbooks.get(id);
    if (!handbook) {
      throw new Error(`Handbook not found: ${id}`);
    }

    await this.updateHandbook(id, {
      status: HandbookStatus.ARCHIVED
    }, 'Archived handbook');

    this.emit('handbook.archived', { id, handbook });
  }

  /**
   * 获取分类统计
   */
  getCategoryStats(): Record<HandbookCategory, number> {
    const stats = {} as Record<HandbookCategory, number>;
    
    // 初始化所有分类为0
    Object.values(HandbookCategory).forEach(category => {
      stats[category] = 0;
    });

    // 统计每个分类的手册数量
    Array.from(this.handbooks.values()).forEach(handbook => {
      stats[handbook.category]++;
    });

    return stats;
  }

  /**
   * 获取热门标签
   */
  getPopularTags(limit: number = 20): Array<{ tag: string; count: number }> {
    const tagCounts = new Map<string, number>();

    Array.from(this.handbooks.values()).forEach(handbook => {
      handbook.tags.forEach(tag => {
        tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
      });
    });

    return Array.from(tagCounts.entries())
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  /**
   * 获取相关手册
   */
  getRelatedHandbooks(id: string, limit: number = 5): TechHandbook[] {
    const handbook = this.handbooks.get(id);
    if (!handbook) return [];

    const related = Array.from(this.handbooks.values())
      .filter(h => h.id !== id)
      .map(h => ({
        handbook: h,
        score: this.calculateSimilarity(handbook, h)
      }))
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(item => item.handbook);

    return related;
  }

  /**
   * 建立搜索索引
   */
  private indexHandbook(handbook: TechHandbook): void {
    const keywords = this.extractKeywords(handbook);
    
    keywords.forEach(keyword => {
      if (!this.searchIndex.has(keyword)) {
        this.searchIndex.set(keyword, new Set());
      }
      this.searchIndex.get(keyword)!.add(handbook.id);
    });
  }

  /**
   * 从索引中移除
   */
  private removeFromIndex(handbook: TechHandbook): void {
    const keywords = this.extractKeywords(handbook);
    
    keywords.forEach(keyword => {
      const ids = this.searchIndex.get(keyword);
      if (ids) {
        ids.delete(handbook.id);
        if (ids.size === 0) {
          this.searchIndex.delete(keyword);
        }
      }
    });
  }

  /**
   * 提取关键词
   */
  private extractKeywords(handbook: TechHandbook): string[] {
    const keywords: string[] = [];
    
    // 标题关键词
    keywords.push(...handbook.title.toLowerCase().split(/\s+/));
    
    // 标签
    keywords.push(...handbook.tags.map(tag => tag.toLowerCase()));
    
    // 分类
    keywords.push(handbook.category.toLowerCase());
    
    // 作者
    keywords.push(handbook.author.toLowerCase());
    
    // 内容关键词（简化处理）
    const contentWords = handbook.content.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2);
    keywords.push(...contentWords.slice(0, 50)); // 限制数量
    
    return [...new Set(keywords)]; // 去重
  }

  /**
   * 创建搜索结果
   */
  private createSearchResult(handbook: TechHandbook, keywords: string[]): SearchResult {
    let relevanceScore = 0;
    const highlights: string[] = [];

    if (keywords.length > 0) {
      // 计算相关性分数
      keywords.forEach(keyword => {
        if (handbook.title.toLowerCase().includes(keyword)) {
          relevanceScore += 10;
          highlights.push(`Title: ${handbook.title}`);
        }
        if (handbook.tags.some(tag => tag.toLowerCase().includes(keyword))) {
          relevanceScore += 5;
        }
        if (handbook.content.toLowerCase().includes(keyword)) {
          relevanceScore += 1;
        }
      });
    } else {
      relevanceScore = 1; // 默认分数
    }

    return {
      id: handbook.id,
      title: handbook.title,
      type: 'handbook',
      description: handbook.content.substring(0, 200) + '...',
      relevanceScore,
      highlights,
      metadata: {
        category: handbook.category,
        tags: handbook.tags,
        author: handbook.author,
        difficulty: handbook.metadata.difficulty,
        readingTime: handbook.metadata.readingTime
      }
    };
  }

  /**
   * 应用过滤器
   */
  private applyFilters(results: SearchResult[], filters: SearchFilters): SearchResult[] {
    let filtered = results;

    // 分类过滤
    if (filters.categories && filters.categories.length > 0) {
      filtered = filtered.filter(result => 
        filters.categories!.includes(result.metadata.category)
      );
    }

    // 标签过滤
    if (filters.tags && filters.tags.length > 0) {
      filtered = filtered.filter(result => 
        filters.tags!.some(tag => 
          result.metadata.tags.includes(tag)
        )
      );
    }

    // 难度过滤
    if (filters.difficulty && filters.difficulty.length > 0) {
      filtered = filtered.filter(result => 
        filters.difficulty!.includes(result.metadata.difficulty)
      );
    }

    // 作者过滤
    if (filters.author) {
      filtered = filtered.filter(result => 
        result.metadata.author === filters.author
      );
    }

    return filtered;
  }

  /**
   * 计算相似度
   */
  private calculateSimilarity(handbook1: TechHandbook, handbook2: TechHandbook): number {
    let score = 0;

    // 分类相同
    if (handbook1.category === handbook2.category) {
      score += 5;
    }

    // 标签重叠
    const commonTags = handbook1.tags.filter(tag => handbook2.tags.includes(tag));
    score += commonTags.length * 2;

    // 难度相近
    if (handbook1.metadata.difficulty === handbook2.metadata.difficulty) {
      score += 3;
    }

    return score;
  }

  /**
   * 创建版本
   */
  private createVersion(handbookId: string, handbook: TechHandbook, message: string): void {
    if (!this.versions.has(handbookId)) {
      this.versions.set(handbookId, []);
    }

    const versions = this.versions.get(handbookId)!;
    const version: Version = {
      id: this.generateId(),
      version: handbook.version,
      changes: [message],
      author: handbook.author,
      createdAt: new Date(),
      message,
      breaking: false
    };

    versions.push(version);
  }

  /**
   * 生成ID
   */
  private generateId(): string {
    return `handbook_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
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

  /**
   * 发布事件
   */
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

  // 默认手册内容
  private getReactHandbookContent(): string {
    return `# React 开发指南

## 简介
React 是一个用于构建用户界面的 JavaScript 库，由 Facebook 开发和维护。

## 核心概念

### 1. 组件
组件是 React 应用的基本构建块。

### 2. JSX
JSX 是 JavaScript 的语法扩展。

### 3. Props
Props 是组件的输入参数。

### 4. State
State 是组件的内部状态。

### 5. Hooks
Hooks 让你在函数组件中使用状态和其他 React 特性。

## 最佳实践

1. 使用函数组件和 Hooks
2. 保持组件简单和可复用
3. 使用 TypeScript 提高代码质量
4. 合理使用 useEffect
5. 优化性能

## 常用 Hooks

- useState: 管理组件状态
- useEffect: 处理副作用
- useContext: 使用 Context
- useReducer: 复杂状态管理
- useMemo: 性能优化
- useCallback: 性能优化

## 总结
React 是一个强大且灵活的前端框架，掌握其核心概念和最佳实践对于现代前端开发至关重要。`;
  }

  private getNodeHandbookContent(): string {
    return `# Node.js 后端开发指南

## 简介
Node.js 是一个基于 Chrome V8 引擎的 JavaScript 运行时环境。

## 核心模块

### 1. HTTP 模块
用于创建 HTTP 服务器和客户端。

### 2. File System 模块
用于文件系统操作。

### 3. Path 模块
用于处理文件路径。

### 4. Events 模块
事件发射器。

## Express.js 框架

Express.js 是 Node.js 最流行的 Web 框架。

### 路由
定义应用程序端点。

### 中间件
处理请求和响应的函数。

### 模板引擎
动态生成 HTML。

## 数据库集成

### MongoDB
使用 Mongoose ODM。

### PostgreSQL
使用 pg 或 Sequelize。

### Redis
缓存和会话存储。

## 最佳实践

1. 使用环境变量
2. 错误处理
3. 日志记录
4. 安全性
5. 性能优化
6. 测试

## 部署

- PM2 进程管理
- Docker 容器化
- 云平台部署

## 总结
Node.js 为 JavaScript 开发者提供了强大的后端开发能力。`;
  }

  private getTypeScriptHandbookContent(): string {
    return `# TypeScript 最佳实践

## 简介
TypeScript 是 JavaScript 的超集，添加了静态类型检查。

## 类型系统

### 基本类型
- string
- number
- boolean
- array
- object

### 高级类型
- Union Types
- Intersection Types
- Generic Types
- Conditional Types

## 接口和类型别名

### 接口
定义对象的形状。

### 类型别名
为类型创建新名称。

## 泛型

创建可重用的组件。

## 装饰器

元编程特性。

## 最佳实践

1. 严格模式配置
2. 类型注解
3. 接口优于类型别名
4. 避免 any 类型
5. 使用联合类型
6. 泛型约束
7. 类型守卫

## 工具链

- TSC 编译器
- ESLint 代码检查
- Prettier 代码格式化
- Jest 测试框架

## 总结
TypeScript 提高了 JavaScript 代码的可维护性和可靠性。`;
  }
}

// 单例实例
export const techHandbookManager = new TechHandbookManager();