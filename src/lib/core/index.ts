// 核心引擎统一入口

// 导出核心引擎类
export { DocumentEngine } from './DocumentEngine';
export { PluginRegistry } from './PluginRegistry';
export { TemplateEngine } from './TemplateEngine';
export { GeneratorRegistry } from './GeneratorRegistry';

// 导入单例实例
import { documentEngine } from './DocumentEngine';
import { pluginRegistry } from './PluginRegistry';
import { templateEngine } from './TemplateEngine';
import { generatorRegistry } from './GeneratorRegistry';
import { PluginSystem, pluginSystem } from '../plugins/PluginSystem';

// 导出单例实例
export { documentEngine } from './DocumentEngine';
export { pluginRegistry } from './PluginRegistry';
export { templateEngine } from './TemplateEngine';
export { generatorRegistry } from './GeneratorRegistry';

// 导出插件系统
export { PluginSystem, pluginSystem } from '../plugins/PluginSystem';

// 导出生成器
export { UseCaseGenerator, useCaseGenerator } from '../charts/generators/UseCaseGenerator';
export { DomainModelGenerator, domainModelGenerator } from '../charts/generators/DomainModelGenerator';
export { BusinessProcessGenerator, businessProcessGenerator } from '../charts/generators/BusinessProcessGenerator';

// 导出Mermaid渲染器
export { MermaidRenderer, mermaidRenderer } from '../charts/MermaidRenderer';

// 导出类型定义
export type {
  GeneratorRegistration
} from './GeneratorRegistry';

export type {
  PluginInstance,
  PluginEvent,
  PluginState
} from '../plugins/PluginSystem';

export type {
  BusinessProcessInput,
  ProcessNode,
  ProcessConnection,
  ProcessLane,
  BusinessProcessModel
} from '../charts/generators/BusinessProcessGenerator';

export type {
  UseCaseInput
} from '../charts/generators/UseCaseGenerator';

export type {
  DomainModelInput
} from '../charts/generators/DomainModelGenerator';

/**
 * 核心引擎初始化函数
 */
export async function initializeCoreEngine(): Promise<void> {
  try {
    console.log('Initializing core engine...');
    
    // 初始化文档引擎
    const docEngine = documentEngine;
    console.log('Document engine initialized');
    
    // 初始化生成器注册中心
    const genRegistry = generatorRegistry;
    console.log('Generator registry initialized');
    
    // 初始化模板引擎
    const templateEng = templateEngine;
    console.log('Template engine initialized');
    
    // 初始化插件系统
    const pluginSys = pluginSystem;
    console.log('Plugin system initialized');
    
    // 刷新文档引擎以同步最新的生成器
    docEngine.refresh();
    
    console.log('Core engine initialization completed successfully');
    
    // 输出统计信息
    const stats = {
      documentTypes: docEngine.getRegisteredTypes().length,
      generators: genRegistry.getEnabledGeneratorCount(),
      templates: templateEng.getAllTemplates().length,
      plugins: pluginSys.getStatistics().plugins.total
    };
    
    console.log('Core engine statistics:', stats);
    
  } catch (error) {
    console.error('Failed to initialize core engine:', error);
    throw error;
  }
}

/**
 * 获取核心引擎状态
 */
export function getCoreEngineStatus() {
  const docEngine = documentEngine;
  const genRegistry = generatorRegistry;
  const templateEng = templateEngine;
  const pluginSys = pluginSystem;
  
  const docEngineStatus = {
    registeredTypes: docEngine.getRegisteredTypes().length,
    isHealthy: true
  };
  
  // 生成器注册中心状态
  const genRegistryStatus = {
    registeredGenerators: genRegistry.getGeneratorCount(),
    enabledGenerators: genRegistry.getEnabledGeneratorCount(),
    categories: genRegistry.getCategories().length
  };
  
  // 模板引擎状态
  const templateEngineStatus = {
    registeredTemplates: templateEng.getAllTemplates().length,
    isHealthy: true
  };
  
  // 插件系统状态
  const pluginSystemStatus = {
    installedPlugins: pluginSys.getStatistics().plugins.total,
    enabledPlugins: pluginSys.getStatistics().plugins.enabled,
    registeredHooks: 0 // 暂时设为0，因为getRegisteredHooks方法不存在
  };
  
  return {
    documentEngine: docEngineStatus,
    generatorRegistry: genRegistryStatus,
    templateEngine: templateEngineStatus,
    pluginSystem: pluginSystemStatus
  };
}

/**
 * 重置核心引擎（主要用于测试和开发）
 */
export async function resetCoreEngine(): Promise<void> {
  console.log('Resetting core engine...');
  
  try {
    const docEngine = documentEngine;
    const genRegistry = generatorRegistry;
    const templateEng = templateEngine;
    const pluginSys = pluginSystem;
    
    // 重置插件系统
    await pluginSys.reset();
    
    // 重置生成器注册中心
    genRegistry.reset();
    
    // 重置模板引擎
    templateEng.reset();
    
    // 刷新文档引擎
    docEngine.refresh();
    
    console.log('Core engine reset completed');
  } catch (error) {
    console.error('Failed to reset core engine:', error);
    throw error;
  }
}

/**
 * 核心引擎健康检查
 */
export function healthCheck(): {
  status: 'healthy' | 'warning' | 'error';
  details: Record<string, any>;
  timestamp: Date;
} {
  const timestamp = new Date();
  const details: Record<string, any> = {};
  let status: 'healthy' | 'warning' | 'error' = 'healthy';
  
  try {
    // 检查文档引擎
    const docEngine = documentEngine;
    const docTypeCount = docEngine.getRegisteredTypes().length;
    details.documentEngine = {
      status: docTypeCount > 0 ? 'ok' : 'warning',
      documentTypes: docTypeCount
    };
    
    if (docTypeCount === 0) {
      status = 'warning';
    }
    
    // 检查生成器注册中心
    const genRegistry = generatorRegistry;
    const genStats = genRegistry.getStatistics();
    details.generatorRegistry = {
      status: genStats.enabled > 0 ? 'ok' : 'warning',
      ...genStats
    };
    
    if (genStats.enabled === 0) {
      status = 'warning';
    }
    
    // 检查模板引擎
    const templateEng = templateEngine;
    const templateCount = templateEng.getAllTemplates().length;
    details.templateEngine = {
      status: 'ok',
      templates: templateCount
    };
    
    // 检查插件系统
    const pluginSys = pluginSystem;
    const pluginStats = pluginSys.getStatistics();
    details.pluginSystem = {
      status: pluginStats.plugins.error > 0 ? 'warning' : 'ok',
      ...pluginStats
    };
    
    if (pluginStats.plugins.error > 0) {
      status = 'warning';
    }
    
  } catch (error) {
    status = 'error';
    details.error = error instanceof Error ? error.message : String(error);
  }
  
  return {
    status,
    details,
    timestamp
  };
}

// 默认导出核心引擎初始化函数
export default initializeCoreEngine;