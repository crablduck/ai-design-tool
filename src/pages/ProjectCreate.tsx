import React, { useState } from 'react';
import {
  Card,
  Steps,
  Button,
  Upload,
  Input,
  Select,
  Form,
  Row,
  Col,
  Typography,

  message,
  Progress,
  Divider,
} from 'antd';
import {
  InboxOutlined,
  FileImageOutlined,
  RocketOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import type { UploadProps } from 'antd';

const { Title, Paragraph, Text } = Typography;
const { TextArea } = Input;
const { Dragger } = Upload;
const { Option } = Select;

interface ProjectFormData {
  name: string;
  description: string;
  type: string;
  techStack: string[];
  generateOptions: string[];
}

const ProjectCreate: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [form] = Form.useForm<ProjectFormData>();
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateProgress, setGenerateProgress] = useState(0);
  const navigate = useNavigate();

  // 步骤配置
  const steps = [
    {
      title: '上传原型图',
      icon: <FileImageOutlined />,
      description: '上传PNG/JPG格式的原型图片',
    },
    {
      title: '输入需求',
      icon: <InboxOutlined />,
      description: '描述项目需求和愿景',
    },
    {
      title: '项目配置',
      icon: <SettingOutlined />,
      description: '设置项目参数和生成选项',
    },
    {
      title: '开始生成',
      icon: <RocketOutlined />,
      description: 'AI分析并生成文档',
    },
  ];

  // 文件上传配置
  const uploadProps: UploadProps = {
    name: 'file',
    multiple: true,
    accept: '.png,.jpg,.jpeg',
    beforeUpload: (file) => {
      const isImage = file.type.startsWith('image/');
      if (!isImage) {
        message.error('只能上传图片文件！');
        return false;
      }
      const isLt10M = file.size / 1024 / 1024 < 10;
      if (!isLt10M) {
        message.error('图片大小不能超过10MB！');
        return false;
      }
      return false; // 阻止自动上传，手动处理
    },
    onChange: (info) => {
      setUploadedFiles(info.fileList);
    },
    onDrop: (e) => {
      console.log('Dropped files', e.dataTransfer.files);
    },
  };

  // 下一步
  const handleNext = async () => {
    if (currentStep === 0) {
      if (uploadedFiles.length === 0) {
        message.warning('请先上传原型图片');
        return;
      }
    } else if (currentStep === 1) {
      try {
        await form.validateFields(['description']);
      } catch {
        return;
      }
    } else if (currentStep === 2) {
      try {
        await form.validateFields();
      } catch {
        return;
      }
    }
    
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  // 上一步
  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // 开始生成
  const handleGenerate = async () => {
    try {
      await form.validateFields();
      setIsGenerating(true);
      setGenerateProgress(0);

      // 模拟生成过程
      const progressSteps = [
        { progress: 20, message: '正在分析原型图...' },
        { progress: 40, message: '正在理解需求描述...' },
        { progress: 60, message: '正在生成功能树...' },
        { progress: 80, message: '正在创建UML图...' },
        { progress: 100, message: '文档生成完成！' },
      ];

      for (const step of progressSteps) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        setGenerateProgress(step.progress);
        message.info(step.message);
      }

      // 生成完成后跳转到文档生成页面
      const projectId = Date.now().toString();
      navigate(`/project/generate/${projectId}`);
    } catch {
      message.error('生成失败，请重试');
      setIsGenerating(false);
    }
  };

  // 渲染步骤内容
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <Card className="mb-6">
            <Title level={4} className="mb-4">上传原型图片</Title>
            <Dragger {...uploadProps} className="mb-4">
              <p className="ant-upload-drag-icon">
                <InboxOutlined className="text-4xl text-blue-500" />
              </p>
              <p className="ant-upload-text text-lg font-medium">
                点击或拖拽文件到此区域上传
              </p>
              <p className="ant-upload-hint">
                支持PNG、JPG格式，单个文件不超过10MB
              </p>
            </Dragger>
            
            {uploadedFiles.length > 0 && (
              <div>
                <Divider orientation="left">已上传文件</Divider>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {uploadedFiles.map((file, index) => (
                    <div key={index} className="border rounded-lg p-2">
                      <div className="aspect-square bg-gray-100 rounded mb-2 flex items-center justify-center">
                        <FileImageOutlined className="text-2xl text-gray-400" />
                      </div>
                      <Text className="text-sm truncate block">{file.name}</Text>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        );

      case 1:
        return (
          <Card className="mb-6">
            <Title level={4} className="mb-4">描述项目需求</Title>
            <Form form={form} layout="vertical">
              <Form.Item
                name="description"
                label="需求愿景描述"
                rules={[
                  { required: true, message: '请输入项目需求描述' },
                  { min: 50, message: '需求描述至少50个字符' },
                ]}
              >
                <TextArea
                  rows={8}
                  placeholder="请详细描述您的项目需求和愿景，包括：&#10;1. 项目的主要功能和目标&#10;2. 目标用户群体&#10;3. 核心业务流程&#10;4. 特殊需求或约束条件&#10;&#10;描述越详细，生成的文档质量越高..."
                  showCount
                  maxLength={2000}
                />
              </Form.Item>
            </Form>
            
            <div className="bg-blue-50 p-4 rounded-lg">
              <Title level={5} className="text-blue-700 mb-2">💡 写作建议</Title>
              <ul className="text-blue-600 text-sm space-y-1">
                <li>• 明确说明项目的核心价值和解决的问题</li>
                <li>• 描述主要的用户角色和使用场景</li>
                <li>• 列出关键功能模块和业务流程</li>
                <li>• 提及技术要求或性能指标</li>
              </ul>
            </div>
          </Card>
        );

      case 2:
        return (
          <Card className="mb-6">
            <Title level={4} className="mb-4">项目配置</Title>
            <Form form={form} layout="vertical">
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="name"
                    label="项目名称"
                    rules={[{ required: true, message: '请输入项目名称' }]}
                  >
                    <Input placeholder="输入项目名称" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="type"
                    label="项目类型"
                    rules={[{ required: true, message: '请选择项目类型' }]}
                  >
                    <Select placeholder="选择项目类型">
                      <Option value="web">Web应用</Option>
                      <Option value="mobile">移动应用</Option>
                      <Option value="desktop">桌面应用</Option>
                      <Option value="api">API服务</Option>
                      <Option value="system">管理系统</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
              
              <Form.Item
                name="techStack"
                label="技术栈"
                rules={[{ required: true, message: '请选择技术栈' }]}
              >
                <Select
                  mode="multiple"
                  placeholder="选择技术栈"
                  options={[
                    { label: 'React', value: 'react' },
                    { label: 'Vue.js', value: 'vue' },
                    { label: 'Angular', value: 'angular' },
                    { label: 'Node.js', value: 'nodejs' },
                    { label: 'Python', value: 'python' },
                    { label: 'Java', value: 'java' },
                    { label: 'MySQL', value: 'mysql' },
                    { label: 'PostgreSQL', value: 'postgresql' },
                    { label: 'MongoDB', value: 'mongodb' },
                  ]}
                />
              </Form.Item>
              
              <Form.Item
                name="generateOptions"
                label="生成文档类型"
                rules={[{ required: true, message: '请选择要生成的文档类型' }]}
              >
                <Select
                  mode="multiple"
                  placeholder="选择要生成的文档"
                  options={[
                    { label: '功能树', value: 'feature-tree' },
                    { label: '需求文档', value: 'requirements' },
                    { label: 'UML类图', value: 'uml-class' },
                    { label: '用例图', value: 'use-case' },
                    { label: '领域模型', value: 'domain-model' },
                    { label: 'OpenAPI接口', value: 'openapi' },
                    { label: 'SQL初始化脚本', value: 'sql-init' },
                    { label: '架构设计', value: 'architecture' },
                    { label: 'ERP图', value: 'erp-diagram' },
                  ]}
                />
              </Form.Item>
            </Form>
          </Card>
        );

      case 3:
        return (
          <Card className="mb-6">
            <div className="text-center">
              <Title level={4} className="mb-4">准备开始生成</Title>
              
              {!isGenerating ? (
                <div>
                  <div className="mb-6">
                    <RocketOutlined className="text-6xl text-blue-500 mb-4" />
                    <Paragraph className="text-lg text-gray-600">
                      所有配置已完成，点击下方按钮开始AI分析和文档生成
                    </Paragraph>
                  </div>
                  
                  <Button
                    type="primary"
                    size="large"
                    onClick={handleGenerate}
                    className="px-8 py-2 h-12 text-lg"
                  >
                    🚀 开始生成文档
                  </Button>
                </div>
              ) : (
                <div>
                  <div className="mb-6">
                    <Progress
                      type="circle"
                      percent={generateProgress}
                      size={120}
                      strokeColor={{
                        '0%': '#2563EB',
                        '100%': '#10B981',
                      }}
                    />
                  </div>
                  <Paragraph className="text-lg">
                    AI正在分析您的项目，请稍候...
                  </Paragraph>
                </div>
              )}
            </div>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <Title level={2} className="mb-2">创建新项目</Title>
        <Paragraph className="text-lg text-gray-600">
          通过上传原型图和描述需求，让AI为您生成完整的软件工程文档
        </Paragraph>
      </div>

      {/* 步骤指示器 */}
      <Card className="mb-6">
        <Steps
          current={currentStep}
          items={steps}
          className="mb-0"
        />
      </Card>

      {/* 步骤内容 */}
      {renderStepContent()}

      {/* 操作按钮 */}
      <div className="flex justify-between">
        <Button
          size="large"
          onClick={handlePrev}
          disabled={currentStep === 0 || isGenerating}
        >
          上一步
        </Button>
        
        {currentStep < steps.length - 1 && (
          <Button
            type="primary"
            size="large"
            onClick={handleNext}
            disabled={isGenerating}
          >
            下一步
          </Button>
        )}
      </div>
    </div>
  );
};

export default ProjectCreate;