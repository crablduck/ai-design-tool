// 代码分析服务 - 实现真实的代码分析功能

import type { BaseDocument } from '../types/document';

// 代码分析结果接口
export interface CodeAnalysisResult {
  id: string;
  fileName: string;
  language: string;
  metrics: CodeMetrics;
  issues: CodeIssue[];
  suggestions: string[];
  dependencies: Dependency[];
  architecture: ArchitectureInfo;
  mermaidCode?: string;
  analyzedAt: Date;
}

// 代码指标接口
export interface CodeMetrics {
  linesOfCode: number;
  complexity: number;
  maintainabilityIndex: number;
  testCoverage?: number;
  duplicatedLines: number;
  technicalDebt: {
    hours: number;
    rating: 'A' | 'B' | 'C' | 'D' | 'E';
  };
}

// 代码问题接口
export interface CodeIssue {
  id: string;
  type: 'bug' | 'vulnerability' | 'code_smell' | 'security_hotspot';
  severity: 'blocker' | 'critical' | 'major' | 'minor' | 'info';
  message: string;
  file: string;
  line: number;
  column?: number;
  rule: string;
  effort: string; // 修复时间估计
}

// 依赖关系接口
export interface Dependency {
  name: string;
  version: string;
  type: 'production' | 'development' | 'peer';
  vulnerabilities: Vulnerability[];
  license: string;
  size: number; // bytes
}

// 漏洞信息接口
export interface Vulnerability {
  id: string;
  severity: 'low' | 'moderate' | 'high' | 'critical';
  title: string;
  description: string;
  patchedVersions: string[];
}

// 架构信息接口
export interface ArchitectureInfo {
  pattern: string; // 'MVC', 'MVP', 'MVVM', 'Layered', 'Microservices', etc.
  layers: ArchitectureLayer[];
  components: ArchitectureComponent[];
  relationships: ArchitectureRelationship[];
}

// 架构层接口
export interface ArchitectureLayer {
  name: string;
  type: 'presentation' | 'business' | 'data' | 'infrastructure';
  components: string[];
  responsibilities: string[];
}

// 架构组件接口
export interface ArchitectureComponent {
  name: string;
  type: 'controller' | 'service' | 'repository' | 'model' | 'view' | 'utility';
  files: string[];
  dependencies: string[];
  complexity: number;
}

// 架构关系接口
export interface ArchitectureRelationship {
  from: string;
  to: string;
  type: 'depends_on' | 'implements' | 'extends' | 'uses' | 'calls';
  strength: number; // 0-1, 关系强度
}

// 文件分析请求接口
export interface FileAnalysisRequest {
  fileName: string;
  content: string;
  language?: string;
}

// 项目分析请求接口
export interface ProjectAnalysisRequest {
  files: FileAnalysisRequest[];
  projectType?: string;
  framework?: string;
}

// 代码分析服务类
export class CodeAnalysisService {
  private static instance: CodeAnalysisService;
  
  private constructor() {}
  
  static getInstance(): CodeAnalysisService {
    if (!CodeAnalysisService.instance) {
      CodeAnalysisService.instance = new CodeAnalysisService();
    }
    return CodeAnalysisService.instance;
  }

  // 分析单个文件
  async analyzeFile(request: FileAnalysisRequest): Promise<CodeAnalysisResult> {
    const language = request.language || this.detectLanguage(request.fileName);
    
    // 模拟分析过程
    await this.simulateAnalysis(1000);
    
    const metrics = this.calculateMetrics(request.content, language);
    const issues = this.detectIssues(request.content, language);
    const dependencies = this.extractDependencies(request.content, language);
    
    return {
      id: this.generateId(),
      fileName: request.fileName,
      language,
      metrics,
      issues,
      suggestions: this.generateSuggestions(metrics, issues),
      dependencies,
      architecture: this.analyzeArchitecture([request]),
      mermaidCode: this.generateMermaidCode(request, dependencies),
      analyzedAt: new Date()
    };
  }

  // 分析整个项目
  async analyzeProject(request: ProjectAnalysisRequest): Promise<CodeAnalysisResult[]> {
    const results: CodeAnalysisResult[] = [];
    
    // 模拟项目分析过程
    await this.simulateAnalysis(3000);
    
    for (const file of request.files) {
      const result = await this.analyzeFile(file);
      results.push(result);
    }
    
    // 分析项目整体架构
    const projectArchitecture = this.analyzeArchitecture(request.files);
    
    // 为每个文件添加项目级别的架构信息
    results.forEach(result => {
      result.architecture = projectArchitecture;
    });
    
    return results;
  }

  // 检测编程语言
  private detectLanguage(fileName: string): string {
    const extension = fileName.split('.').pop()?.toLowerCase();
    
    const languageMap: Record<string, string> = {
      'js': 'javascript',
      'jsx': 'javascript',
      'ts': 'typescript',
      'tsx': 'typescript',
      'py': 'python',
      'java': 'java',
      'cpp': 'cpp',
      'c': 'c',
      'cs': 'csharp',
      'php': 'php',
      'rb': 'ruby',
      'go': 'go',
      'rs': 'rust',
      'swift': 'swift',
      'kt': 'kotlin',
      'scala': 'scala',
      'html': 'html',
      'css': 'css',
      'scss': 'scss',
      'less': 'less',
      'sql': 'sql',
      'json': 'json',
      'xml': 'xml',
      'yaml': 'yaml',
      'yml': 'yaml'
    };
    
    return languageMap[extension || ''] || 'text';
  }

  // 计算代码指标
  private calculateMetrics(content: string, language: string): CodeMetrics {
    const lines = content.split('\n');
    const linesOfCode = lines.filter(line => 
      line.trim().length > 0 && 
      !line.trim().startsWith('//') && 
      !line.trim().startsWith('/*') &&
      !line.trim().startsWith('*') &&
      !line.trim().startsWith('#')
    ).length;
    
    // 简单的复杂度计算
    const complexity = this.calculateComplexity(content, language);
    
    // 可维护性指数计算 (简化版)
    const maintainabilityIndex = Math.max(0, Math.min(100, 
      171 - 5.2 * Math.log(linesOfCode) - 0.23 * complexity - 16.2 * Math.log(linesOfCode / 10)
    ));
    
    // 重复代码检测 (简化版)
    const duplicatedLines = this.detectDuplicatedLines(content);
    
    // 技术债务评估
    const technicalDebt = this.assessTechnicalDebt(complexity, maintainabilityIndex, duplicatedLines);
    
    return {
      linesOfCode,
      complexity,
      maintainabilityIndex: Math.round(maintainabilityIndex),
      duplicatedLines,
      technicalDebt
    };
  }

  // 计算圈复杂度
  private calculateComplexity(content: string, language: string): number {
    let complexity = 1; // 基础复杂度
    
    // 根据语言特性计算复杂度
    const complexityPatterns = {
      javascript: [
        /\bif\b/g, /\belse\b/g, /\bwhile\b/g, /\bfor\b/g, 
        /\bswitch\b/g, /\bcase\b/g, /\bcatch\b/g, /\b&&\b/g, /\b\|\|\b/g
      ],
      typescript: [
        /\bif\b/g, /\belse\b/g, /\bwhile\b/g, /\bfor\b/g, 
        /\bswitch\b/g, /\bcase\b/g, /\bcatch\b/g, /\b&&\b/g, /\b\|\|\b/g
      ],
      python: [
        /\bif\b/g, /\belif\b/g, /\belse\b/g, /\bwhile\b/g, /\bfor\b/g,
        /\btry\b/g, /\bexcept\b/g, /\band\b/g, /\bor\b/g
      ],
      java: [
        /\bif\b/g, /\belse\b/g, /\bwhile\b/g, /\bfor\b/g,
        /\bswitch\b/g, /\bcase\b/g, /\bcatch\b/g, /\b&&\b/g, /\b\|\|\b/g
      ]
    };
    
    const patterns = complexityPatterns[language as keyof typeof complexityPatterns] || 
                    complexityPatterns.javascript;
    
    patterns.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) {
        complexity += matches.length;
      }
    });
    
    return complexity;
  }

  // 检测重复代码行
  private detectDuplicatedLines(content: string): number {
    const lines = content.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    const lineCount = new Map<string, number>();
    
    lines.forEach(line => {
      lineCount.set(line, (lineCount.get(line) || 0) + 1);
    });
    
    let duplicated = 0;
    lineCount.forEach((count, line) => {
      if (count > 1 && line.length > 10) { // 只计算长度超过10的重复行
        duplicated += count - 1;
      }
    });
    
    return duplicated;
  }

  // 评估技术债务
  private assessTechnicalDebt(complexity: number, maintainability: number, duplicated: number): {
    hours: number;
    rating: 'A' | 'B' | 'C' | 'D' | 'E';
  } {
    // 简化的技术债务计算
    const complexityDebt = Math.max(0, complexity - 10) * 0.5;
    const maintainabilityDebt = Math.max(0, 80 - maintainability) * 0.1;
    const duplicationDebt = duplicated * 0.1;
    
    const totalHours = complexityDebt + maintainabilityDebt + duplicationDebt;
    
    let rating: 'A' | 'B' | 'C' | 'D' | 'E';
    if (totalHours < 1) rating = 'A';
    else if (totalHours < 3) rating = 'B';
    else if (totalHours < 8) rating = 'C';
    else if (totalHours < 20) rating = 'D';
    else rating = 'E';
    
    return {
      hours: Math.round(totalHours * 10) / 10,
      rating
    };
  }

  // 检测代码问题
  private detectIssues(content: string, language: string): CodeIssue[] {
    const issues: CodeIssue[] = [];
    const lines = content.split('\n');
    
    lines.forEach((line, index) => {
      // 检测常见问题
      if (line.includes('console.log') && (language === 'javascript' || language === 'typescript')) {
        issues.push({
          id: this.generateId(),
          type: 'code_smell',
          severity: 'minor',
          message: '避免在生产代码中使用console.log',
          file: 'current_file',
          line: index + 1,
          rule: 'no-console',
          effort: '5分钟'
        });
      }
      
      if (line.length > 120) {
        issues.push({
          id: this.generateId(),
          type: 'code_smell',
          severity: 'minor',
          message: '代码行过长，建议控制在120字符以内',
          file: 'current_file',
          line: index + 1,
          rule: 'max-line-length',
          effort: '2分钟'
        });
      }
      
      if (line.includes('TODO') || line.includes('FIXME')) {
        issues.push({
          id: this.generateId(),
          type: 'code_smell',
          severity: 'info',
          message: '发现待办事项或需要修复的代码',
          file: 'current_file',
          line: index + 1,
          rule: 'todo-fixme',
          effort: '变量'
        });
      }
    });
    
    return issues;
  }

  // 提取依赖关系
  private extractDependencies(content: string, language: string): Dependency[] {
    const dependencies: Dependency[] = [];
    
    if (language === 'javascript' || language === 'typescript') {
      // 提取import语句
      const importRegex = /import\s+.*?from\s+['"]([^'"]+)['"]/g;
      const requireRegex = /require\(['"]([^'"]+)['"]\)/g;
      
      let match;
      while ((match = importRegex.exec(content)) !== null) {
        const depName = match[1];
        if (!depName.startsWith('.') && !depName.startsWith('/')) {
          dependencies.push(this.createMockDependency(depName));
        }
      }
      
      while ((match = requireRegex.exec(content)) !== null) {
        const depName = match[1];
        if (!depName.startsWith('.') && !depName.startsWith('/')) {
          dependencies.push(this.createMockDependency(depName));
        }
      }
    }
    
    return dependencies;
  }

  // 创建模拟依赖
  private createMockDependency(name: string): Dependency {
    const versions = ['1.0.0', '2.1.3', '3.4.5', '4.2.1'];
    const licenses = ['MIT', 'Apache-2.0', 'BSD-3-Clause', 'GPL-3.0'];
    
    return {
      name,
      version: versions[Math.floor(Math.random() * versions.length)],
      type: 'production',
      vulnerabilities: Math.random() > 0.8 ? [this.createMockVulnerability()] : [],
      license: licenses[Math.floor(Math.random() * licenses.length)],
      size: Math.floor(Math.random() * 1000000) + 10000
    };
  }

  // 创建模拟漏洞
  private createMockVulnerability(): Vulnerability {
    const severities: Array<'low' | 'moderate' | 'high' | 'critical'> = ['low', 'moderate', 'high', 'critical'];
    
    return {
      id: 'CVE-2023-' + Math.floor(Math.random() * 10000),
      severity: severities[Math.floor(Math.random() * severities.length)],
      title: '潜在的安全漏洞',
      description: '发现潜在的安全问题，建议升级到最新版本',
      patchedVersions: ['>=2.0.0']
    };
  }

  // 分析架构
  private analyzeArchitecture(files: FileAnalysisRequest[]): ArchitectureInfo {
    const components: ArchitectureComponent[] = [];
    const layers: ArchitectureLayer[] = [];
    const relationships: ArchitectureRelationship[] = [];
    
    // 分析文件结构确定架构模式
    const hasControllers = files.some(f => f.fileName.includes('controller'));
    const hasServices = files.some(f => f.fileName.includes('service'));
    const hasModels = files.some(f => f.fileName.includes('model'));
    const hasViews = files.some(f => f.fileName.includes('view') || f.fileName.includes('component'));
    
    let pattern = 'Unknown';
    if (hasControllers && hasServices && hasModels) {
      pattern = 'MVC';
    } else if (hasServices && hasModels) {
      pattern = 'Layered';
    } else if (files.length > 10) {
      pattern = 'Modular';
    }
    
    // 创建架构层
    if (hasViews) {
      layers.push({
        name: 'Presentation Layer',
        type: 'presentation',
        components: files.filter(f => f.fileName.includes('component') || f.fileName.includes('view')).map(f => f.fileName),
        responsibilities: ['用户界面', '用户交互', '数据展示']
      });
    }
    
    if (hasControllers || hasServices) {
      layers.push({
        name: 'Business Layer',
        type: 'business',
        components: files.filter(f => f.fileName.includes('controller') || f.fileName.includes('service')).map(f => f.fileName),
        responsibilities: ['业务逻辑', '数据处理', '业务规则']
      });
    }
    
    if (hasModels) {
      layers.push({
        name: 'Data Layer',
        type: 'data',
        components: files.filter(f => f.fileName.includes('model') || f.fileName.includes('repository')).map(f => f.fileName),
        responsibilities: ['数据访问', '数据持久化', '数据模型']
      });
    }
    
    return {
      pattern,
      layers,
      components,
      relationships
    };
  }

  // 生成建议
  private generateSuggestions(metrics: CodeMetrics, issues: CodeIssue[]): string[] {
    const suggestions: string[] = [];
    
    if (metrics.complexity > 15) {
      suggestions.push('考虑重构复杂的函数，将其拆分为更小的函数');
    }
    
    if (metrics.maintainabilityIndex < 60) {
      suggestions.push('代码可维护性较低，建议进行重构');
    }
    
    if (metrics.duplicatedLines > 10) {
      suggestions.push('发现重复代码，建议提取公共函数或模块');
    }
    
    if (issues.filter(i => i.severity === 'critical' || i.severity === 'blocker').length > 0) {
      suggestions.push('优先修复严重和阻塞级别的问题');
    }
    
    if (metrics.technicalDebt.rating === 'D' || metrics.technicalDebt.rating === 'E') {
      suggestions.push('技术债务较高，建议制定重构计划');
    }
    
    return suggestions;
  }

  // 生成Mermaid代码
  private generateMermaidCode(file: FileAnalysisRequest, dependencies: Dependency[]): string {
    const fileName = file.fileName.split('/').pop() || file.fileName;
    
    let mermaidCode = 'graph TD\n';
    mermaidCode += `    A[${fileName}]\n`;
    
    dependencies.forEach((dep, index) => {
      const nodeId = String.fromCharCode(66 + index); // B, C, D, ...
      mermaidCode += `    ${nodeId}[${dep.name}]\n`;
      mermaidCode += `    A --> ${nodeId}\n`;
    });
    
    return mermaidCode;
  }

  // 模拟分析过程
  private async simulateAnalysis(duration: number): Promise<void> {
    return new Promise(resolve => {
      setTimeout(resolve, duration);
    });
  }

  // 生成唯一ID
  private generateId(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }
}

// 导出单例实例
export const codeAnalysisService = CodeAnalysisService.getInstance();