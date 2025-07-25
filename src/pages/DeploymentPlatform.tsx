import React, { useState, useEffect } from 'react';
import {
  Card,
  Tabs,
  Button,
  Table,
  Modal,
  Form,
  Input,
  Select,
  Tag,
  Progress,
  Space,
  Statistic,
  Row,
  Col,
  Timeline,
  Upload,
  message,
  Divider,
  Badge,
  Tooltip,
  Switch,
  Steps,
  Descriptions,
  Alert,
  List,
  Avatar,
  Spin,
  Tree
} from 'antd';
import {
  PlayCircleOutlined,
  PauseCircleOutlined,
  StopOutlined,
  ReloadOutlined,
  DownloadOutlined,
  UploadOutlined,
  CloudServerOutlined,
  DeploymentUnitOutlined,
  SettingOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  SearchOutlined,
  FilterOutlined,
  ExportOutlined,
  ImportOutlined,
  LinkOutlined,
  RobotOutlined,
  CloudOutlined,
  ToolOutlined,
  SyncOutlined,
  CodeOutlined,
  DatabaseOutlined,
  BranchesOutlined,
  ContainerOutlined,
  MonitorOutlined,
  SecurityScanOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  WarningOutlined,
  ThunderboltOutlined,
  ApiOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { DataNode } from 'antd/es/tree';

// 部署平台集成接口定义
interface DeploymentPlatformIntegration {
  id: string;
  name: string;
  type: 'ci_cd' | 'container' | 'cloud' | 'monitoring' | 'security';
  platform: string; // Jenkins, GitLab CI, Docker, Kubernetes, AWS, etc.
  status: 'connected' | 'disconnected' | 'error';
  url: string;
  apiKey?: string;
  lastSync?: string;
  projects: IntegratedProject[];
  capabilities: string[];
  agentSupport: boolean;
}

interface IntegratedProject {
  id: string;
  name: string;
  platform: string;
  url: string;
  pipelines: number;
  lastDeploy?: string;
  status: 'active' | 'inactive';
  environments: string[];
}

interface DeploymentTool {
  id: string;
  name: string;
  type: 'ci_cd' | 'container' | 'cloud' | 'monitoring' | 'security';
  description: string;
  logo: string;
  supported: boolean;
  integrationStatus: 'available' | 'configured' | 'error';
  agentSupport: boolean;
  autoGeneration: boolean;
  features: string[];
}

interface AgentDeploymentTask {
  id: string;
  type: 'create_pipeline' | 'deploy_app' | 'setup_environment' | 'configure_monitoring' | 'security_scan';
  platform: string;
  tool: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  description: string;
  result?: any;
  createdAt: string;
  completedAt?: string;
  logs: string[];
}

interface DeploymentTemplate {
  id: string;
  name: string;
  type: 'docker' | 'kubernetes' | 'serverless' | 'vm';
  description: string;
  platform: string;
  content: string;
  variables: TemplateVariable[];
  createdAt: string;
  usageCount: number;
}

interface TemplateVariable {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'select';
  description: string;
  required: boolean;
  defaultValue?: any;
  options?: string[];
}

const DeploymentPlatform: React.FC = () => {
  const [activeTab, setActiveTab] = useState('integrations');
  const [integrations, setIntegrations] = useState<DeploymentPlatformIntegration[]>([]);
  const [deploymentTools, setDeploymentTools] = useState<DeploymentTool[]>([]);
  const [agentTasks, setAgentTasks] = useState<AgentDeploymentTask[]>([]);
  const [deploymentTemplates, setDeploymentTemplates] = useState<DeploymentTemplate[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState<DeploymentPlatformIntegration | null>(null);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [templateModalVisible, setTemplateModalVisible] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<DeploymentTemplate | null>(null);

  // 模拟数据初始化
  useEffect(() => {
    const mockIntegrations: DeploymentPlatformIntegration[] = [
      {
        id: '1',
        name: 'Jenkins CI/CD',
        type: 'ci_cd',
        platform: 'Jenkins',
        status: 'connected',
        url: 'https://jenkins.company.com',
        lastSync: '2024-12-20 10:30:00',
        projects: [
          { id: '1', name: 'Web App Pipeline', platform: 'Jenkins', url: '/job/webapp', pipelines: 3, lastDeploy: '2024-12-20 09:00:00', status: 'active', environments: ['dev', 'test', 'prod'] },
          { id: '2', name: 'API Pipeline', platform: 'Jenkins', url: '/job/api', pipelines: 2, lastDeploy: '2024-12-19 18:30:00', status: 'active', environments: ['dev', 'prod'] }
        ],
        capabilities: ['Pipeline Management', 'Build Automation', 'Deployment', 'Notifications'],
        agentSupport: true
      },
      {
        id: '2',
        name: 'GitLab CI',
        type: 'ci_cd',
        platform: 'GitLab',
        status: 'connected',
        url: 'https://gitlab.company.com',
        lastSync: '2024-12-20 11:00:00',
        projects: [
          { id: '3', name: 'Mobile App CI/CD', platform: 'GitLab', url: '/mobile-app', pipelines: 4, lastDeploy: '2024-12-20 08:45:00', status: 'active', environments: ['dev', 'staging', 'prod'] }
        ],
        capabilities: ['GitOps', 'Container Registry', 'Security Scanning', 'Auto DevOps'],
        agentSupport: true
      },
      {
        id: '3',
        name: 'Docker Registry',
        type: 'container',
        platform: 'Docker',
        status: 'connected',
        url: 'https://registry.company.com',
        lastSync: '2024-12-20 09:15:00',
        projects: [
          { id: '4', name: 'Container Images', platform: 'Docker', url: '/repositories', pipelines: 0, lastDeploy: '2024-12-20 07:30:00', status: 'active', environments: [] }
        ],
        capabilities: ['Image Management', 'Vulnerability Scanning', 'Registry API', 'Webhooks'],
        agentSupport: true
      },
      {
        id: '4',
        name: 'Kubernetes Cluster',
        type: 'container',
        platform: 'Kubernetes',
        status: 'connected',
        url: 'https://k8s.company.com',
        lastSync: '2024-12-20 10:45:00',
        projects: [
          { id: '5', name: 'Production Cluster', platform: 'Kubernetes', url: '/clusters/prod', pipelines: 0, lastDeploy: '2024-12-20 06:00:00', status: 'active', environments: ['prod'] },
          { id: '6', name: 'Staging Cluster', platform: 'Kubernetes', url: '/clusters/staging', pipelines: 0, lastDeploy: '2024-12-19 22:00:00', status: 'active', environments: ['staging'] }
        ],
        capabilities: ['Container Orchestration', 'Service Mesh', 'Auto Scaling', 'Rolling Updates'],
        agentSupport: true
      },
      {
        id: '5',
        name: 'AWS ECS',
        type: 'cloud',
        platform: 'AWS',
        status: 'connected',
        url: 'https://console.aws.amazon.com/ecs',
        lastSync: '2024-12-20 09:30:00',
        projects: [
          { id: '7', name: 'Microservices Cluster', platform: 'AWS ECS', url: '/clusters/microservices', pipelines: 0, lastDeploy: '2024-12-20 05:15:00', status: 'active', environments: ['prod'] }
        ],
        capabilities: ['Container Service', 'Load Balancing', 'Service Discovery', 'Auto Scaling'],
        agentSupport: true
      }
    ];

    const mockDeploymentTools: DeploymentTool[] = [
      {
        id: '1',
        name: 'Jenkins',
        type: 'ci_cd',
        description: '开源CI/CD自动化服务器',
        logo: '🔧',
        supported: true,
        integrationStatus: 'configured',
        agentSupport: true,
        autoGeneration: true,
        features: ['Pipeline as Code', 'Plugin Ecosystem', 'Distributed Builds', 'Blue Ocean UI']
      },
      {
        id: '2',
        name: 'GitLab CI',
        type: 'ci_cd',
        description: 'GitLab内置CI/CD平台',
        logo: '🦊',
        supported: true,
        integrationStatus: 'configured',
        agentSupport: true,
        autoGeneration: true,
        features: ['GitOps', 'Auto DevOps', 'Security Scanning', 'Container Registry']
      },
      {
        id: '3',
        name: 'GitHub Actions',
        type: 'ci_cd',
        description: 'GitHub原生CI/CD工作流',
        logo: '🐙',
        supported: true,
        integrationStatus: 'available',
        agentSupport: true,
        autoGeneration: true,
        features: ['Workflow Automation', 'Marketplace Actions', 'Matrix Builds', 'Secrets Management']
      },
      {
        id: '4',
        name: 'Docker',
        type: 'container',
        description: '容器化平台和镜像管理',
        logo: '🐳',
        supported: true,
        integrationStatus: 'configured',
        agentSupport: true,
        autoGeneration: true,
        features: ['Container Images', 'Multi-stage Builds', 'Registry', 'Compose']
      },
      {
        id: '5',
        name: 'Kubernetes',
        type: 'container',
        description: '容器编排和管理平台',
        logo: '☸️',
        supported: true,
        integrationStatus: 'configured',
        agentSupport: true,
        autoGeneration: true,
        features: ['Container Orchestration', 'Service Discovery', 'Auto Scaling', 'Rolling Updates']
      },
      {
        id: '6',
        name: 'Terraform',
        type: 'cloud',
        description: '基础设施即代码工具',
        logo: '🏗️',
        supported: true,
        integrationStatus: 'available',
        agentSupport: true,
        autoGeneration: true,
        features: ['Infrastructure as Code', 'Multi-Cloud', 'State Management', 'Plan & Apply']
      },
      {
        id: '7',
        name: 'Prometheus',
        type: 'monitoring',
        description: '监控和告警系统',
        logo: '📊',
        supported: true,
        integrationStatus: 'configured',
        agentSupport: true,
        autoGeneration: false,
        features: ['Metrics Collection', 'Alerting', 'Time Series DB', 'PromQL']
      },
      {
        id: '8',
        name: 'SonarQube',
        type: 'security',
        description: '代码质量和安全分析',
        logo: '🔍',
        supported: true,
        integrationStatus: 'configured',
        agentSupport: true,
        autoGeneration: false,
        features: ['Code Quality', 'Security Hotspots', 'Technical Debt', 'Quality Gates']
      }
    ];

    const mockAgentTasks: AgentDeploymentTask[] = [
      {
        id: '1',
        type: 'create_pipeline',
        platform: 'Jenkins',
        tool: 'Jenkins',
        status: 'completed',
        progress: 100,
        description: '为React应用创建Jenkins CI/CD流水线',
        result: { pipelineFile: 'Jenkinsfile', stages: 5 },
        createdAt: '2024-12-20 10:00:00',
        completedAt: '2024-12-20 10:08:00',
        logs: [
          '10:00:00 - 开始创建Jenkins流水线',
          '10:02:00 - 分析项目结构',
          '10:04:00 - 生成Jenkinsfile',
          '10:06:00 - 配置构建阶段',
          '10:08:00 - 流水线创建完成'
        ]
      },
      {
        id: '2',
        type: 'deploy_app',
        platform: 'Kubernetes',
        tool: 'Kubernetes',
        status: 'running',
        progress: 75,
        description: '部署应用到Kubernetes集群',
        createdAt: '2024-12-20 11:00:00',
        logs: [
          '11:00:00 - 开始部署流程',
          '11:02:00 - 创建Deployment配置',
          '11:05:00 - 创建Service配置',
          '11:08:00 - 应用部署中...'
        ]
      },
      {
        id: '3',
        type: 'setup_environment',
        platform: 'AWS',
        tool: 'Terraform',
        status: 'pending',
        progress: 0,
        description: '使用Terraform创建AWS基础设施',
        createdAt: '2024-12-20 11:30:00',
        logs: []
      }
    ];

    const mockDeploymentTemplates: DeploymentTemplate[] = [
      {
        id: '1',
        name: 'React应用Docker部署',
        type: 'docker',
        description: 'React前端应用的Docker容器化部署模板',
        platform: 'Docker',
        content: `FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY build ./build
EXPOSE 3000
CMD ["npx", "serve", "-s", "build", "-l", "3000"]`,
        variables: [
          { name: 'NODE_VERSION', type: 'select', description: 'Node.js版本', required: true, defaultValue: '16', options: ['14', '16', '18', '20'] },
          { name: 'PORT', type: 'number', description: '应用端口', required: true, defaultValue: 3000 }
        ],
        createdAt: '2024-12-15',
        usageCount: 15
      },
      {
        id: '2',
        name: 'Node.js API Kubernetes部署',
        type: 'kubernetes',
        description: 'Node.js后端API的Kubernetes部署配置',
        platform: 'Kubernetes',
        content: `apiVersion: apps/v1
kind: Deployment
metadata:
  name: {{APP_NAME}}
spec:
  replicas: {{REPLICAS}}
  selector:
    matchLabels:
      app: {{APP_NAME}}
  template:
    metadata:
      labels:
        app: {{APP_NAME}}
    spec:
      containers:
      - name: {{APP_NAME}}
        image: {{IMAGE_NAME}}:{{IMAGE_TAG}}
        ports:
        - containerPort: {{PORT}}
        env:
        - name: NODE_ENV
          value: "{{NODE_ENV}}"
---
apiVersion: v1
kind: Service
metadata:
  name: {{APP_NAME}}-service
spec:
  selector:
    app: {{APP_NAME}}
  ports:
  - port: 80
    targetPort: {{PORT}}
  type: LoadBalancer`,
        variables: [
          { name: 'APP_NAME', type: 'string', description: '应用名称', required: true },
          { name: 'IMAGE_NAME', type: 'string', description: '镜像名称', required: true },
          { name: 'IMAGE_TAG', type: 'string', description: '镜像标签', required: true, defaultValue: 'latest' },
          { name: 'REPLICAS', type: 'number', description: '副本数量', required: true, defaultValue: 3 },
          { name: 'PORT', type: 'number', description: '容器端口', required: true, defaultValue: 3000 },
          { name: 'NODE_ENV', type: 'select', description: '运行环境', required: true, defaultValue: 'production', options: ['development', 'staging', 'production'] }
        ],
        createdAt: '2024-12-18',
        usageCount: 8
      },
      {
        id: '3',
        name: 'Jenkins CI/CD流水线',
        type: 'docker',
        description: 'Jenkins流水线配置模板',
        platform: 'Jenkins',
        content: `pipeline {
    agent any
    
    environment {
        NODE_VERSION = '{{NODE_VERSION}}'
        DOCKER_REGISTRY = '{{DOCKER_REGISTRY}}'
        IMAGE_NAME = '{{IMAGE_NAME}}'
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        
        stage('Install Dependencies') {
            steps {
                sh 'npm ci'
            }
        }
        
        stage('Test') {
            steps {
                sh 'npm test'
            }
        }
        
        stage('Build') {
            steps {
                sh 'npm run build'
            }
        }
        
        stage('Docker Build') {
            steps {
                script {
                    def image = docker.build("\${DOCKER_REGISTRY}/\${IMAGE_NAME}:\${BUILD_NUMBER}")
                    docker.withRegistry('https://\${DOCKER_REGISTRY}', 'docker-registry-credentials') {
                        image.push()
                        image.push('latest')
                    }
                }
            }
        }
        
        stage('Deploy') {
            when {
                branch 'main'
            }
            steps {
                sh 'kubectl set image deployment/\${IMAGE_NAME} \${IMAGE_NAME}=\${DOCKER_REGISTRY}/\${IMAGE_NAME}:\${BUILD_NUMBER}'
            }
        }
    }
    
    post {
        always {
            cleanWs()
        }
    }
}`,
        variables: [
          { name: 'NODE_VERSION', type: 'select', description: 'Node.js版本', required: true, defaultValue: '16', options: ['14', '16', '18', '20'] },
          { name: 'DOCKER_REGISTRY', type: 'string', description: 'Docker镜像仓库', required: true },
          { name: 'IMAGE_NAME', type: 'string', description: '镜像名称', required: true }
        ],
        createdAt: '2024-12-20',
        usageCount: 12
      }
    ];

    setIntegrations(mockIntegrations);
    setDeploymentTools(mockDeploymentTools);
    setAgentTasks(mockAgentTasks);
    setDeploymentTemplates(mockDeploymentTemplates);
  }, []);

  // 集成平台列表列定义
  const integrationColumns: ColumnsType<DeploymentPlatformIntegration> = [
    {
      title: '平台名称',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Space>
          <Avatar size="small" style={{ backgroundColor: record.status === 'connected' ? '#52c41a' : '#ff4d4f' }}>
            {record.platform.charAt(0)}
          </Avatar>
          <span>{text}</span>
        </Space>
      )
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      render: (type) => {
        const typeMap = {
          ci_cd: { color: 'blue', text: 'CI/CD', icon: <BranchesOutlined /> },
          container: { color: 'green', text: '容器', icon: <ContainerOutlined /> },
          cloud: { color: 'orange', text: '云平台', icon: <CloudOutlined /> },
          monitoring: { color: 'purple', text: '监控', icon: <MonitorOutlined /> },
          security: { color: 'red', text: '安全', icon: <SecurityScanOutlined /> }
        };
        const config = typeMap[type as keyof typeof typeMap];
        return (
          <Space>
            {config.icon}
            <Tag color={config.color}>{config.text}</Tag>
          </Space>
        );
      }
    },
    {
      title: '连接状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const statusMap = {
          connected: { color: 'success' as const, text: '已连接', icon: <CheckCircleOutlined /> },
          disconnected: { color: 'default' as const, text: '未连接', icon: <CloseCircleOutlined /> },
          error: { color: 'error' as const, text: '连接错误', icon: <WarningOutlined /> }
        };
        const config = statusMap[status as keyof typeof statusMap];
        return (
          <Badge status={config.color} text={
            <Space>
              {config.icon}
              {config.text}
            </Space>
          } />
        );
      }
    },
    {
      title: '项目数量',
      dataIndex: 'projects',
      key: 'projectCount',
      render: (projects) => projects.length
    },
    {
      title: 'AI支持',
      dataIndex: 'agentSupport',
      key: 'agentSupport',
      render: (agentSupport) => (
        <Tag color={agentSupport ? 'green' : 'default'}>
          {agentSupport ? 'AI支持' : '不支持'}
        </Tag>
      )
    },
    {
      title: '最后同步',
      dataIndex: 'lastSync',
      key: 'lastSync'
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button type="link" icon={<EyeOutlined />} onClick={() => handleViewIntegration(record)}>
            查看
          </Button>
          <Button type="link" icon={<SettingOutlined />} onClick={() => handleConfigIntegration(record)}>
            配置
          </Button>
          <Button type="link" icon={<SyncOutlined />} onClick={() => handleSyncIntegration(record)}>
            同步
          </Button>
        </Space>
      )
    }
  ];

  // Agent任务列表列定义
  const agentTaskColumns: ColumnsType<AgentDeploymentTask> = [
    {
      title: '任务类型',
      dataIndex: 'type',
      key: 'type',
      render: (type) => {
        const typeMap = {
          create_pipeline: { color: 'blue', text: '创建流水线', icon: <BranchesOutlined /> },
          deploy_app: { color: 'green', text: '部署应用', icon: <DeploymentUnitOutlined /> },
          setup_environment: { color: 'orange', text: '环境配置', icon: <SettingOutlined /> },
          configure_monitoring: { color: 'purple', text: '配置监控', icon: <MonitorOutlined /> },
          security_scan: { color: 'red', text: '安全扫描', icon: <SecurityScanOutlined /> }
        };
        const config = typeMap[type as keyof typeof typeMap];
        return (
          <Space>
            {config.icon}
            <Tag color={config.color}>{config.text}</Tag>
          </Space>
        );
      }
    },
    {
      title: '平台/工具',
      key: 'platformTool',
      render: (_, record) => (
        <Space direction="vertical" size="small">
          <Tag color="blue">{record.platform}</Tag>
          <Tag color="green">{record.tool}</Tag>
        </Space>
      )
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status, record) => {
        const statusMap = {
          pending: { color: 'default' as const, text: '等待中', icon: <ClockCircleOutlined /> },
          running: { color: 'processing' as const, text: '执行中', icon: <SyncOutlined spin /> },
          completed: { color: 'success' as const, text: '已完成', icon: <CheckCircleOutlined /> },
          failed: { color: 'error' as const, text: '失败', icon: <CloseCircleOutlined /> }
        };
        const config = statusMap[status as keyof typeof statusMap];
        return (
          <Space direction="vertical" size="small">
            <Badge status={config.color} text={
              <Space>
                {config.icon}
                {config.text}
              </Space>
            } />
            {status === 'running' && (
              <Progress percent={record.progress} size="small" />
            )}
          </Space>
        );
      }
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description'
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt'
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button type="link" icon={<EyeOutlined />} onClick={() => handleViewTask(record)}>
            查看
          </Button>
          {record.status === 'running' && (
            <Button type="link" icon={<StopOutlined />} onClick={() => handleStopTask(record)}>
              停止
            </Button>
          )}
        </Space>
      )
    }
  ];

  // 部署模板列表列定义
  const templateColumns: ColumnsType<DeploymentTemplate> = [
    {
      title: '模板名称',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Space>
          <Avatar size="small">{record.type === 'docker' ? '🐳' : record.type === 'kubernetes' ? '☸️' : '🏗️'}</Avatar>
          <span>{text}</span>
        </Space>
      )
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      render: (type) => {
        const typeMap = {
          docker: { color: 'blue', text: 'Docker' },
          kubernetes: { color: 'green', text: 'Kubernetes' },
          serverless: { color: 'orange', text: 'Serverless' },
          vm: { color: 'purple', text: 'Virtual Machine' }
        };
        const config = typeMap[type as keyof typeof typeMap];
        return <Tag color={config.color}>{config.text}</Tag>;
      }
    },
    {
      title: '平台',
      dataIndex: 'platform',
      key: 'platform'
    },
    {
      title: '使用次数',
      dataIndex: 'usageCount',
      key: 'usageCount'
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt'
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button type="link" icon={<EyeOutlined />} onClick={() => handleViewTemplate(record)}>
            查看
          </Button>
          <Button type="link" icon={<RobotOutlined />} onClick={() => handleUseTemplate(record)}>
            AI生成
          </Button>
          <Button type="link" icon={<DownloadOutlined />} onClick={() => handleDownloadTemplate(record)}>
            下载
          </Button>
        </Space>
      )
    }
  ];

  // 事件处理函数
  const handleViewIntegration = (integration: DeploymentPlatformIntegration) => {
    setSelectedIntegration(integration);
    setIsModalVisible(true);
  };

  const handleConfigIntegration = (integration: DeploymentPlatformIntegration) => {
    message.info(`配置 ${integration.name} 集成`);
  };

  const handleSyncIntegration = async (integration: DeploymentPlatformIntegration) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      message.success(`${integration.name} 同步成功`);
      const updatedIntegrations = integrations.map(item => 
        item.id === integration.id 
          ? { ...item, lastSync: new Date().toLocaleString() }
          : item
      );
      setIntegrations(updatedIntegrations);
    } catch (error) {
      message.error('同步失败');
    } finally {
      setLoading(false);
    }
  };

  const handleViewTask = (task: AgentDeploymentTask) => {
    Modal.info({
      title: `任务详情: ${task.description}`,
      content: (
        <div>
          <Descriptions bordered size="small">
            <Descriptions.Item label="任务ID">{task.id}</Descriptions.Item>
            <Descriptions.Item label="平台">{task.platform}</Descriptions.Item>
            <Descriptions.Item label="工具">{task.tool}</Descriptions.Item>
            <Descriptions.Item label="状态">{task.status}</Descriptions.Item>
            <Descriptions.Item label="进度">{task.progress}%</Descriptions.Item>
            <Descriptions.Item label="创建时间">{task.createdAt}</Descriptions.Item>
            {task.completedAt && (
              <Descriptions.Item label="完成时间">{task.completedAt}</Descriptions.Item>
            )}
          </Descriptions>
          {task.logs.length > 0 && (
            <div style={{ marginTop: 16 }}>
              <h4>执行日志:</h4>
              <div style={{ background: '#f5f5f5', padding: 8, borderRadius: 4, maxHeight: 200, overflow: 'auto' }}>
                {task.logs.map((log, index) => (
                  <div key={index} style={{ fontFamily: 'monospace', fontSize: 12 }}>
                    {log}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ),
      width: 600
    });
  };

  const handleStopTask = (task: AgentDeploymentTask) => {
    message.warning(`停止任务: ${task.description}`);
  };

  const handleGenerateDeployment = async (tool: DeploymentTool) => {
    setLoading(true);
    try {
      const newTask: AgentDeploymentTask = {
        id: Date.now().toString(),
        type: tool.type === 'ci_cd' ? 'create_pipeline' : 'deploy_app',
        platform: tool.name,
        tool: tool.name,
        status: 'running',
        progress: 0,
        description: `使用${tool.name}生成部署配置`,
        createdAt: new Date().toLocaleString(),
        logs: [`${new Date().toLocaleString()} - 开始使用${tool.name}生成部署配置`]
      };
      
      setAgentTasks(prev => [newTask, ...prev]);
      message.success(`开始使用${tool.name}生成部署配置`);
      
      // 模拟进度更新
      const progressInterval = setInterval(() => {
        setAgentTasks(prev => prev.map(task => {
          if (task.id === newTask.id) {
            const newProgress = Math.min(task.progress + 25, 100);
            const newLogs = [...task.logs];
            if (newProgress === 25) newLogs.push(`${new Date().toLocaleString()} - 分析项目结构`);
            if (newProgress === 50) newLogs.push(`${new Date().toLocaleString()} - 生成配置文件`);
            if (newProgress === 75) newLogs.push(`${new Date().toLocaleString()} - 验证配置`);
            if (newProgress === 100) newLogs.push(`${new Date().toLocaleString()} - 配置生成完成`);
            return { ...task, progress: newProgress, logs: newLogs };
          }
          return task;
        }));
      }, 1500);
      
      // 6秒后完成
      setTimeout(() => {
        clearInterval(progressInterval);
        setAgentTasks(prev => prev.map(task => 
          task.id === newTask.id 
            ? { 
                ...task, 
                status: 'completed', 
                progress: 100,
                completedAt: new Date().toLocaleString(),
                result: { configFile: `${tool.name.toLowerCase()}-config.yml`, stages: 4 }
              }
            : task
        ));
        message.success('部署配置生成完成');
      }, 6000);
      
    } catch (error) {
      message.error('生成部署配置失败');
    } finally {
      setLoading(false);
    }
  };

  const handleViewTemplate = (template: DeploymentTemplate) => {
    setSelectedTemplate(template);
    setTemplateModalVisible(true);
  };

  const handleUseTemplate = async (template: DeploymentTemplate) => {
    setLoading(true);
    try {
      const newTask: AgentDeploymentTask = {
        id: Date.now().toString(),
        type: 'create_pipeline',
        platform: template.platform,
        tool: 'Template Generator',
        status: 'running',
        progress: 0,
        description: `基于模板"${template.name}"生成部署配置`,
        createdAt: new Date().toLocaleString(),
        logs: [`${new Date().toLocaleString()} - 开始基于模板生成配置`]
      };
      
      setAgentTasks(prev => [newTask, ...prev]);
      message.success(`开始基于模板"${template.name}"生成配置`);
      
      // 模拟进度
      setTimeout(() => {
        setAgentTasks(prev => prev.map(task => 
          task.id === newTask.id 
            ? { 
                ...task, 
                status: 'completed', 
                progress: 100,
                completedAt: new Date().toLocaleString(),
                logs: [
                  ...task.logs,
                  `${new Date().toLocaleString()} - 解析模板变量`,
                  `${new Date().toLocaleString()} - 生成配置文件`,
                  `${new Date().toLocaleString()} - 配置生成完成`
                ],
                result: { templateUsed: template.name, configGenerated: true }
              }
            : task
        ));
        message.success('基于模板的配置生成完成');
      }, 3000);
      
    } catch (error) {
      message.error('模板配置生成失败');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadTemplate = (template: DeploymentTemplate) => {
    const blob = new Blob([template.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${template.name.replace(/\s+/g, '-').toLowerCase()}.${template.type === 'kubernetes' ? 'yaml' : 'txt'}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    message.success('模板下载完成');
  };

  const handleAddIntegration = () => {
    setIsModalVisible(true);
    setSelectedIntegration(null);
  };

  const renderIntegrationsTab = () => (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Row gutter={16}>
          <Col span={6}>
            <Card>
              <Statistic
                title="已连接平台"
                value={integrations.filter(i => i.status === 'connected').length}
                prefix={<LinkOutlined />}
                valueStyle={{ color: '#3f8600' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="总项目数"
                value={integrations.reduce((sum, i) => sum + i.projects.length, 0)}
                prefix={<DatabaseOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="活跃任务"
                value={agentTasks.filter(t => t.status === 'running').length}
                prefix={<RobotOutlined />}
                valueStyle={{ color: '#cf1322' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="支持工具"
                value={deploymentTools.filter(t => t.supported).length}
                prefix={<ToolOutlined />}
                valueStyle={{ color: '#722ed1' }}
              />
            </Card>
          </Col>
        </Row>
      </div>
      
      <Card 
        title="部署平台集成" 
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAddIntegration}>
            添加集成
          </Button>
        }
      >
        <Table
          columns={integrationColumns}
          dataSource={integrations}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>
    </div>
  );

  const renderDeploymentToolsTab = () => (
    <div>
      <Alert
        message="AI Agent 自动化部署生成"
        description="选择部署工具，AI Agent将自动分析您的项目并生成相应的部署配置和流水线。"
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
      />
      
      <Row gutter={[16, 16]}>
        {deploymentTools.map(tool => (
          <Col span={8} key={tool.id}>
            <Card
              hoverable
              actions={[
                <Button 
                  type="primary" 
                  icon={<RobotOutlined />}
                  onClick={() => handleGenerateDeployment(tool)}
                  disabled={!tool.agentSupport || tool.integrationStatus !== 'configured'}
                >
                  AI生成配置
                </Button>
              ]}
            >
              <Card.Meta
                avatar={<Avatar size={48}>{tool.logo}</Avatar>}
                title={
                  <Space>
                    {tool.name}
                    {tool.agentSupport && <Tag color="green">AI支持</Tag>}
                    {tool.autoGeneration && <Tag color="blue">自动生成</Tag>}
                  </Space>
                }
                description={
                  <div>
                    <p>{tool.description}</p>
                    <Space wrap>
                      <Tag color={tool.integrationStatus === 'configured' ? 'green' : 'orange'}>
                        {tool.integrationStatus === 'configured' ? '已配置' : '可用'}
                      </Tag>
                      <Tag color="blue">{tool.type.toUpperCase()}</Tag>
                    </Space>
                    <Divider style={{ margin: '8px 0' }} />
                    <div>
                      <strong>特性:</strong>
                      <div style={{ marginTop: 4 }}>
                        {tool.features.slice(0, 2).map(feature => (
                          <Tag key={feature}>{feature}</Tag>
                        ))}
                        {tool.features.length > 2 && (
                          <Tooltip title={tool.features.slice(2).join(', ')}>
                            <Tag>+{tool.features.length - 2}</Tag>
                          </Tooltip>
                        )}
                      </div>
                    </div>
                  </div>
                }
              />
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );

  const renderAgentTasksTab = () => (
    <div>
      <Card title="AI Agent 部署任务管理">
        <Table
          columns={agentTaskColumns}
          dataSource={agentTasks}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>
    </div>
  );

  const renderTemplatesTab = () => (
    <div>
      <Alert
        message="部署模板库"
        description="使用预定义的部署模板快速生成配置文件，支持Docker、Kubernetes、CI/CD等多种部署方式。"
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
      />
      
      <Card 
        title="部署模板" 
        extra={
          <Button type="primary" icon={<PlusOutlined />}>
            创建模板
          </Button>
        }
      >
        <Table
          columns={templateColumns}
          dataSource={deploymentTemplates}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>
    </div>
  );

  const renderIntegrationModal = () => (
    <Modal
      title={selectedIntegration ? `${selectedIntegration.name} 详情` : '添加新集成'}
      open={isModalVisible}
      onCancel={() => setIsModalVisible(false)}
      footer={null}
      width={800}
    >
      {selectedIntegration ? (
        <div>
          <Descriptions bordered>
            <Descriptions.Item label="平台名称">{selectedIntegration.name}</Descriptions.Item>
            <Descriptions.Item label="平台类型">{selectedIntegration.platform}</Descriptions.Item>
            <Descriptions.Item label="连接状态">
              <Badge 
                status={selectedIntegration.status === 'connected' ? 'success' : 'error'} 
                text={selectedIntegration.status === 'connected' ? '已连接' : '未连接'} 
              />
            </Descriptions.Item>
            <Descriptions.Item label="平台URL">{selectedIntegration.url}</Descriptions.Item>
            <Descriptions.Item label="AI支持">
              <Tag color={selectedIntegration.agentSupport ? 'green' : 'default'}>
                {selectedIntegration.agentSupport ? '支持' : '不支持'}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="最后同步">{selectedIntegration.lastSync}</Descriptions.Item>
            <Descriptions.Item label="支持功能" span={3}>
              {selectedIntegration.capabilities.map(cap => (
                <Tag key={cap} color="blue">{cap}</Tag>
              ))}
            </Descriptions.Item>
          </Descriptions>
          
          <Divider>关联项目</Divider>
          <List
            dataSource={selectedIntegration.projects}
            renderItem={project => (
              <List.Item
                actions={[
                  <Button type="link" icon={<EyeOutlined />}>查看</Button>,
                  <Button type="link" icon={<PlayCircleOutlined />}>部署</Button>
                ]}
              >
                <List.Item.Meta
                  title={project.name}
                  description={
                    <Space>
                      <span>流水线: {project.pipelines}</span>
                      <span>最后部署: {project.lastDeploy}</span>
                      <span>环境: {project.environments.join(', ')}</span>
                    </Space>
                  }
                />
                <Tag color={project.status === 'active' ? 'green' : 'default'}>
                  {project.status === 'active' ? '活跃' : '非活跃'}
                </Tag>
              </List.Item>
            )}
          />
        </div>
      ) : (
        <Form form={form} layout="vertical">
          <Form.Item label="平台类型" name="platform" rules={[{ required: true }]}>
            <Select placeholder="选择部署平台">
              <Select.Option value="jenkins">Jenkins</Select.Option>
              <Select.Option value="gitlab">GitLab CI</Select.Option>
              <Select.Option value="github">GitHub Actions</Select.Option>
              <Select.Option value="docker">Docker Registry</Select.Option>
              <Select.Option value="kubernetes">Kubernetes</Select.Option>
              <Select.Option value="aws">AWS</Select.Option>
              <Select.Option value="azure">Azure DevOps</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item label="平台名称" name="name" rules={[{ required: true }]}>
            <Input placeholder="输入平台名称" />
          </Form.Item>
          <Form.Item label="平台URL" name="url" rules={[{ required: true }]}>
            <Input placeholder="输入平台访问地址" />
          </Form.Item>
          <Form.Item label="API密钥" name="apiKey">
            <Input.Password placeholder="输入API密钥（可选）" />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" onClick={() => message.success('集成添加成功')}>
                添加集成
              </Button>
              <Button onClick={() => setIsModalVisible(false)}>
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      )}
    </Modal>
  );

  const renderTemplateModal = () => (
    <Modal
      title={`模板详情: ${selectedTemplate?.name}`}
      open={templateModalVisible}
      onCancel={() => setTemplateModalVisible(false)}
      footer={[
        <Button key="download" icon={<DownloadOutlined />} onClick={() => selectedTemplate && handleDownloadTemplate(selectedTemplate)}>
          下载模板
        </Button>,
        <Button key="use" type="primary" icon={<RobotOutlined />} onClick={() => selectedTemplate && handleUseTemplate(selectedTemplate)}>
          AI生成配置
        </Button>
      ]}
      width={800}
    >
      {selectedTemplate && (
        <div>
          <Descriptions bordered>
            <Descriptions.Item label="模板名称">{selectedTemplate.name}</Descriptions.Item>
            <Descriptions.Item label="类型">{selectedTemplate.type}</Descriptions.Item>
            <Descriptions.Item label="平台">{selectedTemplate.platform}</Descriptions.Item>
            <Descriptions.Item label="使用次数">{selectedTemplate.usageCount}</Descriptions.Item>
            <Descriptions.Item label="创建时间">{selectedTemplate.createdAt}</Descriptions.Item>
            <Descriptions.Item label="描述" span={3}>{selectedTemplate.description}</Descriptions.Item>
          </Descriptions>
          
          <Divider>模板变量</Divider>
          <Table
            size="small"
            dataSource={selectedTemplate.variables}
            columns={[
              { title: '变量名', dataIndex: 'name', key: 'name' },
              { title: '类型', dataIndex: 'type', key: 'type' },
              { title: '描述', dataIndex: 'description', key: 'description' },
              { title: '必填', dataIndex: 'required', key: 'required', render: (required) => required ? '是' : '否' },
              { title: '默认值', dataIndex: 'defaultValue', key: 'defaultValue', render: (value) => value || '-' }
            ]}
            pagination={false}
          />
          
          <Divider>模板内容</Divider>
          <div style={{ background: '#f5f5f5', padding: 12, borderRadius: 4, maxHeight: 300, overflow: 'auto' }}>
            <pre style={{ margin: 0, fontSize: 12, fontFamily: 'monospace' }}>
              {selectedTemplate.content}
            </pre>
          </div>
        </div>
      )}
    </Modal>
  );

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">智能部署平台集成中心</h1>
        <p className="text-gray-600">
          通过AI Agent连接和操作各种开源部署平台，实现CI/CD流水线和部署配置的自动生成
        </p>
      </div>

      <Tabs 
        activeKey={activeTab} 
        onChange={setActiveTab}
        items={[
          {
            key: 'integrations',
            label: (
              <Space>
                <LinkOutlined />
                平台集成
              </Space>
            ),
            children: renderIntegrationsTab()
          },
          {
            key: 'tools',
            label: (
              <Space>
                <ToolOutlined />
                部署工具
              </Space>
            ),
            children: renderDeploymentToolsTab()
          },
          {
            key: 'templates',
            label: (
              <Space>
                <CodeOutlined />
                部署模板
              </Space>
            ),
            children: renderTemplatesTab()
          },
          {
            key: 'agents',
            label: (
              <Space>
                <RobotOutlined />
                Agent任务
                {agentTasks.filter(t => t.status === 'running').length > 0 && (
                  <Badge count={agentTasks.filter(t => t.status === 'running').length} />
                )}
              </Space>
            ),
            children: renderAgentTasksTab()
          }
        ]}
      />

      {renderIntegrationModal()}
      {renderTemplateModal()}
    </div>
  );
};

export default DeploymentPlatform;