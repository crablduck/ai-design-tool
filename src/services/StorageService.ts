// 本地存储服务 - 实现数据持久化

import type { BaseDocument, UseCaseModel, DomainModel } from '../types/document';

// 存储键名常量
const STORAGE_KEYS = {
  PROJECTS: 'ai_design_tool_projects',
  DOCUMENTS: 'ai_design_tool_documents',
  CORE_ASSETS: 'ai_design_tool_core_assets',
  USER_SETTINGS: 'ai_design_tool_user_settings',
  TEMPLATES: 'ai_design_tool_templates'
} as const;

// 项目数据接口
export interface ProjectData {
  id: string;
  name: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
  documents: string[]; // 文档ID列表
  coreAssets: {
    useCases: string[]; // 用例图ID列表
    domainModels: string[]; // 领域模型ID列表
    businessProcesses: string[]; // 业务流程ID列表
  };
  settings: {
    gitRepository?: string;
    aiProvider?: string;
    exportFormats: string[];
  };
}

// 用户设置接口
export interface UserSettings {
  theme: 'light' | 'dark';
  language: 'zh' | 'en';
  aiProvider: {
    name: string;
    apiKey?: string;
    baseUrl?: string;
  };
  exportPreferences: {
    defaultFormat: string;
    includeMetadata: boolean;
  };
  gitIntegration: {
    enabled: boolean;
    defaultBranch: string;
    autoCommit: boolean;
  };
}

// 存储服务类
export class StorageService {
  private static instance: StorageService;
  
  private constructor() {}
  
  static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService();
    }
    return StorageService.instance;
  }

  // 项目管理
  async saveProject(project: ProjectData): Promise<void> {
    const projects = await this.getProjects();
    const existingIndex = projects.findIndex(p => p.id === project.id);
    
    if (existingIndex >= 0) {
      projects[existingIndex] = { ...project, updatedAt: new Date() };
    } else {
      projects.push(project);
    }
    
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
  }

  async getProjects(): Promise<ProjectData[]> {
    const data = localStorage.getItem(STORAGE_KEYS.PROJECTS);
    if (!data) return [];
    
    try {
      const projects = JSON.parse(data);
      return projects.map((p: any) => ({
        ...p,
        createdAt: new Date(p.createdAt),
        updatedAt: new Date(p.updatedAt)
      }));
    } catch (error) {
      console.error('Failed to parse projects data:', error);
      return [];
    }
  }

  async getProject(id: string): Promise<ProjectData | null> {
    const projects = await this.getProjects();
    return projects.find(p => p.id === id) || null;
  }

  async deleteProject(id: string): Promise<void> {
    const projects = await this.getProjects();
    const filtered = projects.filter(p => p.id !== id);
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(filtered));
    
    // 同时删除项目相关的文档
    const project = projects.find(p => p.id === id);
    if (project) {
      for (const docId of project.documents) {
        await this.deleteDocument(docId);
      }
    }
  }

  // 文档管理
  async saveDocument(document: BaseDocument): Promise<void> {
    const documents = await this.getDocuments();
    const existingIndex = documents.findIndex(d => d.id === document.id);
    
    const docToSave = {
      ...document,
      updatedAt: new Date()
    };
    
    if (existingIndex >= 0) {
      documents[existingIndex] = docToSave;
    } else {
      documents.push(docToSave);
    }
    
    localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(documents));
  }

  async getDocuments(): Promise<BaseDocument[]> {
    const data = localStorage.getItem(STORAGE_KEYS.DOCUMENTS);
    if (!data) return [];
    
    try {
      const documents = JSON.parse(data);
      return documents.map((d: any) => ({
        ...d,
        createdAt: new Date(d.createdAt),
        updatedAt: new Date(d.updatedAt)
      }));
    } catch (error) {
      console.error('Failed to parse documents data:', error);
      return [];
    }
  }

  async getDocument(id: string): Promise<BaseDocument | null> {
    const documents = await this.getDocuments();
    return documents.find(d => d.id === id) || null;
  }

  async deleteDocument(id: string): Promise<void> {
    const documents = await this.getDocuments();
    const filtered = documents.filter(d => d.id !== id);
    localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(filtered));
  }

  // 核心资产管理
  async saveCoreAsset(asset: UseCaseModel | DomainModel): Promise<void> {
    const assets = await this.getCoreAssets();
    const existingIndex = assets.findIndex(a => a.id === asset.id);
    
    const assetToSave = {
      ...asset,
      updatedAt: new Date()
    };
    
    if (existingIndex >= 0) {
      assets[existingIndex] = assetToSave;
    } else {
      assets.push(assetToSave);
    }
    
    localStorage.setItem(STORAGE_KEYS.CORE_ASSETS, JSON.stringify(assets));
  }

  async getCoreAssets(): Promise<(UseCaseModel | DomainModel)[]> {
    const data = localStorage.getItem(STORAGE_KEYS.CORE_ASSETS);
    if (!data) return [];
    
    try {
      const assets = JSON.parse(data);
      return assets.map((a: any) => ({
        ...a,
        createdAt: new Date(a.createdAt),
        updatedAt: new Date(a.updatedAt)
      }));
    } catch (error) {
      console.error('Failed to parse core assets data:', error);
      return [];
    }
  }

  async getCoreAsset(id: string): Promise<UseCaseModel | DomainModel | null> {
    const assets = await this.getCoreAssets();
    return assets.find(a => a.id === id) || null;
  }

  async deleteCoreAsset(id: string): Promise<void> {
    const assets = await this.getCoreAssets();
    const filtered = assets.filter(a => a.id !== id);
    localStorage.setItem(STORAGE_KEYS.CORE_ASSETS, JSON.stringify(filtered));
  }

  // 用户设置管理
  async saveUserSettings(settings: UserSettings): Promise<void> {
    localStorage.setItem(STORAGE_KEYS.USER_SETTINGS, JSON.stringify(settings));
  }

  async getUserSettings(): Promise<UserSettings> {
    const data = localStorage.getItem(STORAGE_KEYS.USER_SETTINGS);
    if (!data) {
      // 返回默认设置
      return {
        theme: 'light',
        language: 'zh',
        aiProvider: {
          name: 'openai',
          baseUrl: 'https://api.openai.com/v1'
        },
        exportPreferences: {
          defaultFormat: 'markdown',
          includeMetadata: true
        },
        gitIntegration: {
          enabled: false,
          defaultBranch: 'main',
          autoCommit: false
        }
      };
    }
    
    try {
      return JSON.parse(data);
    } catch (error) {
      console.error('Failed to parse user settings:', error);
      return await this.getUserSettings(); // 返回默认设置
    }
  }

  // 数据导入导出
  async exportAllData(): Promise<string> {
    const data = {
      projects: await this.getProjects(),
      documents: await this.getDocuments(),
      coreAssets: await this.getCoreAssets(),
      userSettings: await this.getUserSettings(),
      exportedAt: new Date().toISOString(),
      version: '1.0.0'
    };
    
    return JSON.stringify(data, null, 2);
  }

  async importAllData(jsonData: string): Promise<void> {
    try {
      const data = JSON.parse(jsonData);
      
      if (data.projects) {
        localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(data.projects));
      }
      
      if (data.documents) {
        localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(data.documents));
      }
      
      if (data.coreAssets) {
        localStorage.setItem(STORAGE_KEYS.CORE_ASSETS, JSON.stringify(data.coreAssets));
      }
      
      if (data.userSettings) {
        localStorage.setItem(STORAGE_KEYS.USER_SETTINGS, JSON.stringify(data.userSettings));
      }
    } catch (error) {
      throw new Error(`数据导入失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  // 清空所有数据
  async clearAllData(): Promise<void> {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  }

  // 获取存储使用情况
  getStorageUsage(): { used: number; total: number; percentage: number } {
    let used = 0;
    Object.values(STORAGE_KEYS).forEach(key => {
      const data = localStorage.getItem(key);
      if (data) {
        used += new Blob([data]).size;
      }
    });
    
    // localStorage 通常限制为 5-10MB
    const total = 5 * 1024 * 1024; // 5MB
    const percentage = Math.round((used / total) * 100);
    
    return { used, total, percentage };
  }
}

// 导出单例实例
export const storageService = StorageService.getInstance();