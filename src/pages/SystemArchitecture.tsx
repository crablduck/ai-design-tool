import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Button,
  Input,
  Select,
  Table,
  Tabs,
  Typography,
  Space,
  Tag,
  Modal,
  Form,
  message,
  Tooltip,
  Badge,
  Divider,
  Alert,
  Tree,
  Progress,
  Collapse,
  List,
  Avatar
} from 'antd';
import {
  ClusterOutlined,
  NodeIndexOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  LinkOutlined,
  SearchOutlined,
  ExportOutlined,
  ImportOutlined,
  BranchesOutlined,
  SettingOutlined,
  EyeOutlined,
  ApiOutlined,
  DatabaseOutlined,
  CloudOutlined,
  SecurityScanOutlined,
  MonitorOutlined,
  DeploymentUnitOutlined,
  CloudServerOutlined,
  HddOutlined,
  ThunderboltOutlined,
  ShareAltOutlined
} from '@ant-design/icons';
import type { TreeDataNode } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { MermaidChart } from '../components/Chart/MermaidChart';

const { Title, Text, Paragraph } = Typography;
const { Search } = Input;
const { Option } = Select;
// const { TabPane } = Tabs; // 已弃用，使用items属性替代
const { TextArea } = Input;
const { Panel } = Collapse;

interface ArchitectureModule {
  id: string;
  name: string;
  type: 'frontend' | 'backend' | 'database' | 'service' | 'gateway' | 'cache' | 'queue' | 'compute' | 'storage' | 'stream' | 'broker';
  description?: string;
  technology: string;
  version?: string;
  dependencies: string[];
  interfaces: ModuleInterface[];
  position?: { x: number; y: number };
  color?: string;
  status: 'active' | 'deprecated' | 'planned';
}

interface ModuleInterface {
  id: string;
  name: string;
  type: 'REST' | 'GraphQL' | 'gRPC' | 'WebSocket' | 'Database' | 'Message' | 'SQL' | 'File System' | 'Web' | 'MQTT';
  endpoint?: string;
  method?: string;
  description?: string;
}

interface ModuleConnection {
  id: string;
  name: string;
  sourceModule: string;
  targetModule: string;
  type: 'sync' | 'async' | 'database' | 'cache' | 'stream';
  protocol: string;
  description?: string;
}

interface ArchitectureLayer {
  id: string;
  name: string;
  description?: string;
  modules: string[];
  order: number;
}

interface SystemArchitectureData {
  id: string;
  name: string;
  description?: string;
  modules: ArchitectureModule[];
  connections: ModuleConnection[];
  layers: ArchitectureLayer[];
  createdAt: Date;
  updatedAt: Date;
}

const SystemArchitecture: React.FC = () => {
  const [activeTab, setActiveTab] = useState('modules');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedModule, setSelectedModule] = useState<ArchitectureModule | null>(null);
  const [selectedConnection, setSelectedConnection] = useState<ModuleConnection | null>(null);
  const [isModuleModalVisible, setIsModuleModalVisible] = useState(false);
  const [isConnectionModalVisible, setIsConnectionModalVisible] = useState(false);
  const [isArchitectureVisible, setIsArchitectureVisible] = useState(false);
  const [moduleForm] = Form.useForm();
  const [connectionForm] = Form.useForm();
  const [selectedLayer, setSelectedLayer] = useState('all');
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [availableProjects, setAvailableProjects] = useState<any[]>([]);

  // 初始化项目数据
  useEffect(() => {
    // 从localStorage获取当前选择的项目
    const savedProject = localStorage.getItem('selectedProject');
    if (savedProject) {
      setSelectedProject(JSON.parse(savedProject));
    }

    // 模拟可用项目列表
    const mockProjects = [
      { id: '1', name: '电商平台', description: '基于React的现代化电商平台', color: '#1890ff' },
      { id: '2', name: '移动端APP', description: 'React Native跨平台移动应用', color: '#52c41a' },
      { id: '3', name: '微服务网关', description: 'Spring Cloud Gateway微服务网关', color: '#722ed1' },
      { id: '4', name: '数据分析平台', description: '大数据分析和机器学习平台', color: '#fa541c' },
      { id: '5', name: '物联网平台', description: 'IoT设备管理和数据采集平台', color: '#13c2c2' }
    ];
    setAvailableProjects(mockProjects);
  }, []);
  
  // 模拟数据 - 基于选择的项目
  const [architectureData, setArchitectureData] = useState<SystemArchitectureData | null>(null);

  // 当项目改变时，重新加载架构数据
  useEffect(() => {
    if (selectedProject) {
      const projectArchitecture = getArchitectureByProject(selectedProject.id);
      setArchitectureData(projectArchitecture);
    } else {
      setArchitectureData(null);
    }
  }, [selectedProject]);

  const getArchitectureByProject = (projectId: string): SystemArchitectureData => {
    const architectures: { [key: string]: SystemArchitectureData } = {
      '1': { // 电商平台
    id: 'arch-1',
    name: '电商系统架构',
    description: '基于微服务的电商系统架构设计',
    modules: [
      {
        id: 'web-frontend',
        name: 'Web前端',
        type: 'frontend',
        description: '用户界面层，提供Web端交互',
        technology: 'React + TypeScript',
        version: '18.2.0',
        dependencies: ['api-gateway'],
        interfaces: [
          {
            id: 'web-api',
            name: 'Web API调用',
            type: 'REST',
            endpoint: '/api/v1',
            description: '调用后端API接口'
          }
        ],
        position: { x: 100, y: 50 },
        color: '#1890ff',
        status: 'active'
      },
      {
        id: 'mobile-app',
        name: '移动应用',
        type: 'frontend',
        description: 'iOS/Android移动应用',
        technology: 'React Native',
        version: '0.72.0',
        dependencies: ['api-gateway'],
        interfaces: [
          {
            id: 'mobile-api',
            name: 'Mobile API调用',
            type: 'REST',
            endpoint: '/api/mobile/v1',
            description: '移动端API接口'
          }
        ],
        position: { x: 300, y: 50 },
        color: '#52c41a',
        status: 'active'
      },
      {
        id: 'api-gateway',
        name: 'API网关',
        type: 'gateway',
        description: '统一API入口，负责路由、认证、限流',
        technology: 'Kong',
        version: '3.0.0',
        dependencies: ['user-service', 'product-service', 'order-service'],
        interfaces: [
          {
            id: 'gateway-api',
            name: 'Gateway API',
            type: 'REST',
            endpoint: '/api',
            description: 'API网关统一入口'
          }
        ],
        position: { x: 200, y: 150 },
        color: '#fa8c16',
        status: 'active'
      },
      {
        id: 'user-service',
        name: '用户服务',
        type: 'service',
        description: '用户管理、认证授权服务',
        technology: 'Spring Boot',
        version: '2.7.0',
        dependencies: ['user-db', 'redis-cache'],
        interfaces: [
          {
            id: 'user-rest',
            name: 'User REST API',
            type: 'REST',
            endpoint: '/users',
            description: '用户管理REST接口'
          },
          {
            id: 'auth-api',
            name: 'Auth API',
            type: 'REST',
            endpoint: '/auth',
            description: '认证授权接口'
          }
        ],
        position: { x: 50, y: 250 },
        color: '#722ed1',
        status: 'active'
      },
      {
        id: 'product-service',
        name: '商品服务',
        type: 'service',
        description: '商品管理、库存管理服务',
        technology: 'Spring Boot',
        version: '2.7.0',
        dependencies: ['product-db', 'redis-cache'],
        interfaces: [
          {
            id: 'product-rest',
            name: 'Product REST API',
            type: 'REST',
            endpoint: '/products',
            description: '商品管理REST接口'
          }
        ],
        position: { x: 200, y: 250 },
        color: '#eb2f96',
        status: 'active'
      },
      {
        id: 'order-service',
        name: '订单服务',
        type: 'service',
        description: '订单处理、支付集成服务',
        technology: 'Spring Boot',
        version: '2.7.0',
        dependencies: ['order-db', 'message-queue'],
        interfaces: [
          {
            id: 'order-rest',
            name: 'Order REST API',
            type: 'REST',
            endpoint: '/orders',
            description: '订单管理REST接口'
          }
        ],
        position: { x: 350, y: 250 },
        color: '#13c2c2',
        status: 'active'
      },
      {
        id: 'user-db',
        name: '用户数据库',
        type: 'database',
        description: '用户数据存储',
        technology: 'PostgreSQL',
        version: '14.0',
        dependencies: [],
        interfaces: [
          {
            id: 'user-db-conn',
            name: 'Database Connection',
            type: 'Database',
            description: '数据库连接'
          }
        ],
        position: { x: 50, y: 350 },
        color: '#096dd9',
        status: 'active'
      },
      {
        id: 'product-db',
        name: '商品数据库',
        type: 'database',
        description: '商品数据存储',
        technology: 'PostgreSQL',
        version: '14.0',
        dependencies: [],
        interfaces: [
          {
            id: 'product-db-conn',
            name: 'Database Connection',
            type: 'Database',
            description: '数据库连接'
          }
        ],
        position: { x: 200, y: 350 },
        color: '#096dd9',
        status: 'active'
      },
      {
        id: 'order-db',
        name: '订单数据库',
        type: 'database',
        description: '订单数据存储',
        technology: 'PostgreSQL',
        version: '14.0',
        dependencies: [],
        interfaces: [
          {
            id: 'order-db-conn',
            name: 'Database Connection',
            type: 'Database',
            description: '数据库连接'
          }
        ],
        position: { x: 350, y: 350 },
        color: '#096dd9',
        status: 'active'
      },
      {
        id: 'redis-cache',
        name: 'Redis缓存',
        type: 'cache',
        description: '分布式缓存服务',
        technology: 'Redis',
        version: '7.0',
        dependencies: [],
        interfaces: [
          {
            id: 'redis-conn',
            name: 'Redis Connection',
            type: 'Database',
            description: '缓存连接'
          }
        ],
        position: { x: 500, y: 250 },
        color: '#f5222d',
        status: 'active'
      },
      {
        id: 'message-queue',
        name: '消息队列',
        type: 'queue',
        description: '异步消息处理',
        technology: 'RabbitMQ',
        version: '3.11',
        dependencies: [],
        interfaces: [
          {
            id: 'mq-conn',
            name: 'Message Queue',
            type: 'Message',
            description: '消息队列连接'
          }
        ],
        position: { x: 500, y: 350 },
        color: '#fa541c',
        status: 'active'
      }
    ],
    connections: [
      {
        id: 'web-gateway',
        name: 'Web到网关',
        sourceModule: 'web-frontend',
        targetModule: 'api-gateway',
        type: 'sync',
        protocol: 'HTTPS',
        description: 'Web前端通过HTTPS调用API网关'
      },
      {
        id: 'mobile-gateway',
        name: '移动端到网关',
        sourceModule: 'mobile-app',
        targetModule: 'api-gateway',
        type: 'sync',
        protocol: 'HTTPS',
        description: '移动应用通过HTTPS调用API网关'
      },
      {
        id: 'gateway-user',
        name: '网关到用户服务',
        sourceModule: 'api-gateway',
        targetModule: 'user-service',
        type: 'sync',
        protocol: 'HTTP',
        description: 'API网关路由到用户服务'
      },
      {
        id: 'gateway-product',
        name: '网关到商品服务',
        sourceModule: 'api-gateway',
        targetModule: 'product-service',
        type: 'sync',
        protocol: 'HTTP',
        description: 'API网关路由到商品服务'
      },
      {
        id: 'gateway-order',
        name: '网关到订单服务',
        sourceModule: 'api-gateway',
        targetModule: 'order-service',
        type: 'sync',
        protocol: 'HTTP',
        description: 'API网关路由到订单服务'
      },
      {
        id: 'user-userdb',
        name: '用户服务到数据库',
        sourceModule: 'user-service',
        targetModule: 'user-db',
        type: 'database',
        protocol: 'JDBC',
        description: '用户服务访问用户数据库'
      },
      {
        id: 'product-productdb',
        name: '商品服务到数据库',
        sourceModule: 'product-service',
        targetModule: 'product-db',
        type: 'database',
        protocol: 'JDBC',
        description: '商品服务访问商品数据库'
      },
      {
        id: 'order-orderdb',
        name: '订单服务到数据库',
        sourceModule: 'order-service',
        targetModule: 'order-db',
        type: 'database',
        protocol: 'JDBC',
        description: '订单服务访问订单数据库'
      },
      {
        id: 'user-cache',
        name: '用户服务到缓存',
        sourceModule: 'user-service',
        targetModule: 'redis-cache',
        type: 'cache',
        protocol: 'Redis Protocol',
        description: '用户服务使用Redis缓存'
      },
      {
        id: 'product-cache',
        name: '商品服务到缓存',
        sourceModule: 'product-service',
        targetModule: 'redis-cache',
        type: 'cache',
        protocol: 'Redis Protocol',
        description: '商品服务使用Redis缓存'
      },
      {
        id: 'order-queue',
        name: '订单服务到消息队列',
        sourceModule: 'order-service',
        targetModule: 'message-queue',
        type: 'async',
        protocol: 'AMQP',
        description: '订单服务发送异步消息'
      }
    ],
    layers: [
      {
        id: 'presentation',
        name: '表现层',
        description: '用户界面和交互层',
        modules: ['web-frontend', 'mobile-app'],
        order: 1
      },
      {
        id: 'gateway',
        name: '网关层',
        description: 'API网关和路由层',
        modules: ['api-gateway'],
        order: 2
      },
      {
        id: 'business',
        name: '业务层',
        description: '业务逻辑和服务层',
        modules: ['user-service', 'product-service', 'order-service'],
        order: 3
      },
      {
        id: 'data',
        name: '数据层',
        description: '数据存储和缓存层',
        modules: ['user-db', 'product-db', 'order-db', 'redis-cache', 'message-queue'],
        order: 4
      }
    ],
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-20')
  },
  '2': { // 移动端APP
    id: 'arch-2',
    name: '移动应用架构',
    description: 'React Native移动应用架构设计',
    modules: [
      {
        id: 'rn-app',
        name: 'React Native应用',
        type: 'frontend',
        description: '跨平台移动应用',
        technology: 'React Native',
        version: '0.72.0',
        dependencies: ['mobile-api'],
        interfaces: [
          {
            id: 'rn-api',
            name: 'Mobile API调用',
            type: 'REST',
            endpoint: '/api/mobile',
            description: '移动端API接口'
          }
        ],
        position: { x: 200, y: 50 },
        color: '#52c41a',
        status: 'active'
      },
      {
        id: 'mobile-api',
        name: '移动API服务',
        type: 'backend',
        description: '移动端专用API服务',
        technology: 'Node.js',
        version: '18.0.0',
        dependencies: ['mobile-db'],
        interfaces: [
          {
            id: 'mobile-rest',
            name: 'Mobile REST API',
            type: 'REST',
            endpoint: '/api',
            description: '移动端REST接口'
          }
        ],
        position: { x: 200, y: 150 },
        color: '#1890ff',
        status: 'active'
      },
      {
        id: 'mobile-db',
        name: '移动数据库',
        type: 'database',
        description: '移动应用数据存储',
        technology: 'SQLite',
        version: '3.0',
        dependencies: [],
        interfaces: [
          {
            id: 'mobile-db-conn',
            name: 'Database Connection',
            type: 'Database',
            description: '数据库连接'
          }
        ],
        position: { x: 200, y: 250 },
        color: '#096dd9',
        status: 'active'
      }
    ],
    connections: [
      {
        id: 'rn-api',
        name: 'RN应用到API',
        sourceModule: 'rn-app',
        targetModule: 'mobile-api',
        type: 'sync',
        protocol: 'HTTPS',
        description: 'React Native应用调用API服务'
      },
      {
        id: 'api-db',
        name: 'API到数据库',
        sourceModule: 'mobile-api',
        targetModule: 'mobile-db',
        type: 'database',
        protocol: 'SQLite',
        description: 'API服务访问SQLite数据库'
      }
    ],
    layers: [
      {
        id: 'mobile-ui',
        name: '移动界面层',
        description: '移动应用用户界面',
        modules: ['rn-app'],
        order: 1
      },
      {
        id: 'mobile-service',
        name: '移动服务层',
        description: '移动端API服务',
        modules: ['mobile-api'],
        order: 2
      },
      {
        id: 'mobile-data',
        name: '移动数据层',
        description: '移动端数据存储',
        modules: ['mobile-db'],
        order: 3
      }
    ],
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-05')
  },
  '3': { // 微服务网关
    id: 'arch-3',
    name: '微服务网关架构',
    description: 'Spring Cloud Gateway微服务网关架构',
    modules: [
      {
        id: 'gateway-service',
        name: 'Gateway服务',
        type: 'gateway',
        description: 'Spring Cloud Gateway网关',
        technology: 'Spring Cloud Gateway',
        version: '3.0.0',
        dependencies: ['eureka-server', 'config-server'],
        interfaces: [
          {
            id: 'gateway-api',
            name: 'Gateway API',
            type: 'REST',
            endpoint: '/api',
            description: '网关统一入口'
          }
        ],
        position: { x: 200, y: 50 },
        color: '#fa8c16',
        status: 'active'
      },
      {
        id: 'eureka-server',
        name: 'Eureka注册中心',
        type: 'service',
        description: '服务注册与发现',
        technology: 'Spring Cloud Eureka',
        version: '2.0.0',
        dependencies: [],
        interfaces: [
          {
            id: 'eureka-api',
            name: 'Eureka API',
            type: 'REST',
            endpoint: '/eureka',
            description: '服务注册接口'
          }
        ],
        position: { x: 100, y: 150 },
        color: '#722ed1',
        status: 'active'
      },
      {
        id: 'config-server',
        name: '配置中心',
        type: 'service',
        description: '统一配置管理',
        technology: 'Spring Cloud Config',
        version: '2.0.0',
        dependencies: [],
        interfaces: [
          {
            id: 'config-api',
            name: 'Config API',
            type: 'REST',
            endpoint: '/config',
            description: '配置管理接口'
          }
        ],
        position: { x: 300, y: 150 },
        color: '#13c2c2',
        status: 'active'
      }
    ],
    connections: [
      {
        id: 'gateway-eureka',
        name: '网关到注册中心',
        sourceModule: 'gateway-service',
        targetModule: 'eureka-server',
        type: 'sync',
        protocol: 'HTTP',
        description: '网关从注册中心获取服务信息'
      },
      {
        id: 'gateway-config',
        name: '网关到配置中心',
        sourceModule: 'gateway-service',
        targetModule: 'config-server',
        type: 'sync',
        protocol: 'HTTP',
        description: '网关从配置中心获取配置'
      }
    ],
    layers: [
      {
        id: 'gateway-layer',
        name: '网关层',
        description: 'API网关服务',
        modules: ['gateway-service'],
        order: 1
      },
      {
        id: 'infrastructure',
        name: '基础设施层',
        description: '注册中心和配置中心',
        modules: ['eureka-server', 'config-server'],
        order: 2
      }
    ],
    createdAt: new Date('2024-03-10'),
    updatedAt: new Date('2024-03-15')
  },
  '4': { // 数据分析平台
    id: 'arch-4',
    name: '数据分析平台架构',
    description: '大数据分析和机器学习平台架构',
    modules: [
      {
        id: 'data-portal',
        name: '数据门户',
        type: 'frontend',
        description: '数据可视化和分析门户',
        technology: 'React + D3.js',
        version: '1.0.0',
        dependencies: ['analytics-api'],
        interfaces: [
          {
            id: 'portal-ui',
            name: 'Portal UI',
            type: 'Web',
            description: '数据门户用户界面'
          }
        ],
        position: { x: 200, y: 50 },
        color: '#52c41a',
        status: 'active'
      },
      {
        id: 'analytics-api',
        name: '分析API服务',
        type: 'service',
        description: '数据分析和查询API',
        technology: 'Python FastAPI',
        version: '0.95.0',
        dependencies: ['spark-cluster', 'data-warehouse'],
        interfaces: [
          {
            id: 'analytics-rest',
            name: 'Analytics REST API',
            type: 'REST',
            endpoint: '/api/analytics',
            description: '数据分析REST接口'
          }
        ],
        position: { x: 200, y: 150 },
        color: '#1890ff',
        status: 'active'
      },
      {
        id: 'spark-cluster',
        name: 'Spark集群',
        type: 'compute',
        description: '大数据处理和机器学习',
        technology: 'Apache Spark',
        version: '3.4.0',
        dependencies: ['hdfs-storage'],
        interfaces: [
          {
            id: 'spark-api',
            name: 'Spark API',
            type: 'gRPC',
            description: 'Spark作业提交接口'
          }
        ],
        position: { x: 100, y: 250 },
        color: '#fa541c',
        status: 'active'
      },
      {
        id: 'data-warehouse',
        name: '数据仓库',
        type: 'database',
        description: '结构化数据存储',
        technology: 'Apache Hive',
        version: '3.1.0',
        dependencies: ['hdfs-storage'],
        interfaces: [
          {
            id: 'hive-sql',
            name: 'Hive SQL',
            type: 'SQL',
            description: 'Hive查询接口'
          }
        ],
        position: { x: 300, y: 250 },
        color: '#722ed1',
        status: 'active'
      },
      {
        id: 'hdfs-storage',
        name: 'HDFS存储',
        type: 'storage',
        description: '分布式文件系统',
        technology: 'Apache Hadoop HDFS',
        version: '3.3.0',
        dependencies: [],
        interfaces: [
          {
            id: 'hdfs-api',
            name: 'HDFS API',
            type: 'File System',
            description: 'HDFS文件系统接口'
          }
        ],
        position: { x: 200, y: 350 },
        color: '#13c2c2',
        status: 'active'
      },
      {
        id: 'kafka-stream',
        name: 'Kafka流处理',
        type: 'stream',
        description: '实时数据流处理',
        technology: 'Apache Kafka',
        version: '3.5.0',
        dependencies: [],
        interfaces: [
          {
            id: 'kafka-api',
            name: 'Kafka API',
            type: 'Message',
            description: 'Kafka消息接口'
          }
        ],
        position: { x: 400, y: 150 },
        color: '#eb2f96',
        status: 'active'
      }
    ],
    connections: [
      {
        id: 'portal-api',
        name: '门户到API',
        sourceModule: 'data-portal',
        targetModule: 'analytics-api',
        type: 'sync',
        protocol: 'HTTPS',
        description: '数据门户调用分析API'
      },
      {
        id: 'api-spark',
        name: 'API到Spark',
        sourceModule: 'analytics-api',
        targetModule: 'spark-cluster',
        type: 'async',
        protocol: 'RPC',
        description: 'API提交Spark作业'
      },
      {
        id: 'api-warehouse',
        name: 'API到数据仓库',
        sourceModule: 'analytics-api',
        targetModule: 'data-warehouse',
        type: 'sync',
        protocol: 'JDBC',
        description: 'API查询数据仓库'
      },
      {
        id: 'spark-hdfs',
        name: 'Spark到HDFS',
        sourceModule: 'spark-cluster',
        targetModule: 'hdfs-storage',
        type: 'sync',
        protocol: 'HDFS Protocol',
        description: 'Spark读写HDFS数据'
      },
      {
        id: 'warehouse-hdfs',
        name: '数据仓库到HDFS',
        sourceModule: 'data-warehouse',
        targetModule: 'hdfs-storage',
        type: 'sync',
        protocol: 'HDFS Protocol',
        description: '数据仓库存储在HDFS'
      },
      {
        id: 'kafka-spark',
        name: 'Kafka到Spark',
        sourceModule: 'kafka-stream',
        targetModule: 'spark-cluster',
        type: 'stream',
        protocol: 'Kafka Protocol',
        description: 'Kafka流数据到Spark处理'
      }
    ],
    layers: [
      {
        id: 'presentation-layer',
        name: '展示层',
        description: '数据可视化和用户交互',
        modules: ['data-portal'],
        order: 1
      },
      {
        id: 'api-layer',
        name: 'API层',
        description: '数据分析API服务',
        modules: ['analytics-api'],
        order: 2
      },
      {
        id: 'processing-layer',
        name: '处理层',
        description: '数据处理和流处理',
        modules: ['spark-cluster', 'kafka-stream'],
        order: 3
      },
      {
        id: 'storage-layer',
        name: '存储层',
        description: '数据存储和仓库',
        modules: ['data-warehouse', 'hdfs-storage'],
        order: 4
      }
    ],
    createdAt: new Date('2024-02-20'),
    updatedAt: new Date('2024-02-25')
  },
  '5': { // 物联网平台
    id: 'arch-5',
    name: '物联网平台架构',
    description: 'IoT设备管理和数据采集平台',
    modules: [
      {
        id: 'iot-dashboard',
        name: 'IoT控制台',
        type: 'frontend',
        description: '设备管理和监控界面',
        technology: 'Vue.js + ECharts',
        version: '3.0.0',
        dependencies: ['iot-api'],
        interfaces: [
          {
            id: 'dashboard-ui',
            name: 'Dashboard UI',
            type: 'Web',
            description: 'IoT控制台界面'
          }
        ],
        position: { x: 200, y: 50 },
        color: '#52c41a',
        status: 'active'
      },
      {
        id: 'iot-api',
        name: 'IoT API网关',
        type: 'gateway',
        description: '设备API和数据接口',
        technology: 'Spring Boot',
        version: '2.7.0',
        dependencies: ['device-service', 'data-service'],
        interfaces: [
          {
            id: 'iot-rest',
            name: 'IoT REST API',
            type: 'REST',
            endpoint: '/api/iot',
            description: 'IoT设备管理接口'
          }
        ],
        position: { x: 200, y: 150 },
        color: '#fa8c16',
        status: 'active'
      },
      {
        id: 'device-service',
        name: '设备管理服务',
        type: 'service',
        description: '设备注册、配置和状态管理',
        technology: 'Spring Boot',
        version: '2.7.0',
        dependencies: ['device-db'],
        interfaces: [
          {
            id: 'device-api',
            name: 'Device API',
            type: 'REST',
            endpoint: '/devices',
            description: '设备管理接口'
          }
        ],
        position: { x: 100, y: 250 },
        color: '#1890ff',
        status: 'active'
      },
      {
        id: 'data-service',
        name: '数据采集服务',
        type: 'service',
        description: '设备数据采集和处理',
        technology: 'Spring Boot',
        version: '2.7.0',
        dependencies: ['timeseries-db', 'mqtt-broker'],
        interfaces: [
          {
            id: 'data-api',
            name: 'Data API',
            type: 'REST',
            endpoint: '/data',
            description: '数据查询接口'
          }
        ],
        position: { x: 300, y: 250 },
        color: '#722ed1',
        status: 'active'
      },
      {
        id: 'mqtt-broker',
        name: 'MQTT消息代理',
        type: 'broker',
        description: '设备消息通信',
        technology: 'Eclipse Mosquitto',
        version: '2.0.0',
        dependencies: [],
        interfaces: [
          {
            id: 'mqtt-protocol',
            name: 'MQTT Protocol',
            type: 'MQTT',
            description: 'MQTT消息协议'
          }
        ],
        position: { x: 400, y: 150 },
        color: '#13c2c2',
        status: 'active'
      },
      {
        id: 'device-db',
        name: '设备数据库',
        type: 'database',
        description: '设备信息存储',
        technology: 'MongoDB',
        version: '6.0',
        dependencies: [],
        interfaces: [
          {
            id: 'mongo-conn',
            name: 'MongoDB Connection',
            type: 'Database',
            description: 'MongoDB连接'
          }
        ],
        position: { x: 100, y: 350 },
        color: '#096dd9',
        status: 'active'
      },
      {
        id: 'timeseries-db',
        name: '时序数据库',
        type: 'database',
        description: '设备时序数据存储',
        technology: 'InfluxDB',
        version: '2.7',
        dependencies: [],
        interfaces: [
          {
            id: 'influx-conn',
            name: 'InfluxDB Connection',
            type: 'Database',
            description: 'InfluxDB连接'
          }
        ],
        position: { x: 300, y: 350 },
        color: '#f5222d',
        status: 'active'
      }
    ],
    connections: [
      {
        id: 'dashboard-api',
        name: '控制台到API',
        sourceModule: 'iot-dashboard',
        targetModule: 'iot-api',
        type: 'sync',
        protocol: 'HTTPS',
        description: 'IoT控制台调用API网关'
      },
      {
        id: 'api-device',
        name: 'API到设备服务',
        sourceModule: 'iot-api',
        targetModule: 'device-service',
        type: 'sync',
        protocol: 'HTTP',
        description: 'API网关路由到设备服务'
      },
      {
        id: 'api-data',
        name: 'API到数据服务',
        sourceModule: 'iot-api',
        targetModule: 'data-service',
        type: 'sync',
        protocol: 'HTTP',
        description: 'API网关路由到数据服务'
      },
      {
        id: 'device-devicedb',
        name: '设备服务到数据库',
        sourceModule: 'device-service',
        targetModule: 'device-db',
        type: 'database',
        protocol: 'MongoDB Protocol',
        description: '设备服务访问设备数据库'
      },
      {
        id: 'data-timeseries',
        name: '数据服务到时序库',
        sourceModule: 'data-service',
        targetModule: 'timeseries-db',
        type: 'database',
        protocol: 'InfluxDB Protocol',
        description: '数据服务访问时序数据库'
      },
      {
        id: 'data-mqtt',
        name: '数据服务到MQTT',
        sourceModule: 'data-service',
        targetModule: 'mqtt-broker',
        type: 'async',
        protocol: 'MQTT',
        description: '数据服务订阅MQTT消息'
      }
    ],
    layers: [
      {
        id: 'iot-ui',
        name: '用户界面层',
        description: 'IoT设备管理界面',
        modules: ['iot-dashboard'],
        order: 1
      },
      {
        id: 'iot-gateway',
        name: '网关层',
        description: 'IoT API网关',
        modules: ['iot-api'],
        order: 2
      },
      {
        id: 'iot-service',
        name: '服务层',
        description: '设备和数据服务',
        modules: ['device-service', 'data-service'],
        order: 3
      },
      {
        id: 'iot-messaging',
        name: '消息层',
        description: 'MQTT消息代理',
        modules: ['mqtt-broker'],
        order: 4
      },
      {
        id: 'iot-storage',
        name: '存储层',
        description: '设备和时序数据存储',
        modules: ['device-db', 'timeseries-db'],
        order: 5
      }
    ],
    createdAt: new Date('2024-03-01'),
    updatedAt: new Date('2024-03-10')
  }
};
return architectures[projectId] || {
  id: 'default',
  name: '默认架构',
  description: '请选择项目查看架构',
  modules: [],
  connections: [],
  layers: [],
  createdAt: new Date(),
  updatedAt: new Date()
};
};

const handleProjectChange = (projectId: string) => {
  const project = availableProjects.find(p => p.id === projectId);
  if (project) {
    setSelectedProject(project);
    localStorage.setItem('selectedProject', JSON.stringify(project));
    // message.success(`已切换到项目：${project.name}`); // 使用App组件的message实例
  }
};

  // 过滤模块列表
  const filteredModules = architectureData ? architectureData.modules.filter(module => {
    const matchesSearch = searchTerm === '' || 
                         module.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         module.technology.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (module.description && module.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesLayer = selectedLayer === 'all' || 
                        architectureData.layers.some(layer => 
                          layer.id === selectedLayer && layer.modules.includes(module.id)
                        );
    return matchesSearch && matchesLayer;
  }) : [];

  // 模块类型图标映射
  const getModuleIcon = (type: string) => {
    const icons = {
      frontend: <MonitorOutlined />,
      backend: <ApiOutlined />,
      database: <DatabaseOutlined />,
      service: <CloudOutlined />,
      gateway: <SecurityScanOutlined />,
      cache: <DeploymentUnitOutlined />,
      queue: <BranchesOutlined />,
      compute: <CloudServerOutlined />,
      storage: <HddOutlined />,
      stream: <ThunderboltOutlined />,
      broker: <ShareAltOutlined />
    };
    return icons[type as keyof typeof icons] || <NodeIndexOutlined />;
  };

  // 模块表格列配置
  const moduleColumns: ColumnsType<ArchitectureModule> = [
    {
      title: '模块名',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: ArchitectureModule) => (
        <Space>
          {getModuleIcon(record.type)}
          <div 
            className="w-3 h-3 rounded-full" 
            style={{ backgroundColor: record.color || '#1890ff' }}
          />
          <Button type="link" onClick={() => handleEditModule(record)}>
            {text}
          </Button>
        </Space>
      )
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => {
        const colors = {
          frontend: 'blue',
          backend: 'green',
          database: 'purple',
          service: 'orange',
          gateway: 'red',
          cache: 'cyan',
          queue: 'magenta',
          compute: 'volcano',
          storage: 'geekblue',
          stream: 'gold',
          broker: 'lime'
        };
        return <Tag color={colors[type as keyof typeof colors]}>{type}</Tag>;
      }
    },
    {
      title: '技术栈',
      dataIndex: 'technology',
      key: 'technology',
      render: (tech: string, record: ArchitectureModule) => (
        <Space>
          <Text code>{tech}</Text>
          {record.version && <Tag>v{record.version}</Tag>}
        </Space>
      )
    },
    {
      title: '接口数',
      key: 'interfaceCount',
      render: (_: any, record: ArchitectureModule) => (
        <Badge count={record.interfaces.length} showZero />
      )
    },
    {
      title: '依赖数',
      key: 'dependencyCount',
      render: (_: any, record: ArchitectureModule) => (
        <Badge count={record.dependencies.length} showZero />
      )
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const colors = {
          active: 'success',
          deprecated: 'warning',
          planned: 'processing'
        };
        return <Tag color={colors[status as keyof typeof colors]}>{status}</Tag>;
      }
    },
    {
      title: '操作',
      key: 'actions',
      render: (_: any, record: ArchitectureModule) => (
        <Space>
          <Tooltip title="编辑">
            <Button size="small" icon={<EditOutlined />} onClick={() => handleEditModule(record)} />
          </Tooltip>
          <Tooltip title="删除">
            <Button size="small" danger icon={<DeleteOutlined />} onClick={() => handleDeleteModule(record)} />
          </Tooltip>
        </Space>
      )
    }
  ];

  // 连接表格列配置
  const connectionColumns: ColumnsType<ModuleConnection> = [
    {
      title: '连接名',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: '源模块',
      dataIndex: 'sourceModule',
      key: 'sourceModule',
      render: (moduleId: string) => {
        const module = architectureData?.modules.find(m => m.id === moduleId);
        return module ? <Tag color="blue">{module.name}</Tag> : moduleId;
      }
    },
    {
      title: '目标模块',
      dataIndex: 'targetModule',
      key: 'targetModule',
      render: (moduleId: string) => {
        const module = architectureData?.modules.find(m => m.id === moduleId);
        return module ? <Tag color="green">{module.name}</Tag> : moduleId;
      }
    },
    {
      title: '连接类型',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => {
        const colors = {
          sync: 'blue',
          async: 'orange',
          database: 'purple',
          cache: 'cyan',
          stream: 'gold'
        };
        return <Tag color={colors[type as keyof typeof colors]}>{type}</Tag>;
      }
    },
    {
      title: '协议',
      dataIndex: 'protocol',
      key: 'protocol',
      render: (protocol: string) => <Text code>{protocol}</Text>
    },
    {
      title: '操作',
      key: 'actions',
      render: (_: any, record: ModuleConnection) => (
        <Space>
          <Tooltip title="编辑">
            <Button size="small" icon={<EditOutlined />} onClick={() => handleEditConnection(record)} />
          </Tooltip>
          <Tooltip title="删除">
            <Button size="small" danger icon={<DeleteOutlined />} onClick={() => handleDeleteConnection(record)} />
          </Tooltip>
        </Space>
      )
    }
  ];

  // 处理新建模块
  const handleCreateModule = () => {
    setSelectedModule(null);
    moduleForm.resetFields();
    setIsModuleModalVisible(true);
  };

  // 处理编辑模块
  const handleEditModule = (module: ArchitectureModule) => {
    setSelectedModule(module);
    moduleForm.setFieldsValue(module);
    setIsModuleModalVisible(true);
  };

  // 处理删除模块
  const handleDeleteModule = (module: ArchitectureModule) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除模块 "${module.name}" 吗？相关的连接也会被删除。`,
      okText: '删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: () => {
        setArchitectureData(prev => ({
          ...prev,
          modules: prev.modules.filter(m => m.id !== module.id),
          connections: prev.connections.filter(c => 
            c.sourceModule !== module.id && c.targetModule !== module.id
          ),
          updatedAt: new Date()
        }));
        message.success('模块删除成功');
      }
    });
  };

  // 处理新建连接
  const handleCreateConnection = () => {
    setSelectedConnection(null);
    connectionForm.resetFields();
    setIsConnectionModalVisible(true);
  };

  // 处理编辑连接
  const handleEditConnection = (connection: ModuleConnection) => {
    setSelectedConnection(connection);
    connectionForm.setFieldsValue(connection);
    setIsConnectionModalVisible(true);
  };

  // 处理删除连接
  const handleDeleteConnection = (connection: ModuleConnection) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除连接 "${connection.name}" 吗？`,
      okText: '删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: () => {
        setArchitectureData(prev => ({
          ...prev,
          connections: prev.connections.filter(c => c.id !== connection.id),
          updatedAt: new Date()
        }));
        message.success('连接删除成功');
      }
    });
  };

  // 保存模块
  const handleSaveModule = async () => {
    try {
      const values = await moduleForm.validateFields();
      
      if (selectedModule) {
        // 更新模块
        setArchitectureData(prev => ({
          ...prev,
          modules: prev.modules.map(m => 
            m.id === selectedModule.id ? { ...m, ...values } : m
          ),
          updatedAt: new Date()
        }));
        message.success('模块更新成功');
      } else {
        // 新建模块
        const newModule: ArchitectureModule = {
          id: `module-${Date.now()}`,
          ...values,
          dependencies: values.dependencies || [],
          interfaces: [],
          position: { x: 100, y: 100 },
          color: '#1890ff'
        };
        
        setArchitectureData(prev => ({
          ...prev,
          modules: [...prev.modules, newModule],
          updatedAt: new Date()
        }));
        message.success('模块创建成功');
      }
      
      setIsModuleModalVisible(false);
    } catch (error) {
      console.error('保存模块失败:', error);
    }
  };

  // 保存连接
  const handleSaveConnection = async () => {
    try {
      const values = await connectionForm.validateFields();
      
      if (selectedConnection) {
        // 更新连接
        setArchitectureData(prev => ({
          ...prev,
          connections: prev.connections.map(c => 
            c.id === selectedConnection.id ? { ...c, ...values } : c
          ),
          updatedAt: new Date()
        }));
        message.success('连接更新成功');
      } else {
        // 新建连接
        const newConnection: ModuleConnection = {
          id: `connection-${Date.now()}`,
          ...values
        };
        
        setArchitectureData(prev => ({
          ...prev,
          connections: [...prev.connections, newConnection],
          updatedAt: new Date()
        }));
        message.success('连接创建成功');
      }
      
      setIsConnectionModalVisible(false);
    } catch (error) {
      console.error('保存连接失败:', error);
    }
  };

  // 生成架构图的Mermaid代码
  const generateArchitectureDiagram = () => {
    if (!architectureData || !architectureData.modules || architectureData.modules.length === 0) {
      return 'graph TD\n    A["暂无架构数据"]\n    style A fill:#f9f9f9,stroke:#d9d9d9,stroke-dasharray: 5 5';
    }
    
    let mermaidCode = 'graph TD\n';
    
    // 添加模块节点
    architectureData.modules.forEach(module => {
      let nodeShape;
      switch (module.type) {
        case 'database':
          nodeShape = `[("${module.name}")]`;
          break;
        case 'cache':
          nodeShape = `{"${module.name}"}`;
          break;
        case 'queue':
          nodeShape = `{{"${module.name}"}}`;
          break;
        case 'service':
          nodeShape = `["${module.name}"]`;
          break;
        case 'frontend':
          nodeShape = `("${module.name}")`;
          break;
        case 'gateway':
          nodeShape = `>"${module.name}"]`;
          break;
        default:
          nodeShape = `["${module.name}"]`;
      }
      mermaidCode += `    ${module.id}${nodeShape}\n`;
      
      // 添加节点样式
      if (module.color) {
        mermaidCode += `    style ${module.id} fill:${module.color},stroke:#333,stroke-width:2px\n`;
      }
    });
    
    // 添加连接
    architectureData.connections.forEach(conn => {
      let arrow;
      switch (conn.type) {
        case 'async':
          arrow = `-.->|"${conn.protocol || 'async'}"|`;
          break;
        case 'database':
          arrow = `-->|"${conn.protocol || 'DB'}"|`;
          break;
        case 'cache':
          arrow = `-->|"${conn.protocol || 'cache'}"|`;
          break;
        case 'sync':
          arrow = `-->|"${conn.protocol || 'sync'}"|`;
          break;
        default:
          arrow = '-->';
      }
      mermaidCode += `    ${conn.sourceModule} ${arrow} ${conn.targetModule}\n`;
    });
    
    return mermaidCode;
  };

  // 生成分层架构图
  const generateLayeredDiagram = () => {
    if (!architectureData || !architectureData.layers || architectureData.layers.length === 0) {
      return 'graph TB\n    A["暂无分层数据"]\n    style A fill:#f9f9f9,stroke:#d9d9d9,stroke-dasharray: 5 5';
    }
    
    let mermaidCode = 'graph TB\n';
    
    // 按层级组织模块
    const sortedLayers = architectureData.layers.sort((a, b) => a.order - b.order);
    
    sortedLayers.forEach((layer, layerIndex) => {
      // 添加层级子图
      mermaidCode += `    subgraph L${layerIndex}["${layer.name}"]\n`;
      mermaidCode += `        direction LR\n`;
      
      layer.modules.forEach(moduleId => {
        const module = architectureData.modules.find(m => m.id === moduleId);
        if (module) {
          let nodeShape;
          switch (module.type) {
            case 'database':
              nodeShape = `[("${module.name}")]`;
              break;
            case 'cache':
              nodeShape = `{"${module.name}"}`;
              break;
            case 'queue':
              nodeShape = `{{"${module.name}"}}`;
              break;
            case 'service':
              nodeShape = `["${module.name}"]`;
              break;
            case 'frontend':
              nodeShape = `("${module.name}")`;
              break;
            case 'gateway':
              nodeShape = `>"${module.name}"]`;
              break;
            default:
              nodeShape = `["${module.name}"]`;
          }
          mermaidCode += `        ${moduleId}${nodeShape}\n`;
          
          // 添加节点样式
          if (module.color) {
            mermaidCode += `        style ${moduleId} fill:${module.color},stroke:#333,stroke-width:2px\n`;
          }
        }
      });
      
      mermaidCode += `    end\n`;
    });
    
    // 添加跨层连接
    architectureData.connections.forEach(conn => {
      let arrow;
      switch (conn.type) {
        case 'async':
          arrow = `-.->|"${conn.protocol || 'async'}"|`;
          break;
        case 'database':
          arrow = `-->|"${conn.protocol || 'DB'}"|`;
          break;
        case 'cache':
          arrow = `-->|"${conn.protocol || 'cache'}"|`;
          break;
        case 'sync':
          arrow = `-->|"${conn.protocol || 'sync'}"|`;
          break;
        default:
          arrow = '-->';
      }
      mermaidCode += `    ${conn.sourceModule} ${arrow} ${conn.targetModule}\n`;
    });
    
    return mermaidCode;
  };

  // 计算架构复杂度
  const calculateComplexity = () => {
    if (!architectureData || !architectureData.modules || architectureData.modules.length === 0) {
      return { level: 'low', score: 0, color: 'success' };
    }
    
    const moduleCount = architectureData.modules.length;
    const connectionCount = architectureData.connections.length;
    const avgDependencies = architectureData.modules.reduce((sum, m) => sum + m.dependencies.length, 0) / moduleCount;
    
    const complexityScore = (moduleCount * 0.3) + (connectionCount * 0.5) + (avgDependencies * 0.2);
    
    if (complexityScore < 10) return { level: 'low', score: complexityScore, color: 'success' };
    if (complexityScore < 20) return { level: 'medium', score: complexityScore, color: 'warning' };
    return { level: 'high', score: complexityScore, color: 'error' };
  };

  const complexity = calculateComplexity();

  return (
    <div className="p-6">
      {/* 项目选择器 */}
      <div className="mb-6">
        <Card size="small">
          <div className="flex items-center gap-4">
            <Text strong>选择项目:</Text>
            <Select
              placeholder="请选择一个项目"
              value={selectedProject}
              onChange={handleProjectChange}
              style={{ width: 300 }}
              allowClear
            >
              {availableProjects.map(project => (
                <Option key={project.id} value={project.id}>
                  <Space>
                    <Avatar size="small" style={{ backgroundColor: project.color }}>
                      {project.name.charAt(0)}
                    </Avatar>
                    {project.name}
                  </Space>
                </Option>
              ))}
            </Select>
            {!selectedProject && (
              <Text type="secondary">请先选择一个项目以查看其系统架构</Text>
            )}
          </div>
        </Card>
      </div>

      {/* 页面头部 */}
      <div className="mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <Title level={2} className="mb-2">
              <ClusterOutlined className="mr-2" />
              系统架构设计
              {selectedProject && (
                <Text type="secondary" className="ml-2 text-base font-normal">
                  - {availableProjects.find(p => p.id === selectedProject)?.name}
                </Text>
              )}
            </Title>
            <Text type="secondary" className="text-lg">
              设计和管理系统架构、模块关系和依赖图谱
            </Text>
          </div>
          <Space>
            <Button 
              icon={<ImportOutlined />}
              disabled={!selectedProject}
            >
              导入架构
            </Button>
            <Button 
              icon={<ExportOutlined />}
              disabled={!selectedProject || !architectureData}
            >
              导出架构
            </Button>
            <Button
              type="primary"
              icon={<EyeOutlined />}
              onClick={() => setIsArchitectureVisible(true)}
              disabled={!selectedProject || !architectureData}
            >
              查看架构图
            </Button>
          </Space>
        </div>
        
        {/* 架构统计 */}
        {architectureData ? (
          <Row gutter={16} className="mb-4">
            <Col span={4}>
              <Card size="small">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {architectureData.modules.length}
                  </div>
                  <div className="text-gray-500">模块数量</div>
                </div>
              </Card>
            </Col>
            <Col span={4}>
              <Card size="small">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {architectureData.connections.length}
                  </div>
                  <div className="text-gray-500">连接数量</div>
                </div>
              </Card>
            </Col>
            <Col span={4}>
              <Card size="small">
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {architectureData.layers.length}
                  </div>
                  <div className="text-gray-500">架构层级</div>
                </div>
              </Card>
            </Col>
            <Col span={4}>
              <Card size="small">
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {architectureData.modules.reduce((sum, m) => sum + m.interfaces.length, 0)}
                  </div>
                  <div className="text-gray-500">接口总数</div>
                </div>
              </Card>
            </Col>
            <Col span={4}>
              <Card size="small">
                <div className="text-center">
                  <div className={`text-2xl font-bold text-${complexity.color === 'success' ? 'green' : complexity.color === 'warning' ? 'yellow' : 'red'}-600`}>
                    {complexity.level.toUpperCase()}
                  </div>
                  <div className="text-gray-500">复杂度</div>
                </div>
              </Card>
            </Col>
            <Col span={4}>
              <Card size="small">
                <div className="text-center">
                  <div className="text-2xl font-bold text-cyan-600">
                    {Math.round(complexity.score)}
                  </div>
                  <div className="text-gray-500">复杂度分数</div>
                </div>
              </Card>
            </Col>
          </Row>
        ) : (
          <div className="mb-4">
            <Card size="small">
              <div className="text-center py-8">
                <Text type="secondary" className="text-lg">
                  {selectedProject ? '该项目暂无架构数据' : '请选择项目以查看架构统计信息'}
                </Text>
              </div>
            </Card>
          </div>
        )}
      </div>
      
      {/* 主要内容 */}
      <Card>
        {!selectedProject ? (
          <div className="text-center py-16">
            <ClusterOutlined className="text-6xl text-gray-300 mb-4" />
            <Title level={3} type="secondary">请选择项目</Title>
            <Text type="secondary">选择一个项目以查看和管理其系统架构</Text>
          </div>
        ) : !architectureData ? (
          <div className="text-center py-16">
            <ClusterOutlined className="text-6xl text-gray-300 mb-4" />
            <Title level={3} type="secondary">暂无架构数据</Title>
            <Text type="secondary">该项目还没有架构数据，请先创建模块和连接</Text>
            <div className="mt-4">
              <Button type="primary" icon={<PlusOutlined />} onClick={handleCreateModule}>
                创建第一个模块
              </Button>
            </div>
          </div>
        ) : (
          <Tabs 
            activeKey={activeTab} 
            onChange={setActiveTab}
            items={[
              {
                key: 'modules',
                label: (
                  <Space>
                    <NodeIndexOutlined />
                    <span>模块管理</span>
                    <Badge count={architectureData.modules.length} showZero />
                  </Space>
                ),
                children: (
                  <div>
                    <div className="mb-4">
                      <Row gutter={16} align="middle">
                        <Col span={6}>
                          <Search
                            placeholder="搜索模块名、技术栈或描述"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            allowClear
                          />
                        </Col>
                        <Col span={4}>
                          <Select
                            placeholder="选择架构层级"
                            value={selectedLayer}
                            onChange={setSelectedLayer}
                            style={{ width: '100%' }}
                          >
                            <Option value="all">全部层级</Option>
                            {architectureData.layers.map(layer => (
                              <Option key={layer.id} value={layer.id}>{layer.name}</Option>
                            ))}
                          </Select>
                        </Col>
                        <Col span={6}>
                          <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={handleCreateModule}
                          >
                            新建模块
                          </Button>
                        </Col>
                        <Col span={8}>
                          <Text type="secondary">
                            共 {filteredModules.length} 个模块
                          </Text>
                        </Col>
                      </Row>
                    </div>
                    
                    <Table
                      dataSource={filteredModules}
                      columns={moduleColumns}
                      rowKey="id"
                      pagination={{ pageSize: 10 }}
                      expandable={{
                        expandedRowRender: (record: ArchitectureModule) => (
                          <div className="p-4">
                            <Row gutter={16}>
                              <Col span={12}>
                                <Title level={5}>接口列表</Title>
                                <List
                                  size="small"
                                  dataSource={record.interfaces}
                                  renderItem={(item) => (
                                    <List.Item>
                                      <List.Item.Meta
                                        avatar={<Avatar icon={getModuleIcon(item.type)} />}
                                        title={item.name}
                                        description={`${item.type} - ${item.endpoint || item.description}`}
                                      />
                                    </List.Item>
                                  )}
                                />
                              </Col>
                              <Col span={12}>
                                <Title level={5}>依赖模块</Title>
                                <Space wrap>
                                  {record.dependencies.map(depId => {
                                    const depModule = architectureData.modules.find(m => m.id === depId);
                                    return (
                                      <Tag key={depId} icon={<LinkOutlined />}>
                                        {depModule ? depModule.name : depId}
                                      </Tag>
                                    );
                                  })}
                                </Space>
                              </Col>
                            </Row>
                          </div>
                        ),
                        rowExpandable: (record: ArchitectureModule) => 
                          record.interfaces.length > 0 || record.dependencies.length > 0
                      }}
                    />
                  </div>
                )
              },
              {
                key: 'connections',
                label: (
                  <Space>
                    <LinkOutlined />
                    <span>连接管理</span>
                    <Badge count={architectureData.connections.length} showZero />
                  </Space>
                ),
                children: (
                  <div>
                    <div className="mb-4">
                      <Row gutter={16} align="middle">
                        <Col span={8}>
                          <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={handleCreateConnection}
                          >
                            新建连接
                          </Button>
                        </Col>
                        <Col span={8}>
                          <Text type="secondary">
                            共 {architectureData.connections.length} 个连接
                          </Text>
                        </Col>
                      </Row>
                    </div>
                    
                    <Table
                      dataSource={architectureData.connections}
                      columns={connectionColumns}
                      rowKey="id"
                      pagination={{ pageSize: 10 }}
                    />
                  </div>
                )
              },
              {
                key: 'layers',
                label: (
                  <Space>
                    <BranchesOutlined />
                    <span>架构层级</span>
                    <Badge count={architectureData.layers.length} showZero />
                  </Space>
                ),
                children: (
            <Collapse>
              {architectureData.layers
                .sort((a, b) => a.order - b.order)
                .map(layer => (
                  <Panel 
                    key={layer.id} 
                    header={
                      <Space>
                        <Tag color="blue">Layer {layer.order}</Tag>
                        <span>{layer.name}</span>
                        <Badge count={layer.modules.length} showZero />
                      </Space>
                    }
                  >
                    <div className="mb-4">
                      <Paragraph>{layer.description}</Paragraph>
                    </div>
                    
                    <Row gutter={[16, 16]}>
                      {layer.modules.map(moduleId => {
                        const module = architectureData.modules.find(m => m.id === moduleId);
                        return module ? (
                          <Col key={moduleId} span={8}>
                            <Card size="small">
                              <Card.Meta
                                avatar={
                                  <Avatar 
                                    style={{ backgroundColor: module.color }}
                                    icon={getModuleIcon(module.type)}
                                  />
                                }
                                title={module.name}
                                description={
                                  <div>
                                    <Tag color="blue">{module.type}</Tag>
                                    <Text code>{module.technology}</Text>
                                  </div>
                                }
                              />
                            </Card>
                          </Col>
                        ) : null;
                      })}
                    </Row>
                  </Panel>
                ))
              }
            </Collapse>
                )
              }
            ]}
          />
        )}
      </Card>
      
      {/* 模块编辑模态框 */}
      <Modal
        title={`${selectedModule ? '编辑' : '新建'}模块`}
        open={isModuleModalVisible}
        onCancel={() => setIsModuleModalVisible(false)}
        onOk={handleSaveModule}
        width={800}
      >
        <Form form={moduleForm} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="模块名"
                rules={[{ required: true, message: '请输入模块名' }]}
              >
                <Input placeholder="如：用户服务" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="type"
                label="模块类型"
                rules={[{ required: true, message: '请选择模块类型' }]}
              >
                <Select placeholder="选择模块类型">
                  <Option value="frontend">前端</Option>
                  <Option value="backend">后端</Option>
                  <Option value="database">数据库</Option>
                  <Option value="service">服务</Option>
                  <Option value="gateway">网关</Option>
                  <Option value="cache">缓存</Option>
                  <Option value="queue">队列</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="technology"
                label="技术栈"
                rules={[{ required: true, message: '请输入技术栈' }]}
              >
                <Input placeholder="如：Spring Boot" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="version"
                label="版本"
              >
                <Input placeholder="如：2.7.0" />
              </Form.Item>
            </Col>
          </Row>
          
          <Form.Item
            name="description"
            label="描述"
          >
            <TextArea rows={3} placeholder="模块功能描述" />
          </Form.Item>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="status"
                label="状态"
                rules={[{ required: true, message: '请选择状态' }]}
              >
                <Select placeholder="选择状态">
                  <Option value="active">活跃</Option>
                  <Option value="deprecated">已废弃</Option>
                  <Option value="planned">计划中</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="color"
                label="颜色"
              >
                <Select placeholder="选择颜色">
                  <Option value="#1890ff">蓝色</Option>
                  <Option value="#52c41a">绿色</Option>
                  <Option value="#fa8c16">橙色</Option>
                  <Option value="#eb2f96">粉色</Option>
                  <Option value="#722ed1">紫色</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          
          <Form.Item
            name="dependencies"
            label="依赖模块"
          >
            <Select
              mode="multiple"
              placeholder="选择依赖的模块"
              options={architectureData?.modules
                ?.filter(m => m.id !== selectedModule?.id)
                ?.map(m => ({ label: m.name, value: m.id })) || []
              }
            />
          </Form.Item>
        </Form>
      </Modal>
      
      {/* 连接编辑模态框 */}
      <Modal
        title={`${selectedConnection ? '编辑' : '新建'}连接`}
        open={isConnectionModalVisible}
        onCancel={() => setIsConnectionModalVisible(false)}
        onOk={handleSaveConnection}
        width={600}
      >
        <Form form={connectionForm} layout="vertical">
          <Form.Item
            name="name"
            label="连接名"
            rules={[{ required: true, message: '请输入连接名' }]}
          >
            <Input placeholder="如：用户服务到数据库" />
          </Form.Item>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="sourceModule"
                label="源模块"
                rules={[{ required: true, message: '请选择源模块' }]}
              >
                <Select placeholder="选择源模块">
                  {architectureData?.modules?.map(module => (
                    <Option key={module.id} value={module.id}>{module.name}</Option>
                  )) || []}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="targetModule"
                label="目标模块"
                rules={[{ required: true, message: '请选择目标模块' }]}
              >
                <Select placeholder="选择目标模块">
                  {architectureData?.modules?.map(module => (
                    <Option key={module.id} value={module.id}>{module.name}</Option>
                  )) || []}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="type"
                label="连接类型"
                rules={[{ required: true, message: '请选择连接类型' }]}
              >
                <Select placeholder="选择连接类型">
                  <Option value="sync">同步调用</Option>
                  <Option value="async">异步调用</Option>
                  <Option value="database">数据库连接</Option>
                  <Option value="cache">缓存连接</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="protocol"
                label="协议"
                rules={[{ required: true, message: '请输入协议' }]}
              >
                <Input placeholder="如：HTTP, HTTPS, JDBC" />
              </Form.Item>
            </Col>
          </Row>
          
          <Form.Item
            name="description"
            label="描述"
          >
            <TextArea rows={3} placeholder="连接描述" />
          </Form.Item>
        </Form>
      </Modal>
      
      {/* 架构图查看模态框 */}
      <Modal
        title={architectureData?.name || '系统架构'}
        open={isArchitectureVisible}
        onCancel={() => setIsArchitectureVisible(false)}
        width={1400}
        footer={[
          <Button key="close" onClick={() => setIsArchitectureVisible(false)}>
            关闭
          </Button>
        ]}
      >
        <Tabs 
          defaultActiveKey="architecture"
          items={[
            {
              key: 'architecture',
              label: '架构图',
              children: (
                <MermaidChart
                  chart={{
                    id: 'architecture-diagram',
                    type: 'flowchart',
                    code: generateArchitectureDiagram(),
                    title: '系统架构图'
                  }}
                  height={600}
                />
              )
            },
            {
              key: 'layered',
              label: '分层架构',
              children: (
                <MermaidChart
                  chart={{
                    id: 'layered-diagram',
                    type: 'flowchart',
                    code: generateLayeredDiagram(),
                    title: '分层架构图'
                  }}
                  height={600}
                />
              )
            }
          ]}
        />
      </Modal>
    </div>
  );
};

export default SystemArchitecture;