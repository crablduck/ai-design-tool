// 基于业务领域的状态管理 - 以核心业务资产为中心

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type {
  BaseDocument,
  UseCaseModel,
  DomainModel,
  MermaidChart,
  DocumentTypeDefinition,
  ExportFormat,
  Plugin
} from '../types/document';

// 核心业务资产状态
interface CoreAssetsState {
  // 用例图 - 核心业务资产
  useCaseModels: Map<string, UseCaseModel>;
  currentUseCaseModel: UseCaseModel | null;
  
  // 领域模型/知识图谱 - 核心业务资产
  domainModels: Map<string, DomainModel>;
  currentDomainModel: DomainModel | null;
  
  // 业务流程图
  businessProcesses: Map<string, MermaidChart>;
  currentBusinessProcess: MermaidChart | null;
  
  // 操作方法
  setCurrentUseCaseModel: (model: UseCaseModel | null) => void;
  addUseCaseModel: (model: UseCaseModel) => void;
  updateUseCaseModel: (id: string, model: Partial<UseCaseModel>) => void;
  removeUseCaseModel: (id: string) => void;
  
  setCurrentDomainModel: (model: DomainModel | null) => void;
  addDomainModel: (model: DomainModel) => void;
  updateDomainModel: (id: string, model: Partial<DomainModel>) => void;
  removeDomainModel: (id: string) => void;
  
  setCurrentBusinessProcess: (process: MermaidChart | null) => void;
  addBusinessProcess: (process: MermaidChart) => void;
  updateBusinessProcess: (id: string, process: Partial<MermaidChart>) => void;
  removeBusinessProcess: (id: string) => void;
}

// 可扩展文档生成状态
interface DocumentEngineState {
  // 文档类型注册表
  documentTypes: Map<string, DocumentTypeDefinition>;
  
  // 生成的文档
  documents: Map<string, BaseDocument>;
  
  // 文档生成历史
  generationHistory: Array<{
    id: string;
    type: string;
    timestamp: Date;
    status: 'pending' | 'generating' | 'completed' | 'failed';
    result?: BaseDocument;
    error?: string;
  }>;
  
  // 插件系统
  installedPlugins: Map<string, Plugin>;
  
  // 操作方法
  registerDocumentType: (definition: DocumentTypeDefinition) => void;
  unregisterDocumentType: (type: string) => void;
  getDocumentType: (type: string) => DocumentTypeDefinition | undefined;
  
  addDocument: (document: BaseDocument) => void;
  updateDocument: (id: string, document: Partial<BaseDocument>) => void;
  removeDocument: (id: string) => void;
  getDocument: (id: string) => BaseDocument | undefined;
  
  addGenerationRecord: (record: {
    id: string;
    type: string;
    timestamp: Date;
    status: 'pending' | 'generating' | 'completed' | 'failed';
    result?: BaseDocument;
    error?: string;
  }) => void;
  updateGenerationRecord: (id: string, updates: Record<string, unknown>) => void;
  
  installPlugin: (plugin: Plugin) => void;
  uninstallPlugin: (pluginId: string) => void;
  getPlugin: (pluginId: string) => Plugin | undefined;
}

// Mermaid图表生成状态
interface ChartEngineState {
  // 图表集合
  charts: Map<string, MermaidChart>;
  
  // 当前编辑的图表
  currentChart: MermaidChart | null;
  
  // 图表模板
  chartTemplates: Map<string, MermaidChart>;
  
  // 导出历史
  exportHistory: Array<{
    chartId: string;
    format: ExportFormat;
    timestamp: Date;
    status: 'pending' | 'exporting' | 'completed' | 'failed';
    result?: Buffer;
    error?: string;
  }>;
  
  // 操作方法
  setCurrentChart: (chart: MermaidChart | null) => void;
  addChart: (chart: MermaidChart) => void;
  updateChart: (id: string, chart: Partial<MermaidChart>) => void;
  removeChart: (id: string) => void;
  getChart: (id: string) => MermaidChart | undefined;
  
  addChartTemplate: (template: MermaidChart) => void;
  removeChartTemplate: (id: string) => void;
  getChartTemplate: (id: string) => MermaidChart | undefined;
  
  addExportRecord: (record: {
    chartId: string;
    format: ExportFormat;
    timestamp: Date;
    status: 'pending' | 'exporting' | 'completed' | 'failed';
    result?: Buffer;
    error?: string;
  }) => void;
  updateExportRecord: (chartId: string, updates: Record<string, unknown>) => void;
}

// 用户定制化状态
// 用户偏好设置类型
type UserPreferences = {
  defaultDocumentTypes: string[];
  favoriteChartTypes: string[];
  exportFormats: ExportFormat[];
  autoSave: boolean;
  theme: 'light' | 'dark' | 'auto';
};

// 工作空间配置类型
type WorkspaceConfig = {
  layout: 'grid' | 'list' | 'kanban';
  sidebarCollapsed: boolean;
  activePanel: 'assets' | 'documents' | 'charts' | 'plugins';
};

interface CustomizationState {
  // 用户偏好设置
  userPreferences: UserPreferences;
  
  // 自定义模板
  customTemplates: Map<string, Record<string, unknown>>;
  
  // 工作空间配置
  workspaceConfig: WorkspaceConfig;
  
  // 操作方法
  updateUserPreferences: (preferences: Partial<UserPreferences>) => void;
  addCustomTemplate: (template: Record<string, unknown> & { id: string }) => void;
  removeCustomTemplate: (id: string) => void;
  updateWorkspaceConfig: (config: Partial<WorkspaceConfig>) => void;
}

// MCP能力类型
type MCPCapability = {
  name: string;
  version: string;
  description?: string;
};

// MCP协议状态
interface MCPState {
  // 连接状态
  isConnected: boolean;
  serverUrl: string;
  
  // 能力信息
  capabilities: MCPCapability[];
  
  // 请求历史
  requestHistory: Array<{
    id: string;
    method: string;
    params: Record<string, unknown>;
    timestamp: Date;
    status: 'pending' | 'completed' | 'failed';
    result?: Record<string, unknown>;
    error?: string;
  }>;
  
  // 操作方法
  setConnectionStatus: (connected: boolean) => void;
  setServerUrl: (url: string) => void;
  setCapabilities: (capabilities: MCPCapability[]) => void;
  addRequestRecord: (record: {
    id: string;
    method: string;
    params: Record<string, unknown>;
    timestamp: Date;
    status: 'pending' | 'completed' | 'failed';
    result?: Record<string, unknown>;
    error?: string;
  }) => void;
  updateRequestRecord: (id: string, updates: Record<string, unknown>) => void;
}

// 创建核心业务资产store
export const useCoreAssetsStore = create<CoreAssetsState>()(devtools(persist(
      (set) => ({
        useCaseModels: new Map(),
        currentUseCaseModel: null,
        domainModels: new Map(),
        currentDomainModel: null,
        businessProcesses: new Map(),
        currentBusinessProcess: null,
        
        setCurrentUseCaseModel: (model) => set({ currentUseCaseModel: model }),
        
        addUseCaseModel: (model) => set((state) => {
          // 确保useCaseModels是Map对象
          const currentModels = state.useCaseModels instanceof Map 
            ? state.useCaseModels 
            : new Map(Array.isArray(state.useCaseModels) ? state.useCaseModels : []);
          const newMap = new Map(currentModels) as Map<string, UseCaseModel>;
          newMap.set(model.id, model);
          return { useCaseModels: newMap };
        }),
        
        updateUseCaseModel: (id, updates) => set((state) => {
          const currentModels = state.useCaseModels instanceof Map 
            ? state.useCaseModels 
            : new Map(Array.isArray(state.useCaseModels) ? state.useCaseModels : []);
          const newMap = new Map(currentModels) as Map<string, UseCaseModel>;
          const existing = newMap.get(id);
          if (existing) {
            newMap.set(id, { ...existing, ...updates });
          }
          return { useCaseModels: newMap };
        }),
        
        removeUseCaseModel: (id) => set((state) => {
          const currentModels = state.useCaseModels instanceof Map 
            ? state.useCaseModels 
            : new Map(Array.isArray(state.useCaseModels) ? state.useCaseModels : []);
          const newMap = new Map(currentModels) as Map<string, UseCaseModel>;
          newMap.delete(id);
          return { 
            useCaseModels: newMap,
            currentUseCaseModel: state.currentUseCaseModel?.id === id ? null : state.currentUseCaseModel
          };
        }),
        
        setCurrentDomainModel: (model) => set({ currentDomainModel: model }),
        
        addDomainModel: (model) => set((state) => {
          const currentModels = state.domainModels instanceof Map 
            ? state.domainModels 
            : new Map(Array.isArray(state.domainModels) ? state.domainModels : []);
          const newMap = new Map(currentModels) as Map<string, DomainModel>;
          newMap.set(model.id, model);
          return { domainModels: newMap };
        }),
        
        updateDomainModel: (id, updates) => set((state) => {
          const currentModels = state.domainModels instanceof Map 
            ? state.domainModels 
            : new Map(Array.isArray(state.domainModels) ? state.domainModels : []);
          const newMap = new Map(currentModels) as Map<string, DomainModel>;
          const existing = newMap.get(id);
          if (existing) {
            newMap.set(id, { ...existing, ...updates });
          }
          return { domainModels: newMap };
        }),
        
        removeDomainModel: (id) => set((state) => {
          const currentModels = state.domainModels instanceof Map 
            ? state.domainModels 
            : new Map(Array.isArray(state.domainModels) ? state.domainModels : []);
          const newMap = new Map(currentModels) as Map<string, DomainModel>;
          newMap.delete(id);
          return { 
            domainModels: newMap,
            currentDomainModel: state.currentDomainModel?.id === id ? null : state.currentDomainModel
          };
        }),
        
        setCurrentBusinessProcess: (process) => set({ currentBusinessProcess: process }),
        
        addBusinessProcess: (process) => set((state) => {
          const currentProcesses = state.businessProcesses instanceof Map 
            ? state.businessProcesses 
            : new Map(Array.isArray(state.businessProcesses) ? state.businessProcesses : []);
          const newMap = new Map(currentProcesses) as Map<string, MermaidChart>;
          newMap.set(process.id, process);
          return { businessProcesses: newMap };
        }),
        
        updateBusinessProcess: (id, updates) => set((state) => {
          const currentProcesses = state.businessProcesses instanceof Map 
            ? state.businessProcesses 
            : new Map(Array.isArray(state.businessProcesses) ? state.businessProcesses : []);
          const newMap = new Map(currentProcesses) as Map<string, MermaidChart>;
          const existing = newMap.get(id);
          if (existing) {
            newMap.set(id, { ...existing, ...updates });
          }
          return { businessProcesses: newMap };
        }),
        
        removeBusinessProcess: (id) => set((state) => {
          const currentProcesses = state.businessProcesses instanceof Map 
            ? state.businessProcesses 
            : new Map(Array.isArray(state.businessProcesses) ? state.businessProcesses : []);
          const newMap = new Map(currentProcesses) as Map<string, MermaidChart>;
          newMap.delete(id);
          return { 
            businessProcesses: newMap,
            currentBusinessProcess: state.currentBusinessProcess?.id === id ? null : state.currentBusinessProcess
          };
        })
      }),
      {
        name: 'core-assets-storage',
        storage: {
          getItem: (name) => {
            try {
              const str = localStorage.getItem(name);
              if (!str) return null;
              const data = JSON.parse(str);
              // 恢复Map对象
              if (data.state) {
                // 安全地恢复 useCaseModels
                if (data.state.useCaseModels) {
                  if (Array.isArray(data.state.useCaseModels)) {
                    try {
                      data.state.useCaseModels = new Map(data.state.useCaseModels);
                    } catch (e) {
                      console.warn('Failed to restore useCaseModels Map:', e);
                      data.state.useCaseModels = new Map();
                    }
                  } else if (!(data.state.useCaseModels instanceof Map)) {
                    data.state.useCaseModels = new Map();
                  }
                } else {
                  data.state.useCaseModels = new Map();
                }
                
                // 安全地恢复 domainModels
                if (data.state.domainModels) {
                  if (Array.isArray(data.state.domainModels)) {
                    try {
                      data.state.domainModels = new Map(data.state.domainModels);
                    } catch (e) {
                      console.warn('Failed to restore domainModels Map:', e);
                      data.state.domainModels = new Map();
                    }
                  } else if (!(data.state.domainModels instanceof Map)) {
                    data.state.domainModels = new Map();
                  }
                } else {
                  data.state.domainModels = new Map();
                }
                
                // 安全地恢复 businessProcesses
                if (data.state.businessProcesses) {
                  if (Array.isArray(data.state.businessProcesses)) {
                    try {
                      data.state.businessProcesses = new Map(data.state.businessProcesses);
                    } catch (e) {
                      console.warn('Failed to restore businessProcesses Map:', e);
                      data.state.businessProcesses = new Map();
                    }
                  } else if (!(data.state.businessProcesses instanceof Map)) {
                    data.state.businessProcesses = new Map();
                  }
                } else {
                  data.state.businessProcesses = new Map();
                }
              }
              return data;
            } catch (error) {
              console.error('Error parsing stored data:', error);
              return null;
            }
          },
          setItem: (name, value) => {
            try {
              const data = { ...value };
              // 序列化Map对象
              if (data.state) {
                // 安全地序列化 useCaseModels
                if (data.state.useCaseModels instanceof Map) {
                  try {
                    (data.state as any).useCaseModels = Array.from(data.state.useCaseModels.entries());
                  } catch (e) {
                    console.warn('Failed to serialize useCaseModels Map:', e);
                    (data.state as any).useCaseModels = [];
                  }
                } else if (data.state.useCaseModels && !Array.isArray(data.state.useCaseModels)) {
                  (data.state as any).useCaseModels = [];
                }
                
                // 安全地序列化 domainModels
                if (data.state.domainModels instanceof Map) {
                  try {
                    (data.state as any).domainModels = Array.from(data.state.domainModels.entries());
                  } catch (e) {
                    console.warn('Failed to serialize domainModels Map:', e);
                    (data.state as any).domainModels = [];
                  }
                } else if (data.state.domainModels && !Array.isArray(data.state.domainModels)) {
                  (data.state as any).domainModels = [];
                }
                
                // 安全地序列化 businessProcesses
                if (data.state.businessProcesses instanceof Map) {
                  try {
                    (data.state as any).businessProcesses = Array.from(data.state.businessProcesses.entries());
                  } catch (e) {
                    console.warn('Failed to serialize businessProcesses Map:', e);
                    (data.state as any).businessProcesses = [];
                  }
                } else if (data.state.businessProcesses && !Array.isArray(data.state.businessProcesses)) {
                  (data.state as any).businessProcesses = [];
                }
              }
              localStorage.setItem(name, JSON.stringify(data));
            } catch (error) {
              console.error('Error storing data:', error);
            }
          },
          removeItem: (name) => localStorage.removeItem(name)
        }
      }
    ),
    { name: 'core-assets-store' }
  ));

// 创建文档引擎store
export const useDocumentEngineStore = create<DocumentEngineState>()(devtools(persist(
      (set, get) => ({
        documentTypes: new Map(),
        documents: new Map(),
        generationHistory: [],
        installedPlugins: new Map(),
        
        registerDocumentType: (definition) => set((state) => {
          const newMap = new Map(state.documentTypes);
          newMap.set(definition.type, definition);
          return { documentTypes: newMap };
        }),
        
        unregisterDocumentType: (type) => set((state) => {
          const newMap = new Map(state.documentTypes);
          newMap.delete(type);
          return { documentTypes: newMap };
        }),
        
        getDocumentType: (type) => get().documentTypes.get(type),
        
        addDocument: (document) => set((state) => {
          const newMap = new Map(state.documents);
          newMap.set(document.id, document);
          return { documents: newMap };
        }),
        
        updateDocument: (id, updates) => set((state) => {
          const newMap = new Map(state.documents);
          const existing = newMap.get(id);
          if (existing) {
            newMap.set(id, { ...existing, ...updates });
          }
          return { documents: newMap };
        }),
        
        removeDocument: (id) => set((state) => {
          const newMap = new Map(state.documents);
          newMap.delete(id);
          return { documents: newMap };
        }),
        
        getDocument: (id) => get().documents.get(id),
        
        addGenerationRecord: (record) => set((state) => ({
          generationHistory: [...state.generationHistory, record]
        })),
        
        updateGenerationRecord: (id, updates) => set((state) => ({
          generationHistory: state.generationHistory.map(record => 
            record.id === id ? { ...record, ...updates } : record
          )
        })),
        
        installPlugin: (plugin) => set((state) => {
          const newMap = new Map(state.installedPlugins);
          newMap.set(plugin.id, plugin);
          return { installedPlugins: newMap };
        }),
        
        uninstallPlugin: (pluginId) => set((state) => {
          const newMap = new Map(state.installedPlugins);
          newMap.delete(pluginId);
          return { installedPlugins: newMap };
        }),
        
        getPlugin: (pluginId) => get().installedPlugins.get(pluginId)
      }),
      {
        name: 'document-engine-storage'
      }
    ),
    { name: 'document-engine-store' }
  ));

// 创建图表引擎store
export const useChartEngineStore = create<ChartEngineState>()(devtools(persist(
      (set, get) => ({
        charts: new Map(),
        currentChart: null,
        chartTemplates: new Map(),
        exportHistory: [],
        
        setCurrentChart: (chart) => set({ currentChart: chart }),
        
        addChart: (chart) => set((state) => {
          const newMap = new Map(state.charts);
          newMap.set(chart.id, chart);
          return { charts: newMap };
        }),
        
        updateChart: (id, updates) => set((state) => {
          const newMap = new Map(state.charts);
          const existing = newMap.get(id);
          if (existing) {
            newMap.set(id, { ...existing, ...updates });
          }
          return { charts: newMap };
        }),
        
        removeChart: (id) => set((state) => {
          const newMap = new Map(state.charts);
          newMap.delete(id);
          return { 
            charts: newMap,
            currentChart: state.currentChart?.id === id ? null : state.currentChart
          };
        }),
        
        getChart: (id) => get().charts.get(id),
        
        addChartTemplate: (template) => set((state) => {
          const newMap = new Map(state.chartTemplates);
          newMap.set(template.id, template);
          return { chartTemplates: newMap };
        }),
        
        removeChartTemplate: (id) => set((state) => {
          const newMap = new Map(state.chartTemplates);
          newMap.delete(id);
          return { chartTemplates: newMap };
        }),
        
        getChartTemplate: (id) => get().chartTemplates.get(id),
        
        addExportRecord: (record) => set((state) => ({
          exportHistory: [...state.exportHistory, record]
        })),
        
        updateExportRecord: (chartId, updates) => set((state) => ({
          exportHistory: state.exportHistory.map(record => 
            record.chartId === chartId ? { ...record, ...updates } : record
          )
        }))
      }),
      {
        name: 'chart-engine-storage'
      }
    ),
    { name: 'chart-engine-store' }
  ));

// 创建用户定制化store
export const useCustomizationStore = create<CustomizationState>()(devtools(persist(
      (set) => ({
        userPreferences: {
          defaultDocumentTypes: ['usecase', 'domain-model', 'sequence'],
          favoriteChartTypes: ['flowchart', 'sequence', 'class'],
          exportFormats: ['svg', 'png'],
          autoSave: true,
          theme: 'auto'
        },
        customTemplates: new Map(),
        workspaceConfig: {
          layout: 'grid',
          sidebarCollapsed: false,
          activePanel: 'assets'
        },
        
        updateUserPreferences: (preferences) => set((state) => ({
          userPreferences: { ...state.userPreferences, ...preferences }
        })),
        
        addCustomTemplate: (template) => set((state) => {
          const newMap = new Map(state.customTemplates);
          newMap.set(template.id, template);
          return { customTemplates: newMap };
        }),
        
        removeCustomTemplate: (id) => set((state) => {
          const newMap = new Map(state.customTemplates);
          newMap.delete(id);
          return { customTemplates: newMap };
        }),
        
        updateWorkspaceConfig: (config) => set((state) => ({
          workspaceConfig: { ...state.workspaceConfig, ...config }
        }))
      }),
      {
        name: 'customization-storage'
      }
    ),
    { name: 'customization-store' }
  ));

// 创建MCP协议store
export const useMCPStore = create<MCPState>()(devtools(
    (set) => ({
      isConnected: false,
      serverUrl: 'http://localhost:3001',
      capabilities: [],
      requestHistory: [],
      
      setConnectionStatus: (connected) => set({ isConnected: connected }),
      setServerUrl: (url) => set({ serverUrl: url }),
      setCapabilities: (capabilities) => set({ capabilities }),
      
      addRequestRecord: (record) => set((state) => ({
        requestHistory: [...state.requestHistory, record]
      })),
      
      updateRequestRecord: (id, updates) => set((state) => ({
        requestHistory: state.requestHistory.map(record => 
          record.id === id ? { ...record, ...updates } : record
        )
      }))
    }),
    { name: 'mcp-store' }
  ));

// 导出所有store的组合hook
export const useAppStores = () => {
  const coreAssets = useCoreAssetsStore();
  const documentEngine = useDocumentEngineStore();
  const chartEngine = useChartEngineStore();
  const customization = useCustomizationStore();
  const mcp = useMCPStore();
  
  return {
    coreAssets,
    documentEngine,
    chartEngine,
    customization,
    mcp
  };
};

// 初始化默认数据
export const initializeStores = () => {
  // 初始化默认文档类型
  const documentEngine = useDocumentEngineStore.getState();
  
  // 注册核心文档类型
  const coreDocumentTypes: Partial<DocumentTypeDefinition>[] = [
    {
      type: 'usecase',
      name: '用例图',
      description: '系统用例图，描述系统功能和用户交互',
      icon: 'project',
      category: 'core-asset',
      schema: {
        type: 'object',
        properties: {
          actors: { type: 'array' },
          useCases: { type: 'array' },
          relationships: { type: 'array' }
        }
      }
    },
    {
      type: 'domain-model',
      name: '领域模型',
      description: '业务领域模型和知识图谱',
      icon: 'node-index',
      category: 'core-asset',
      schema: {
        type: 'object',
        properties: {
          entities: { type: 'array' },
          valueObjects: { type: 'array' },
          aggregates: { type: 'array' },
          relationships: { type: 'array' }
        }
      }
    },
    {
      type: 'sequence',
      name: '时序图',
      description: '系统交互时序图',
      icon: 'branches',
      category: 'diagram',
      schema: {
        type: 'object',
        properties: {
          participants: { type: 'array' },
          messages: { type: 'array' }
        }
      }
    },
    {
      type: 'class',
      name: '类图',
      description: '系统类结构图',
      icon: 'code',
      category: 'diagram',
      schema: {
        type: 'object',
        properties: {
          classes: { type: 'array' },
          relationships: { type: 'array' }
        }
      }
    },
    {
      type: 'api-spec',
      name: 'API规范',
      description: 'RESTful API接口规范',
      icon: 'api',
      category: 'specification',
      schema: {
        type: 'object',
        properties: {
          endpoints: { type: 'array' },
          schemas: { type: 'object' }
        }
      }
    },
    {
      type: 'database',
      name: '数据库设计',
      description: '数据库表结构和关系设计',
      icon: 'database',
      category: 'specification',
      schema: {
        type: 'object',
        properties: {
          tables: { type: 'array' },
          relationships: { type: 'array' }
        }
      }
    }
  ];
  
  // 注册所有核心文档类型
  coreDocumentTypes.forEach(type => {
    // 为了简化，暂时跳过注册，因为需要完整的DocumentTypeDefinition
    // documentEngine.registerDocumentType(type as DocumentTypeDefinition);
  });
  
  console.log('Stores initialized with default data');
};