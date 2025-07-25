import { 
  MCPPlugin, 
  PluginMetadata, 
  PluginStatus, 
  PluginSearchFilters, 
  PluginMarketplaceItem,
  PluginInstallOptions,
  PluginNotFoundError,
  PluginValidationError,
  PluginDependencyError
} from '../types/plugins';

/**
 * MCP插件市场管理器
 * 负责插件的注册、搜索、安装、管理等功能
 */
export class PluginMarketplace {
  private plugins: Map<string, MCPPlugin> = new Map();
  private metadata: Map<string, PluginMetadata> = new Map();
  private marketplaceItems: Map<string, PluginMarketplaceItem> = new Map();
  private eventListeners: Map<string, Function[]> = new Map();

  constructor() {
    this.initializeEventSystem();
    this.loadCorePlugins();
  }

  /**
   * 初始化事件系统
   */
  private initializeEventSystem(): void {
    const events = [
      'plugin.registered',
      'plugin.installed', 
      'plugin.activated',
      'plugin.deactivated',
      'plugin.uninstalled',
      'plugin.updated',
      'plugin.error'
    ];
    
    events.forEach(event => {
      this.eventListeners.set(event, []);
    });
  }

  /**
   * 加载核心插件
   */
  private async loadCorePlugins(): Promise<void> {
    // 这里可以加载预定义的核心插件
    // 例如：用例图插件、领域模型插件等
  }

  /**
   * 注册插件
   */
  async registerPlugin(plugin: MCPPlugin): Promise<void> {
    try {
      // 验证插件
      await this.validatePlugin(plugin);
      
      // 检查依赖
      await this.checkDependencies(plugin.dependencies);
      
      // 注册插件
      this.plugins.set(plugin.id, plugin);
      
      // 创建元数据
      const metadata: PluginMetadata = {
        id: plugin.id,
        name: plugin.name,
        version: plugin.version,
        status: PluginStatus.REGISTERED,
        registeredAt: new Date(),
        usageCount: 0
      };
      this.metadata.set(plugin.id, metadata);
      
      // 创建市场项目
      const marketplaceItem: PluginMarketplaceItem = {
        plugin,
        metadata,
        downloadCount: 0,
        lastUpdated: new Date(),
        screenshots: [],
        documentation: plugin.description
      };
      this.marketplaceItems.set(plugin.id, marketplaceItem);
      
      // 发布事件
      this.emit('plugin.registered', { pluginId: plugin.id, plugin });
      
      console.log(`Plugin registered: ${plugin.name} (${plugin.id})`);
    } catch (error) {
      this.emit('plugin.error', { pluginId: plugin.id, error });
      throw error;
    }
  }

  /**
   * 安装插件
   */
  async installPlugin(pluginId: string, options: PluginInstallOptions = {}): Promise<void> {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) {
      throw new PluginNotFoundError(pluginId);
    }

    try {
      // 检查依赖
      if (!options.skipDependencies) {
        await this.installDependencies(plugin.dependencies);
      }
      
      // 执行插件安装
      await plugin.install();
      
      // 更新状态
      const metadata = this.metadata.get(pluginId)!;
      metadata.status = PluginStatus.INSTALLED;
      metadata.installedAt = new Date();
      
      // 更新下载计数
      const marketplaceItem = this.marketplaceItems.get(pluginId)!;
      marketplaceItem.downloadCount++;
      
      // 发布事件
      this.emit('plugin.installed', { pluginId, plugin });
      
      console.log(`Plugin installed: ${plugin.name}`);
    } catch (error) {
      this.emit('plugin.error', { pluginId, error });
      throw error;
    }
  }

  /**
   * 激活插件
   */
  async activatePlugin(pluginId: string): Promise<void> {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) {
      throw new PluginNotFoundError(pluginId);
    }

    const metadata = this.metadata.get(pluginId)!;
    if (metadata.status !== PluginStatus.INSTALLED) {
      throw new Error(`Plugin must be installed before activation: ${pluginId}`);
    }

    try {
      // 激活插件
      await plugin.activate();
      
      // 更新状态
      metadata.status = PluginStatus.ACTIVE;
      metadata.activatedAt = new Date();
      
      // 发布事件
      this.emit('plugin.activated', { pluginId, plugin });
      
      console.log(`Plugin activated: ${plugin.name}`);
    } catch (error) {
      metadata.status = PluginStatus.ERROR;
      this.emit('plugin.error', { pluginId, error });
      throw error;
    }
  }

  /**
   * 停用插件
   */
  async deactivatePlugin(pluginId: string): Promise<void> {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) {
      throw new PluginNotFoundError(pluginId);
    }

    try {
      // 停用插件
      await plugin.deactivate();
      
      // 更新状态
      const metadata = this.metadata.get(pluginId)!;
      metadata.status = PluginStatus.INACTIVE;
      
      // 发布事件
      this.emit('plugin.deactivated', { pluginId, plugin });
      
      console.log(`Plugin deactivated: ${plugin.name}`);
    } catch (error) {
      this.emit('plugin.error', { pluginId, error });
      throw error;
    }
  }

  /**
   * 卸载插件
   */
  async uninstallPlugin(pluginId: string): Promise<void> {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) {
      throw new PluginNotFoundError(pluginId);
    }

    try {
      // 先停用插件
      const metadata = this.metadata.get(pluginId)!;
      if (metadata.status === PluginStatus.ACTIVE) {
        await this.deactivatePlugin(pluginId);
      }
      
      // 卸载插件
      await plugin.uninstall();
      
      // 更新状态
      metadata.status = PluginStatus.REGISTERED;
      metadata.installedAt = undefined;
      metadata.activatedAt = undefined;
      
      // 发布事件
      this.emit('plugin.uninstalled', { pluginId, plugin });
      
      console.log(`Plugin uninstalled: ${plugin.name}`);
    } catch (error) {
      this.emit('plugin.error', { pluginId, error });
      throw error;
    }
  }

  /**
   * 执行插件命令
   */
  async executePlugin(pluginId: string, command: string, params: any): Promise<any> {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) {
      throw new PluginNotFoundError(pluginId);
    }

    const metadata = this.metadata.get(pluginId)!;
    if (metadata.status !== PluginStatus.ACTIVE) {
      throw new Error(`Plugin is not active: ${pluginId}`);
    }

    try {
      // 执行插件命令
      const result = await plugin.execute(command, params);
      
      // 更新使用统计
      metadata.usageCount++;
      metadata.lastUsed = new Date();
      
      return result;
    } catch (error) {
      this.emit('plugin.error', { pluginId, command, error });
      throw error;
    }
  }

  /**
   * 搜索插件
   */
  searchPlugins(query: string, filters: PluginSearchFilters = {}): PluginMarketplaceItem[] {
    let results = Array.from(this.marketplaceItems.values());

    // 文本搜索
    if (query) {
      const lowerQuery = query.toLowerCase();
      results = results.filter(item => 
        item.plugin.name.toLowerCase().includes(lowerQuery) ||
        item.plugin.description.toLowerCase().includes(lowerQuery) ||
        item.plugin.author.toLowerCase().includes(lowerQuery)
      );
    }

    // 分类过滤
    if (filters.category) {
      results = results.filter(item => item.plugin.category === filters.category);
    }

    // 作者过滤
    if (filters.author) {
      results = results.filter(item => item.plugin.author === filters.author);
    }

    // 评分过滤
    if (filters.minRating) {
      results = results.filter(item => 
        item.metadata.rating && item.metadata.rating >= filters.minRating!
      );
    }

    // 标签过滤
    if (filters.tags && filters.tags.length > 0) {
      results = results.filter(item => 
        filters.tags!.some(tag => 
          item.plugin.name.toLowerCase().includes(tag.toLowerCase())
        )
      );
    }

    // 排序
    if (filters.sortBy) {
      results.sort((a, b) => {
        let aValue: any, bValue: any;
        
        switch (filters.sortBy) {
          case 'popularity':
            aValue = a.downloadCount;
            bValue = b.downloadCount;
            break;
          case 'rating':
            aValue = a.metadata.rating || 0;
            bValue = b.metadata.rating || 0;
            break;
          case 'updated':
            aValue = a.lastUpdated.getTime();
            bValue = b.lastUpdated.getTime();
            break;
          case 'name':
            aValue = a.plugin.name.toLowerCase();
            bValue = b.plugin.name.toLowerCase();
            break;
          default:
            return 0;
        }
        
        if (filters.sortOrder === 'desc') {
          return bValue > aValue ? 1 : bValue < aValue ? -1 : 0;
        } else {
          return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
        }
      });
    }

    return results;
  }

  /**
   * 获取已安装的插件
   */
  getInstalledPlugins(): PluginMarketplaceItem[] {
    return Array.from(this.marketplaceItems.values()).filter(item => 
      item.metadata.status === PluginStatus.INSTALLED || 
      item.metadata.status === PluginStatus.ACTIVE
    );
  }

  /**
   * 获取活跃的插件
   */
  getActivePlugins(): PluginMarketplaceItem[] {
    return Array.from(this.marketplaceItems.values()).filter(item => 
      item.metadata.status === PluginStatus.ACTIVE
    );
  }

  /**
   * 获取插件详情
   */
  getPlugin(pluginId: string): PluginMarketplaceItem | null {
    return this.marketplaceItems.get(pluginId) || null;
  }

  /**
   * 验证插件
   */
  private async validatePlugin(plugin: MCPPlugin): Promise<void> {
    const errors: string[] = [];

    // 基本字段验证
    if (!plugin.id) errors.push('Plugin ID is required');
    if (!plugin.name) errors.push('Plugin name is required');
    if (!plugin.version) errors.push('Plugin version is required');
    if (!plugin.description) errors.push('Plugin description is required');
    if (!plugin.author) errors.push('Plugin author is required');

    // 检查ID唯一性
    if (this.plugins.has(plugin.id)) {
      errors.push(`Plugin ID already exists: ${plugin.id}`);
    }

    // 验证方法存在性
    const requiredMethods = ['install', 'activate', 'deactivate', 'uninstall', 'execute', 'getCommands', 'getSchema'];
    for (const method of requiredMethods) {
      if (typeof (plugin as any)[method] !== 'function') {
        errors.push(`Required method missing: ${method}`);
      }
    }

    if (errors.length > 0) {
      throw new PluginValidationError(plugin.id, errors);
    }
  }

  /**
   * 检查依赖
   */
  private async checkDependencies(dependencies: string[]): Promise<void> {
    const missing: string[] = [];
    
    for (const dep of dependencies) {
      if (!this.plugins.has(dep)) {
        missing.push(dep);
      }
    }
    
    if (missing.length > 0) {
      throw new PluginDependencyError('', missing);
    }
  }

  /**
   * 安装依赖
   */
  private async installDependencies(dependencies: string[]): Promise<void> {
    for (const dep of dependencies) {
      const metadata = this.metadata.get(dep);
      if (metadata && metadata.status === PluginStatus.REGISTERED) {
        await this.installPlugin(dep);
      }
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

  /**
   * 移除事件监听
   */
  off(event: string, listener: Function): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
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

  /**
   * 获取插件统计信息
   */
  getStatistics() {
    const total = this.plugins.size;
    const installed = Array.from(this.metadata.values()).filter(m => 
      m.status === PluginStatus.INSTALLED || m.status === PluginStatus.ACTIVE
    ).length;
    const active = Array.from(this.metadata.values()).filter(m => 
      m.status === PluginStatus.ACTIVE
    ).length;
    
    return {
      total,
      installed,
      active,
      categories: this.getCategoryStats(),
      topPlugins: this.getTopPlugins()
    };
  }

  /**
   * 获取分类统计
   */
  private getCategoryStats() {
    const stats: Record<string, number> = {};
    
    Array.from(this.plugins.values()).forEach(plugin => {
      stats[plugin.category] = (stats[plugin.category] || 0) + 1;
    });
    
    return stats;
  }

  /**
   * 获取热门插件
   */
  private getTopPlugins(limit: number = 10): PluginMarketplaceItem[] {
    return Array.from(this.marketplaceItems.values())
      .sort((a, b) => b.downloadCount - a.downloadCount)
      .slice(0, limit);
  }
}

// 单例实例
export const pluginMarketplace = new PluginMarketplace();