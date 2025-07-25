import { GenerationStep, GeneratedDocument } from '../pages/DocumentGenerate';
import { storageService } from './StorageService';
import type { UseCaseModel, DomainModel } from '../types/document';

// AI服务配置
interface AIServiceConfig {
  apiKey?: string;
  baseUrl?: string;
  timeout?: number;
}

// AI分析结果接口
interface AIAnalysisResult {
  confidence: number;
  complexity: 'low' | 'medium' | 'high';
  completeness: number;
  suggestions: string[];
  insights: string[];
  warnings: string[];
}

// 文档生成请求接口
interface DocumentGenerationRequest {
  projectId: string;
  imageUrl?: string;
  requirements?: string;
  documentTypes: string[];
}

// 文档生成响应接口
interface DocumentGenerationResponse {
  success: boolean;
  documents: GeneratedDocument[];
  analysisResults: {
    totalDocuments: number;
    averageConfidence: number;
    processingTime: string;
    recommendations: string[];
  };
  error?: string;
}

// 步骤更新回调类型
type StepUpdateCallback = (stepIndex: number, updates: Partial<GenerationStep>) => void;
type DocumentUpdateCallback = (docIndex: number, updates: Partial<GeneratedDocument>) => void;
type ProgressUpdateCallback = (progress: number) => void;

class AIService {
  private config: AIServiceConfig;
  private isGenerating: boolean = false;

  constructor(config: AIServiceConfig = {}) {
    this.config = {
      baseUrl: config.baseUrl || 'https://api.openai.com/v1',
      timeout: config.timeout || 30000,
      ...config
    };
  }

  /**
   * 生成项目文档
   */
  async generateDocuments(
    request: DocumentGenerationRequest,
    onStepUpdate: StepUpdateCallback,
    onDocumentUpdate: DocumentUpdateCallback,
    onProgressUpdate: ProgressUpdateCallback
  ): Promise<DocumentGenerationResponse> {
    if (this.isGenerating) {
      throw new Error('AI服务正在处理其他请求，请稍后重试');
    }

    this.isGenerating = true;
    const startTime = Date.now();

    try {
      // 定义生成步骤
      const steps = [
        { id: 'image-analysis', title: '图片分析', weight: 0.2 },
        { id: 'requirement-parsing', title: '需求解析', weight: 0.2 },
        { id: 'feature-extraction', title: '功能提取', weight: 0.2 },
        { id: 'document-generation', title: '文档生成', weight: 0.3 },
        { id: 'quality-check', title: '质量检查', weight: 0.1 }
      ];

      let overallProgress = 0;
      const documents: GeneratedDocument[] = [];

      // 执行每个步骤
      for (let i = 0; i < steps.length; i++) {
        const step = steps[i];
        const stepStartTime = Date.now();

        // 更新步骤状态为处理中
        onStepUpdate(i, { status: 'processing', progress: 0 });

        try {
          // 执行具体的AI分析步骤
          const stepResult = await this.executeStep(step.id, request, (progress) => {
            onStepUpdate(i, { progress });
            const stepProgress = overallProgress + (step.weight * progress);
            onProgressUpdate(stepProgress);
          });

          const stepDuration = Date.now() - stepStartTime;

          // 更新步骤状态为完成
          onStepUpdate(i, {
            status: 'completed',
            progress: 100,
            duration: stepDuration,
            aiInsights: stepResult.insights,
            warnings: stepResult.warnings
          });

          // 如果是文档生成步骤，更新文档
          if (step.id === 'document-generation' && stepResult.documents) {
            stepResult.documents.forEach((doc, docIndex) => {
              documents.push(doc);
              onDocumentUpdate(docIndex, doc);
            });
          }

          overallProgress += step.weight * 100;
          onProgressUpdate(overallProgress);

        } catch (stepError) {
          // 步骤执行失败
          onStepUpdate(i, {
            status: 'error',
            progress: 100,
            warnings: [`步骤执行失败: ${stepError instanceof Error ? stepError.message : '未知错误'}`]
          });
          throw stepError;
        }
      }

      const totalTime = Date.now() - startTime;
      const processingTime = this.formatDuration(totalTime);

      // 计算平均置信度
      const averageConfidence = documents.length > 0 
        ? Math.round(documents.reduce((sum, doc) => sum + (doc.confidence || 0), 0) / documents.length)
        : 0;

      return {
        success: true,
        documents,
        analysisResults: {
          totalDocuments: documents.length,
          averageConfidence,
          processingTime,
          recommendations: this.generateRecommendations(documents)
        }
      };

    } catch (error) {
      return {
        success: false,
        documents: [],
        analysisResults: {
          totalDocuments: 0,
          averageConfidence: 0,
          processingTime: '0秒',
          recommendations: []
        },
        error: error instanceof Error ? error.message : '未知错误'
      };
    } finally {
      this.isGenerating = false;
    }
  }

  /**
   * 执行具体的AI分析步骤
   */
  private async executeStep(
    stepId: string,
    request: DocumentGenerationRequest,
    onProgress: (progress: number) => void
  ): Promise<AIAnalysisResult & { documents?: GeneratedDocument[] }> {
    // 模拟AI处理时间
    const processingTime = Math.random() * 2000 + 1000; // 1-3秒
    const steps = 4;
    const stepTime = processingTime / steps;

    for (let i = 0; i <= steps; i++) {
      await new Promise(resolve => setTimeout(resolve, stepTime));
      onProgress((i / steps) * 100);
    }

    switch (stepId) {
      case 'image-analysis':
        return this.analyzeImage(request.imageUrl);
      
      case 'requirement-parsing':
        return this.parseRequirements(request.requirements);
      
      case 'feature-extraction':
        return this.extractFeatures(request);
      
      case 'document-generation':
        return this.generateDocumentContent(request);
      
      case 'quality-check':
        return this.performQualityCheck(request);
      
      default:
        throw new Error(`未知的步骤: ${stepId}`);
    }
  }

  /**
   * 图片分析
   */
  private async analyzeImage(imageUrl?: string): Promise<AIAnalysisResult> {
    // 模拟图片分析
    const hasImage = !!imageUrl;
    
    return {
      confidence: hasImage ? Math.floor(Math.random() * 20) + 80 : 60,
      complexity: hasImage ? 'medium' : 'low',
      completeness: hasImage ? 85 : 60,
      suggestions: hasImage 
        ? ['建议提供更高分辨率的图片', '考虑添加多角度视图']
        : ['建议上传项目截图以提高分析精度'],
      insights: hasImage
        ? ['检测到响应式布局设计', '识别出现代化UI组件', '发现数据可视化元素']
        : ['基于项目描述进行分析'],
      warnings: hasImage && Math.random() < 0.3 
        ? ['图片分辨率较低，可能影响组件识别精度']
        : []
    };
  }

  /**
   * 需求解析
   */
  private async parseRequirements(requirements?: string): Promise<AIAnalysisResult> {
    const hasRequirements = !!requirements && requirements.trim().length > 0;
    
    return {
      confidence: hasRequirements ? Math.floor(Math.random() * 15) + 85 : 70,
      complexity: hasRequirements ? 'high' : 'medium',
      completeness: hasRequirements ? 90 : 70,
      suggestions: hasRequirements
        ? ['建议细化非功能性需求', '考虑添加用户故事']
        : ['建议提供详细的项目需求描述'],
      insights: hasRequirements
        ? ['识别出核心业务流程', '检测到数据管理需求', '发现用户权限管理需求']
        : ['基于项目类型推断基础需求'],
      warnings: !hasRequirements
        ? ['缺少详细需求描述，可能影响文档质量']
        : []
    };
  }

  /**
   * 功能提取
   */
  private async extractFeatures(request: DocumentGenerationRequest): Promise<AIAnalysisResult> {
    return {
      confidence: Math.floor(Math.random() * 10) + 88,
      complexity: 'high',
      completeness: 92,
      suggestions: [
        '建议添加API接口设计',
        '考虑增加错误处理机制',
        '推荐添加性能监控功能'
      ],
      insights: [
        '识别出微服务架构模式',
        '检测到RESTful API设计',
        '发现前后端分离架构',
        '识别出数据库设计需求'
      ],
      warnings: Math.random() < 0.4
        ? ['部分功能描述不够详细，建议补充']
        : []
    };
  }

  /**
   * 生成文档内容
   */
  private async generateDocumentContent(request: DocumentGenerationRequest): Promise<AIAnalysisResult & { documents: GeneratedDocument[] }> {
    const documentTypes = request.documentTypes || ['markdown', 'plantuml', 'openapi', 'sql'];
    const documents: GeneratedDocument[] = [];

    // 为每种文档类型生成内容
    documentTypes.forEach((type, index) => {
      const confidence = Math.floor(Math.random() * 15) + 85;
      const complexity = ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as 'low' | 'medium' | 'high';
      
      documents.push({
        id: `doc_${Date.now()}_${index}`,
        title: this.getDocumentTitle(type),
        type,
        status: 'completed',
        content: this.generateEnhancedContent(type),
        confidence,
        aiAnalysis: {
          complexity,
          completeness: confidence,
          suggestions: this.getDocumentSuggestions(type)
        }
      });
    });

    return {
      confidence: 94,
      complexity: 'high',
      completeness: 95,
      suggestions: [
        '建议添加更多代码示例',
        '考虑增加部署指南',
        '推荐添加故障排除文档'
      ],
      insights: [
        '成功生成完整的技术文档集',
        '文档结构清晰，覆盖面广',
        '代码质量符合行业标准'
      ],
      warnings: [],
      documents
    };
  }

  /**
   * 质量检查
   */
  private async performQualityCheck(request: DocumentGenerationRequest): Promise<AIAnalysisResult> {
    const hasIssues = Math.random() < 0.3;
    
    return {
      confidence: hasIssues ? 82 : 96,
      complexity: 'medium',
      completeness: hasIssues ? 85 : 98,
      suggestions: hasIssues
        ? ['建议增加错误处理机制', '考虑添加性能优化方案', '推荐完善单元测试']
        : ['文档质量良好，建议定期更新', '考虑添加版本控制'],
      insights: [
        '文档结构完整性检查通过',
        '代码示例语法正确',
        'API文档格式规范',
        '数据库设计合理'
      ],
      warnings: hasIssues
        ? ['检测到部分文档可能需要人工审核', '建议验证API接口的实际可用性']
        : []
    };
  }

  /**
   * 获取文档标题
   */
  private getDocumentTitle(type: string): string {
    const titles: Record<string, string> = {
      markdown: '项目需求文档',
      plantuml: '系统架构图',
      openapi: 'API接口文档',
      sql: '数据库设计脚本'
    };
    return titles[type] || `${type.toUpperCase()}文档`;
  }

  /**
   * 生成文档建议
   */
  private getDocumentSuggestions(type: string): string[] {
    const suggestions: Record<string, string[]> = {
      markdown: ['建议添加更详细的用例描述', '考虑增加非功能性需求', '推荐添加验收标准'],
      plantuml: ['建议优化类之间的关系', '考虑添加接口抽象', '推荐使用设计模式'],
      openapi: ['建议添加更多错误状态码', '考虑增加请求限流配置', '推荐添加API版本控制'],
      sql: ['建议优化索引策略', '考虑添加数据约束', '推荐实现软删除机制']
    };
    return suggestions[type] || ['建议进行代码审查', '考虑添加单元测试'];
  }

  /**
   * 生成增强的文档内容
   */
  private generateEnhancedContent(type: string): string {
    // 这里可以调用真实的AI API来生成内容
    // 目前使用模拟内容
    const templates: Record<string, string> = {
      markdown: this.generateMarkdownTemplate(),
      plantuml: this.generatePlantUMLTemplate(),
      openapi: this.generateOpenAPITemplate(),
      sql: this.generateSQLTemplate()
    };
    return templates[type] || `# ${type.toUpperCase()}文档\n\n生成的内容...`;
  }

  /**
   * 生成Markdown模板
   */
  private generateMarkdownTemplate(): string {
    return `# 项目需求文档

## 📖 项目概述

本文档基于AI智能分析生成，包含完整的功能需求和技术规范。

## 🎯 核心功能

### 1. 用户管理模块
- **用户注册/登录**: 支持邮箱、手机号注册
- **权限管理**: 基于角色的访问控制(RBAC)
- **个人资料**: 用户信息管理和偏好设置

### 2. 内容管理模块
- **内容创建**: 富文本编辑器，支持多媒体
- **内容审核**: 自动化内容检测和人工审核
- **内容发布**: 定时发布和版本管理

### 3. 数据分析模块
- **实时统计**: 用户行为和内容数据分析
- **报表生成**: 自定义报表和数据导出
- **趋势预测**: 基于机器学习的数据预测

## ⚡ 技术要求

### 性能指标
- 页面加载时间 < 2秒
- API响应时间 < 500ms
- 支持10,000并发用户

### 安全要求
- HTTPS加密传输
- JWT令牌认证
- SQL注入防护
- XSS攻击防护

## 🔧 部署要求

- **前端**: React + TypeScript + Vite
- **后端**: Node.js + Express + TypeScript
- **数据库**: PostgreSQL + Redis
- **容器化**: Docker + Kubernetes
- **CI/CD**: GitHub Actions

---
*文档生成时间: ${new Date().toISOString()}*
*AI置信度: 94%*`;
  }

  /**
   * 生成PlantUML模板
   */
  private generatePlantUMLTemplate(): string {
    return `@startuml
!theme aws-orange
title 系统架构图 - AI生成

!define ENTITY class
!define SERVICE class
!define CONTROLLER class

package "前端层" {
  [React应用] as Frontend
  [状态管理] as StateManager
  [路由管理] as Router
}

package "API网关" {
  [负载均衡器] as LoadBalancer
  [API网关] as APIGateway
  [认证服务] as AuthService
}

package "业务服务层" {
  [用户服务] as UserService
  [内容服务] as ContentService
  [分析服务] as AnalyticsService
}

package "数据层" {
  database "PostgreSQL" as MainDB
  database "Redis" as CacheDB
  database "MongoDB" as LogDB
}

package "外部服务" {
  [文件存储] as FileStorage
  [邮件服务] as EmailService
  [推送服务] as PushService
}

' 连接关系
Frontend --> LoadBalancer : HTTPS
LoadBalancer --> APIGateway
APIGateway --> AuthService
APIGateway --> UserService
APIGateway --> ContentService
APIGateway --> AnalyticsService

UserService --> MainDB
ContentService --> MainDB
AnalyticsService --> LogDB

UserService --> CacheDB
ContentService --> CacheDB

ContentService --> FileStorage
UserService --> EmailService
AnalyticsService --> PushService

note right of APIGateway
  - 请求路由
  - 限流控制
  - 日志记录
  - 错误处理
end note

note right of MainDB
  - 主数据存储
  - 事务支持
  - 备份恢复
end note

@enduml`;
  }

  /**
   * 生成OpenAPI模板
   */
  private generateOpenAPITemplate(): string {
    return `openapi: 3.0.0
info:
  title: AI设计工具 API
  description: 基于AI智能分析生成的RESTful API文档
  version: 1.0.0
  contact:
    name: 开发团队
    email: dev@example.com
  license:
    name: MIT
    url: https://opensource.org/licenses/MIT

servers:
  - url: https://api.example.com/v1
    description: 生产环境
  - url: https://staging-api.example.com/v1
    description: 测试环境
  - url: http://localhost:3000/v1
    description: 开发环境

security:
  - bearerAuth: []

paths:
  /auth/login:
    post:
      tags:
        - 认证
      summary: 用户登录
      description: 用户通过邮箱和密码登录系统
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - email
                - password
              properties:
                email:
                  type: string
                  format: email
                  example: user@example.com
                password:
                  type: string
                  minLength: 8
                  example: password123
      responses:
        '200':
          description: 登录成功
          content:
            application/json:
              schema:
                type: object
                properties:
                  success:
                    type: boolean
                    example: true
                  data:
                    type: object
                    properties:
                      token:
                        type: string
                        example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
                      user:
                        $ref: '#/components/schemas/User'
        '401':
          description: 认证失败
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'

  /users:
    get:
      tags:
        - 用户管理
      summary: 获取用户列表
      description: 分页获取系统用户信息
      parameters:
        - name: page
          in: query
          description: 页码
          schema:
            type: integer
            minimum: 1
            default: 1
        - name: limit
          in: query
          description: 每页数量
          schema:
            type: integer
            minimum: 1
            maximum: 100
            default: 20
        - name: search
          in: query
          description: 搜索关键词
          schema:
            type: string
      responses:
        '200':
          description: 成功返回用户列表
          content:
            application/json:
              schema:
                type: object
                properties:
                  success:
                    type: boolean
                    example: true
                  data:
                    type: array
                    items:
                      $ref: '#/components/schemas/User'
                  pagination:
                    $ref: '#/components/schemas/Pagination'

components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT

  schemas:
    User:
      type: object
      properties:
        id:
          type: string
          example: "123e4567-e89b-12d3-a456-426614174000"
        email:
          type: string
          format: email
          example: user@example.com
        username:
          type: string
          example: johndoe
        createdAt:
          type: string
          format: date-time
          example: "2024-01-01T00:00:00Z"
        updatedAt:
          type: string
          format: date-time
          example: "2024-01-01T00:00:00Z"

    Error:
      type: object
      properties:
        success:
          type: boolean
          example: false
        error:
          type: object
          properties:
            code:
              type: string
              example: "INVALID_CREDENTIALS"
            message:
              type: string
              example: "邮箱或密码错误"

    Pagination:
      type: object
      properties:
        page:
          type: integer
          example: 1
        limit:
          type: integer
          example: 20
        total:
          type: integer
          example: 100
        totalPages:
          type: integer
          example: 5`;
  }

  /**
   * 生成SQL模板
   */
  private generateSQLTemplate(): string {
    return `-- 数据库设计脚本
-- AI智能生成的数据库初始化脚本
-- 生成时间: ${new Date().toISOString()}
-- 置信度: 96%

-- 创建数据库
CREATE DATABASE IF NOT EXISTS ai_design_tool
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE ai_design_tool;

-- 用户表
CREATE TABLE users (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()) COMMENT '用户ID',
  email VARCHAR(255) NOT NULL UNIQUE COMMENT '邮箱',
  username VARCHAR(50) NOT NULL UNIQUE COMMENT '用户名',
  password_hash VARCHAR(255) NOT NULL COMMENT '密码哈希',
  avatar_url VARCHAR(500) COMMENT '头像URL',
  status ENUM('active', 'inactive', 'banned') DEFAULT 'active' COMMENT '用户状态',
  email_verified BOOLEAN DEFAULT FALSE COMMENT '邮箱是否验证',
  last_login_at TIMESTAMP NULL COMMENT '最后登录时间',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  
  INDEX idx_email (email),
  INDEX idx_username (username),
  INDEX idx_status (status),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB COMMENT='用户信息表';

-- 项目表
CREATE TABLE projects (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()) COMMENT '项目ID',
  name VARCHAR(200) NOT NULL COMMENT '项目名称',
  description TEXT COMMENT '项目描述',
  owner_id VARCHAR(36) NOT NULL COMMENT '项目所有者ID',
  status ENUM('draft', 'active', 'archived', 'deleted') DEFAULT 'draft' COMMENT '项目状态',
  visibility ENUM('private', 'public', 'team') DEFAULT 'private' COMMENT '可见性',
  settings JSON COMMENT '项目设置',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  
  FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_owner_id (owner_id),
  INDEX idx_status (status),
  INDEX idx_visibility (visibility),
  INDEX idx_created_at (created_at),
  FULLTEXT INDEX ft_name_description (name, description)
) ENGINE=InnoDB COMMENT='项目信息表';

-- 文档表
CREATE TABLE documents (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()) COMMENT '文档ID',
  project_id VARCHAR(36) NOT NULL COMMENT '项目ID',
  title VARCHAR(200) NOT NULL COMMENT '文档标题',
  type ENUM('markdown', 'plantuml', 'openapi', 'sql', 'other') NOT NULL COMMENT '文档类型',
  content LONGTEXT COMMENT '文档内容',
  status ENUM('generating', 'completed', 'error') DEFAULT 'generating' COMMENT '生成状态',
  confidence TINYINT UNSIGNED COMMENT 'AI置信度(0-100)',
  ai_analysis JSON COMMENT 'AI分析结果',
  version INT DEFAULT 1 COMMENT '版本号',
  created_by VARCHAR(36) NOT NULL COMMENT '创建者ID',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_project_id (project_id),
  INDEX idx_type (type),
  INDEX idx_status (status),
  INDEX idx_created_by (created_by),
  INDEX idx_created_at (created_at),
  FULLTEXT INDEX ft_title_content (title, content)
) ENGINE=InnoDB COMMENT='文档信息表';

-- 学习路径表
CREATE TABLE learning_paths (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()) COMMENT '学习路径ID',
  title VARCHAR(200) NOT NULL COMMENT '路径标题',
  description TEXT COMMENT '路径描述',
  difficulty ENUM('beginner', 'intermediate', 'advanced') NOT NULL COMMENT '难度级别',
  duration_hours INT UNSIGNED COMMENT '预计学习时长(小时)',
  target_audience VARCHAR(500) COMMENT '目标受众',
  prerequisites TEXT COMMENT '前置要求',
  learning_outcomes TEXT COMMENT '学习成果',
  tags JSON COMMENT '标签',
  nodes JSON COMMENT '学习节点',
  status ENUM('draft', 'published', 'archived') DEFAULT 'draft' COMMENT '状态',
  created_by VARCHAR(36) NOT NULL COMMENT '创建者ID',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_difficulty (difficulty),
  INDEX idx_status (status),
  INDEX idx_created_by (created_by),
  INDEX idx_created_at (created_at),
  FULLTEXT INDEX ft_title_description (title, description)
) ENGINE=InnoDB COMMENT='学习路径表';

-- 用户学习进度表
CREATE TABLE user_learning_progress (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()) COMMENT '进度ID',
  user_id VARCHAR(36) NOT NULL COMMENT '用户ID',
  learning_path_id VARCHAR(36) NOT NULL COMMENT '学习路径ID',
  current_node_index INT DEFAULT 0 COMMENT '当前节点索引',
  progress_percentage DECIMAL(5,2) DEFAULT 0.00 COMMENT '完成百分比',
  status ENUM('not_started', 'in_progress', 'completed', 'paused') DEFAULT 'not_started' COMMENT '学习状态',
  started_at TIMESTAMP NULL COMMENT '开始时间',
  completed_at TIMESTAMP NULL COMMENT '完成时间',
  last_accessed_at TIMESTAMP NULL COMMENT '最后访问时间',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (learning_path_id) REFERENCES learning_paths(id) ON DELETE CASCADE,
  UNIQUE KEY uk_user_path (user_id, learning_path_id),
  INDEX idx_user_id (user_id),
  INDEX idx_learning_path_id (learning_path_id),
  INDEX idx_status (status),
  INDEX idx_last_accessed_at (last_accessed_at)
) ENGINE=InnoDB COMMENT='用户学习进度表';

-- 插入初始数据
INSERT INTO users (email, username, password_hash, status, email_verified) VALUES
('admin@example.com', 'admin', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'active', TRUE),
('user1@example.com', 'user1', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'active', TRUE),
('user2@example.com', 'user2', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'active', FALSE);

-- AI优化建议:
-- 1. 考虑添加数据分区以提高查询性能
-- 2. 建议定期清理过期数据和日志
-- 3. 可以添加审计日志表记录重要操作
-- 4. 建议实现读写分离以提高并发性能
-- 5. 考虑使用缓存层减少数据库压力`;
  }

  /**
   * 生成推荐建议
   */
  private generateRecommendations(documents: GeneratedDocument[]): string[] {
    const recommendations = [
      '建议定期更新文档以保持与代码同步',
      '考虑添加更多代码示例和使用场景',
      '推荐建立文档审核流程确保质量'
    ];

    // 根据文档类型添加特定建议
    const hasAPI = documents.some(doc => doc.type === 'openapi');
    const hasDB = documents.some(doc => doc.type === 'sql');
    const hasArchitecture = documents.some(doc => doc.type === 'plantuml');

    if (hasAPI) {
      recommendations.push('建议为API接口添加自动化测试');
    }
    if (hasDB) {
      recommendations.push('建议实施数据库迁移策略');
    }
    if (hasArchitecture) {
      recommendations.push('建议定期审查系统架构设计');
    }

    return recommendations;
  }

  /**
   * 格式化持续时间
   */
  private formatDuration(milliseconds: number): string {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    if (minutes > 0) {
      return `${minutes}分${remainingSeconds}秒`;
    }
    return `${remainingSeconds}秒`;
  }

  /**
   * 生成用例图
   */
  async generateUseCase(requirements: string): Promise<UseCaseModel> {
    if (this.isGenerating) {
      throw new Error('AI服务正在处理其他请求，请稍后重试');
    }

    this.isGenerating = true;
    
    try {
      // 模拟AI分析需求
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const useCaseModel: UseCaseModel = {
        id: `usecase_${Date.now()}`,
        type: 'usecase',
        title: '基于需求生成的用例图',
        content: {
          actors: this.extractActors(requirements),
          useCases: this.extractUseCases(requirements),
          relationships: [],
          mermaidCode: ''
        },
        metadata: {
          version: '1.0.0',
          author: 'AI Assistant',
          tags: ['auto-generated', 'use-case'],
          description: '基于用户需求自动生成的用例图',
          exportFormats: ['json', 'markdown', 'svg', 'png']
        },
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      // 生成关系
      useCaseModel.content.relationships = this.generateUseCaseRelationships(
        useCaseModel.content.actors,
        useCaseModel.content.useCases
      );
      
      // 生成Mermaid代码
      useCaseModel.content.mermaidCode = this.generateUseCaseMermaidCode(useCaseModel.content);
      
      // 保存到存储
      await storageService.saveCoreAsset(useCaseModel);
      
      return useCaseModel;
    } finally {
      this.isGenerating = false;
    }
  }

  /**
   * 生成领域模型
   */
  async generateDomainModel(businessContext: string): Promise<DomainModel> {
    if (this.isGenerating) {
      throw new Error('AI服务正在处理其他请求，请稍后重试');
    }

    this.isGenerating = true;
    
    try {
      // 模拟AI分析业务上下文
      await new Promise(resolve => setTimeout(resolve, 2500));
      
      const domainModel: DomainModel = {
        id: `domain_${Date.now()}`,
        type: 'domain-model',
        title: '基于业务上下文生成的领域模型',
        content: {
          entities: this.extractEntities(businessContext),
          valueObjects: this.extractValueObjects(businessContext),
          aggregates: [],
          relationships: [],
          mermaidCode: ''
        },
        metadata: {
          version: '1.0.0',
          author: 'AI Assistant',
          tags: ['auto-generated', 'domain-model'],
          description: '基于业务上下文自动生成的领域模型',
          exportFormats: ['json', 'markdown', 'svg', 'png']
        },
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      // 生成聚合
      domainModel.content.aggregates = this.generateAggregates(
        domainModel.content.entities,
        domainModel.content.valueObjects
      );
      
      // 生成关系
      domainModel.content.relationships = this.generateDomainRelationships(
        domainModel.content.entities
      );
      
      // 生成Mermaid代码
      domainModel.content.mermaidCode = this.generateDomainMermaidCode(domainModel.content);
      
      // 保存到存储
      await storageService.saveCoreAsset(domainModel);
      
      return domainModel;
    } finally {
      this.isGenerating = false;
    }
  }

  /**
   * 提取参与者
   */
  private extractActors(requirements: string): any[] {
    const actors = [];
    const actorKeywords = ['用户', '管理员', '客户', '员工', '系统', '服务'];
    
    actorKeywords.forEach((keyword, index) => {
      if (requirements.includes(keyword)) {
        actors.push({
          id: `actor_${index + 1}`,
          name: keyword,
          description: `${keyword}角色`,
          type: keyword === '系统' ? 'system' : 'primary'
        });
      }
    });
    
    return actors.length > 0 ? actors : [{
      id: 'actor_1',
      name: '用户',
      description: '系统用户',
      type: 'primary'
    }];
  }

  /**
   * 提取用例
   */
  private extractUseCases(requirements: string): any[] {
    const useCases = [];
    const useCaseKeywords = ['登录', '注册', '查询', '添加', '删除', '修改', '管理', '生成', '分析'];
    
    useCaseKeywords.forEach((keyword, index) => {
      if (requirements.includes(keyword)) {
        useCases.push({
          id: `usecase_${index + 1}`,
          name: keyword,
          description: `${keyword}功能`,
          preconditions: [`用户已${keyword === '登录' ? '注册' : '登录'}`],
          postconditions: [`${keyword}操作完成`],
          mainFlow: [
            `用户选择${keyword}功能`,
            `系统验证权限`,
            `执行${keyword}操作`,
            `返回操作结果`
          ],
          priority: 'high'
        });
      }
    });
    
    return useCases.length > 0 ? useCases : [{
      id: 'usecase_1',
      name: '基本功能',
      description: '系统基本功能',
      preconditions: ['用户已登录'],
      postconditions: ['功能执行完成'],
      mainFlow: [
        '用户访问系统',
        '系统显示功能界面',
        '用户执行操作',
        '系统返回结果'
      ],
      priority: 'medium'
    }];
  }

  /**
   * 生成用例关系
   */
  private generateUseCaseRelationships(actors: any[], useCases: any[]): any[] {
    const relationships = [];
    
    // 为每个用例分配一个参与者
    useCases.forEach((useCase, index) => {
      const actor = actors[index % actors.length];
      relationships.push({
        id: `rel_${index + 1}`,
        type: 'association',
        source: actor.id,
        target: useCase.id,
        label: 'performs'
      });
    });
    
    return relationships;
  }

  /**
   * 生成用例Mermaid代码
   */
  private generateUseCaseMermaidCode(content: any): string {
    let mermaidCode = 'graph TD\n';
    
    content.actors.forEach((actor: any) => {
      mermaidCode += `  ${actor.id}[${actor.name}]\n`;
    });
    
    content.useCases.forEach((useCase: any) => {
      mermaidCode += `  ${useCase.id}((${useCase.name}))\n`;
    });
    
    content.relationships.forEach((rel: any) => {
      mermaidCode += `  ${rel.from} --> ${rel.to}\n`;
    });
    
    return mermaidCode;
  }

  /**
   * 提取实体
   */
  private extractEntities(businessContext: string): any[] {
    const entities = [];
    const entityKeywords = ['用户', '订单', '产品', '客户', '员工', '部门', '项目', '任务'];
    
    entityKeywords.forEach((keyword, index) => {
      if (businessContext.includes(keyword)) {
        entities.push({
          id: `entity_${index + 1}`,
          name: keyword,
          attributes: [
            { name: 'id', type: 'string', required: true },
            { name: 'name', type: 'string', required: true },
            { name: 'createdAt', type: 'Date', required: true },
            { name: 'updatedAt', type: 'Date', required: true }
          ],
          methods: [
            { name: 'create', parameters: [], returnType: 'void' },
            { name: 'update', parameters: [], returnType: 'void' }
          ],
          isAggregateRoot: index === 0
        });
      }
    });
    
    return entities.length > 0 ? entities : [{
      id: 'entity_1',
      name: '基础实体',
      attributes: [
        { name: 'id', type: 'string', required: true },
        { name: 'name', type: 'string', required: true }
      ],
      methods: [],
      isAggregateRoot: true
    }];
  }

  /**
   * 提取值对象
   */
  private extractValueObjects(businessContext: string): any[] {
    const valueObjects = [];
    const voKeywords = ['地址', '金额', '日期', '邮箱', '电话'];
    
    voKeywords.forEach((keyword, index) => {
      if (businessContext.includes(keyword)) {
        valueObjects.push({
          id: `vo_${index + 1}`,
          name: keyword,
          attributes: [
            { name: 'value', type: 'string', required: true }
          ],
          invariants: [`${keyword} must be valid format`]
        });
      }
    });
    
    // 如果没有找到值对象，返回默认的值对象
    if (valueObjects.length === 0) {
      valueObjects.push(
        {
          id: 'vo_1',
          name: 'Money',
          attributes: [
            { name: 'amount', type: 'number', required: true },
            { name: 'currency', type: 'string', required: true }
          ],
          invariants: ['amount must be positive', 'currency must be valid ISO code']
        },
        {
          id: 'vo_2', 
          name: 'Address',
          attributes: [
            { name: 'street', type: 'string', required: true },
            { name: 'city', type: 'string', required: true },
            { name: 'zipCode', type: 'string', required: true }
          ],
          invariants: ['zipCode must be valid format']
        }
      );
    }
    
    return valueObjects;
  }

  /**
   * 生成聚合
   */
  private generateAggregates(entities: any[], valueObjects: any[]): any[] {
    if (entities.length === 0) return [];
    
    const aggregates = [];
    
    // 为每个聚合根实体创建聚合
    entities.filter(e => e.isAggregateRoot).forEach((entity, index) => {
      aggregates.push({
        id: `aggregate_${index + 1}`,
        name: `${entity.name}Aggregate`,
        root: entity.id, // Entity ID
        entities: [entity.id], // Entity IDs
        valueObjects: valueObjects.slice(0, 1).map(vo => vo.id), // ValueObject IDs
        boundaryRules: [`${entity.name} must maintain consistency`, `${entity.name} business rules must be enforced`]
      });
    });
    
    // 如果没有聚合根实体，返回默认聚合
    if (aggregates.length === 0) {
      aggregates.push({
        id: 'aggregate_1',
        name: '主聚合',
        root: entities[0]?.id || 'entity_1',
        entities: [entities[0]?.id || 'entity_1'],
        valueObjects: valueObjects.slice(0, 1).map(vo => vo.id),
        boundaryRules: ['主要业务规则必须得到维护']
      });
    }
    
    return aggregates;
  }

  /**
   * 生成领域关系
   */
  private generateDomainRelationships(entities: any[]): any[] {
    const relationships = [];
    
    for (let i = 0; i < entities.length - 1; i++) {
      relationships.push({
        id: `rel_${i + 1}`,
        type: 'association',
        source: entities[i].id,
        target: entities[i + 1].id,
        cardinality: '1:n',
        label: 'relates to'
      });
    }
    
    // 添加一些典型的领域关系
    if (entities.length >= 2) {
      relationships.push({
        id: `rel_${entities.length}`,
        type: 'aggregation',
        source: entities[0].id,
        target: entities[entities.length - 1].id,
        cardinality: '1:*',
        label: 'contains'
      });
    }
    
    return relationships;
  }

  /**
   * 生成领域Mermaid代码
   */
  private generateDomainMermaidCode(content: any): string {
    let mermaidCode = 'classDiagram\n';
    
    content.entities.forEach((entity: any) => {
      mermaidCode += `  class ${entity.name} {\n`;
      entity.attributes.forEach((attr: string) => {
        mermaidCode += `    ${attr}\n`;
      });
      mermaidCode += '  }\n';
    });
    
    content.relationships.forEach((rel: any) => {
      mermaidCode += `  ${rel.from} --> ${rel.to}\n`;
    });
    
    return mermaidCode;
  }

  /**
   * 检查服务状态
   */
  isServiceAvailable(): boolean {
    return !this.isGenerating;
  }

  /**
   * 取消当前生成任务
   */
  cancelGeneration(): void {
    this.isGenerating = false;
  }

  /**
   * 获取服务状态详情
   */
  getServiceStatus(): {
    isHealthy: boolean;
    lastCheck: Date;
    capabilities: string[];
  } {
    return {
      isHealthy: true,
      lastCheck: new Date(),
      capabilities: [
        'document-generation',
        'image-analysis',
        'requirement-parsing',
        'feature-extraction',
        'quality-check',
        'usecase-generation',
        'domain-modeling'
      ]
    };
  }

  /**
   * 批量分析项目文件
   */
  async analyzeProjectFiles(files: File[]): Promise<{
    summary: string;
    recommendations: string[];
    detectedPatterns: string[];
    suggestedDocuments: string[];
  }> {
    if (this.isGenerating) {
      throw new Error('AI服务正在处理其他请求，请稍后重试');
    }

    this.isGenerating = true;
    
    try {
      // 模拟文件分析
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const fileTypes = files.map(f => f.name.split('.').pop()).filter(Boolean);
      const hasCode = fileTypes.some(type => ['js', 'ts', 'jsx', 'tsx', 'py', 'java', 'cpp'].includes(type!));
      const hasConfig = fileTypes.some(type => ['json', 'yaml', 'yml', 'xml'].includes(type!));
      const hasDocs = fileTypes.some(type => ['md', 'txt', 'doc', 'docx'].includes(type!));
      
      return {
        summary: `分析了 ${files.length} 个文件，检测到 ${fileTypes.length} 种文件类型`,
        recommendations: [
          hasCode ? '建议生成API文档和架构图' : '建议添加代码文件',
          hasConfig ? '配置文件结构良好' : '建议添加配置文档',
          hasDocs ? '文档覆盖率良好' : '建议增加项目文档'
        ],
        detectedPatterns: [
          hasCode ? 'MVC架构模式' : '文档项目',
          hasConfig ? '配置驱动' : '简单结构',
          '模块化设计'
        ],
        suggestedDocuments: [
          'API接口文档',
          '系统架构图',
          '用例图',
          '领域模型',
          '部署指南'
        ]
      };
    } finally {
      this.isGenerating = false;
    }
  }

  /**
   * 智能问答
   */
  async askQuestion(question: string, context?: string): Promise<{
    answer: string;
    confidence: number;
    sources: string[];
    relatedQuestions: string[];
  }> {
    if (this.isGenerating) {
      throw new Error('AI服务正在处理其他请求，请稍后重试');
    }

    this.isGenerating = true;
    
    try {
      // 模拟AI问答
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const isArchitectureQuestion = question.includes('架构') || question.includes('设计');
      const isImplementationQuestion = question.includes('实现') || question.includes('代码');
      const isBusinessQuestion = question.includes('业务') || question.includes('需求');
      
      let answer = '这是一个很好的问题。';
      let confidence = 0.8;
      
      if (isArchitectureQuestion) {
        answer = '基于您的问题，建议采用分层架构设计，包括表现层、业务层和数据层。这样可以确保系统的可维护性和扩展性。';
        confidence = 0.9;
      } else if (isImplementationQuestion) {
        answer = '对于实现方面，建议遵循SOLID原则，使用设计模式来解决常见问题，并确保代码的可测试性。';
        confidence = 0.85;
      } else if (isBusinessQuestion) {
        answer = '业务需求分析是项目成功的关键。建议使用用例图和领域模型来明确业务流程和数据结构。';
        confidence = 0.88;
      }
      
      return {
        answer,
        confidence,
        sources: ['AI知识库', '最佳实践', '设计模式'],
        relatedQuestions: [
          '如何设计可扩展的系统架构？',
          '什么是领域驱动设计？',
          '如何进行需求分析？'
        ]
      };
    } finally {
      this.isGenerating = false;
    }
  }
}

// 导出单例实例
export const aiService = new AIService();
export default AIService;