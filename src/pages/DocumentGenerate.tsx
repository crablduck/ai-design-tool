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
} from 'antd';
import {
  CheckCircleOutlined,
  LoadingOutlined,
  FileTextOutlined,
  DownloadOutlined,
  EyeOutlined,
  EditOutlined,
} from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';

const { Title, Paragraph, Text } = Typography;


interface GenerationStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  progress: number;
  result?: string;
}

interface GeneratedDocument {
  id: string;
  title: string;
  type: string;
  content: string;
  status: 'generating' | 'completed';
}

const DocumentGenerate: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [overallProgress, setOverallProgress] = useState(0);
  const [, setCurrentStep] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  
  const [generationSteps, setGenerationSteps] = useState<GenerationStep[]>([
    {
      id: 'image-analysis',
      title: '图像分析',
      description: '正在分析上传的原型图片，识别UI组件和布局结构',
      status: 'pending',
      progress: 0,
    },
    {
      id: 'requirement-parsing',
      title: '需求解析',
      description: '正在理解和分析项目需求描述',
      status: 'pending',
      progress: 0,
    },
    {
      id: 'feature-extraction',
      title: '功能提取',
      description: '正在提取核心功能模块和业务逻辑',
      status: 'pending',
      progress: 0,
    },
    {
      id: 'document-generation',
      title: '文档生成',
      description: '正在生成各类软件工程文档',
      status: 'pending',
      progress: 0,
    },
    {
      id: 'quality-check',
      title: '质量检查',
      description: '正在检查生成文档的完整性和一致性',
      status: 'pending',
      progress: 0,
    },
  ]);

  const [generatedDocuments, setGeneratedDocuments] = useState<GeneratedDocument[]>([
    {
      id: 'feature-tree',
      title: '功能树',
      type: 'markdown',
      content: '',
      status: 'generating',
    },
    {
      id: 'requirements',
      title: '需求文档',
      type: 'markdown',
      content: '',
      status: 'generating',
    },
    {
      id: 'uml-class',
      title: 'UML类图',
      type: 'plantuml',
      content: '',
      status: 'generating',
    },
    {
      id: 'use-case',
      title: '用例图',
      type: 'plantuml',
      content: '',
      status: 'generating',
    },
    {
      id: 'api-spec',
      title: 'API接口文档',
      type: 'openapi',
      content: '',
      status: 'generating',
    },
    {
      id: 'sql-init',
      title: 'SQL初始化脚本',
      type: 'sql',
      content: '',
      status: 'generating',
    },
  ]);

  // 模拟生成过程
  useEffect(() => {
    const simulateGeneration = async () => {
      for (let i = 0; i < generationSteps.length; i++) {
        // 更新当前步骤状态
        setCurrentStep(i);
        setGenerationSteps(prev => 
          prev.map((step, index) => {
            if (index === i) {
              return { ...step, status: 'processing' };
            } else if (index < i) {
              return { ...step, status: 'completed', progress: 100 };
            }
            return step;
          })
        );

        // 模拟步骤进度
        for (let progress = 0; progress <= 100; progress += 20) {
          await new Promise(resolve => setTimeout(resolve, 200));
          setGenerationSteps(prev => 
            prev.map((step, index) => 
              index === i ? { ...step, progress } : step
            )
          );
          setOverallProgress(((i * 100 + progress) / generationSteps.length));
        }

        // 完成当前步骤
        setGenerationSteps(prev => 
          prev.map((step, index) => 
            index === i ? { ...step, status: 'completed', progress: 100 } : step
          )
        );

        // 生成对应的文档内容
        if (i >= 2) { // 从功能提取步骤开始生成文档
          const docsToComplete = Math.min(2, generatedDocuments.length - (i - 2) * 2);
          for (let j = 0; j < docsToComplete; j++) {
            const docIndex = (i - 2) * 2 + j;
            if (docIndex < generatedDocuments.length) {
              setGeneratedDocuments(prev => 
                prev.map((doc, index) => 
                  index === docIndex ? {
                    ...doc,
                    status: 'completed',
                    content: generateMockContent(doc.type, doc.title)
                  } : doc
                )
              );
            }
          }
        }
      }

      // 完成所有生成
      setIsCompleted(true);
      setOverallProgress(100);
    };

    simulateGeneration();
  }, []);

  // 生成模拟内容
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
      default:
        return <div className="w-4 h-4 rounded-full border-2 border-gray-300" />;
    }
  };

  const getDocumentStatusTag = (status: string) => {
    return status === 'completed' ? (
      <Tag color="success">已完成</Tag>
    ) : (
      <Tag color="processing">生成中</Tag>
    );
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
                  color={step.status === 'completed' ? 'green' : step.status === 'processing' ? 'blue' : 'gray'}
                >
                  <div>
                    <Text strong className={step.status === 'processing' ? 'text-blue-600' : ''}>
                      {step.title}
                    </Text>
                    <div className="text-sm text-gray-500 mt-1">
                      {step.description}
                    </div>
                    {step.status === 'processing' && (
                      <Progress 
                        percent={step.progress} 
                        size="small" 
                        className="mt-2 max-w-xs"
                      />
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
              isCompleted && (
                <Space>
                  <Button 
                    type="primary" 
                    icon={<DownloadOutlined />}
                    onClick={() => navigate('/documents')}
                  >
                    查看所有文档
                  </Button>
                </Space>
              )
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
                      {getDocumentStatusTag(doc.status)}
                    </div>
                  }
                  extra={
                    doc.status === 'completed' && (
                      <Space size="small">
                        <Button size="small" icon={<EyeOutlined />} />
                        <Button size="small" icon={<EditOutlined />} />
                      </Space>
                    )
                  }
                >
                  {doc.status === 'completed' ? (
                    <div>
                      <Text className="text-sm text-gray-600">
                        类型: {doc.type.toUpperCase()}
                      </Text>
                      <div className="mt-2 p-2 bg-gray-50 rounded text-xs font-mono max-h-20 overflow-hidden">
                        {doc.content.substring(0, 100)}...
                      </div>
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
    </div>
  );
};

export default DocumentGenerate;