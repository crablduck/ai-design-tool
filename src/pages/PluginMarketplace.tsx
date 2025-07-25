import React, { useState, useEffect } from 'react';
import { Search, Download, Star, Filter, Grid, List, Package, Settings, Play, Pause, Trash2, Eye, X, ExternalLink, Code, FileText, Zap } from 'lucide-react';
import { 
  PluginMarketplaceItem, 
  PluginCategory, 
  PluginStatus,
  PluginSearchFilters 
} from '../types/plugins';
import { pluginMarketplace } from '../mcp/PluginMarketplace';
import { MermaidChart } from '../components/Chart';

/**
 * MCP插件市场页面
 */
export const PluginMarketplace: React.FC = () => {
  const [plugins, setPlugins] = useState<PluginMarketplaceItem[]>([]);
  const [filteredPlugins, setFilteredPlugins] = useState<PluginMarketplaceItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<PluginCategory | 'all'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'installed' | 'active'>('all');
  const [previewPlugin, setPreviewPlugin] = useState<PluginMarketplaceItem | null>(null);
  const [isPreviewModalVisible, setIsPreviewModalVisible] = useState(false);

  useEffect(() => {
    loadPlugins();
  }, []);

  useEffect(() => {
    filterPlugins();
  }, [plugins, searchQuery, selectedCategory, activeTab]);

  const loadPlugins = () => {
    setLoading(true);
    try {
      let pluginList: PluginMarketplaceItem[] = [];
      
      switch (activeTab) {
        case 'installed':
          pluginList = pluginMarketplace.getInstalledPlugins();
          break;
        case 'active':
          pluginList = pluginMarketplace.getActivePlugins();
          break;
        default:
          const filters: PluginSearchFilters = {
            sortBy: 'popularity',
            sortOrder: 'desc'
          };
          pluginList = pluginMarketplace.searchPlugins('', filters);
      }
      
      setPlugins(pluginList);
    } catch (error) {
      console.error('Failed to load plugins:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePreviewPlugin = (plugin: PluginMarketplaceItem) => {
    setPreviewPlugin(plugin);
    setIsPreviewModalVisible(true);
  };

  const generatePluginArchitecture = (plugin: PluginMarketplaceItem) => {
    return `graph TB
    A["用户界面"] --> B["插件管理器"]
    B --> C["${plugin.plugin.name}"]
    C --> D["MCP协议"]
    D --> E["核心功能"]
    E --> F["数据处理"]
    F --> G["结果输出"]
    
    style A fill:#e1f5fe
    style B fill:#f3e5f5
    style C fill:#e8f5e8
    style D fill:#fff3e0
    style E fill:#fce4ec
    style F fill:#f1f8e9
    style G fill:#e0f2f1`;
  };

  const getPluginFeatures = (plugin: PluginMarketplaceItem) => {
    const baseFeatures = [
      '支持MCP协议',
      '实时数据处理',
      '可视化输出',
      '配置管理'
    ];
    
    switch (plugin.plugin.category) {
      case PluginCategory.ANALYSIS:
        return [...baseFeatures, '代码分析', '性能监控', '质量评估'];
      case PluginCategory.ARCHITECTURE:
        return [...baseFeatures, '架构设计', '模式识别', '依赖分析'];
      case PluginCategory.CODE_GENERATION:
        return [...baseFeatures, '代码生成', '模板引擎', '语法检查'];
      case PluginCategory.VISUALIZATION:
        return [...baseFeatures, '图表生成', '交互式界面', '数据可视化'];
      default:
        return baseFeatures;
    }
  };

  const filterPlugins = () => {
    let filtered = plugins;

    // 搜索过滤
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item => 
        item.plugin.name.toLowerCase().includes(query) ||
        item.plugin.description.toLowerCase().includes(query) ||
        item.plugin.author.toLowerCase().includes(query)
      );
    }

    // 分类过滤
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.plugin.category === selectedCategory);
    }

    setFilteredPlugins(filtered);
  };

  const handleInstallPlugin = async (pluginId: string) => {
    try {
      setLoading(true);
      await pluginMarketplace.installPlugin(pluginId);
      loadPlugins(); // 重新加载插件列表
    } catch (error) {
      console.error('Failed to install plugin:', error);
      alert('插件安装失败: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleActivatePlugin = async (pluginId: string) => {
    try {
      setLoading(true);
      await pluginMarketplace.activatePlugin(pluginId);
      loadPlugins();
    } catch (error) {
      console.error('Failed to activate plugin:', error);
      alert('插件激活失败: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivatePlugin = async (pluginId: string) => {
    try {
      setLoading(true);
      await pluginMarketplace.deactivatePlugin(pluginId);
      loadPlugins();
    } catch (error) {
      console.error('Failed to deactivate plugin:', error);
      alert('插件停用失败: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleUninstallPlugin = async (pluginId: string) => {
    if (!confirm('确定要卸载这个插件吗？')) return;
    
    try {
      setLoading(true);
      await pluginMarketplace.uninstallPlugin(pluginId);
      loadPlugins();
    } catch (error) {
      console.error('Failed to uninstall plugin:', error);
      alert('插件卸载失败: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: PluginStatus) => {
    switch (status) {
      case PluginStatus.ACTIVE:
        return 'text-green-600 bg-green-100';
      case PluginStatus.INSTALLED:
        return 'text-blue-600 bg-blue-100';
      case PluginStatus.INACTIVE:
        return 'text-gray-600 bg-gray-100';
      case PluginStatus.ERROR:
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status: PluginStatus) => {
    switch (status) {
      case PluginStatus.ACTIVE:
        return '已激活';
      case PluginStatus.INSTALLED:
        return '已安装';
      case PluginStatus.INACTIVE:
        return '未激活';
      case PluginStatus.REGISTERED:
        return '可安装';
      case PluginStatus.ERROR:
        return '错误';
      default:
        return '未知';
    }
  };

  const getCategoryText = (category: PluginCategory) => {
    const categoryMap = {
      [PluginCategory.ANALYSIS]: '分析工具',
      [PluginCategory.DOCUMENTATION]: '文档生成',
      [PluginCategory.VISUALIZATION]: '可视化',
      [PluginCategory.ARCHITECTURE]: '架构设计',
      [PluginCategory.CODE_GENERATION]: '代码生成',
      [PluginCategory.INTEGRATION]: '集成工具',
      [PluginCategory.UTILITY]: '实用工具'
    };
    return categoryMap[category] || category;
  };

  const renderPluginCard = (item: PluginMarketplaceItem) => {
    const { plugin, metadata } = item;
    
    return (
      <div key={plugin.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{plugin.name}</h3>
              <p className="text-sm text-gray-600">by {plugin.author}</p>
            </div>
          </div>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(metadata.status)}`}>
            {getStatusText(metadata.status)}
          </span>
        </div>
        
        <p className="text-gray-700 text-sm mb-4 line-clamp-3">{plugin.description}</p>
        
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
            {getCategoryText(plugin.category)}
          </span>
          <div className="flex items-center space-x-4 text-xs text-gray-500">
            <span className="flex items-center space-x-1">
              <Download className="w-3 h-3" />
              <span>{item.downloadCount}</span>
            </span>
            {metadata.rating && (
              <span className="flex items-center space-x-1">
                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                <span>{metadata.rating.toFixed(1)}</span>
              </span>
            )}

        {/* 插件预览模态框 */}
        {isPreviewModalVisible && previewPlugin && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              {/* 模态框头部 */}
              <div className="flex items-center justify-between p-6 border-b">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <Package className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{previewPlugin.plugin.name}</h2>
                    <p className="text-gray-600">by {previewPlugin.plugin.author} • v{previewPlugin.plugin.version}</p>
                    <div className="flex items-center space-x-2 mt-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(previewPlugin.metadata.status)}`}>
                        {getStatusText(previewPlugin.metadata.status)}
                      </span>
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {getCategoryText(previewPlugin.plugin.category)}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setIsPreviewModalVisible(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* 模态框内容 */}
              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* 左侧：插件信息 */}
                  <div className="space-y-6">
                    {/* 描述 */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                        <FileText className="w-5 h-5 mr-2" />
                        插件描述
                      </h3>
                      <p className="text-gray-700 leading-relaxed">{previewPlugin.plugin.description}</p>
                    </div>

                    {/* 功能特性 */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                        <Zap className="w-5 h-5 mr-2" />
                        功能特性
                      </h3>
                      <div className="grid grid-cols-1 gap-2">
                        {getPluginFeatures(previewPlugin).map((feature, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <span className="text-sm text-gray-700">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 统计信息 */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">统计信息</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <div className="flex items-center space-x-2">
                            <Download className="w-4 h-4 text-gray-500" />
                            <span className="text-sm text-gray-600">下载量</span>
                          </div>
                          <p className="text-lg font-semibold text-gray-900 mt-1">{previewPlugin.downloadCount}</p>
                        </div>
                        {previewPlugin.metadata.rating && (
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <div className="flex items-center space-x-2">
                              <Star className="w-4 h-4 text-yellow-500" />
                              <span className="text-sm text-gray-600">评分</span>
                            </div>
                            <p className="text-lg font-semibold text-gray-900 mt-1">{previewPlugin.metadata.rating.toFixed(1)}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* 操作按钮 */}
                    <div className="flex space-x-3">
                      {previewPlugin.metadata.status === PluginStatus.REGISTERED && (
                        <button
                          onClick={() => {
                            handleInstallPlugin(previewPlugin.plugin.id);
                            setIsPreviewModalVisible(false);
                          }}
                          disabled={loading}
                          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center space-x-2"
                        >
                          <Download className="w-4 h-4" />
                          <span>安装插件</span>
                        </button>
                      )}
                      {previewPlugin.metadata.status === PluginStatus.INSTALLED && (
                        <button
                          onClick={() => {
                            handleActivatePlugin(previewPlugin.plugin.id);
                            setIsPreviewModalVisible(false);
                          }}
                          disabled={loading}
                          className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center justify-center space-x-2"
                        >
                          <Play className="w-4 h-4" />
                          <span>激活插件</span>
                        </button>
                      )}
                      {previewPlugin.metadata.status === PluginStatus.ACTIVE && (
                        <button
                          onClick={() => {
                            handleDeactivatePlugin(previewPlugin.plugin.id);
                            setIsPreviewModalVisible(false);
                          }}
                          disabled={loading}
                          className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 flex items-center justify-center space-x-2"
                        >
                          <Pause className="w-4 h-4" />
                          <span>停用插件</span>
                        </button>
                      )}
                      <button
                        onClick={() => window.open(`https://github.com/mcp-plugins/${previewPlugin.plugin.id}`, '_blank')}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center space-x-2"
                      >
                        <ExternalLink className="w-4 h-4" />
                        <span>查看源码</span>
                      </button>
                    </div>
                  </div>

                  {/* 右侧：架构图 */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                      <Code className="w-5 h-5 mr-2" />
                      插件架构
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <MermaidChart
                        chart={{
                          id: `plugin-architecture-${previewPlugin.plugin.id}`,
                          type: 'flowchart',
                          code: generatePluginArchitecture(previewPlugin),
                          title: `${previewPlugin.plugin.name} 架构图`
                        }}
                        height={400}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">v{plugin.version}</span>
          <div className="flex space-x-2">
            {metadata.status === PluginStatus.REGISTERED && (
              <>
                <button
                  onClick={() => handleInstallPlugin(plugin.id)}
                  disabled={loading}
                  className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  安装
                </button>
                <button
                  onClick={() => handlePreviewPlugin(item)}
                  className="px-3 py-1 bg-purple-600 text-white text-xs rounded hover:bg-purple-700 flex items-center space-x-1"
                >
                  <Eye className="w-3 h-3" />
                  <span>预览</span>
                </button>
              </>
            )}
            {metadata.status === PluginStatus.INSTALLED && (
              <>
                <button
                  onClick={() => handleActivatePlugin(plugin.id)}
                  disabled={loading}
                  className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 disabled:opacity-50 flex items-center space-x-1"
                >
                  <Play className="w-3 h-3" />
                  <span>激活</span>
                </button>
                <button
                  onClick={() => handleUninstallPlugin(plugin.id)}
                  disabled={loading}
                  className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 disabled:opacity-50 flex items-center space-x-1"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>卸载</span>
                </button>
                <button
                  onClick={() => handlePreviewPlugin(item)}
                  className="px-3 py-1 bg-purple-600 text-white text-xs rounded hover:bg-purple-700 flex items-center space-x-1"
                >
                  <Eye className="w-3 h-3" />
                  <span>预览</span>
                </button>
              </>
            )}
            {metadata.status === PluginStatus.ACTIVE && (
              <>
                <button
                  onClick={() => handleDeactivatePlugin(plugin.id)}
                  disabled={loading}
                  className="px-3 py-1 bg-orange-600 text-white text-xs rounded hover:bg-orange-700 disabled:opacity-50 flex items-center space-x-1"
                >
                  <Pause className="w-3 h-3" />
                  <span>停用</span>
                </button>
                <button
                  onClick={() => handleUninstallPlugin(plugin.id)}
                  disabled={loading}
                  className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 disabled:opacity-50 flex items-center space-x-1"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>卸载</span>
                </button>
                <button
                  onClick={() => handlePreviewPlugin(item)}
                  className="px-3 py-1 bg-purple-600 text-white text-xs rounded hover:bg-purple-700 flex items-center space-x-1"
                >
                  <Eye className="w-3 h-3" />
                  <span>预览</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 头部 */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">MCP 插件市场</h1>
                <p className="mt-2 text-gray-600">发现和管理智能软件分析设计工具的插件</p>
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
            { key: 'all', label: '全部插件' },
            { key: 'installed', label: '已安装' },
            { key: 'active', label: '已激活' }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => {
                setActiveTab(tab.key as any);
                loadPlugins();
              }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* 搜索和过滤 */}
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="搜索插件..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          {showFilters && (
            <div className="flex flex-wrap gap-2">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">所有分类</option>
                {Object.values(PluginCategory).map(category => (
                  <option key={category} value={category}>
                    {getCategoryText(category)}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* 插件列表 */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">加载中...</span>
          </div>
        ) : filteredPlugins.length === 0 ? (
          <div className="text-center py-12">
            <Package className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">没有找到插件</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchQuery || selectedCategory !== 'all' 
                ? '尝试调整搜索条件或过滤器' 
                : '暂时没有可用的插件'}
            </p>
          </div>
        ) : (
          <div className={`grid gap-6 ${
            viewMode === 'grid' 
              ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
              : 'grid-cols-1'
          }`}>
            {filteredPlugins.map(renderPluginCard)}
          </div>
        )}
      </div>
    </div>
  );
};

export default PluginMarketplace;