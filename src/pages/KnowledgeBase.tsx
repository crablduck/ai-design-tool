import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Book, 
  BookOpen, 
  Map, 
  Filter, 
  Grid, 
  List, 
  Clock, 
  Star,
  Tag,
  User,
  Calendar,
  TrendingUp,
  Brain,
  Route
} from 'lucide-react';
import {
  TechHandbook,
  HandbookCategory,
  DifficultyLevel,
  SearchResult,
  LearningPath,
  TechStack
} from '../types/knowledge';
import { techHandbookManager } from '../knowledge/TechHandbookManager';
import { knowledgeGraph } from '../knowledge/KnowledgeGraph';

/**
 * 技术知识库页面
 */
export const KnowledgeBase: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'handbooks' | 'paths' | 'techstack' | 'graph'>('handbooks');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<HandbookCategory | 'all'>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyLevel | 'all'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // 数据状态
  const [handbooks, setHandbooks] = useState<SearchResult[]>([]);
  const [learningPaths, setLearningPaths] = useState<LearningPath[]>([]);
  const [techStacks, setTechStacks] = useState<TechStack[]>([]);
  const [popularTags, setPopularTags] = useState<Array<{ tag: string; count: number }>>([]);
  const [categoryStats, setCategoryStats] = useState<Record<string, number>>({});
  const [pathStats, setPathStats] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'handbooks') {
      searchHandbooks();
    } else if (activeTab === 'paths') {
      searchLearningPaths();
    }
  }, [searchQuery, selectedCategory, selectedDifficulty, activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      switch (activeTab) {
        case 'handbooks':
          await loadHandbooks();
          break;
        case 'paths':
          await loadLearningPaths();
          break;
        case 'techstack':
          await loadTechStacks();
          break;
        case 'graph':
          // 图谱数据在组件中直接获取
          break;
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadHandbooks = async () => {
    const results = techHandbookManager.searchHandbooks('');
    setHandbooks(results);
    
    const stats = techHandbookManager.getCategoryStats();
    setCategoryStats(stats);
    
    const tags = techHandbookManager.getPopularTags();
    setPopularTags(tags);
  };

  const loadLearningPaths = async () => {
    try {
      // 使用真实的学习路径管理器
      const { learningPathManager } = await import('../knowledge/LearningPathManager');
      const paths = learningPathManager.getAllPaths();
      const stats = learningPathManager.getPathStats();
      const tags = learningPathManager.getPopularTags(8);
      
      setLearningPaths(paths);
      setPathStats(stats);
      setPopularTags(tags);
      
      console.log('Loaded learning paths:', paths.length);
      console.log('Path stats:', stats);
    } catch (error) {
      console.error('Failed to load learning paths:', error);
      // 设置默认数据
      setLearningPaths([]);
      setPathStats(null);
      setPopularTags([]);
    }
  };

  const searchLearningPaths = async () => {
    try {
      const filters: any = {};
      
      // 难度过滤
      if (selectedDifficulty !== 'all') {
        filters.difficulty = [selectedDifficulty as DifficultyLevel];
      }
      
      // 使用学习路径管理器的搜索功能
      const { learningPathManager } = await import('../knowledge/LearningPathManager');
      const filtered = learningPathManager.searchPaths(searchQuery, filters);
      setLearningPaths(filtered);
      
      console.log('Filtered learning paths:', filtered.length);
    } catch (error) {
      console.error('Failed to search learning paths:', error);
    }
  };

  const loadTechStacks = async () => {
    const stacks = knowledgeGraph.searchTechStacks('');
    setTechStacks(stacks);
  };

  const searchHandbooks = () => {
    const filters = {
      categories: selectedCategory !== 'all' ? [selectedCategory] : undefined,
      difficulty: selectedDifficulty !== 'all' ? [selectedDifficulty] : undefined
    };
    
    const results = techHandbookManager.searchHandbooks(searchQuery, filters);
    setHandbooks(results);
  };

  const getDifficultyColor = (difficulty: DifficultyLevel) => {
    switch (difficulty) {
      case DifficultyLevel.BEGINNER:
        return 'text-green-600 bg-green-100';
      case DifficultyLevel.INTERMEDIATE:
        return 'text-blue-600 bg-blue-100';
      case DifficultyLevel.ADVANCED:
        return 'text-orange-600 bg-orange-100';
      case DifficultyLevel.EXPERT:
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getDifficultyText = (difficulty: DifficultyLevel) => {
    switch (difficulty) {
      case DifficultyLevel.BEGINNER:
        return '初级';
      case DifficultyLevel.INTERMEDIATE:
        return '中级';
      case DifficultyLevel.ADVANCED:
        return '高级';
      case DifficultyLevel.EXPERT:
        return '专家';
      default:
        return '未知';
    }
  };

  const getCategoryText = (category: HandbookCategory) => {
    const categoryMap = {
      [HandbookCategory.FRONTEND]: '前端开发',
      [HandbookCategory.BACKEND]: '后端开发',
      [HandbookCategory.DATABASE]: '数据库',
      [HandbookCategory.DEVOPS]: 'DevOps',
      [HandbookCategory.ARCHITECTURE]: '架构设计',
      [HandbookCategory.SECURITY]: '安全',
      [HandbookCategory.TESTING]: '测试',
      [HandbookCategory.TOOLS]: '开发工具',
      [HandbookCategory.BEST_PRACTICES]: '最佳实践',
      [HandbookCategory.TUTORIALS]: '教程指南'
    };
    return categoryMap[category] || category;
  };

  const renderHandbookCard = (result: SearchResult) => {
    return (
      <div key={result.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-600 rounded-lg flex items-center justify-center">
              <Book className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{result.title}</h3>
              <p className="text-sm text-gray-600">by {result.metadata.author}</p>
            </div>
          </div>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(result.metadata.difficulty)}`}>
            {getDifficultyText(result.metadata.difficulty)}
          </span>
        </div>
        
        <p className="text-gray-700 text-sm mb-4 line-clamp-3">{result.description}</p>
        
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
            {getCategoryText(result.metadata.category)}
          </span>
          <div className="flex items-center space-x-4 text-xs text-gray-500">
            <span className="flex items-center space-x-1">
              <Clock className="w-3 h-3" />
              <span>{result.metadata.readingTime}分钟</span>
            </span>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-1 mb-4">
          {result.metadata.tags.slice(0, 3).map(tag => (
            <span key={tag} className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded">
              {tag}
            </span>
          ))}
          {result.metadata.tags.length > 3 && (
            <span className="text-xs text-gray-500">+{result.metadata.tags.length - 3}</span>
          )}
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">相关性: {result.relevanceScore.toFixed(1)}</span>
          <button className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700">
            查看详情
          </button>
        </div>
      </div>
    );
  };

  const renderLearningPathCard = (path: LearningPath) => {
    return (
      <div key={path.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
              <Route className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{path.title}</h3>
              <p className="text-sm text-gray-600">{path.targetAudience}</p>
            </div>
          </div>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(path.difficulty)}`}>
            {getDifficultyText(path.difficulty)}
          </span>
        </div>
        
        <p className="text-gray-700 text-sm mb-4 line-clamp-3">{path.description}</p>
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4 text-xs text-gray-500">
            <span className="flex items-center space-x-1">
              <Clock className="w-3 h-3" />
              <span>{path.estimatedDuration}小时</span>
            </span>
            <span className="flex items-center space-x-1">
              <Map className="w-3 h-3" />
              <span>{path.nodes.length}个节点</span>
            </span>
          </div>
        </div>
        
        <div className="mb-4">
          <p className="text-xs text-gray-600 mb-2">学习目标:</p>
          <div className="flex flex-wrap gap-1">
            {path.outcomes.slice(0, 3).map(outcome => (
              <span key={outcome} className="text-xs bg-green-50 text-green-600 px-2 py-1 rounded">
                {outcome}
              </span>
            ))}
            {path.outcomes.length > 3 && (
              <span className="text-xs text-gray-500">+{path.outcomes.length - 3}</span>
            )}
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">by {path.createdBy}</span>
          <button className="px-3 py-1 bg-purple-600 text-white text-xs rounded hover:bg-purple-700">
            开始学习
          </button>
        </div>
      </div>
    );
  };

  const renderTechStackCard = (tech: TechStack) => {
    return (
      <div key={tech.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{tech.name}</h3>
              <p className="text-sm text-gray-600">{tech.category}</p>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <TrendingUp className="w-4 h-4 text-green-500" />
            <span className="text-sm font-medium text-green-600">{tech.popularity}%</span>
          </div>
        </div>
        
        <p className="text-gray-700 text-sm mb-4 line-clamp-3">{tech.description}</p>
        
        <div className="flex items-center justify-between mb-4">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(tech.learningCurve)}`}>
            {getDifficultyText(tech.learningCurve)}
          </span>
        </div>
        
        <div className="flex flex-wrap gap-1 mb-4">
          {tech.tags.slice(0, 3).map(tag => (
            <span key={tag} className="text-xs bg-orange-50 text-orange-600 px-2 py-1 rounded">
              {tag}
            </span>
          ))}
          {tech.tags.length > 3 && (
            <span className="text-xs text-gray-500">+{tech.tags.length - 3}</span>
          )}
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">{tech.version && `v${tech.version}`}</span>
          <button className="px-3 py-1 bg-orange-600 text-white text-xs rounded hover:bg-orange-700">
            查看详情
          </button>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">加载中...</span>
        </div>
      );
    }

    switch (activeTab) {
      case 'handbooks':
        return handbooks.length === 0 ? (
          <div className="text-center py-12">
            <Book className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">没有找到技术手册</h3>
            <p className="mt-1 text-sm text-gray-500">尝试调整搜索条件或过滤器</p>
          </div>
        ) : (
          <div className={`grid gap-6 ${
            viewMode === 'grid' 
              ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
              : 'grid-cols-1'
          }`}>
            {handbooks.map(renderHandbookCard)}
          </div>
        );
        
      case 'paths':
        return learningPaths.length === 0 ? (
          <div className="text-center py-12">
            <Route className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">没有找到学习路径</h3>
            <p className="mt-1 text-sm text-gray-500">暂时没有可用的学习路径</p>
          </div>
        ) : (
          <>
            {/* 统计面板 */}
            {pathStats && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-white p-4 rounded-lg shadow">
                  <div className="flex items-center">
                    <Book className="w-8 h-8 text-blue-500" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-500">学习路径总数</p>
                      <p className="text-2xl font-semibold text-gray-900">{pathStats.totalPaths || 0}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                  <div className="flex items-center">
                    <Clock className="w-8 h-8 text-purple-500" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-500">平均学习时长</p>
                      <p className="text-2xl font-semibold text-gray-900">{pathStats.averageDuration || 0}小时</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                  <div className="flex items-center">
                    <Star className="w-8 h-8 text-green-500" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-500">初级路径</p>
                      <p className="text-2xl font-semibold text-gray-900">{pathStats.pathsByDifficulty?.beginner || 0}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                  <div className="flex items-center">
                    <TrendingUp className="w-8 h-8 text-orange-500" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-500">高级路径</p>
                      <p className="text-2xl font-semibold text-gray-900">{pathStats.pathsByDifficulty?.advanced || 0}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* 热门标签 */}
            {popularTags.length > 0 && (
              <div className="bg-white p-4 rounded-lg shadow mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <Tag className="w-5 h-5 mr-2" />
                  热门标签
                </h3>
                <div className="flex flex-wrap gap-2">
                  {popularTags.map(({ tag, count }) => (
                    <span 
                      key={tag} 
                      className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full cursor-pointer hover:bg-blue-200"
                      onClick={() => setSearchQuery(tag)}
                    >
                      {tag} ({count})
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            <div className={`grid gap-6 ${
              viewMode === 'grid' 
                ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
                : 'grid-cols-1'
            }`}>
              {learningPaths.map(renderLearningPathCard)}
            </div>
          </>
        );
        
      case 'techstack':
        return techStacks.length === 0 ? (
          <div className="text-center py-12">
            <Brain className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">没有找到技术栈</h3>
            <p className="mt-1 text-sm text-gray-500">暂时没有可用的技术栈</p>
          </div>
        ) : (
          <div className={`grid gap-6 ${
            viewMode === 'grid' 
              ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
              : 'grid-cols-1'
          }`}>
            {techStacks.map(renderTechStackCard)}
          </div>
        );
        
      case 'graph':
        return (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">技术知识图谱</h3>
            <div className="h-96 bg-gray-50 rounded-lg flex items-center justify-center">
              <p className="text-gray-500">知识图谱可视化组件（待实现）</p>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 头部 */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">技术知识库</h1>
                <p className="mt-2 text-gray-600">探索技术手册、学习路径和技术栈知识图谱</p>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                  className="p-2 text-gray-500 hover:text-gray-700 border rounded-lg"
                >
                  {viewMode === 'grid' ? <List className="w-5 h-5" /> : <Grid className="w-5 h-5" />}
                </button>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="p-2 text-gray-500 hover:text-gray-700 border rounded-lg"
                >
                  <Filter className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 标签页 */}
        <div className="flex space-x-1 mb-6">
          {[
            { key: 'handbooks', label: '技术手册', icon: Book },
            { key: 'paths', label: '学习路径', icon: Route },
            { key: 'techstack', label: '技术栈', icon: Brain },
            { key: 'graph', label: '知识图谱', icon: Map }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab.key
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* 搜索和过滤 */}
        {(activeTab === 'handbooks' || activeTab === 'techstack' || activeTab === 'paths') && (
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder={`搜索${activeTab === 'handbooks' ? '技术手册' : activeTab === 'paths' ? '学习路径' : '技术栈'}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            {showFilters && (activeTab === 'handbooks' || activeTab === 'paths') && (
              <div className="flex flex-wrap gap-2">
                {activeTab === 'handbooks' && (
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value as any)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">所有分类</option>
                    {Object.values(HandbookCategory).map(category => (
                      <option key={category} value={category}>
                        {getCategoryText(category)}
                      </option>
                    ))}
                  </select>
                )}
                
                <select
                  value={selectedDifficulty}
                  onChange={(e) => setSelectedDifficulty(e.target.value as any)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">所有难度</option>
                  {Object.values(DifficultyLevel).map(difficulty => (
                    <option key={difficulty} value={difficulty}>
                      {getDifficultyText(difficulty)}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        )}

        {/* 内容区域 */}
        {renderContent()}
      </div>
    </div>
  );
};

export default KnowledgeBase;