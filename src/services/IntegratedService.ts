import { aiService } from './aiService';
import { StorageService } from './StorageService';
import { GitService } from './GitService';
import { CodeAnalysisService } from './CodeAnalysisService';
import { DocumentEngine } from './DocumentEngine';
import { MCPServer } from './MCPServer';
import { UseCaseModel, DomainModel } from '../types/document';

type AIServiceType = typeof aiService;

/**
 * 集成服务 - 统一管理所有后端服务
 */
export class IntegratedService {
  private aiService: AIServiceType;
  private storageService: StorageService;
  private gitService: GitService;
  private codeAnalysisService: CodeAnalysisService;
  private documentEngine: DocumentEngine;
  private mcpServer: MCPServer;
  private isInitialized = false;

  constructor() {
    this.aiService = aiService;
    this.storageService = StorageService.getInstance();
    this.gitService = GitService.getInstance();
    this.codeAnalysisService = CodeAnalysisService.getInstance();
    this.documentEngine = new DocumentEngine();
    this.mcpServer = new MCPServer();
  }

  /**
   * 初始化所有服务
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      // 所有服务都是单例或无需初始化
      
      this.isInitialized = true;
      console.log('集成服务初始化完成');
    } catch (error) {
      console.error('集成服务初始化失败:', error);
      throw error;
    }
  }

  /**
   * 获取服务状态
   */
  getServiceStatus() {
    return {
      isInitialized: this.isInitialized,
      services: {
        ai: this.aiService.getServiceStatus(),
        storage: this.storageService.getStorageUsage(),
        git: this.gitService.getStatus(),
        codeAnalysis: { isHealthy: true },
        documentEngine: { isHealthy: true },
        mcpServer: { isHealthy: true }
      }
    };
  }

  // AI 服务相关方法
  async generateUseCase(requirements: string): Promise<UseCaseModel> {
    await this.ensureInitialized();
    return this.aiService.generateUseCase(requirements);
  }

  async generateDomainModel(businessContext: string): Promise<DomainModel> {
    await this.ensureInitialized();
    return this.aiService.generateDomainModel(businessContext);
  }

  async analyzeProjectFiles(files: File[]) {
    await this.ensureInitialized();
    return this.aiService.analyzeProjectFiles(files);
  }

  async askQuestion(question: string, context?: string) {
    await this.ensureInitialized();
    return this.aiService.askQuestion(question, context);
  }

  // 存储服务相关方法
  async saveProject(project: any) {
    await this.ensureInitialized();
    return this.storageService.saveProject(project);
  }

  async getProject(id: string) {
    await this.ensureInitialized();
    return this.storageService.getProject(id);
  }

  async getAllProjects() {
    await this.ensureInitialized();
    return this.storageService.getProjects();
  }

  async saveCoreAsset(asset: UseCaseModel | DomainModel) {
    await this.ensureInitialized();
    return this.storageService.saveCoreAsset(asset);
  }

  async getCoreAsset(id: string) {
    await this.ensureInitialized();
    return this.storageService.getCoreAsset(id);
  }

  async getAllCoreAssets() {
    await this.ensureInitialized();
    return this.storageService.getCoreAssets();
  }

  async exportData() {
    await this.ensureInitialized();
    return this.storageService.exportAllData();
  }

  async importData(data: string) {
    await this.ensureInitialized();
    return this.storageService.importAllData(data);
  }

  // Git 服务相关方法
  async initRepository(projectData: any) {
    await this.ensureInitialized();
    return this.gitService.initRepository(projectData);
  }

  async commitChanges(message: string, files?: any[]) {
    await this.ensureInitialized();
    const fileChanges = files || [];
    return this.gitService.commitFiles(fileChanges, message);
  }

  async pushChanges(remote = 'origin', branch = 'main') {
    await this.ensureInitialized();
    return this.gitService.push();
  }

  async pullChanges(remote = 'origin', branch = 'main') {
    await this.ensureInitialized();
    return this.gitService.pull();
  }

  async getGitStatus() {
    await this.ensureInitialized();
    return this.gitService.getStatus();
  }

  async getCommitHistory(limit = 10) {
    await this.ensureInitialized();
    return this.gitService.getCommitHistory(limit);
  }

  // 代码分析服务相关方法
  async analyzeFile(fileName: string, content: string, language?: string) {
    await this.ensureInitialized();
    return this.codeAnalysisService.analyzeFile({
      fileName,
      content,
      language
    });
  }

  async analyzeProject(files: { fileName: string; content: string; language?: string }[]) {
    await this.ensureInitialized();
    return this.codeAnalysisService.analyzeProject({
      files,
      projectType: 'web',
      framework: 'react'
    });
  }

  // 文档引擎相关方法
  async generateDocument(type: string, data: any) {
    await this.ensureInitialized();
    return this.documentEngine.generateDocument(type, data);
  }

  async renderDocument(document: any, format: 'html' | 'pdf' | 'markdown') {
    await this.ensureInitialized();
    return this.documentEngine.renderDocument(document, format);
  }

  async exportDocument(document: any, format: 'html' | 'pdf' | 'markdown') {
    await this.ensureInitialized();
    return this.documentEngine.exportDocument(document, format);
  }

  async validateDocument(document: any) {
    await this.ensureInitialized();
    return this.documentEngine.validateDocument(document);
  }

  // MCP 服务相关方法
  async handleMCPRequest(request: any) {
    await this.ensureInitialized();
    return this.mcpServer.handleRequest(request);
  }

  // 综合功能方法
  /**
   * 智能项目分析 - 结合多个服务的综合分析
   */
  async intelligentProjectAnalysis(files: File[], requirements?: string) {
    await this.ensureInitialized();
    
    try {
      // 1. AI 文件分析
      const aiAnalysis = await this.aiService.analyzeProjectFiles(files);
      
      // 2. 代码分析（如果有代码文件）
      const codeFiles = files.filter(f => 
        ['js', 'ts', 'jsx', 'tsx', 'py', 'java', 'cpp'].includes(
          f.name.split('.').pop() || ''
        )
      );
      
      let codeAnalysis = null;
      if (codeFiles.length > 0) {
        // 模拟代码分析
        codeAnalysis = {
          metrics: { complexity: 'medium', maintainability: 'good' },
          issues: [],
          suggestions: ['添加单元测试', '优化代码结构']
        };
      }
      
      // 3. 生成建议的核心资产
      const suggestions = {
        shouldGenerateUseCase: requirements && requirements.length > 0,
        shouldGenerateDomainModel: aiAnalysis.detectedPatterns.includes('MVC架构模式'),
        suggestedDocuments: aiAnalysis.suggestedDocuments
      };
      
      return {
        aiAnalysis,
        codeAnalysis,
        suggestions,
        summary: `项目分析完成：${aiAnalysis.summary}`,
        nextSteps: [
          '基于分析结果生成核心业务资产',
          '创建项目文档',
          '设置版本控制'
        ]
      };
    } catch (error) {
      console.error('智能项目分析失败:', error);
      throw error;
    }
  }

  /**
   * 一键项目初始化
   */
  async quickProjectSetup(projectData: {
    name: string;
    description: string;
    requirements?: string;
    businessContext?: string;
    files?: File[];
  }) {
    await this.ensureInitialized();
    
    try {
      const results = {
        project: null as any,
        useCase: null as any,
        domainModel: null as any,
        git: null as any,
        analysis: null as any
      };
      
      // 1. 创建项目
      const project = {
        id: `project_${Date.now()}`,
        name: projectData.name,
        description: projectData.description,
        createdAt: new Date(),
        updatedAt: new Date(),
        status: 'active'
      };
      results.project = await this.saveProject(project);
      
      // 2. 生成用例图（如果有需求）
      if (projectData.requirements) {
        results.useCase = await this.generateUseCase(projectData.requirements);
      }
      
      // 3. 生成领域模型（如果有业务上下文）
      if (projectData.businessContext) {
        results.domainModel = await this.generateDomainModel(projectData.businessContext);
      }
      
      // 4. 初始化Git仓库
      try {
        results.git = await this.initRepository(`./projects/${project.id}`);
      } catch (error) {
        console.warn('Git初始化失败，跳过:', error);
      }
      
      // 5. 分析项目文件（如果有）
      if (projectData.files && projectData.files.length > 0) {
        results.analysis = await this.intelligentProjectAnalysis(
          projectData.files,
          projectData.requirements
        );
      }
      
      return {
        success: true,
        results,
        message: `项目 "${projectData.name}" 初始化完成`
      };
    } catch (error) {
      console.error('项目初始化失败:', error);
      throw error;
    }
  }

  /**
   * 确保服务已初始化
   */
  private async ensureInitialized(): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }
  }

  /**
   * 清理资源
   */
  async cleanup(): Promise<void> {
    // 清理各个服务的资源
    this.isInitialized = false;
    console.log('集成服务已清理');
  }
}

// 导出单例实例
export const integratedService = new IntegratedService();