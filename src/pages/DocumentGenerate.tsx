import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Typography,
  Progress,
  Timeline,
  Tabs,
  Button,
  Space,
  Tag,
  Divider,
  Alert,
  message,
} from 'antd';
import {
  CheckCircleOutlined,
  LoadingOutlined,
  FileTextOutlined,
  DownloadOutlined,
  EyeOutlined,
  EditOutlined,
  ExclamationCircleOutlined,
  ReloadOutlined,
  RobotOutlined,
  BulbOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import { aiService } from '../services/aiService';

const { Title, Paragraph, Text } = Typography;


export interface GenerationStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  progress: number;
  result?: string;
  aiInsights?: string[];
  warnings?: string[];
  duration?: number;
}

export interface GeneratedDocument {
  id: string;
  title: string;
  type: string;
  content: string;
  status: 'generating' | 'completed' | 'error';
  confidence?: number;
  aiAnalysis?: {
    complexity: 'low' | 'medium' | 'high';
    completeness: number;
    suggestions: string[];
  };
  errorMessage?: string;
}

const DocumentGenerate: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [overallProgress, setOverallProgress] = useState(0);
  const [, setCurrentStep] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [hasErrors, setHasErrors] = useState(false);
  const [aiAnalysisResults, setAiAnalysisResults] = useState<any>(null);
  
  const [generationSteps, setGenerationSteps] = useState<GenerationStep[]>([
    {
      id: 'image-analysis',
      title: '图像分析',
      description: '正在分析上传的原型图片，识别UI组件和布局结构',
      status: 'pending',
      progress: 0,
      aiInsights: [],
      warnings: [],
    },
    {
      id: 'requirement-parsing',
      title: '需求解析',
      description: '正在理解和分析项目需求描述',
      status: 'pending',
      progress: 0,
      aiInsights: [],
      warnings: [],
    },
    {
      id: 'feature-extraction',
      title: '功能提取',
      description: '正在提取核心功能模块和业务逻辑',
      status: 'pending',
      progress: 0,
      aiInsights: [],
      warnings: [],
    },
    {
      id: 'document-generation',
      title: '文档生成',
      description: '正在生成各类软件工程文档',
      status: 'pending',
      progress: 0,
      aiInsights: [],
      warnings: [],
    },
    {
      id: 'quality-check',
      title: '质量检查',
      description: '正在检查生成文档的完整性和一致性',
      status: 'pending',
      progress: 0,
      aiInsights: [],
      warnings: [],
    },
  ]);

  const [generatedDocuments, setGeneratedDocuments] = useState<GeneratedDocument[]>([
    {
      id: 'feature-tree',
      title: '功能树',
      type: 'markdown',
      content: '',
      status: 'generating',
      confidence: 0,
    },
    {
      id: 'requirements',
      title: '需求文档',
      type: 'markdown',
      content: '',
      status: 'generating',
      confidence: 0,
    },
    {
      id: 'uml-class',
      title: 'UML类图',
      type: 'plantuml',
      content: '',
      status: 'generating',
      confidence: 0,
    },
    {
      id: 'use-case',
      title: '用例图',
      type: 'plantuml',
      content: '',
      status: 'generating',
      confidence: 0,
    },
    {
      id: 'api-spec',
      title: 'API接口文档',
      type: 'openapi',
      content: '',
      status: 'generating',
      confidence: 0,
    },
    {
      id: 'sql-init',
      title: 'SQL初始化脚本',
      type: 'sql',
      content: '',
      status: 'generating',
      confidence: 0,
    },
  ]);

  // 使用真实AI服务进行文档生成
  useEffect(() => {
    const generateDocuments = async () => {
      try {
        // 检查AI服务是否可用
        if (!aiService.isServiceAvailable()) {
          message.error('AI服务正忙，请稍后重试');
          return;
        }

        // 准备生成请求
        const request = {
          projectId: id || 'default',
          imageUrl: undefined, // 可以从项目设置中获取
          requirements: undefined, // 可以从项目描述中获取
          documentTypes: ['markdown', 'plantuml', 'openapi', 'sql']
        };

        // 调用AI服务生成文档
        const result = await aiService.generateDocuments(
          request,
          // 步骤更新回调
          (stepIndex: number, updates: Partial<GenerationStep>) => {
            setCurrentStep(stepIndex);
            setGenerationSteps(prev => 
              prev.map((step, index) => 
                index === stepIndex ? { ...step, ...updates } : step
              )
            );
          },
          // 文档更新回调
          (docIndex: number, updates: Partial<GeneratedDocument>) => {
            setGeneratedDocuments(prev => 
              prev.map((doc, index) => 
                index === docIndex ? { ...doc, ...updates } : doc
              )
            );
          },
          // 进度更新回调
          (progress: number) => {
            setOverallProgress(progress);
          }
        );

        if (result.success) {
          // 生成成功
          setIsCompleted(true);
          setOverallProgress(100);
          setGeneratedDocuments(result.documents);
          setAiAnalysisResults(result.analysisResults);
          message.success('文档生成完成！');
        } else {
          // 生成失败
          setHasErrors(true);
          message.error(`文档生成失败: ${result.error}`);
        }
      } catch (error) {
        console.error('AI文档生成错误:', error);
        setHasErrors(true);
        message.error('AI服务连接失败，请检查网络连接');
      }
    };

    generateDocuments();
  }, [id]);

  // 生成增强的模拟内容
  const generateEnhancedContent = (type: string, title: string): string => {
    switch (type) {
      case 'markdown':
        if (title.includes('功能树')) {
          return `# ${title}\n\n## 🎯 项目概述\n\n基于AI分析的智能功能分解，置信度: 89%\n\n## 📋 核心功能模块\n\n### 1. 用户管理模块\n- 用户注册/登录\n- 权限管理\n- 个人资料管理\n\n### 2. 内容管理模块\n- 内容创建/编辑\n- 内容审核\n- 内容发布\n\n### 3. 系统管理模块\n- 系统配置\n- 日志管理\n- 数据备份\n\n## 🔍 AI分析洞察\n\n- 检测到响应式设计需求\n- 识别出RESTful API架构\n- 建议使用微服务架构`;
        } else {
          return `# ${title}\n\n## 📖 需求概述\n\n本文档基于AI智能分析生成，包含完整的功能需求和非功能需求。\n\n## 🎯 功能需求\n\n### FR-001 用户认证\n**描述**: 系统应支持用户注册、登录和权限验证\n**优先级**: 高\n**验收标准**: \n- 用户可以通过邮箱注册账户\n- 支持密码强度验证\n- 实现JWT令牌认证\n\n### FR-002 数据管理\n**描述**: 提供完整的CRUD操作接口\n**优先级**: 高\n**验收标准**:\n- 支持数据的增删改查\n- 实现数据验证和错误处理\n- 提供数据导入导出功能\n\n## ⚡ 非功能需求\n\n### NFR-001 性能要求\n- 页面加载时间 < 2秒\n- API响应时间 < 500ms\n- 支持1000并发用户\n\n### NFR-002 安全要求\n- 数据传输加密(HTTPS)\n- 敏感数据存储加密\n- 定期安全审计`;
        }
      case 'plantuml':
        if (title.includes('类图')) {
          return `@startuml\n!theme aws-orange\ntitle ${title} - AI生成 (置信度: 92%)\n\n!define ENTITY class\n!define SERVICE class\n!define CONTROLLER class\n\npackage "用户模块" {\n  ENTITY User {\n    -id: Long\n    -username: String\n    -email: String\n    -password: String\n    -createdAt: Date\n    +login(): Boolean\n    +logout(): void\n    +updateProfile(): void\n  }\n  \n  SERVICE UserService {\n    +createUser(user: User): User\n    +findById(id: Long): User\n    +updateUser(user: User): User\n    +deleteUser(id: Long): void\n  }\n  \n  CONTROLLER UserController {\n    +register(): ResponseEntity\n    +login(): ResponseEntity\n    +getProfile(): ResponseEntity\n  }\n}\n\npackage "内容模块" {\n  ENTITY Content {\n    -id: Long\n    -title: String\n    -body: String\n    -authorId: Long\n    -status: ContentStatus\n    +publish(): void\n    +archive(): void\n  }\n  \n  SERVICE ContentService {\n    +createContent(content: Content): Content\n    +publishContent(id: Long): void\n    +getContentsByAuthor(authorId: Long): List<Content>\n  }\n}\n\nUser ||--o{ Content : creates\nUserService --> User\nContentService --> Content\nUserController --> UserService\n\n@enduml`;
        } else {
          return `@startuml\n!theme plain\ntitle ${title} - AI智能生成\n\nactor "用户" as User\nactor "管理员" as Admin\nactor "系统" as System\n\nrectangle "核心功能" {\n  usecase "用户注册" as UC1\n  usecase "用户登录" as UC2\n  usecase "内容管理" as UC3\n  usecase "权限管理" as UC4\n  usecase "数据分析" as UC5\n}\n\nUser --> UC1\nUser --> UC2\nUser --> UC3\nAdmin --> UC4\nAdmin --> UC5\nSystem --> UC5\n\nUC2 ..> UC1 : <<extend>>\nUC3 ..> UC2 : <<include>>\nUC4 ..> UC2 : <<include>>\n\nnote right of UC1\n  AI分析建议:\n  - 支持第三方登录\n  - 实现邮箱验证\n  - 添加验证码机制\nend note\n\n@enduml`;
        }
      case 'openapi':
        return `openapi: 3.0.0\ninfo:\n  title: ${title} - AI生成API规范\n  description: 基于智能分析生成的RESTful API文档\n  version: 1.0.0\n  contact:\n    name: AI生成\n    email: ai@example.com\nservers:\n  - url: https://api.example.com/v1\n    description: 生产环境\n  - url: https://staging-api.example.com/v1\n    description: 测试环境\npaths:\n  /users:\n    get:\n      summary: 获取用户列表\n      description: 分页获取系统用户信息\n      parameters:\n        - name: page\n          in: query\n          schema:\n            type: integer\n            default: 1\n        - name: limit\n          in: query\n          schema:\n            type: integer\n            default: 20\n      responses:\n        '200':\n          description: 成功返回用户列表\n          content:\n            application/json:\n              schema:\n                type: object\n                properties:\n                  data:\n                    type: array\n                    items:\n                      $ref: '#/components/schemas/User'\n                  pagination:\n                    $ref: '#/components/schemas/Pagination'\n    post:\n      summary: 创建新用户\n      requestBody:\n        required: true\n        content:\n          application/json:\n            schema:\n              $ref: '#/components/schemas/CreateUserRequest'\n      responses:\n        '201':\n          description: 用户创建成功\n        '400':\n          description: 请求参数错误\ncomponents:\n  schemas:\n    User:\n      type: object\n      properties:\n        id:\n          type: integer\n        username:\n          type: string\n        email:\n          type: string\n        createdAt:\n          type: string\n          format: date-time\n    CreateUserRequest:\n      type: object\n      required:\n        - username\n        - email\n        - password\n      properties:\n        username:\n          type: string\n          minLength: 3\n        email:\n          type: string\n          format: email\n        password:\n          type: string\n          minLength: 8\n    Pagination:\n      type: object\n      properties:\n        page:\n          type: integer\n        limit:\n          type: integer\n        total:\n          type: integer`;
      case 'sql':
        return `-- ${title}\n-- AI智能生成的数据库初始化脚本\n-- 生成时间: ${new Date().toISOString()}\n-- 置信度: 94%\n\n-- 创建数据库\nCREATE DATABASE IF NOT EXISTS ai_project_db\nCHARACTER SET utf8mb4\nCOLLATE utf8mb4_unicode_ci;\n\nUSE ai_project_db;\n\n-- 用户表\nCREATE TABLE users (\n  id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '用户ID',\n  username VARCHAR(50) NOT NULL UNIQUE COMMENT '用户名',\n  email VARCHAR(100) NOT NULL UNIQUE COMMENT '邮箱',\n  password_hash VARCHAR(255) NOT NULL COMMENT '密码哈希',\n  status ENUM('active', 'inactive', 'banned') DEFAULT 'active' COMMENT '用户状态',\n  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',\n  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',\n  INDEX idx_username (username),\n  INDEX idx_email (email),\n  INDEX idx_status (status)\n) ENGINE=InnoDB COMMENT='用户信息表';\n\n-- 内容表\nCREATE TABLE contents (\n  id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '内容ID',\n  title VARCHAR(200) NOT NULL COMMENT '标题',\n  body TEXT COMMENT '内容',\n  author_id BIGINT NOT NULL COMMENT '作者ID',\n  status ENUM('draft', 'published', 'archived') DEFAULT 'draft' COMMENT '状态',\n  view_count INT DEFAULT 0 COMMENT '浏览次数',\n  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',\n  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',\n  FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE,\n  INDEX idx_author_id (author_id),\n  INDEX idx_status (status),\n  INDEX idx_created_at (created_at),\n  FULLTEXT INDEX ft_title_body (title, body)\n) ENGINE=InnoDB COMMENT='内容信息表';\n\n-- 权限表\nCREATE TABLE permissions (\n  id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '权限ID',\n  name VARCHAR(50) NOT NULL UNIQUE COMMENT '权限名称',\n  description VARCHAR(200) COMMENT '权限描述',\n  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间'\n) ENGINE=InnoDB COMMENT='权限表';\n\n-- 用户权限关联表\nCREATE TABLE user_permissions (\n  user_id BIGINT NOT NULL COMMENT '用户ID',\n  permission_id BIGINT NOT NULL COMMENT '权限ID',\n  granted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '授权时间',\n  PRIMARY KEY (user_id, permission_id),\n  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,\n  FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE\n) ENGINE=InnoDB COMMENT='用户权限关联表';\n\n-- 插入初始数据\nINSERT INTO users (username, email, password_hash, status) VALUES\n('admin', 'admin@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'active'),\n('user1', 'user1@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'active'),\n('user2', 'user2@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'active');\n\nINSERT INTO permissions (name, description) VALUES\n('user.create', '创建用户'),\n('user.read', '查看用户'),\n('user.update', '更新用户'),\n('user.delete', '删除用户'),\n('content.create', '创建内容'),\n('content.read', '查看内容'),\n('content.update', '更新内容'),\n('content.delete', '删除内容');\n\n-- AI优化建议:\n-- 1. 考虑添加数据分区以提高查询性能\n-- 2. 建议定期清理过期数据\n-- 3. 可以添加审计日志表记录重要操作`;
      default:
        return `生成的${title}内容...`;
    }
  };

  // 生成AI建议
  const generateSuggestions = (type: string): string[] => {
    switch (type) {
      case 'markdown':
        return [
          '建议添加更详细的用例描述',
          '考虑增加非功能性需求',
          '推荐添加验收标准'
        ];
      case 'plantuml':
        return [
          '建议优化类之间的关系',
          '考虑添加接口抽象',
          '推荐使用设计模式'
        ];
      case 'openapi':
        return [
          '建议添加更多错误状态码',
          '考虑增加请求限流配置',
          '推荐添加API版本控制'
        ];
      case 'sql':
        return [
          '建议优化索引策略',
          '考虑添加数据约束',
          '推荐实现软删除机制'
        ];
      default:
        return ['建议进行代码审查', '考虑添加单元测试'];
    }
  };

  // 重新生成文档
  const handleRegenerate = async (docId: string) => {
    try {
      // 更新文档状态为生成中
      setGeneratedDocuments(prev => 
        prev.map(doc => 
          doc.id === docId 
            ? { ...doc, status: 'generating', content: '', confidence: 0, aiAnalysis: undefined }
            : doc
        )
      );

      // 获取文档类型
      const targetDoc = generatedDocuments.find(doc => doc.id === docId);
      if (!targetDoc) {
        message.error('文档不存在');
        return;
      }

      // 准备重新生成请求
      const request = {
        projectId: id || 'default',
        documentTypes: [targetDoc.type]
      };

      // 调用AI服务重新生成单个文档
      const result = await aiService.generateDocuments(
        request,
        () => {}, // 步骤更新回调（单文档生成不需要）
        (docIndex: number, updates: Partial<GeneratedDocument>) => {
          // 更新目标文档
          setGeneratedDocuments(prev => 
            prev.map(doc => 
              doc.id === docId ? { ...doc, ...updates } : doc
            )
          );
        },
        () => {} // 进度更新回调（单文档生成不需要）
      );

      if (result.success && result.documents.length > 0) {
        const newDoc = result.documents[0];
        setGeneratedDocuments(prev => 
          prev.map(doc => 
            doc.id === docId 
              ? {
                  ...doc,
                  status: 'completed',
                  content: newDoc.content,
                  confidence: newDoc.confidence,
                  aiAnalysis: newDoc.aiAnalysis
                }
              : doc
          )
        );
        message.success('文档重新生成完成！');
      } else {
        setGeneratedDocuments(prev => 
          prev.map(doc => 
            doc.id === docId 
              ? { ...doc, status: 'error', errorMessage: result.error || '重新生成失败' }
              : doc
          )
        );
        message.error(`重新生成失败: ${result.error}`);
      }
    } catch (error) {
      console.error('重新生成文档错误:', error);
      setGeneratedDocuments(prev => 
        prev.map(doc => 
          doc.id === docId 
            ? { ...doc, status: 'error', errorMessage: '网络连接失败' }
            : doc
        )
      );
      message.error('重新生成失败，请检查网络连接');
    }
  };

  // 重新开始整个生成流程
  const handleRestartGeneration = () => {
    // 取消当前生成任务
    aiService.cancelGeneration();
    
    // 重置所有状态
    setGenerationSteps(prev => 
      prev.map(step => ({
        ...step,
        status: 'pending',
        progress: 0,
        aiInsights: [],
        warnings: [],
        duration: undefined
      }))
    );
    setGeneratedDocuments(prev => 
      prev.map(doc => ({
        ...doc,
        status: 'generating',
        content: '',
        confidence: 0,
        aiAnalysis: undefined,
        errorMessage: undefined
      }))
    );
    setOverallProgress(0);
    setCurrentStep(0);
    setIsCompleted(false);
    setHasErrors(false);
    setAiAnalysisResults(null);
    
    // 重新开始生成流程
    window.location.reload();
  };

  // 获取复杂度颜色
  const getComplexityColor = (complexity: 'low' | 'medium' | 'high') => {
    switch (complexity) {
      case 'low': return 'green';
      case 'medium': return 'orange';
      case 'high': return 'red';
      default: return 'gray';
    }
  };

  // 获取置信度颜色
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'green';
    if (confidence >= 75) return 'blue';
    if (confidence >= 60) return 'orange';
    return 'red';
  };

  // 生成模拟内容（保持原有函数兼容性）
  const generateMockContent = (type: string, title: string): string => {
    switch (type) {
      case 'markdown':
        return `# ${title}\n\n## 概述\n\n这是AI生成的${title}内容。\n\n## 详细说明\n\n- 功能点1\n- 功能点2\n- 功能点3\n\n## 实现方案\n\n详细的实现方案描述...`;
      case 'plantuml':
        return `@startuml\n!theme plain\ntitle ${title}\n\nclass User {\n  +id: Long\n  +name: String\n  +email: String\n}\n\nclass Project {\n  +id: Long\n  +name: String\n  +description: String\n}\n\nUser ||--o{ Project\n\n@enduml`;
      case 'openapi':
        return `openapi: 3.0.0\ninfo:\n  title: ${title}\n  version: 1.0.0\npaths:\n  /api/users:\n    get:\n      summary: 获取用户列表\n      responses:\n        '200':\n          description: 成功`;
      case 'sql':
        return `-- ${title}\n\nCREATE TABLE users (\n  id BIGINT PRIMARY KEY AUTO_INCREMENT,\n  name VARCHAR(100) NOT NULL,\n  email VARCHAR(255) UNIQUE NOT NULL,\n  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP\n);\n\nINSERT INTO users (name, email) VALUES\n('张三', 'zhangsan@example.com'),\n('李四', 'lisi@example.com');`;
      default:
        return `生成的${title}内容...`;
    }
  };

  const getStepIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircleOutlined className="text-green-500" />;
      case 'processing':
        return <LoadingOutlined className="text-blue-500" />;
      case 'error':
        return <ExclamationCircleOutlined className="text-red-500" />;
      default:
        return <div className="w-4 h-4 rounded-full border-2 border-gray-300" />;
    }
  };

  const getDocumentStatusTag = (status: string) => {
    switch (status) {
      case 'completed':
        return <Tag color="success">已完成</Tag>;
      case 'generating':
        return <Tag color="processing">生成中</Tag>;
      case 'error':
        return <Tag color="error">生成失败</Tag>;
      default:
        return <Tag color="default">等待中</Tag>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <Title level={2} className="mb-2">文档生成中</Title>
        <Paragraph className="text-lg text-gray-600">
          项目ID: {id} - AI正在分析您的项目并生成相关文档
        </Paragraph>
      </div>

      <Row gutter={[24, 24]}>
        {/* 左侧：生成进度 */}
        <Col xs={24} lg={10}>
          <Card title="生成进度" className="h-fit">
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <Text strong>总体进度</Text>
                <Text>{Math.round(overallProgress)}%</Text>
              </div>
              <Progress 
                percent={overallProgress} 
                strokeColor={{
                  '0%': '#2563EB',
                  '100%': '#10B981',
                }}
                className="mb-4"
              />
              {isCompleted && (
                <Alert
                  message="生成完成！"
                  description="所有文档已成功生成，您可以在右侧查看和编辑。"
                  type="success"
                  showIcon
                  className="mb-4"
                />
              )}
            </div>

            <Divider orientation="left">详细步骤</Divider>
            <Timeline>
              {generationSteps.map((step, _index) => (
                <Timeline.Item
                  key={step.id}
                  dot={getStepIcon(step.status)}
                  color={step.status === 'completed' ? 'green' : step.status === 'processing' ? 'blue' : step.status === 'error' ? 'red' : 'gray'}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Text strong className={step.status === 'processing' ? 'text-blue-600' : step.status === 'error' ? 'text-red-600' : ''}>
                        {step.title}
                      </Text>
                      {step.duration && (
                        <span className="text-xs text-gray-500">
                          {(step.duration / 1000).toFixed(1)}s
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      {step.description}
                    </div>
                    {(step.status === 'processing' || step.status === 'completed' || step.status === 'error') && (
                      <Progress 
                        percent={step.progress} 
                        size="small" 
                        className="mt-2 max-w-xs"
                        status={step.status === 'error' ? 'exception' : step.status === 'completed' ? 'success' : 'active'}
                      />
                    )}
                    
                    {/* AI洞察 */}
                    {step.aiInsights && step.aiInsights.length > 0 && (
                      <div className="mt-3 p-2 bg-blue-50 rounded border-l-4 border-blue-400">
                        <div className="flex items-center gap-1 mb-1">
                          <RobotOutlined className="text-blue-500" />
                          <span className="text-xs font-medium text-blue-700">AI分析洞察</span>
                        </div>
                        <ul className="text-xs text-blue-600 space-y-1">
                          {step.aiInsights.map((insight, idx) => (
                            <li key={idx} className="flex items-start gap-1">
                              <BulbOutlined className="text-blue-400 mt-0.5 flex-shrink-0" />
                              {insight}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {/* 警告信息 */}
                    {step.warnings && step.warnings.length > 0 && (
                      <div className="mt-2 p-2 bg-yellow-50 rounded border-l-4 border-yellow-400">
                        <div className="flex items-center gap-1 mb-1">
                          <WarningOutlined className="text-yellow-500" />
                          <span className="text-xs font-medium text-yellow-700">注意事项</span>
                        </div>
                        <ul className="text-xs text-yellow-600 space-y-1">
                          {step.warnings.map((warning, idx) => (
                            <li key={idx}>{warning}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </Timeline.Item>
              ))}
            </Timeline>
          </Card>
        </Col>

        {/* 右侧：生成的文档 */}
        <Col xs={24} lg={14}>
          <Card 
            title="生成的文档" 
            extra={
              <Space>
                {hasErrors && (
                  <Button 
                    icon={<ReloadOutlined />}
                    onClick={handleRestartGeneration}
                  >
                    重新开始
                  </Button>
                )}
                {isCompleted && (
                  <Button 
                    type="primary" 
                    icon={<DownloadOutlined />}
                    onClick={() => navigate('/documents')}
                  >
                    查看所有文档
                  </Button>
                )}
              </Space>
            }
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {generatedDocuments.map((doc) => (
                <Card
                  key={doc.id}
                  size="small"
                  className="border border-gray-200 hover:border-blue-300 transition-colors"
                  title={
                    <div className="flex justify-between items-center">
                      <span className="flex items-center">
                        <FileTextOutlined className="mr-2" />
                        {doc.title}
                      </span>
                      <div className="flex items-center gap-1">
                        {getDocumentStatusTag(doc.status)}
                        {doc.confidence && (
                           <Tag color={getConfidenceColor(doc.confidence)}>
                             {doc.confidence}%
                           </Tag>
                         )}
                      </div>
                    </div>
                  }
                  extra={
                    doc.status === 'completed' && (
                      <Space size="small">
                        <Button size="small" icon={<EyeOutlined />} />
                        <Button size="small" icon={<EditOutlined />} />
                        <Button 
                          size="small" 
                          icon={<ReloadOutlined />}
                          onClick={() => handleRegenerate(doc.id)}
                        />
                      </Space>
                    )
                  }
                >
                  {/* AI分析信息 */}
                  {doc.aiAnalysis && (
                    <div className="mb-3 p-2 bg-gradient-to-r from-blue-50 to-purple-50 rounded border">
                      <div className="flex items-center gap-2 mb-2">
                        <RobotOutlined className="text-blue-500" />
                        <span className="text-xs font-medium text-gray-700">AI分析结果</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-gray-600">复杂度: </span>
                          <Tag color={getComplexityColor(doc.aiAnalysis.complexity)}>
                             {doc.aiAnalysis.complexity.toUpperCase()}
                           </Tag>
                        </div>
                        <div>
                          <span className="text-gray-600">完整度: </span>
                          <span className="font-medium">{doc.aiAnalysis.completeness}%</span>
                        </div>
                      </div>
                      {doc.aiAnalysis.suggestions.length > 0 && (
                        <div className="mt-2">
                          <div className="text-xs text-gray-600 mb-1">AI建议:</div>
                          <div className="flex flex-wrap gap-1">
                            {doc.aiAnalysis.suggestions.slice(0, 2).map((suggestion, idx) => (
                               <Tag key={idx} color="blue">
                                 {suggestion}
                               </Tag>
                             ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {doc.status === 'completed' ? (
                    <div>
                      <Text className="text-sm text-gray-600">
                        类型: {doc.type.toUpperCase()}
                      </Text>
                      <div className="mt-2 p-2 bg-gray-50 rounded text-xs font-mono max-h-20 overflow-hidden">
                        {doc.content.substring(0, 100)}...
                      </div>
                    </div>
                  ) : doc.status === 'error' ? (
                    <div className="flex items-center justify-center py-4">
                      <ExclamationCircleOutlined className="text-red-500 mr-2" />
                      <Text className="text-red-500">{doc.errorMessage || '生成失败，请重试'}</Text>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center py-4">
                      <LoadingOutlined className="text-blue-500 mr-2" />
                      <Text className="text-gray-500">生成中...</Text>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </Card>
        </Col>
      </Row>
      
      {/* AI分析结果总结 */}
      {aiAnalysisResults && isCompleted && (
        <Row className="mt-6">
          <Col span={24}>
            <Card 
              title={
                <div className="flex items-center gap-2">
                  <RobotOutlined className="text-purple-500" />
                  <span>AI分析总结</span>
                </div>
              }
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="text-center p-4 bg-blue-50 rounded">
                  <div className="text-2xl font-bold text-blue-600">
                    {aiAnalysisResults.totalDocuments}
                  </div>
                  <div className="text-sm text-gray-600">生成文档数量</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded">
                  <div className="text-2xl font-bold text-green-600">
                    {aiAnalysisResults.averageConfidence}%
                  </div>
                  <div className="text-sm text-gray-600">平均置信度</div>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded">
                  <div className="text-2xl font-bold text-orange-600">
                    {aiAnalysisResults.processingTime}
                  </div>
                  <div className="text-sm text-gray-600">处理时间</div>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <BulbOutlined className="text-yellow-500" />
                  AI优化建议
                </h4>
                <div className="space-y-2">
                  {aiAnalysisResults.recommendations.map((rec: string, idx: number) => (
                    <div key={idx} className="flex items-start gap-2 p-2 bg-yellow-50 rounded">
                      <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-sm text-gray-700">{rec}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </Col>
        </Row>
      )}
    </div>
  );
};

export default DocumentGenerate;