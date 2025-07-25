// 插件系统基础框架

import type {
  Plugin,
  PluginManifest,
  PluginContext,
  PluginHook,
  PluginAPI
} from '../../types/document';
import { generatorRegistry } from '../core/GeneratorRegistry';
import { DocumentEngine } from '../core/DocumentEngine';
import { TemplateEngine } from '../core/TemplateEngine';

/**
 * 插件状态
 */
export type PluginState = 'installed' | 'enabled' | 'disabled' | 'error' | 'loading';

/**
 * 插件实例信息
 */
export interface PluginInstance {
  id: string;
  manifest: PluginManifest;
  plugin: Plugin;
  state: PluginState;
  error?: string;
  loadedAt?: Date;
  enabledAt?: Date;
  context?: PluginContext;
}

/**
 * 插件事件
 */
export interface PluginEvent {
  type: 'install' | 'uninstall' | 'enable' | 'disable' | 'error';
  pluginId: string;
  timestamp: Date;
  data?: any;
}

/**
 * 插件系统
 */
export class PluginSystem {
  private static instance: PluginSystem;
  private plugins = new Map<string, PluginInstance>();
  private hooks = new Map<string, PluginHook[]>();
  private pluginStorage = new Map<string, any>();
  private eventListeners = new Map<string, ((event: PluginEvent) => void)[]>();
  private api: PluginAPI;

  private constructor() {
    this.api = this.createPluginAPI();
    this.initializeBuiltinHooks();
  }

  /**
   * 获取单例实例
   */
  public static getInstance(): PluginSystem {
    if (!PluginSystem.instance) {
      PluginSystem.instance = new PluginSystem();
    }
    return PluginSystem.instance;
  }

  /**
   * 创建插件API
   */
  private createPluginAPI(): PluginAPI {
    return {
      // 核心API
      registerDocumentType: (type) => DocumentEngine.getInstance().registerDocumentType(type),
      unregisterDocumentType: (id) => DocumentEngine.getInstance().unregisterDocumentType(id),
      registerGenerator: (generator) => {
        // 将DocumentGenerator转换为GeneratorRegistration
        const registration = {
          id: generator.id || `generator_${Date.now()}`,
          name: generator.name || 'Unknown Generator',
          description: generator.description || '',
          category: 'plugin',
          generator,
          documentType: {
            id: generator.id || `type_${Date.now()}`,
            type: generator.id || `type_${Date.now()}`,
            name: generator.name || 'Unknown Type',
            description: generator.description || '',
            icon: '🔧',
            category: 'custom' as const,
            schema: {},
            generator,
            renderer: {
              render: async () => ({ content: '', format: 'json' as const, metadata: { size: 0, generatedAt: new Date(), renderTime: 0 } }),
              getPreview: async () => '',
              getSupportedFormats: () => ['json' as const]
            },
            exporter: {
              export: async () => ({ data: Buffer.from(''), filename: 'export.json', mimeType: 'application/json', size: 0 }),
              getSupportedFormats: () => ['json' as const],
              getFormatOptions: () => ({ supportedQuality: ['medium' as const], supportsCustomTemplate: false, supportsWatermark: false })
            }
          },
          version: '1.0.0',
          author: 'Plugin',
          tags: ['plugin'],
          dependencies: [],
          enabled: true,
          priority: 100
        };
        generatorRegistry.register(registration);
      },
      unregisterGenerator: (id) => generatorRegistry.unregister(id),
      registerRenderer: () => { /* TODO: 实现渲染器注册 */ },
      unregisterRenderer: () => { /* TODO: 实现渲染器注销 */ },
      registerExporter: () => { /* TODO: 实现导出器注册 */ },
      unregisterExporter: () => { /* TODO: 实现导出器注销 */ },
      registerValidator: () => { /* TODO: 实现验证器注册 */ },
      unregisterValidator: () => { /* TODO: 实现验证器注销 */ },
      addHook: (event, callback) => this.registerHook(event, { event, callback }),
      removeHook: (event, callback) => this.unregisterHook(event, { event, callback }),
      triggerEvent: async (event, data) => this.emitEvent({ type: event as any, pluginId: 'system', data, timestamp: new Date() })
    };
  }

  /**
   * 初始化内置钩子
   */
  private initializeBuiltinHooks(): void {
    // 文档生成前钩子
    this.hooks.set('before-document-generation', []);
    // 文档生成后钩子
    this.hooks.set('after-document-generation', []);
    // 文档验证钩子
    this.hooks.set('document-validation', []);
    // 模板渲染前钩子
    this.hooks.set('before-template-render', []);
    // 模板渲染后钩子
    this.hooks.set('after-template-render', []);
    // 插件加载钩子
    this.hooks.set('plugin-loaded', []);
    // 插件卸载钩子
    this.hooks.set('plugin-unloaded', []);
  }

  /**
   * 安装插件
   */
  public async installPlugin(manifest: PluginManifest, pluginCode: string): Promise<void> {
    try {
      // 验证清单
      const validation = this.validateManifest(manifest);
      if (!validation.valid) {
        throw new Error(`Invalid plugin manifest: ${validation.errors.join(', ')}`);
      }

      // 检查是否已安装
      if (this.plugins.has(manifest.id)) {
        throw new Error(`Plugin '${manifest.id}' is already installed`);
      }

      // 检查依赖
      await this.checkDependencies(manifest.dependencies || []);

      // 创建插件实例
      const plugin = await this.loadPluginCode(pluginCode, manifest);
      
      // 创建插件上下文
      const context = this.createPluginContext(plugin);

      const instance: PluginInstance = {
        id: manifest.id,
        manifest,
        plugin,
        state: 'installed',
        loadedAt: new Date(),
        context
      };

      // 注册插件
      this.plugins.set(manifest.id, instance);

      // 触发安装事件
      this.emitEvent({
        type: 'install',
        pluginId: manifest.id,
        timestamp: new Date(),
        data: { manifest }
      });

      console.log(`Plugin '${manifest.id}' installed successfully`);
    } catch (error) {
      console.error(`Failed to install plugin '${manifest.id}':`, error);
      throw error;
    }
  }

  /**
   * 卸载插件
   */
  public async uninstallPlugin(pluginId: string): Promise<void> {
    const instance = this.plugins.get(pluginId);
    if (!instance) {
      throw new Error(`Plugin '${pluginId}' is not installed`);
    }

    try {
      // 如果插件已启用，先禁用
      if (instance.state === 'enabled') {
        await this.disablePlugin(pluginId);
      }

      // 调用插件的卸载方法
      // 插件没有onUninstall方法，使用onUnregister代替
      if (instance.plugin.onUnregister) {
        await instance.plugin.onUnregister(instance.context!);
      }

      // 清理插件注册的资源
      await this.cleanupPluginResources(instance);

      // 移除插件
      this.plugins.delete(pluginId);

      // 触发卸载事件
      this.emitEvent({
        type: 'uninstall',
        pluginId,
        timestamp: new Date()
      });

      console.log(`Plugin '${pluginId}' uninstalled successfully`);
    } catch (error) {
      console.error(`Failed to uninstall plugin '${pluginId}':`, error);
      throw error;
    }
  }

  /**
   * 启用插件
   */
  public async enablePlugin(pluginId: string): Promise<void> {
    const instance = this.plugins.get(pluginId);
    if (!instance) {
      throw new Error(`Plugin '${pluginId}' is not installed`);
    }

    if (instance.state === 'enabled') {
      return; // 已经启用
    }

    try {
      instance.state = 'loading';

      // 检查依赖
      await this.checkDependencies(instance.manifest.dependencies || []);

      // 调用插件的启用方法
      if (instance.plugin.onEnable) {
        await instance.plugin.onEnable(instance.context!);
      }

      // 注册插件提供的功能
      await this.registerPluginFeatures(instance);

      instance.state = 'enabled';
      instance.enabledAt = new Date();

      // 触发启用事件
      this.emitEvent({
        type: 'enable',
        pluginId,
        timestamp: new Date()
      });

      console.log(`Plugin '${pluginId}' enabled successfully`);
    } catch (error) {
      instance.state = 'error';
      instance.error = error instanceof Error ? error.message : String(error);
      
      this.emitEvent({
        type: 'error',
        pluginId,
        timestamp: new Date(),
        data: { error: instance.error }
      });

      console.error(`Failed to enable plugin '${pluginId}':`, error);
      throw error;
    }
  }

  /**
   * 禁用插件
   */
  public async disablePlugin(pluginId: string): Promise<void> {
    const instance = this.plugins.get(pluginId);
    if (!instance) {
      throw new Error(`Plugin '${pluginId}' is not installed`);
    }

    if (instance.state !== 'enabled') {
      return; // 已经禁用或未启用
    }

    try {
      // 调用插件的禁用方法
      if (instance.plugin.onDisable) {
        await instance.plugin.onDisable(instance.context!);
      }

      // 注销插件提供的功能
      await this.unregisterPluginFeatures(instance);

      instance.state = 'disabled';
      instance.error = undefined;

      // 触发禁用事件
      this.emitEvent({
        type: 'disable',
        pluginId,
        timestamp: new Date()
      });

      console.log(`Plugin '${pluginId}' disabled successfully`);
    } catch (error) {
      console.error(`Failed to disable plugin '${pluginId}':`, error);
      throw error;
    }
  }

  /**
   * 获取插件实例
   */
  public getPlugin(pluginId: string): PluginInstance | undefined {
    return this.plugins.get(pluginId);
  }

  /**
   * 获取所有插件
   */
  public getAllPlugins(): PluginInstance[] {
    return Array.from(this.plugins.values());
  }

  /**
   * 获取已启用的插件
   */
  public getEnabledPlugins(): PluginInstance[] {
    return Array.from(this.plugins.values()).filter(p => p.state === 'enabled');
  }

  /**
   * 检查插件是否已安装
   */
  public isInstalled(pluginId: string): boolean {
    return this.plugins.has(pluginId);
  }

  /**
   * 检查插件是否已启用
   */
  public isEnabled(pluginId: string): boolean {
    const instance = this.plugins.get(pluginId);
    return instance?.state === 'enabled';
  }

  /**
   * 注册钩子
   */
  public registerHook(name: string, hook: PluginHook): void {
    if (!this.hooks.has(name)) {
      this.hooks.set(name, []);
    }
    this.hooks.get(name)!.push(hook);
  }

  /**
   * 注销钩子
   */
  public unregisterHook(name: string, hook: PluginHook): void {
    const hooks = this.hooks.get(name);
    if (hooks) {
      const index = hooks.indexOf(hook);
      if (index > -1) {
        hooks.splice(index, 1);
      }
    }
  }

  /**
   * 执行钩子
   */
  public async executeHook(name: string, context: any): Promise<any> {
    const hooks = this.hooks.get(name) || [];
    let result = context;

    for (const hook of hooks) {
      try {
        result = await hook.callback(result);
      } catch (error) {
        console.error(`Error executing hook '${name}':`, error);
      }
    }

    return result;
  }

  /**
   * 添加事件监听器
   */
  public addEventListener(event: string, listener: (event: PluginEvent) => void): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(listener);
  }

  /**
   * 移除事件监听器
   */
  public removeEventListener(event: string, listener: (event: PluginEvent) => void): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  /**
   * 触发事件
   */
  public emitEvent(event: PluginEvent): void {
    const listeners = this.eventListeners.get(event.type) || [];
    listeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        console.error(`Error in event listener for '${event.type}':`, error);
      }
    });
  }

  /**
   * 验证插件清单
   */
  private validateManifest(manifest: PluginManifest): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!manifest.id || typeof manifest.id !== 'string') {
      errors.push('Plugin ID is required and must be a string');
    }

    if (!manifest.name || typeof manifest.name !== 'string') {
      errors.push('Plugin name is required and must be a string');
    }

    if (!manifest.version || typeof manifest.version !== 'string') {
      errors.push('Plugin version is required and must be a string');
    }

    if (!manifest.author || typeof manifest.author !== 'string') {
      errors.push('Plugin author is required and must be a string');
    }

    if (manifest.dependencies && !Array.isArray(manifest.dependencies)) {
      errors.push('Plugin dependencies must be an array');
    }

    if (manifest.permissions && !Array.isArray(manifest.permissions)) {
      errors.push('Plugin permissions must be an array');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * 检查依赖
   */
  private async checkDependencies(dependencies: string[]): Promise<void> {
    for (const dep of dependencies) {
      if (!this.isEnabled(dep)) {
        throw new Error(`Required dependency '${dep}' is not enabled`);
      }
    }
  }

  /**
   * 加载插件代码
   */
  private async loadPluginCode(code: string, manifest: PluginManifest): Promise<Plugin> {
    try {
      // 创建安全的执行环境
      const pluginFunction = new Function('api', 'manifest', code);
      const plugin = pluginFunction(this.api, manifest);

      if (!plugin || typeof plugin !== 'object') {
        throw new Error('Plugin must return an object');
      }

      return plugin as Plugin;
    } catch (error) {
      throw new Error(`Failed to load plugin code: ${error}`);
    }
  }

  /**
   * 创建插件上下文
   */
  private createPluginContext(plugin: Plugin): PluginContext {
    return {
      plugin,
      api: this.api,
      storage: {
        get: async (key: string) => this.pluginStorage.get(`${plugin.id}:${key}`),
        set: async (key: string, value: any) => { this.pluginStorage.set(`${plugin.id}:${key}`, value); },
        delete: async (key: string) => { this.pluginStorage.delete(`${plugin.id}:${key}`); },
        clear: async () => {
          const keys = Array.from(this.pluginStorage.keys()).filter((k: unknown) => typeof k === 'string' && k.startsWith(`${plugin.id}:`));
          keys.forEach(k => this.pluginStorage.delete(k));
        },
        keys: async () => Array.from(this.pluginStorage.keys()).filter((k: unknown) => typeof k === 'string' && k.startsWith(`${plugin.id}:`)).map((k: unknown) => typeof k === 'string' ? k.substring(`${plugin.id}:`.length) : '')
      },
      logger: {
        info: (message: string, ...args: any[]) => console.log(`[${plugin.id}] ${message}`, ...args),
        warn: (message: string, ...args: any[]) => console.warn(`[${plugin.id}] ${message}`, ...args),
        error: (message: string, ...args: any[]) => console.error(`[${plugin.id}] ${message}`, ...args),
        debug: (message: string, ...args: any[]) => console.debug(`[${plugin.id}] ${message}`, ...args)
      }
    };
  }

  /**
   * 注册插件功能
   */
  private async registerPluginFeatures(instance: PluginInstance): Promise<void> {
    // 这里可以扩展插件功能注册逻辑
    // 例如：注册文档类型、生成器、模板等
    if (instance.plugin.onRegister) {
      await instance.plugin.onRegister(instance.context!);
    }
  }

  /**
   * 注销插件功能
   */
  private async unregisterPluginFeatures(instance: PluginInstance): Promise<void> {
    // 这里可以扩展插件功能注销逻辑
    if (instance.plugin.onUnregister) {
      await instance.plugin.onUnregister(instance.context!);
    }
  }

  /**
   * 清理插件资源
   */
  private async cleanupPluginResources(instance: PluginInstance): Promise<void> {
    // 清理插件注册的钩子
    // 清理插件注册的事件监听器
    // 清理插件创建的资源
    
    // 这里可以扩展资源清理逻辑
    if (instance.context) {
      instance.context.storage.clear();
    }
  }

  /**
   * 获取插件统计信息
   */
  public getStatistics() {
    const total = this.plugins.size;
    const enabled = this.getEnabledPlugins().length;
    const disabled = Array.from(this.plugins.values()).filter(p => p.state === 'disabled').length;
    const error = Array.from(this.plugins.values()).filter(p => p.state === 'error').length;
    const hooks = this.hooks.size;
    const eventListeners = Array.from(this.eventListeners.values()).reduce((sum, listeners) => sum + listeners.length, 0);

    return {
      plugins: { total, enabled, disabled, error },
      hooks,
      eventListeners
    };
  }

  /**
   * 重置插件系统
   */
  public async reset(): Promise<void> {
    // 禁用所有插件
    const enabledPlugins = this.getEnabledPlugins();
    for (const plugin of enabledPlugins) {
      try {
        await this.disablePlugin(plugin.id);
      } catch (error) {
        console.error(`Failed to disable plugin '${plugin.id}' during reset:`, error);
      }
    }

    // 卸载所有插件
    const allPlugins = this.getAllPlugins();
    for (const plugin of allPlugins) {
      try {
        await this.uninstallPlugin(plugin.id);
      } catch (error) {
        console.error(`Failed to uninstall plugin '${plugin.id}' during reset:`, error);
      }
    }

    // 清理钩子和事件监听器
    this.hooks.clear();
    this.eventListeners.clear();
    
    // 重新初始化
    this.initializeBuiltinHooks();
  }
}

// 导出单例实例
export const pluginSystem = PluginSystem.getInstance();