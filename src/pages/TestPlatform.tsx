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
  Tree,
  Radio,
  Checkbox,
  DatePicker,
  Slider
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
  ApiOutlined,
  BugOutlined,
  ExperimentOutlined,
  FileTextOutlined,
  BarChartOutlined,
  LineChartOutlined,
  PieChartOutlined,
  FunctionOutlined,
  GlobalOutlined,
  MobileOutlined,
  DesktopOutlined,
  TabletOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { DataNode } from 'antd/es/tree';

// const { TabPane } = Tabs; // 已弃用，使用items属性替代
const { Option } = Select;

// 测试平台集成接口定义
interface TestPlatformIntegration {
  id: string;
  name: string;
  type: 'unit_test' | 'integration_test' | 'e2e_test' | 'performance_test' | 'security_test' | 'api_test';
  platform: string; // Jest, Cypress, Selenium, JMeter, etc.
  status: 'connected' | 'disconnected' | 'error';
  url: string;
  apiKey?: string;
  lastSync?: string;
  projects: IntegratedTestProject[];
  capabilities: string[];
  agentSupport: boolean;
}

interface IntegratedTestProject {
  id: string;
  name: string;
  platform: string;
  url: string;
  testSuites: number;
  lastRun?: string;
  status: 'active' | 'inactive';
  coverage: number;
  passRate: number;
}

interface TestTool {
  id: string;
  name: string;
  type: 'unit_test' | 'integration_test' | 'e2e_test' | 'performance_test' | 'security_test' | 'api_test';
  description: string;
  logo: string;
  supported: boolean;
  integrationStatus: 'available' | 'configured' | 'error';
  agentSupport: boolean;
  autoGeneration: boolean;
  features: string[];
  languages: string[];
}

interface AgentTestTask {
  id: string;
  type: 'generate_tests' | 'run_tests' | 'analyze_coverage' | 'performance_test' | 'security_scan' | 'api_test';
  platform: string;
  tool: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  description: string;
  result?: TestResult;
  createdAt: string;
  completedAt?: string;
  logs: string[];
}

interface TestResult {
  totalTests: number;
  passedTests: number;
  failedTests: number;
  skippedTests: number;
  coverage: number;
  duration: number;
  reportUrl?: string;
}

interface TestTemplate {
  id: string;
  name: string;
  type: 'unit' | 'integration' | 'e2e' | 'performance' | 'api';
  description: string;
  framework: string;
  content: string;
  variables: TestTemplateVariable[];
  createdAt: string;
  usageCount: number;
  language: string;
}

interface TestTemplateVariable {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'select' | 'array';
  description: string;
  required: boolean;
  defaultValue?: any;
  options?: string[];
}

interface TestReport {
  id: string;
  name: string;
  type: 'unit' | 'integration' | 'e2e' | 'performance' | 'security';
  status: 'passed' | 'failed' | 'running';
  totalTests: number;
  passedTests: number;
  failedTests: number;
  coverage: number;
  duration: number;
  createdAt: string;
  reportUrl: string;
  environment: string;
}

const TestPlatform: React.FC = () => {
  const [activeTab, setActiveTab] = useState('integrations');
  const [integrations, setIntegrations] = useState<TestPlatformIntegration[]>([]);
  const [testTools, setTestTools] = useState<TestTool[]>([]);
  const [agentTasks, setAgentTasks] = useState<AgentTestTask[]>([]);
  const [testTemplates, setTestTemplates] = useState<TestTemplate[]>([]);
  const [testReports, setTestReports] = useState<TestReport[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState<TestPlatformIntegration | null>(null);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [templateModalVisible, setTemplateModalVisible] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<TestTemplate | null>(null);
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [selectedReport, setSelectedReport] = useState<TestReport | null>(null);

  // 模拟数据初始化
  useEffect(() => {
    // 模拟测试平台集成数据
    const mockIntegrations: TestPlatformIntegration[] = [
      {
        id: '1',
        name: 'Jest单元测试平台',
        type: 'unit_test',
        platform: 'Jest',
        status: 'connected',
        url: 'https://jest-platform.example.com',
        apiKey: 'jest_api_key_***',
        lastSync: '2024-12-20 10:30:00',
        projects: [
          {
            id: 'p1',
            name: 'Frontend Tests',
            platform: 'Jest',
            url: 'https://jest-platform.example.com/projects/frontend',
            testSuites: 25,
            lastRun: '2024-12-20 09:45:00',
            status: 'active',
            coverage: 85,
            passRate: 92
          }
        ],
        capabilities: ['单元测试', '快照测试', '覆盖率分析'],
        agentSupport: true
      },
      {
        id: '2',
        name: 'Cypress E2E测试平台',
        type: 'e2e_test',
        platform: 'Cypress',
        status: 'connected',
        url: 'https://cypress-dashboard.example.com',
        apiKey: 'cypress_api_key_***',
        lastSync: '2024-12-20 11:00:00',
        projects: [
          {
            id: 'p2',
            name: 'E2E Test Suite',
            platform: 'Cypress',
            url: 'https://cypress-dashboard.example.com/projects/e2e',
            testSuites: 12,
            lastRun: '2024-12-20 10:30:00',
            status: 'active',
            coverage: 78,
            passRate: 88
          }
        ],
        capabilities: ['端到端测试', '视觉回归测试', 'API测试'],
        agentSupport: true
      },
      {
        id: '3',
        name: 'JMeter性能测试平台',
        type: 'performance_test',
        platform: 'JMeter',
        status: 'disconnected',
        url: 'https://jmeter-platform.example.com',
        projects: [],
        capabilities: ['负载测试', '压力测试', '性能监控'],
        agentSupport: false
      }
    ];

    // 模拟测试工具数据
    const mockTestTools: TestTool[] = [
      {
        id: '1',
        name: 'Jest',
        type: 'unit_test',
        description: 'JavaScript测试框架，专注于简洁性',
        logo: 'https://jestjs.io/img/jest.png',
        supported: true,
        integrationStatus: 'configured',
        agentSupport: true,
        autoGeneration: true,
        features: ['快照测试', '模拟函数', '覆盖率报告'],
        languages: ['JavaScript', 'TypeScript']
      },
      {
        id: '2',
        name: 'Cypress',
        type: 'e2e_test',
        description: '现代化的端到端测试框架',
        logo: 'https://cypress.io/static/cypress-logo.png',
        supported: true,
        integrationStatus: 'configured',
        agentSupport: true,
        autoGeneration: true,
        features: ['实时重载', '时间旅行', '自动等待'],
        languages: ['JavaScript', 'TypeScript']
      },
      {
        id: '3',
        name: 'Selenium',
        type: 'e2e_test',
        description: 'Web应用程序自动化测试工具',
        logo: 'https://selenium.dev/images/selenium_logo_square_green.png',
        supported: true,
        integrationStatus: 'available',
        agentSupport: false,
        autoGeneration: false,
        features: ['跨浏览器测试', '多语言支持', '并行执行'],
        languages: ['Java', 'Python', 'C#', 'JavaScript']
      },
      {
        id: '4',
        name: 'JMeter',
        type: 'performance_test',
        description: 'Apache JMeter性能测试工具',
        logo: 'https://jmeter.apache.org/images/jmeter_square.png',
        supported: true,
        integrationStatus: 'available',
        agentSupport: true,
        autoGeneration: true,
        features: ['负载测试', '压力测试', '分布式测试'],
        languages: ['Java', 'Groovy']
      }
    ];

    // 模拟Agent任务数据
    const mockAgentTasks: AgentTestTask[] = [
      {
        id: '1',
        type: 'generate_tests',
        platform: 'Jest',
        tool: 'Jest',
        status: 'completed',
        progress: 100,
        description: '为React组件生成单元测试',
        result: {
          totalTests: 15,
          passedTests: 13,
          failedTests: 2,
          skippedTests: 0,
          coverage: 85,
          duration: 12.5,
          reportUrl: '/reports/jest-unit-tests'
        },
        createdAt: '2024-12-20 10:00:00',
        completedAt: '2024-12-20 10:08:00',
        logs: [
          '10:00:00 - 开始分析React组件',
          '10:02:00 - 识别组件props和state',
          '10:04:00 - 生成测试用例',
          '10:06:00 - 执行测试',
          '10:08:00 - 测试完成，生成报告'
        ]
      },
      {
        id: '2',
        type: 'run_tests',
        platform: 'Cypress',
        tool: 'Cypress',
        status: 'running',
        progress: 75,
        description: '执行端到端测试套件',
        createdAt: '2024-12-20 11:00:00',
        logs: [
          '11:00:00 - 启动Cypress测试',
          '11:02:00 - 执行登录流程测试',
          '11:05:00 - 执行用户管理测试',
          '11:08:00 - 执行数据展示测试...'
        ]
      },
      {
        id: '3',
        type: 'performance_test',
        platform: 'JMeter',
        tool: 'JMeter',
        status: 'pending',
        progress: 0,
        description: '执行API性能压力测试',
        createdAt: '2024-12-20 11:30:00',
        logs: []
      }
    ];

    // 模拟测试模板数据
    const mockTestTemplates: TestTemplate[] = [
      {
        id: '1',
        name: 'React组件单元测试',
        type: 'unit',
        description: 'React组件的Jest单元测试模板',
        framework: 'Jest',
        language: 'JavaScript',
        content: `import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import {{COMPONENT_NAME}} from './{{COMPONENT_NAME}}';

describe('{{COMPONENT_NAME}}', () => {
  test('renders without crashing', () => {
    render(<{{COMPONENT_NAME}} />);
  });

  test('displays correct content', () => {
    const props = {
      {{PROPS}}
    };
    render(<{{COMPONENT_NAME}} {...props} />);
    
    expect(screen.getByText('{{EXPECTED_TEXT}}')).toBeInTheDocument();
  });

  test('handles user interactions', () => {
    const mockHandler = jest.fn();
    render(<{{COMPONENT_NAME}} onClick={mockHandler} />);
    
    fireEvent.click(screen.getByRole('button'));
    expect(mockHandler).toHaveBeenCalledTimes(1);
  });

  test('matches snapshot', () => {
    const { container } = render(<{{COMPONENT_NAME}} />);
    expect(container.firstChild).toMatchSnapshot();
  });
});`,
        variables: [
          { name: 'COMPONENT_NAME', type: 'string', description: '组件名称', required: true },
          { name: 'PROPS', type: 'string', description: '组件属性', required: false, defaultValue: '' },
          { name: 'EXPECTED_TEXT', type: 'string', description: '期望显示的文本', required: true }
        ],
        createdAt: '2024-12-15',
        usageCount: 28
      },
      {
        id: '2',
        name: 'Cypress E2E测试',
        type: 'e2e',
        description: 'Cypress端到端测试模板',
        framework: 'Cypress',
        language: 'JavaScript',
        content: `describe('{{TEST_SUITE_NAME}}', () => {
  beforeEach(() => {
    cy.visit('{{BASE_URL}}');
  });

  it('should {{TEST_DESCRIPTION}}', () => {
    // 登录操作
    cy.get('[data-testid="username"]').type('{{USERNAME}}');
    cy.get('[data-testid="password"]').type('{{PASSWORD}}');
    cy.get('[data-testid="login-button"]').click();

    // 验证登录成功
    cy.url().should('include', '/dashboard');
    cy.get('[data-testid="welcome-message"]').should('be.visible');

    // 执行主要测试逻辑
    {{TEST_STEPS}}

    // 验证结果
    cy.get('[data-testid="{{RESULT_ELEMENT}}"]').should('contain', '{{EXPECTED_RESULT}}');
  });

  it('should handle error cases', () => {
    // 错误场景测试
    {{ERROR_TEST_STEPS}}
  });
});`,
        variables: [
          { name: 'TEST_SUITE_NAME', type: 'string', description: '测试套件名称', required: true },
          { name: 'BASE_URL', type: 'string', description: '基础URL', required: true, defaultValue: 'http://localhost:3000' },
          { name: 'USERNAME', type: 'string', description: '测试用户名', required: true, defaultValue: 'testuser' },
          { name: 'PASSWORD', type: 'string', description: '测试密码', required: true, defaultValue: 'testpass' },
          { name: 'TEST_DESCRIPTION', type: 'string', description: '测试描述', required: true },
          { name: 'TEST_STEPS', type: 'string', description: '测试步骤', required: true },
          { name: 'RESULT_ELEMENT', type: 'string', description: '结果元素ID', required: true },
          { name: 'EXPECTED_RESULT', type: 'string', description: '期望结果', required: true },
          { name: 'ERROR_TEST_STEPS', type: 'string', description: '错误测试步骤', required: false }
        ],
        createdAt: '2024-12-18',
        usageCount: 15
      }
    ];

    // 模拟测试报告数据
    const mockTestReports: TestReport[] = [
      {
        id: '1',
        name: 'Frontend单元测试报告',
        type: 'unit',
        status: 'passed',
        totalTests: 156,
        passedTests: 148,
        failedTests: 8,
        coverage: 87,
        duration: 45.2,
        createdAt: '2024-12-20 10:30:00',
        reportUrl: '/reports/unit-test-20241220-1030',
        environment: 'development'
      },
      {
        id: '2',
        name: 'E2E测试报告',
        type: 'e2e',
        status: 'failed',
        totalTests: 24,
        passedTests: 20,
        failedTests: 4,
        coverage: 0,
        duration: 180.5,
        createdAt: '2024-12-20 11:15:00',
        reportUrl: '/reports/e2e-test-20241220-1115',
        environment: 'staging'
      },
      {
        id: '3',
        name: '性能测试报告',
        type: 'performance',
        status: 'running',
        totalTests: 8,
        passedTests: 5,
        failedTests: 0,
        coverage: 0,
        duration: 0,
        createdAt: '2024-12-20 11:45:00',
        reportUrl: '/reports/performance-test-20241220-1145',
        environment: 'production'
      }
    ];

    setIntegrations(mockIntegrations);
    setTestTools(mockTestTools);
    setAgentTasks(mockAgentTasks);
    setTestTemplates(mockTestTemplates);
    setTestReports(mockTestReports);
  }, []);

  // 集成平台列表列定义
  const integrationColumns: ColumnsType<TestPlatformIntegration> = [
    {
      title: '集成名称',
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
      title: '测试类型',
      dataIndex: 'type',
      key: 'type',
      render: (type) => {
        const typeMap = {
          unit_test: { color: 'blue', text: '单元测试', icon: <FunctionOutlined /> },
          integration_test: { color: 'green', text: '集成测试', icon: <LinkOutlined /> },
          e2e_test: { color: 'orange', text: 'E2E测试', icon: <GlobalOutlined /> },
          performance_test: { color: 'purple', text: '性能测试', icon: <ThunderboltOutlined /> },
          security_test: { color: 'red', text: '安全测试', icon: <SecurityScanOutlined /> },
          api_test: { color: 'cyan', text: 'API测试', icon: <ApiOutlined /> }
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
      title: '测试项目',
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
  const agentTaskColumns: ColumnsType<AgentTestTask> = [
    {
      title: '任务类型',
      dataIndex: 'type',
      key: 'type',
      render: (type) => {
        const typeMap = {
          generate_tests: { color: 'blue', text: '生成测试', icon: <CodeOutlined /> },
          run_tests: { color: 'green', text: '执行测试', icon: <PlayCircleOutlined /> },
          analyze_coverage: { color: 'orange', text: '覆盖率分析', icon: <BarChartOutlined /> },
          performance_test: { color: 'purple', text: '性能测试', icon: <ThunderboltOutlined /> },
          security_scan: { color: 'red', text: '安全扫描', icon: <SecurityScanOutlined /> },
          api_test: { color: 'cyan', text: 'API测试', icon: <ApiOutlined /> }
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
            {record.result && status === 'completed' && (
              <div style={{ fontSize: 12, color: '#666' }}>
                通过率: {((record.result.passedTests / record.result.totalTests) * 100).toFixed(1)}%
              </div>
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
          {record.result?.reportUrl && (
            <Button type="link" icon={<FileTextOutlined />} onClick={() => handleViewReport(record.result!.reportUrl!)}>
              报告
            </Button>
          )}
        </Space>
      )
    }
  ];

  // 测试报告列表列定义
  const testReportColumns: ColumnsType<TestReport> = [
    {
      title: '报告名称',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Space>
          <Avatar size="small" style={{ 
            backgroundColor: record.status === 'passed' ? '#52c41a' : 
                           record.status === 'failed' ? '#ff4d4f' : '#1890ff' 
          }}>
            {record.type === 'unit' ? '🧪' : 
             record.type === 'e2e' ? '🌐' : 
             record.type === 'performance' ? '⚡' : 
             record.type === 'security' ? '🔒' : '🔧'}
          </Avatar>
          <span>{text}</span>
        </Space>
      )
    },
    {
      title: '测试类型',
      dataIndex: 'type',
      key: 'type',
      render: (type) => {
        const typeMap = {
          unit: { color: 'blue', text: '单元测试' },
          integration: { color: 'green', text: '集成测试' },
          e2e: { color: 'orange', text: 'E2E测试' },
          performance: { color: 'purple', text: '性能测试' },
          security: { color: 'red', text: '安全测试' }
        };
        const config = typeMap[type as keyof typeof typeMap];
        return <Tag color={config.color}>{config.text}</Tag>;
      }
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const statusMap = {
          passed: { color: 'success' as const, text: '通过', icon: <CheckCircleOutlined /> },
          failed: { color: 'error' as const, text: '失败', icon: <CloseCircleOutlined /> },
          running: { color: 'processing' as const, text: '运行中', icon: <SyncOutlined spin /> }
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
      title: '测试结果',
      key: 'testResults',
      render: (_, record) => (
        <Space direction="vertical" size="small">
          <div style={{ fontSize: 12 }}>
            总计: {record.totalTests} | 通过: {record.passedTests} | 失败: {record.failedTests}
          </div>
          <div style={{ fontSize: 12 }}>
            通过率: {record.totalTests > 0 ? ((record.passedTests / record.totalTests) * 100).toFixed(1) : 0}%
            {record.coverage > 0 && ` | 覆盖率: ${record.coverage}%`}
          </div>
        </Space>
      )
    },
    {
      title: '执行时间',
      dataIndex: 'duration',
      key: 'duration',
      render: (duration) => duration > 0 ? `${duration.toFixed(1)}s` : '-'
    },
    {
      title: '环境',
      dataIndex: 'environment',
      key: 'environment',
      render: (env) => <Tag color="geekblue">{env}</Tag>
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
          <Button type="link" icon={<EyeOutlined />} onClick={() => handleViewReportDetail(record)}>
            查看
          </Button>
          <Button type="link" icon={<DownloadOutlined />} onClick={() => handleDownloadReport(record)}>
            下载
          </Button>
          <Button type="link" icon={<LinkOutlined />} onClick={() => handleOpenReport(record.reportUrl)}>
            打开
          </Button>
        </Space>
      )
    }
  ];

  // 事件处理函数
  const handleViewIntegration = (integration: TestPlatformIntegration) => {
    setSelectedIntegration(integration);
    setIsModalVisible(true);
  };

  const handleConfigIntegration = (integration: TestPlatformIntegration) => {
    message.info(`配置 ${integration.name} 集成`);
  };

  const handleSyncIntegration = async (integration: TestPlatformIntegration) => {
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

  const handleViewTask = (task: AgentTestTask) => {
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
          {task.result && (
            <div style={{ marginTop: 16 }}>
              <h4>测试结果:</h4>
              <Descriptions bordered size="small">
                <Descriptions.Item label="总测试数">{task.result.totalTests}</Descriptions.Item>
                <Descriptions.Item label="通过数">{task.result.passedTests}</Descriptions.Item>
                <Descriptions.Item label="失败数">{task.result.failedTests}</Descriptions.Item>
                <Descriptions.Item label="跳过数">{task.result.skippedTests}</Descriptions.Item>
                <Descriptions.Item label="覆盖率">{task.result.coverage}%</Descriptions.Item>
                <Descriptions.Item label="执行时间">{task.result.duration}s</Descriptions.Item>
              </Descriptions>
            </div>
          )}
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
      width: 700
    });
  };

  const handleStopTask = (task: AgentTestTask) => {
    message.warning(`停止任务: ${task.description}`);
  };

  const handleViewReport = (reportUrl: string) => {
    window.open(reportUrl, '_blank');
  };

  const handleGenerateTest = async (tool: TestTool) => {
    setLoading(true);
    try {
      const newTask: AgentTestTask = {
        id: Date.now().toString(),
        type: tool.type === 'unit_test' ? 'generate_tests' : 
              tool.type === 'performance_test' ? 'performance_test' : 'run_tests',
        platform: tool.name,
        tool: tool.name,
        status: 'running',
        progress: 0,
        description: `使用${tool.name}生成${tool.type === 'unit_test' ? '单元' : tool.type === 'e2e_test' ? 'E2E' : '性能'}测试`,
        createdAt: new Date().toLocaleString(),
        logs: [`${new Date().toLocaleString()} - 开始使用${tool.name}生成测试`]
      };
      
      setAgentTasks(prev => [newTask, ...prev]);
      message.success(`开始使用${tool.name}生成测试`);
      
      // 模拟进度
      setTimeout(() => {
        setAgentTasks(prev => prev.map(task => 
          task.id === newTask.id 
            ? { 
                ...task, 
                status: 'completed' as const, 
                progress: 100,
                completedAt: new Date().toLocaleString(),
                logs: [
                  ...task.logs,
                  `${new Date().toLocaleString()} - 分析代码结构`,
                  `${new Date().toLocaleString()} - 生成测试用例`,
                  `${new Date().toLocaleString()} - 执行测试`,
                  `${new Date().toLocaleString()} - 测试完成`
                ]
              }
            : task
        ));
        message.success('测试生成完成');
        setLoading(false);
      }, 3000);
      
    } catch (error) {
      message.error('测试生成失败');
      setLoading(false);
    }
  };

  const handleViewTemplate = (template: TestTemplate) => {
    setSelectedTemplate(template);
    setTemplateModalVisible(true);
  };

  const handleDownloadTemplate = (template: TestTemplate) => {
    const blob = new Blob([template.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${template.name.replace(/\s+/g, '-').toLowerCase()}.${template.framework.toLowerCase()}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    message.success('模板下载完成');
  };

  const handleUseTemplate = async (template: TestTemplate) => {
    setLoading(true);
    try {
      const newTask: AgentTestTask = {
        id: Date.now().toString(),
        type: 'generate_tests',
        platform: template.framework,
        tool: 'Template Generator',
        status: 'running',
        progress: 0,
        description: `基于模板"${template.name}"生成测试`,
        createdAt: new Date().toLocaleString(),
        logs: [`${new Date().toLocaleString()} - 开始基于模板生成测试`]
      };
      
      setAgentTasks(prev => [newTask, ...prev]);
      message.success(`开始基于模板"${template.name}"生成测试`);
      
      // 模拟进度
      setTimeout(() => {
        const mockResult: TestResult = {
          totalTests: Math.floor(Math.random() * 20) + 5,
          passedTests: 0,
          failedTests: 0,
          skippedTests: 0,
          coverage: Math.floor(Math.random() * 20) + 80,
          duration: Math.random() * 30 + 5,
          reportUrl: `/reports/template-${template.id}-${Date.now()}`
        };
        mockResult.passedTests = Math.floor(mockResult.totalTests * 0.9);
        mockResult.failedTests = mockResult.totalTests - mockResult.passedTests;
        
        setAgentTasks(prev => prev.map(task => 
          task.id === newTask.id 
            ? { 
                ...task, 
                status: 'completed' as const, 
                progress: 100,
                completedAt: new Date().toLocaleString(),
                logs: [
                  ...task.logs,
                  `${new Date().toLocaleString()} - 解析模板变量`,
                  `${new Date().toLocaleString()} - 生成测试文件`,
                  `${new Date().toLocaleString()} - 执行测试`,
                  `${new Date().toLocaleString()} - 测试完成`
                ],
                result: mockResult
              }
            : task
        ));
        message.success('基于模板的测试生成完成');
        setLoading(false);
      }, 3000);
      
    } catch (error) {
      message.error('模板测试生成失败');
      setLoading(false);
    }
  };

  const handleSaveIntegration = async () => {
    try {
      const values = await form.validateFields();
      message.success('集成配置保存成功');
      setIsModalVisible(false);
      form.resetFields();
    } catch (error) {
      message.error('保存失败');
    }
  };

  const handleViewReportDetail = (report: TestReport) => {
    message.info(`查看报告详情: ${report.name}`);
  };

  const handleDownloadReport = (report: TestReport) => {
    message.success(`下载报告: ${report.name}`);
  };

  const handleOpenReport = (reportUrl: string) => {
    window.open(reportUrl, '_blank');
  };

  // 渲染函数
  const renderIntegrations = () => (
    <Card>
      <div className="mb-4 flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">测试平台集成</h3>
          <p className="text-gray-600">管理与外部测试平台的集成连接</p>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalVisible(true)}>
          添加集成
        </Button>
      </div>
      <Table
        dataSource={integrations}
        columns={integrationColumns}
        rowKey="id"
        pagination={{ pageSize: 10 }}
      />
    </Card>
  );

  const renderTestTools = () => (
    <div className="space-y-4">
      <Card>
        <div className="mb-4">
          <h3 className="text-lg font-semibold">可用测试工具</h3>
          <p className="text-gray-600">选择测试工具并通过AI Agent自动生成测试</p>
        </div>
        <Row gutter={[16, 16]}>
          {testTools.map(tool => (
            <Col key={tool.id} xs={24} sm={12} md={8} lg={6}>
              <Card
                size="small"
                hoverable
                actions={[
                  <Button 
                    key="generate" 
                    type="primary" 
                    size="small"
                    disabled={!tool.agentSupport}
                    onClick={() => handleGenerateTest(tool)}
                  >
                    生成测试
                  </Button>
                ]}
              >
                <Card.Meta
                  avatar={<Avatar src={tool.logo} />}
                  title={tool.name}
                  description={
                    <div>
                      <p className="text-xs text-gray-600 mb-2">{tool.description}</p>
                      <div className="flex flex-wrap gap-1">
                        <Tag color={tool.supported ? 'green' : 'red'}>
                          {tool.supported ? '已支持' : '未支持'}
                        </Tag>
                        {tool.agentSupport && (
                          <Tag color="blue">AI支持</Tag>
                        )}
                      </div>
                    </div>
                  }
                />
              </Card>
            </Col>
          ))}
        </Row>
      </Card>
    </div>
  );

  const renderAgentTasks = () => (
    <Card>
      <div className="mb-4">
        <h3 className="text-lg font-semibold">AI Agent任务</h3>
        <p className="text-gray-600">查看AI Agent执行的测试任务状态</p>
      </div>
      <Table
        dataSource={agentTasks}
        columns={agentTaskColumns}
        rowKey="id"
        pagination={{ pageSize: 10 }}
      />
    </Card>
  );

  const renderTestTemplates = () => (
    <Card>
      <div className="mb-4">
        <h3 className="text-lg font-semibold">测试模板</h3>
        <p className="text-gray-600">使用预定义模板快速生成测试</p>
      </div>
      <Row gutter={[16, 16]}>
        {testTemplates.map(template => (
          <Col key={template.id} xs={24} sm={12} md={8}>
            <Card
              size="small"
              hoverable
              actions={[
                <Button key="view" size="small" onClick={() => handleViewTemplate(template)}>
                  查看
                </Button>,
                <Button key="use" type="primary" size="small" onClick={() => handleUseTemplate(template)}>
                  使用
                </Button>
              ]}
            >
              <Card.Meta
                title={template.name}
                description={
                  <div>
                    <p className="text-xs text-gray-600 mb-2">{template.description}</p>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>框架: {template.framework}</span>
                      <span>使用: {template.usageCount}次</span>
                    </div>
                  </div>
                }
              />
            </Card>
          </Col>
        ))}
      </Row>
    </Card>
  );

  const renderTestReports = () => (
    <Card>
      <div className="mb-4">
        <h3 className="text-lg font-semibold">测试报告</h3>
        <p className="text-gray-600">查看测试执行结果和报告</p>
      </div>
      <Table
        dataSource={testReports}
        columns={testReportColumns}
        rowKey="id"
        pagination={{ pageSize: 10 }}
      />
    </Card>
  );

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">测试平台集成</h1>
        <p className="text-gray-600">集成现有开源测试工具，通过AI Agent自动生成和执行测试</p>
      </div>

      <Tabs 
        activeKey={activeTab} 
        onChange={setActiveTab}
        items={[
          {
            key: 'integrations',
            label: '平台集成',
            children: renderIntegrations()
          },
          {
            key: 'tools',
            label: '测试工具',
            children: renderTestTools()
          },
          {
            key: 'tasks',
            label: 'Agent任务',
            children: renderAgentTasks()
          },
          {
            key: 'templates',
            label: '测试模板',
            children: renderTestTemplates()
          },
          {
            key: 'reports',
            label: '测试报告',
            children: renderTestReports()
          }
        ]}
      />

      {/* 集成配置模态框 */}
      <Modal
        title="配置测试平台集成"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setIsModalVisible(false)}>
            取消
          </Button>,
          <Button key="submit" type="primary" loading={loading} onClick={handleSaveIntegration}>
            保存配置
          </Button>
        ]}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="集成名称" rules={[{ required: true }]}>
            <Input placeholder="请输入集成名称" />
          </Form.Item>
          <Form.Item name="platform" label="平台类型" rules={[{ required: true }]}>
            <Select placeholder="请选择平台类型">
              <Option value="Jenkins">Jenkins</Option>
              <Option value="GitLab CI">GitLab CI</Option>
              <Option value="GitHub Actions">GitHub Actions</Option>
              <Option value="SonarQube">SonarQube</Option>
            </Select>
          </Form.Item>
          <Form.Item name="url" label="平台URL" rules={[{ required: true }]}>
            <Input placeholder="请输入平台URL" />
          </Form.Item>
          <Form.Item name="apiKey" label="API密钥">
            <Input.Password placeholder="请输入API密钥" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 测试模板详情模态框 */}
      <Modal
        title={`测试模板: ${selectedTemplate?.name}`}
        open={templateModalVisible}
        onCancel={() => setTemplateModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setTemplateModalVisible(false)}>
            关闭
          </Button>,
          <Button 
            key="use" 
            type="primary" 
            onClick={() => selectedTemplate && handleUseTemplate(selectedTemplate)}
          >
            使用模板
          </Button>
        ]}
        width={800}
      >
        {selectedTemplate && (
          <div>
            <Descriptions bordered>
              <Descriptions.Item label="模板类型">{selectedTemplate.type}</Descriptions.Item>
              <Descriptions.Item label="测试框架">{selectedTemplate.framework}</Descriptions.Item>
              <Descriptions.Item label="编程语言">{selectedTemplate.language}</Descriptions.Item>
              <Descriptions.Item label="使用次数">{selectedTemplate.usageCount}</Descriptions.Item>
              <Descriptions.Item label="创建时间" span={2}>{selectedTemplate.createdAt}</Descriptions.Item>
              <Descriptions.Item label="描述" span={3}>{selectedTemplate.description}</Descriptions.Item>
            </Descriptions>
            
            <div style={{ marginTop: 16 }}>
              <h4>模板变量:</h4>
              <Table
                dataSource={selectedTemplate.variables}
                columns={[
                  { title: '变量名', dataIndex: 'name', key: 'name' },
                  { title: '类型', dataIndex: 'type', key: 'type' },
                  { title: '必填', dataIndex: 'required', key: 'required', render: (required) => required ? '是' : '否' },
                  { title: '默认值', dataIndex: 'defaultValue', key: 'defaultValue' },
                  { title: '描述', dataIndex: 'description', key: 'description' }
                ]}
                pagination={false}
                size="small"
              />
            </div>
            
            <div style={{ marginTop: 16 }}>
              <h4>模板内容:</h4>
              <pre style={{ background: '#f5f5f5', padding: 12, borderRadius: 4, overflow: 'auto', maxHeight: 300 }}>
                {selectedTemplate.content}
              </pre>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default TestPlatform;