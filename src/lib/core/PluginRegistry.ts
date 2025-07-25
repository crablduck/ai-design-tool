// 插件注册表 - 支持动态插件加载和管理

import type {
  Plugin,
  DocumentTypeDefinition,
  PluginCategory,
  PluginConfig,
  ValidationResult
} from '../../types/document';
import { documentEngine } from './DocumentEngine';

/**
 * 插件注册表 - 管理所有插件的生命周期
 */
export class PluginRegistry {
  private plugins = new Map<string, Plugin>();
  private enabledPlugins = new Set<string>();
  private static instance: PluginRegistry;

  private constructor() {
    this.initializeBuiltinPlugins();
  }

  /**
   * 获取插件注册表单例实例
   */
  public static getInstance(): PluginRegistry {
    if (!PluginRegistry.instance) {
      PluginRegistry.instance = new PluginRegistry();
    }
    return PluginRegistry.instance;
  }

  /**
   * 注册插件
   */
  public async registerPlugin(plugin: Plugin): Promise<void> {
    // 验证插件
    const validation = this.validatePlugin(plugin);
    if (!validation.valid) {
      throw new Error(`Plugin validation failed: ${validation.errors.map(e => e.message).join(', ')}`);
    }

    // 检查依赖
    if (plugin.dependencies) {
      for (const dep of plugin.dependencies) {
        if (!this.plugins.has(dep)) {
          throw new Error(`Missing dependency: ${dep}`);
        }
      }
    }

    // 注册插件
    this.plugins.set(plugin.id, plugin);

    // 如果插件默认启用，则启用它
    if (plugin.enabled) {
      await this.enablePlugin(plugin.id);
    }

    console.log(`Plugin '${plugin.name}' (${plugin.id}) registered successfully`);
  }

  /**
   * 注销插件
   */
  public async unregisterPlugin(pluginId: string): Promise<void> {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) {
      throw new Error(`Plugin not found: ${pluginId}`);
    }

    // 检查是否有其他插件依赖此插件
    const dependents = this.getDependentPlugins(pluginId);
    if (dependents.length > 0) {
      throw new Error(`Cannot unregister plugin ${pluginId}. It is required by: ${dependents.join(', ')}`);
    }

    // 先禁用插件
    if (this.enabledPlugins.has(pluginId)) {
      await this.disablePlugin(pluginId);
    }

    // 注销插件
    this.plugins.delete(pluginId);
    console.log(`Plugin '${plugin.name}' (${pluginId}) unregistered`);
  }

  /**
   * 启用插件
   */
  public async enablePlugin(pluginId: string): Promise<void> {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) {
      throw new Error(`Plugin not found: ${pluginId}`);
    }

    if (this.enabledPlugins.has(pluginId)) {
      console.warn(`Plugin ${pluginId} is already enabled`);
      return;
    }

    // 检查依赖是否已启用
    if (plugin.dependencies) {
      for (const dep of plugin.dependencies) {
        if (!this.enabledPlugins.has(dep)) {
          throw new Error(`Dependency ${dep} is not enabled`);
        }
      }
    }

    // 注册插件提供的文档类型
    for (const docType of plugin.documentTypes) {
      documentEngine.registerDocumentType(docType);
    }

    this.enabledPlugins.add(pluginId);
    console.log(`Plugin '${plugin.name}' (${pluginId}) enabled`);
  }

  /**
   * 禁用插件
   */
  public async disablePlugin(pluginId: string): Promise<void> {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) {
      throw new Error(`Plugin not found: ${pluginId}`);
    }

    if (!this.enabledPlugins.has(pluginId)) {
      console.warn(`Plugin ${pluginId} is already disabled`);
      return;
    }

    // 检查是否有启用的插件依赖此插件
    const enabledDependents = this.getDependentPlugins(pluginId)
      .filter(depId => this.enabledPlugins.has(depId));
    
    if (enabledDependents.length > 0) {
      throw new Error(`Cannot disable plugin ${pluginId}. It is required by enabled plugins: ${enabledDependents.join(', ')}`);
    }

    // 注销插件提供的文档类型
    for (const docType of plugin.documentTypes) {
      documentEngine.unregisterDocumentType(docType.type);
    }

    this.enabledPlugins.delete(pluginId);
    console.log(`Plugin '${plugin.name}' (${pluginId}) disabled`);
  }

  /**
   * 获取插件
   */
  public getPlugin(pluginId: string): Plugin | undefined {
    return this.plugins.get(pluginId);
  }

  /**
   * 获取所有插件
   */
  public getAllPlugins(): Plugin[] {
    return Array.from(this.plugins.values());
  }

  /**
   * 获取已启用的插件
   */
  public getEnabledPlugins(): Plugin[] {
    return Array.from(this.enabledPlugins)
      .map(id => this.plugins.get(id)!)
      .filter(Boolean);
  }

  /**
   * 按类别获取插件
   */
  public getPluginsByCategory(category: PluginCategory): Plugin[] {
    return Array.from(this.plugins.values())
      .filter(plugin => plugin.category === category);
  }

  /**
   * 检查插件是否已启用
   */
  public isPluginEnabled(pluginId: string): boolean {
    return this.enabledPlugins.has(pluginId);
  }

  /**
   * 获取插件统计信息
   */
  public getStatistics(): {
    total: number;
    enabled: number;
    byCategory: Record<PluginCategory, number>;
  } {
    const byCategory: Record<PluginCategory, number> = {
      generator: 0,
      renderer: 0,
      exporter: 0,
      validator: 0,
      integration: 0,
      utility: 0
    };

    for (const plugin of this.plugins.values()) {
      byCategory[plugin.category]++;
    }

    return {
      total: this.plugins.size,
      enabled: this.enabledPlugins.size,
      byCategory
    };
  }

  /**
   * 验证插件
   */
  private validatePlugin(plugin: Plugin): ValidationResult {
    const errors: Array<{ field: string; message: string; code: string }> = [];
    const warnings: Array<{ field: string; message: string; suggestion?: string }> = [];

    // 基本字段验证
    if (!plugin.id) {
      errors.push({ field: 'id', message: 'Plugin ID is required', code: 'REQUIRED_FIELD' });
    }

    if (!plugin.name) {
      errors.push({ field: 'name', message: 'Plugin name is required', code: 'REQUIRED_FIELD' });
    }

    if (!plugin.version) {
      errors.push({ field: 'version', message: 'Plugin version is required', code: 'REQUIRED_FIELD' });
    }

    // 检查ID冲突
    if (plugin.id && this.plugins.has(plugin.id)) {
      errors.push({ field: 'id', message: `Plugin ID '${plugin.id}' already exists`, code: 'DUPLICATE_ID' });
    }

    // 检查文档类型
    if (!plugin.documentTypes || plugin.documentTypes.length === 0) {
      warnings.push({ 
        field: 'documentTypes', 
        message: 'Plugin does not provide any document types',
        suggestion: 'Consider adding at least one document type to make the plugin useful'
      });
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * 获取依赖某个插件的其他插件
   */
  private getDependentPlugins(pluginId: string): string[] {
    const dependents: string[] = [];
    
    for (const [id, plugin] of this.plugins) {
      if (plugin.dependencies?.includes(pluginId)) {
        dependents.push(id);
      }
    }

    return dependents;
  }

  /**
   * 初始化内置插件
   */
  private initializeBuiltinPlugins(): void {
    // 这里会在后续实现中注册内置插件
    // 如核心文档生成器、Mermaid渲染器等
    console.log('PluginRegistry initialized with builtin plugins');
  }

  /**
   * 重置注册表（主要用于测试）
   */
  public reset(): void {
    this.plugins.clear();
    this.enabledPlugins.clear();
    this.initializeBuiltinPlugins();
  }
}

// 导出单例实例
export const pluginRegistry = PluginRegistry.getInstance();