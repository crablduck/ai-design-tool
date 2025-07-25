import { LearningPath, DifficultyLevel, LearningPathNode, ResourceType } from '../types/knowledge';

/**
 * 学习路径管理器
 * 负责管理学习路径的创建、更新、搜索和推荐
 */
export class LearningPathManager {
  private paths: Map<string, LearningPath> = new Map();
  private pathsByCategory: Map<string, string[]> = new Map();
  private pathsByDifficulty: Map<DifficultyLevel, string[]> = new Map();
  private userProgress: Map<string, Map<string, number>> = new Map(); // userId -> pathId -> progress

  constructor() {
    this.initializeDefaultPaths();
  }

  /**
   * 初始化默认学习路径
   */
  private initializeDefaultPaths() {
    const defaultPaths: LearningPath[] = [
      {
        id: 'react-fullstack-path',
        title: 'React 全栈开发路径',
        description: '从零开始学习 React 全栈开发，包括前端 React、状态管理、后端 Node.js、数据库设计等完整技术栈',
        targetAudience: '初级到中级开发者',
        estimatedDuration: 120,
        difficulty: DifficultyLevel.INTERMEDIATE,
        nodes: [
          {
            id: 'react-basics',
            title: 'React 基础',
            description: '学习 React 组件、JSX、Props 和 State',
            type: 'lesson',
            estimatedDuration: 15,
            prerequisites: ['javascript-basics'],
            resources: [
              { id: 'react-intro-video', type: ResourceType.VIDEO, title: 'React 入门教程', url: '/resources/react-intro', difficulty: DifficultyLevel.BEGINNER, tags: ['react', 'basics'], free: true },
              { id: 'react-docs', type: ResourceType.ARTICLE, title: 'React 官方文档', url: 'https://react.dev', difficulty: DifficultyLevel.BEGINNER, tags: ['react', 'documentation'], free: true },
              { id: 'first-component-exercise', type: ResourceType.EXERCISE, title: '创建第一个组件', url: '/exercises/first-component', difficulty: DifficultyLevel.BEGINNER, tags: ['react', 'exercise'], free: true }
            ]
          },
          {
            id: 'react-hooks',
            title: 'React Hooks',
            description: '掌握 useState、useEffect 等核心 Hooks',
            type: 'lesson',
            estimatedDuration: 20,
            prerequisites: ['react-basics'],
            resources: [
              { id: 'hooks-deep-dive', type: ResourceType.VIDEO, title: 'Hooks 深入解析', url: '/resources/hooks-deep-dive', difficulty: DifficultyLevel.INTERMEDIATE, tags: ['react', 'hooks'], free: true },
              { id: 'hooks-practice', type: ResourceType.EXERCISE, title: 'Hooks 实战练习', url: '/exercises/hooks-practice', difficulty: DifficultyLevel.INTERMEDIATE, tags: ['react', 'hooks', 'practice'], free: true }
            ]
          },
          {
            id: 'state-management',
            title: '状态管理',
            description: '学习 Redux、Zustand 等状态管理方案',
            type: 'lesson',
            estimatedDuration: 25,
            prerequisites: ['react-hooks'],
            resources: [
              { id: 'redux-toolkit-tutorial', type: ResourceType.ARTICLE, title: 'Redux 工具包教程', url: '/resources/redux-toolkit', difficulty: DifficultyLevel.INTERMEDIATE, tags: ['redux', 'state-management'], free: true },
              { id: 'shopping-cart-project', type: ResourceType.PROJECT, title: '购物车状态管理', url: '/projects/shopping-cart', difficulty: DifficultyLevel.INTERMEDIATE, tags: ['redux', 'project'], free: true }
            ]
          },
          {
            id: 'nodejs-backend',
            title: 'Node.js 后端开发',
            description: '使用 Express.js 构建 RESTful API',
            type: 'lesson',
            estimatedDuration: 30,
            prerequisites: ['javascript-advanced'],
            resources: [
              { id: 'express-tutorial', type: ResourceType.VIDEO, title: 'Express.js 完整教程', url: '/resources/express-tutorial', difficulty: DifficultyLevel.INTERMEDIATE, tags: ['nodejs', 'express', 'backend'], free: true },
              { id: 'api-server-project', type: ResourceType.PROJECT, title: 'API 服务器搭建', url: '/projects/api-server', difficulty: DifficultyLevel.INTERMEDIATE, tags: ['nodejs', 'api', 'project'], free: true }
             ]
          },
          {
            id: 'database-design',
            title: '数据库设计',
            description: '学习 MongoDB 和 PostgreSQL 数据库设计',
            type: 'lesson',
            estimatedDuration: 20,
            prerequisites: ['nodejs-backend'],
            resources: [
              { id: 'db-design-article', type: ResourceType.ARTICLE, title: '数据库设计最佳实践', url: '/resources/db-design', difficulty: DifficultyLevel.INTERMEDIATE, tags: ['database', 'design'], free: true },
              { id: 'user-db-exercise', type: ResourceType.EXERCISE, title: '设计用户系统数据库', url: '/exercises/user-db', difficulty: DifficultyLevel.INTERMEDIATE, tags: ['database', 'exercise'], free: true }
             ]
          },
          {
            id: 'fullstack-project',
            title: '全栈项目实战',
            description: '构建完整的全栈应用项目',
            type: 'project',
            estimatedDuration: 40,
            prerequisites: ['state-management', 'database-design'],
            resources: [
              { id: 'social-app-project', type: ResourceType.PROJECT, title: '社交媒体应用', url: '/projects/social-app', difficulty: DifficultyLevel.ADVANCED, tags: ['fullstack', 'project'], free: true },
              { id: 'deployment-guide', type: ResourceType.TUTORIAL, title: '部署指南', url: '/guides/deployment', difficulty: DifficultyLevel.INTERMEDIATE, tags: ['deployment', 'guide'], free: true }
             ]
          }
        ],
        prerequisites: ['JavaScript基础', 'HTML/CSS'],
        outcomes: ['React 开发', 'Node.js 后端', '全栈架构设计', '项目部署'],
        createdBy: 'Tech Team',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-12-20'),
        tags: ['react', 'fullstack', 'javascript', 'nodejs', 'database']
      },
      {
        id: 'vue-modern-dev',
        title: 'Vue.js 现代开发路径',
        description: '掌握 Vue.js 3.x 及其生态系统，包括 Composition API、Pinia、Vue Router 等现代开发技术',
        targetAudience: '中级开发者',
        estimatedDuration: 80,
        difficulty: DifficultyLevel.INTERMEDIATE,
        nodes: [
          {
            id: 'vue3-basics',
            title: 'Vue 3 基础',
            description: '学习 Vue 3 的基本概念和语法',
            type: 'lesson',
            estimatedDuration: 12,
            prerequisites: ['javascript-basics'],
            resources: [
              { id: 'vue3-intro-video', type: ResourceType.VIDEO, title: 'Vue 3 入门', url: '/resources/vue3-intro', difficulty: DifficultyLevel.BEGINNER, tags: ['vue', 'basics'], free: true },
              { id: 'vue3-docs', type: ResourceType.ARTICLE, title: 'Vue 3 官方指南', url: 'https://vuejs.org', difficulty: DifficultyLevel.BEGINNER, tags: ['vue', 'documentation'], free: true }
            ]
          },
          {
            id: 'composition-api',
            title: 'Composition API',
            description: '深入学习 Vue 3 的 Composition API',
            type: 'lesson',
            estimatedDuration: 18,
            prerequisites: ['vue3-basics'],
            resources: [
              { id: 'composition-api-video', type: ResourceType.VIDEO, title: 'Composition API 详解', url: '/resources/composition-api', difficulty: DifficultyLevel.INTERMEDIATE, tags: ['vue', 'composition-api'], free: true },
              { id: 'composition-practice', type: ResourceType.EXERCISE, title: 'Composition API 练习', url: '/exercises/composition-practice', difficulty: DifficultyLevel.INTERMEDIATE, tags: ['vue', 'practice'], free: true }
            ]
          },
          {
            id: 'vue-router',
            title: 'Vue Router',
            description: '学习 Vue Router 4 的路由管理',
            type: 'lesson',
            estimatedDuration: 15,
            prerequisites: ['composition-api'],
            resources: [
              { id: 'vue-router-guide', type: ResourceType.ARTICLE, title: 'Vue Router 指南', url: '/resources/vue-router', difficulty: DifficultyLevel.INTERMEDIATE, tags: ['vue', 'router'], free: true },
              { id: 'spa-routing-project', type: ResourceType.PROJECT, title: 'SPA 路由实战', url: '/projects/spa-routing', difficulty: DifficultyLevel.INTERMEDIATE, tags: ['vue', 'spa', 'project'], free: true }
            ]
          },
          {
            id: 'pinia-state',
            title: 'Pinia 状态管理',
            description: '使用 Pinia 进行状态管理',
            type: 'lesson',
            estimatedDuration: 20,
            prerequisites: ['vue-router'],
            resources: [
              { id: 'pinia-tutorial', type: ResourceType.VIDEO, title: 'Pinia 完整教程', url: '/resources/pinia-tutorial', difficulty: DifficultyLevel.INTERMEDIATE, tags: ['vue', 'pinia', 'state-management'], free: true },
              { id: 'pinia-practice', type: ResourceType.PROJECT, title: '状态管理实战', url: '/projects/pinia-practice', difficulty: DifficultyLevel.INTERMEDIATE, tags: ['vue', 'pinia', 'project'], free: true }
            ]
          },
          {
            id: 'vue-ecosystem',
            title: 'Vue 生态系统',
            description: '学习 Vite、Vitest、Vue DevTools 等工具',
            type: 'lesson',
            estimatedDuration: 15,
            prerequisites: ['pinia-state'],
            resources: [
              { id: 'vue-ecosystem-article', type: ResourceType.ARTICLE, title: 'Vue 生态系统概览', url: '/resources/vue-ecosystem', difficulty: DifficultyLevel.INTERMEDIATE, tags: ['vue', 'ecosystem'], free: true },
              { id: 'vue-dev-setup', type: ResourceType.TUTORIAL, title: '开发环境配置', url: '/guides/vue-dev-setup', difficulty: DifficultyLevel.BEGINNER, tags: ['vue', 'setup'], free: true }
            ]
          }
        ],
        prerequisites: ['JavaScript进阶', 'ES6+语法'],
        outcomes: ['Vue 3 开发', 'SPA 应用', '现代前端工程化'],
        createdBy: 'Vue Team',
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-12-18'),
        tags: ['vue', 'frontend', 'spa', 'composition-api', 'pinia']
      },
      {
        id: 'python-ai-path',
        title: 'Python AI 开发路径',
        description: '从 Python 基础到机器学习和深度学习的完整学习路径',
        targetAudience: '初级到高级开发者',
        estimatedDuration: 150,
        difficulty: DifficultyLevel.ADVANCED,
        nodes: [
          {
            id: 'python-basics',
            title: 'Python 基础',
            description: '学习 Python 语法、数据结构和面向对象编程',
            type: 'lesson',
            estimatedDuration: 25,
            prerequisites: [],
            resources: [
              { id: 'python-basics-video', type: ResourceType.VIDEO, title: 'Python 零基础教程', url: '/resources/python-basics', difficulty: DifficultyLevel.BEGINNER, tags: ['python', 'basics'], free: true },
              { id: 'python-practice', type: ResourceType.EXERCISE, title: 'Python 基础练习', url: '/exercises/python-practice', difficulty: DifficultyLevel.BEGINNER, tags: ['python', 'exercise'], free: true }
            ]
          },
          {
            id: 'numpy-pandas',
            title: 'NumPy & Pandas',
            description: '掌握数据处理的核心库',
            type: 'lesson',
            estimatedDuration: 20,
            prerequisites: ['python-basics'],
            resources: [
              { id: 'numpy-guide', type: ResourceType.ARTICLE, title: 'NumPy 完整指南', url: '/resources/numpy-guide', difficulty: DifficultyLevel.INTERMEDIATE, tags: ['python', 'numpy', 'data-science'], free: true },
              { id: 'data-analysis-project', type: ResourceType.PROJECT, title: '数据分析项目', url: '/projects/data-analysis', difficulty: DifficultyLevel.INTERMEDIATE, tags: ['python', 'data-analysis', 'project'], free: true }
            ]
          },
          {
            id: 'machine-learning',
            title: '机器学习基础',
            description: '学习 Scikit-learn 和机器学习算法',
            type: 'lesson',
            estimatedDuration: 35,
            prerequisites: ['numpy-pandas'],
            resources: [
              { id: 'ml-intro-video', type: ResourceType.VIDEO, title: '机器学习入门', url: '/resources/ml-intro', difficulty: DifficultyLevel.INTERMEDIATE, tags: ['python', 'machine-learning'], free: true },
              { id: 'prediction-model', type: ResourceType.PROJECT, title: '预测模型构建', url: '/projects/prediction-model', difficulty: DifficultyLevel.INTERMEDIATE, tags: ['machine-learning', 'project'], free: true }
            ]
          },
          {
            id: 'deep-learning',
            title: '深度学习',
            description: '使用 TensorFlow/PyTorch 进行深度学习',
            type: 'lesson',
            estimatedDuration: 40,
            prerequisites: ['machine-learning'],
            resources: [
              { id: 'deep-learning-video', type: ResourceType.VIDEO, title: '深度学习实战', url: '/resources/deep-learning', difficulty: DifficultyLevel.ADVANCED, tags: ['python', 'deep-learning', 'tensorflow'], free: true },
              { id: 'neural-network-project', type: ResourceType.PROJECT, title: '神经网络项目', url: '/projects/neural-network', difficulty: DifficultyLevel.ADVANCED, tags: ['deep-learning', 'neural-network', 'project'], free: true }
            ]
          },
          {
            id: 'ai-deployment',
            title: 'AI 模型部署',
            description: '学习模型部署和生产环境优化',
            type: 'lesson',
            estimatedDuration: 30,
            prerequisites: ['deep-learning'],
            resources: [
              { id: 'model-deployment-guide', type: ResourceType.TUTORIAL, title: '模型部署指南', url: '/guides/model-deployment', difficulty: DifficultyLevel.ADVANCED, tags: ['ai', 'deployment'], free: true },
              { id: 'ai-service-project', type: ResourceType.PROJECT, title: 'AI 服务部署', url: '/projects/ai-service', difficulty: DifficultyLevel.ADVANCED, tags: ['ai', 'deployment', 'project'], free: true }
            ]
          }
        ],
        prerequisites: ['数学基础', '统计学基础'],
        outcomes: ['Python 编程', '数据科学', '机器学习', 'AI 应用开发'],
        createdBy: 'AI Team',
        createdAt: new Date('2024-02-01'),
        updatedAt: new Date('2024-12-15'),
        tags: ['python', 'ai', 'machine-learning', 'data-science', 'tensorflow']
      },
      {
        id: 'devops-path',
        title: 'DevOps 工程师路径',
        description: '学习现代 DevOps 实践，包括容器化、CI/CD、监控和云平台',
        targetAudience: '中级到高级开发者',
        estimatedDuration: 100,
        difficulty: DifficultyLevel.ADVANCED,
        nodes: [
          {
            id: 'linux-basics',
            title: 'Linux 系统管理',
            description: '掌握 Linux 命令行和系统管理',
            type: 'lesson',
            estimatedDuration: 20,
            prerequisites: [],
            resources: [
              { id: 'linux-admin-video', type: ResourceType.VIDEO, title: 'Linux 系统管理', url: '/resources/linux-admin', difficulty: DifficultyLevel.INTERMEDIATE, tags: ['linux', 'system-admin'], free: true },
              { id: 'linux-commands-exercise', type: ResourceType.EXERCISE, title: 'Linux 命令练习', url: '/exercises/linux-commands', difficulty: DifficultyLevel.INTERMEDIATE, tags: ['linux', 'commands'], free: true }
            ]
          },
          {
            id: 'docker-containers',
            title: 'Docker 容器化',
            description: '学习 Docker 容器技术',
            type: 'lesson',
            estimatedDuration: 25,
            prerequisites: ['linux-basics'],
            resources: [
              { id: 'docker-tutorial', type: ResourceType.VIDEO, title: 'Docker 完整教程', url: '/resources/docker-tutorial', difficulty: DifficultyLevel.INTERMEDIATE, tags: ['docker', 'containers'], free: true },
              { id: 'app-containerization', type: ResourceType.PROJECT, title: '应用容器化', url: '/projects/app-containerization', difficulty: DifficultyLevel.INTERMEDIATE, tags: ['docker', 'project'], free: true }
            ]
          },
          {
            id: 'kubernetes',
            title: 'Kubernetes 编排',
            description: '掌握 Kubernetes 容器编排',
            type: 'lesson',
            estimatedDuration: 30,
            prerequisites: ['docker-containers'],
            resources: [
              { id: 'k8s-guide', type: ResourceType.ARTICLE, title: 'Kubernetes 指南', url: '/resources/k8s-guide', difficulty: DifficultyLevel.ADVANCED, tags: ['kubernetes', 'orchestration'], free: true },
              { id: 'microservices-k8s', type: ResourceType.PROJECT, title: '微服务部署', url: '/projects/microservices-k8s', difficulty: DifficultyLevel.ADVANCED, tags: ['kubernetes', 'microservices', 'project'], free: true }
            ]
          },
          {
            id: 'cicd-pipeline',
            title: 'CI/CD 流水线',
            description: '构建自动化部署流水线',
            type: 'lesson',
            estimatedDuration: 25,
            prerequisites: ['kubernetes'],
            resources: [
              { id: 'cicd-practices', type: ResourceType.VIDEO, title: 'CI/CD 最佳实践', url: '/resources/cicd-practices', difficulty: DifficultyLevel.ADVANCED, tags: ['cicd', 'automation'], free: true },
              { id: 'automated-deployment', type: ResourceType.PROJECT, title: '自动化部署', url: '/projects/automated-deployment', difficulty: DifficultyLevel.ADVANCED, tags: ['cicd', 'deployment', 'project'], free: true }
            ]
          }
        ],
        prerequisites: ['编程基础', '网络基础'],
        outcomes: ['系统运维', '容器化部署', 'CI/CD 自动化', '云平台管理'],
        createdBy: 'DevOps Team',
        createdAt: new Date('2024-03-01'),
        updatedAt: new Date('2024-12-10'),
        tags: ['devops', 'docker', 'kubernetes', 'cicd', 'linux']
      }
    ];

    defaultPaths.forEach(path => {
      this.addPath(path);
    });
  }

  /**
   * 添加学习路径
   */
  addPath(path: LearningPath): void {
    this.paths.set(path.id, path);
    
    // 按标签分类
    path.tags.forEach(tag => {
      if (!this.pathsByCategory.has(tag)) {
        this.pathsByCategory.set(tag, []);
      }
      this.pathsByCategory.get(tag)!.push(path.id);
    });
    
    // 按难度分类
    if (!this.pathsByDifficulty.has(path.difficulty)) {
      this.pathsByDifficulty.set(path.difficulty, []);
    }
    this.pathsByDifficulty.get(path.difficulty)!.push(path.id);
  }

  /**
   * 获取所有学习路径
   */
  getAllPaths(): LearningPath[] {
    return Array.from(this.paths.values());
  }

  /**
   * 根据ID获取学习路径
   */
  getPathById(id: string): LearningPath | undefined {
    return this.paths.get(id);
  }

  /**
   * 搜索学习路径
   */
  searchPaths(query: string, filters?: {
    difficulty?: DifficultyLevel[];
    tags?: string[];
    targetAudience?: string;
  }): LearningPath[] {
    let results = Array.from(this.paths.values());

    // 文本搜索
    if (query.trim()) {
      const searchTerm = query.toLowerCase();
      results = results.filter(path => 
        path.title.toLowerCase().includes(searchTerm) ||
        path.description.toLowerCase().includes(searchTerm) ||
        path.tags.some(tag => tag.toLowerCase().includes(searchTerm))
      );
    }

    // 难度过滤
    if (filters?.difficulty && filters.difficulty.length > 0) {
      results = results.filter(path => filters.difficulty!.includes(path.difficulty));
    }

    // 标签过滤
    if (filters?.tags && filters.tags.length > 0) {
      results = results.filter(path => 
        filters.tags!.some(tag => path.tags.includes(tag))
      );
    }

    // 目标受众过滤
    if (filters?.targetAudience) {
      results = results.filter(path => 
        path.targetAudience.toLowerCase().includes(filters.targetAudience!.toLowerCase())
      );
    }

    return results;
  }

  /**
   * 获取推荐学习路径
   */
  getRecommendedPaths(userId: string, limit: number = 5): LearningPath[] {
    const userProgress = this.userProgress.get(userId) || new Map();
    const allPaths = Array.from(this.paths.values());
    
    // 简单的推荐算法：优先推荐未开始的路径，按难度和受欢迎程度排序
    return allPaths
      .filter(path => !userProgress.has(path.id) || userProgress.get(path.id)! < 100)
      .sort((a, b) => {
        // 按难度排序（初级优先）
        const difficultyOrder = {
          [DifficultyLevel.BEGINNER]: 1,
          [DifficultyLevel.INTERMEDIATE]: 2,
          [DifficultyLevel.ADVANCED]: 3,
          [DifficultyLevel.EXPERT]: 4
        };
        return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
      })
      .slice(0, limit);
  }

  /**
   * 更新用户学习进度
   */
  updateUserProgress(userId: string, pathId: string, progress: number): void {
    if (!this.userProgress.has(userId)) {
      this.userProgress.set(userId, new Map());
    }
    this.userProgress.get(userId)!.set(pathId, Math.max(0, Math.min(100, progress)));
  }

  /**
   * 获取用户学习进度
   */
  getUserProgress(userId: string, pathId: string): number {
    return this.userProgress.get(userId)?.get(pathId) || 0;
  }

  /**
   * 获取用户所有学习进度
   */
  getAllUserProgress(userId: string): Map<string, number> {
    return this.userProgress.get(userId) || new Map();
  }

  /**
   * 标记节点完成
   */
  markNodeCompleted(userId: string, pathId: string, nodeId: string): void {
    const path = this.paths.get(pathId);
    if (!path) return;

    const node = path.nodes.find(n => n.id === nodeId);
    if (!node) return;

    // 使用用户进度跟踪完成状态，而不是修改节点本身
    if (!this.userProgress.has(userId)) {
      this.userProgress.set(userId, new Map());
    }
    
    // 标记该节点为完成
    const userProgress = this.userProgress.get(userId)!;
    const completedNodesKey = `${pathId}_completed_nodes`;
    
    // 获取已完成节点列表（存储为数组）
    let completedNodesArray = userProgress.get(completedNodesKey) as string[] | undefined;
    if (!completedNodesArray) {
      completedNodesArray = [];
    }
    
    // 如果节点未完成，则添加到完成列表
    if (!completedNodesArray.includes(nodeId)) {
      completedNodesArray.push(nodeId);
      userProgress.set(completedNodesKey, completedNodesArray);
    }
    
    // 计算整体进度
    const progress = (completedNodesArray.length / path.nodes.length) * 100;
    this.updateUserProgress(userId, pathId, progress);
  }

  /**
   * 获取学习路径统计信息
   */
  getPathStats(): {
    totalPaths: number;
    pathsByDifficulty: Record<string, number>;
    pathsByCategory: Record<string, number>;
    averageDuration: number;
  } {
    const allPaths = Array.from(this.paths.values());
    
    const pathsByDifficulty: Record<string, number> = {};
    const pathsByCategory: Record<string, number> = {};
    
    allPaths.forEach(path => {
      // 统计难度分布
      const difficulty = path.difficulty;
      pathsByDifficulty[difficulty] = (pathsByDifficulty[difficulty] || 0) + 1;
      
      // 统计标签分布
      path.tags.forEach(tag => {
        pathsByCategory[tag] = (pathsByCategory[tag] || 0) + 1;
      });
    });
    
    const averageDuration = allPaths.reduce((sum, path) => sum + path.estimatedDuration, 0) / allPaths.length;
    
    return {
      totalPaths: allPaths.length,
      pathsByDifficulty,
      pathsByCategory,
      averageDuration: Math.round(averageDuration)
    };
  }

  /**
   * 获取热门标签
   */
  getPopularTags(limit: number = 10): Array<{ tag: string; count: number }> {
    const tagCounts = new Map<string, number>();
    
    Array.from(this.paths.values()).forEach(path => {
      path.tags.forEach(tag => {
        tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
      });
    });
    
    return Array.from(tagCounts.entries())
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }
}

// 创建全局实例
export const learningPathManager = new LearningPathManager();