// 核心业务资产页面 - 用例图和领域模型管理中心

import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Button,
  Space,
  Typography,
  Tabs,
  Avatar,
  Tag,
  Modal,
  Input,
  Select,
  Divider,
  Tooltip,
  Badge,
  Empty,
  Dropdown,
  message,
  Spin,
  Form,
  Upload
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CopyOutlined,
  DownloadOutlined,
  EyeOutlined,
  MoreOutlined,
  ProjectOutlined,
  NodeIndexOutlined,
  BranchesOutlined,
  RobotOutlined,
  UploadOutlined,
  ThunderboltOutlined
} from '@ant-design/icons';
import { useCoreAssetsStore } from '@/stores';
import UseCaseDesigner from '../components/Designer/UseCaseDesigner';
import DomainModelDesigner from '../components/Designer/DomainModelDesigner';
import { MermaidChart } from '../components/Chart/MermaidChart';
import { integratedService } from '../services/IntegratedService';
import type { UseCaseModel, DomainModel } from '../types/document';

const { Title, Text, Paragraph } = Typography;
const { Search } = Input;
const { Option } = Select;
const { TextArea } = Input;

// 核心业务资产页面组件
// 检测 Mermaid 图表类型的辅助函数
const detectMermaidChartType = (code: string): 'flowchart' | 'class' | 'sequence' | 'state' | 'pie' | 'gantt' | 'gitgraph' => {
  const trimmedCode = code.trim().toLowerCase();
  
  if (trimmedCode.startsWith('classDiagram')) return 'class';
  if (trimmedCode.startsWith('sequenceDiagram')) return 'sequence';
  if (trimmedCode.startsWith('stateDiagram')) return 'state';
  if (trimmedCode.startsWith('pie')) return 'pie';
  if (trimmedCode.startsWith('gantt')) return 'gantt';
  if (trimmedCode.startsWith('gitGraph')) return 'gitgraph';
  
  // 默认为 flowchart (包括 graph TD, graph LR 等)
  return 'flowchart';
};

export const CoreAssets: React.FC = () => {
  const [activeTab, setActiveTab] = useState('usecase');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [isDesignerVisible, setIsDesignerVisible] = useState(false);
  const [designerType, setDesignerType] = useState<'usecase' | 'domain'>('usecase');
  const [selectedAsset, setSelectedAsset] = useState<UseCaseModel | DomainModel | null>(null);
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);
  
  // AI生成相关状态
  const [isAIGenerating, setIsAIGenerating] = useState(false);
  const [isAIModalVisible, setIsAIModalVisible] = useState(false);
  const [aiGenerationType, setAIGenerationType] = useState<'usecase' | 'domain'>('usecase');
  const [form] = Form.useForm();
  
  // Store hooks
  const {
    useCaseModels,
    domainModels,
    businessProcesses,
    addUseCaseModel,
    addDomainModel,
    updateUseCaseModel,
    updateDomainModel,
    removeUseCaseModel,
    removeDomainModel
  } = useCoreAssetsStore();

  // 添加测试数据（仅在开发环境）
  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && useCaseModels.size === 0 && domainModels.size === 0) {
      // 添加测试用例图
      const testUseCaseModel: UseCaseModel = {
        id: 'test-usecase-1',
        title: '测试用例图',

        
        
        createdAt: new Date(),
        updatedAt: new Date(),
        version: '1.0.0',
        content: {
          actors: [],
          useCases: [],
          relationships: [],
          mermaidCode: `graph TD
    A[用户] --> B[登录系统]
    B --> C{验证成功?}
    C -->|是| D[进入主页]
    C -->|否| E[显示错误信息]
    E --> B
    
    classDef actor fill:#e1f5fe,stroke:#01579b,stroke-width:2px
    classDef usecase fill:#f3e5f5,stroke:#4a148c,stroke-width:2px
    
    class A actor
    class B,D,E usecase`
        }
      };
      
      // 添加测试领域模型
      const testDomainModel: DomainModel = {
        id: 'test-domain-1',
        title: '测试领域模型',

        
        createdAt: new Date(),
        updatedAt: new Date(),
        version: '1.0.0',
        content: {
          entities: [],
          valueObjects: [],
          aggregates: [],
          relationships: [],
          knowledgeGraph: [],
          mermaidCode: `classDiagram
    class User {
        +String id
        +String name
        +String email
        +login()
        +logout()
    }
    
    class Order {
        +String id
        +Date createdAt
        +BigDecimal amount
        +OrderStatus status
        +create()
        +cancel()
    }
    
    class Product {
        +String id
        +String name
        +BigDecimal price
        +Integer stock
    }
    
    User ||--o{ Order : places
    Order ||--o{ Product : contains`
        }
      };
      
      addUseCaseModel(testUseCaseModel);
      addDomainModel(testDomainModel);
    }
  }, [useCaseModels.size, domainModels.size, addUseCaseModel, addDomainModel]);

  // 初始化集成服务
  useEffect(() => {
    const initService = async () => {
      try {
        await integratedService.initialize();
        console.log('集成服务初始化完成');
      } catch (error) {
        console.error('集成服务初始化失败:', error);
        message.error('服务初始化失败，部分功能可能不可用');
      }
    };
    initService();
  }, []);

  // AI生成处理方法
  const handleAIGenerate = async (values: any) => {
    setIsAIGenerating(true);
    try {
      let result;
      if (aiGenerationType === 'usecase') {
        result = await integratedService.generateUseCase(values.requirements);
        addUseCaseModel(result);
        message.success('用例图生成成功！');
      } else {
        result = await integratedService.generateDomainModel(values.businessContext);
        addDomainModel(result);
        message.success('领域模型生成成功！');
      }
      
      setIsAIModalVisible(false);
      form.resetFields();
    } catch (error) {
      console.error('AI生成失败:', error);
      message.error('生成失败，请稍后重试');
    } finally {
      setIsAIGenerating(false);
    }
  };

  // 打开AI生成对话框
  const openAIModal = (type: 'usecase' | 'domain') => {
    setAIGenerationType(type);
    setIsAIModalVisible(true);
    form.resetFields();
  };
  
  // 模拟数据
  const mockUseCaseModels: UseCaseModel[] = [
    {
      id: 'uc-001',
      type: 'usecase',
      title: '用户管理系统',
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-20'),
      metadata: {
        author: 'Product Manager',
        version: '1.2.0',
        tags: ['用户管理', '认证', '核心功能'],
        exportFormats: []
      },
      content: {
        mermaidCode: 'graph TD\n    User[普通用户] --> Login[用户登录]\n    User --> Register[用户注册]\n    User --> Profile[个人信息管理]\n    Admin[管理员] --> Login',
        actors: [
          { id: 'user', name: '普通用户', description: '系统的主要使用者', type: 'primary' },
          { id: 'admin', name: '管理员', description: '系统管理人员', type: 'primary' },
          { id: 'system', name: '系统', description: '外部系统接口', type: 'system' }
        ],
        useCases: [
          { id: 'login', name: '用户登录', description: '用户通过用户名密码登录系统', preconditions: [], postconditions: [], mainFlow: [], priority: 'high' },
          { id: 'register', name: '用户注册', description: '新用户注册账号', preconditions: [], postconditions: [], mainFlow: [], priority: 'medium' },
          { id: 'profile', name: '个人信息管理', description: '用户管理个人信息', preconditions: [], postconditions: [], mainFlow: [], priority: 'medium' },
          { id: 'password', name: '密码管理', description: '用户修改密码', preconditions: [], postconditions: [], mainFlow: [], priority: 'medium' }
        ],
        relationships: [
          { id: 'user-login', source: 'user', target: 'login', type: 'association' },
          { id: 'user-register', source: 'user', target: 'register', type: 'association' },
          { id: 'user-profile', source: 'user', target: 'profile', type: 'association' },
          { id: 'admin-login', source: 'admin', target: 'login', type: 'association' }
        ]
      }
    },
    {
      id: 'uc-002',
      type: 'usecase',
      title: '电商订单系统',
      createdAt: new Date('2024-01-10'),
      updatedAt: new Date('2024-01-25'),
      metadata: {
        author: 'Business Analyst',
        version: '2.1.0',
        tags: ['电商', '订单', '支付'],
        exportFormats: []
      },
      content: {
        mermaidCode: 'graph TD\n    Customer[客户] --> Browse[浏览商品]\n    Customer --> Cart[购物车管理]\n    Customer --> Order[下单]\n    Merchant[商家] --> Fulfill[订单履行]',
        actors: [
          { id: 'customer', name: '客户', description: '购买商品的用户', type: 'primary' },
          { id: 'merchant', name: '商家', description: '销售商品的商户', type: 'primary' },
          { id: 'payment', name: '支付系统', description: '第三方支付服务', type: 'system' }
        ],
        useCases: [
          { id: 'browse', name: '浏览商品', description: '客户浏览商品信息', preconditions: [], postconditions: [], mainFlow: [], priority: 'medium' },
          { id: 'cart', name: '购物车管理', description: '添加、删除购物车商品', preconditions: [], postconditions: [], mainFlow: [], priority: 'medium' },
          { id: 'order', name: '下单', description: '客户提交订单', preconditions: [], postconditions: [], mainFlow: [], priority: 'high' },
          { id: 'payment', name: '支付', description: '订单支付处理', preconditions: [], postconditions: [], mainFlow: [], priority: 'high' },
          { id: 'fulfill', name: '订单履行', description: '商家处理订单', preconditions: [], postconditions: [], mainFlow: [], priority: 'medium' }
        ],
        relationships: [
          { id: 'customer-browse', source: 'customer', target: 'browse', type: 'association' },
          { id: 'customer-cart', source: 'customer', target: 'cart', type: 'association' },
          { id: 'customer-order', source: 'customer', target: 'order', type: 'association' },
          { id: 'merchant-fulfill', source: 'merchant', target: 'fulfill', type: 'association' }
        ]
      }
    },
    {
      id: 'uc-003',
      type: 'usecase',
      title: '内容管理系统',
      createdAt: new Date('2024-01-08'),
      updatedAt: new Date('2024-01-28'),
      metadata: {
        author: 'Content Manager',
        version: '1.5.0',
        tags: ['内容管理', 'CMS', '发布'],
        exportFormats: []
      },
      content: {
        mermaidCode: 'graph TD\n    Editor[编辑者] --> Create[创建内容]\n    Editor --> Edit[编辑内容]\n    Editor --> Review[内容审核]\n    Admin[管理员] --> Publish[发布内容]\n    Reader[读者] --> View[查看内容]',
        actors: [
          { id: 'editor', name: '编辑者', description: '内容创作和编辑人员', type: 'primary' },
          { id: 'admin', name: '管理员', description: '内容审核和发布管理员', type: 'primary' },
          { id: 'reader', name: '读者', description: '内容消费者', type: 'primary' },
          { id: 'search', name: '搜索引擎', description: '外部搜索服务', type: 'system' }
        ],
        useCases: [
          { id: 'create', name: '创建内容', description: '编辑者创建新的内容', preconditions: [], postconditions: [], mainFlow: [], priority: 'high' },
          { id: 'edit', name: '编辑内容', description: '修改已有内容', preconditions: [], postconditions: [], mainFlow: [], priority: 'medium' },
          { id: 'review', name: '内容审核', description: '审核内容质量和合规性', preconditions: [], postconditions: [], mainFlow: [], priority: 'high' },
          { id: 'publish', name: '发布内容', description: '将审核通过的内容发布', preconditions: [], postconditions: [], mainFlow: [], priority: 'high' },
          { id: 'view', name: '查看内容', description: '读者浏览已发布的内容', preconditions: [], postconditions: [], mainFlow: [], priority: 'medium' }
        ],
        relationships: [
          { id: 'editor-create', source: 'editor', target: 'create', type: 'association' },
          { id: 'editor-edit', source: 'editor', target: 'edit', type: 'association' },
          { id: 'editor-review', source: 'editor', target: 'review', type: 'association' },
          { id: 'admin-publish', source: 'admin', target: 'publish', type: 'association' },
          { id: 'reader-view', source: 'reader', target: 'view', type: 'association' }
        ]
      }
    },
    {
      id: 'uc-004',
      type: 'usecase',
      title: '库存管理系统',
      createdAt: new Date('2024-01-05'),
      updatedAt: new Date('2024-01-30'),
      metadata: {
        author: 'Warehouse Manager',
        version: '2.0.0',
        tags: ['库存', '仓储', '物流'],
        exportFormats: []
      },
      content: {
        mermaidCode: 'graph TD\n    Manager[仓库管理员] --> Receive[入库管理]\n    Manager --> Ship[出库管理]\n    Manager --> Count[库存盘点]\n    System[系统] --> Alert[库存预警]\n    Supplier[供应商] --> Deliver[货物配送]',
        actors: [
          { id: 'manager', name: '仓库管理员', description: '负责仓库日常管理', type: 'primary' },
          { id: 'supplier', name: '供应商', description: '货物供应方', type: 'primary' },
          { id: 'system', name: '库存系统', description: '自动化库存管理', type: 'system' },
          { id: 'erp', name: 'ERP系统', description: '企业资源规划系统', type: 'system' }
        ],
        useCases: [
          { id: 'receive', name: '入库管理', description: '处理货物入库流程', preconditions: [], postconditions: [], mainFlow: [], priority: 'high' },
          { id: 'ship', name: '出库管理', description: '处理货物出库流程', preconditions: [], postconditions: [], mainFlow: [], priority: 'high' },
          { id: 'count', name: '库存盘点', description: '定期盘点库存数量', preconditions: [], postconditions: [], mainFlow: [], priority: 'medium' },
          { id: 'alert', name: '库存预警', description: '库存不足时自动预警', preconditions: [], postconditions: [], mainFlow: [], priority: 'medium' },
          { id: 'transfer', name: '库存调拨', description: '不同仓库间货物调拨', preconditions: [], postconditions: [], mainFlow: [], priority: 'medium' }
        ],
        relationships: [
          { id: 'manager-receive', source: 'manager', target: 'receive', type: 'association' },
          { id: 'manager-ship', source: 'manager', target: 'ship', type: 'association' },
          { id: 'manager-count', source: 'manager', target: 'count', type: 'association' },
          { id: 'system-alert', source: 'system', target: 'alert', type: 'association' },
          { id: 'manager-transfer', source: 'manager', target: 'transfer', type: 'association' }
        ]
      }
    },
    {
      id: 'uc-005',
      type: 'usecase',
      title: '客服支持系统',
      createdAt: new Date('2024-01-03'),
      updatedAt: new Date('2024-02-01'),
      metadata: {
        author: 'Customer Service Lead',
        version: '1.8.0',
        tags: ['客服', '工单', '支持'],
        exportFormats: []
      },
      content: {
        mermaidCode: 'graph TD\n    Customer[客户] --> Submit[提交工单]\n    Customer --> Chat[在线咨询]\n    Agent[客服代表] --> Handle[处理工单]\n    Agent --> Escalate[升级工单]\n    Supervisor[主管] --> Review[审核处理]',
        actors: [
          { id: 'customer', name: '客户', description: '需要支持的用户', type: 'primary' },
          { id: 'agent', name: '客服代表', description: '一线客服人员', type: 'primary' },
          { id: 'supervisor', name: '客服主管', description: '客服团队管理者', type: 'primary' },
          { id: 'knowledge', name: '知识库', description: '客服知识管理系统', type: 'system' }
        ],
        useCases: [
          { id: 'submit', name: '提交工单', description: '客户提交支持请求', preconditions: [], postconditions: [], mainFlow: [], priority: 'high' },
          { id: 'chat', name: '在线咨询', description: '实时在线客服对话', preconditions: [], postconditions: [], mainFlow: [], priority: 'high' },
          { id: 'handle', name: '处理工单', description: '客服处理客户问题', preconditions: [], postconditions: [], mainFlow: [], priority: 'high' },
          { id: 'escalate', name: '升级工单', description: '复杂问题升级处理', preconditions: [], postconditions: [], mainFlow: [], priority: 'medium' },
          { id: 'review', name: '审核处理', description: '主管审核处理结果', preconditions: [], postconditions: [], mainFlow: [], priority: 'medium' }
        ],
        relationships: [
          { id: 'customer-submit', source: 'customer', target: 'submit', type: 'association' },
          { id: 'customer-chat', source: 'customer', target: 'chat', type: 'association' },
          { id: 'agent-handle', source: 'agent', target: 'handle', type: 'association' },
          { id: 'agent-escalate', source: 'agent', target: 'escalate', type: 'association' },
          { id: 'supervisor-review', source: 'supervisor', target: 'review', type: 'association' }
        ]
      }
    },
    {
      id: 'uc-006',
      type: 'usecase',
      title: '在线银行系统',
      createdAt: new Date('2024-01-02'),
      updatedAt: new Date('2024-02-05'),
      metadata: {
        author: 'Banking Analyst',
        version: '3.0.0',
        tags: ['银行', '金融', '转账', '安全'],
        exportFormats: []
      },
      content: {
        mermaidCode: 'graph TD\n    Customer[客户] --> Login[登录验证]\n    Customer --> Transfer[转账汇款]\n    Customer --> Balance[查询余额]\n    Customer --> History[交易历史]\n    Teller[柜员] --> Approve[审批交易]\n    System[风控系统] --> Monitor[风险监控]',
        actors: [
          { id: 'customer', name: '银行客户', description: '使用银行服务的个人或企业', type: 'primary' },
          { id: 'teller', name: '银行柜员', description: '银行工作人员', type: 'primary' },
          { id: 'manager', name: '银行经理', description: '银行管理人员', type: 'primary' },
          { id: 'riskSystem', name: '风控系统', description: '风险控制和监控系统', type: 'system' },
          { id: 'paymentGateway', name: '支付网关', description: '第三方支付接口', type: 'system' }
        ],
        useCases: [
          { id: 'login', name: '安全登录', description: '多因子身份验证登录', preconditions: [], postconditions: [], mainFlow: [], priority: 'high' },
          { id: 'transfer', name: '转账汇款', description: '向其他账户转账', preconditions: [], postconditions: [], mainFlow: [], priority: 'high' },
          { id: 'balance', name: '余额查询', description: '查看账户余额和明细', preconditions: [], postconditions: [], mainFlow: [], priority: 'medium' },
          { id: 'history', name: '交易历史', description: '查看历史交易记录', preconditions: [], postconditions: [], mainFlow: [], priority: 'medium' },
          { id: 'approve', name: '交易审批', description: '大额交易人工审批', preconditions: [], postconditions: [], mainFlow: [], priority: 'high' },
          { id: 'monitor', name: '风险监控', description: '实时监控异常交易', preconditions: [], postconditions: [], mainFlow: [], priority: 'high' }
        ],
        relationships: [
          { id: 'customer-login', source: 'customer', target: 'login', type: 'association' },
          { id: 'customer-transfer', source: 'customer', target: 'transfer', type: 'association' },
          { id: 'customer-balance', source: 'customer', target: 'balance', type: 'association' },
          { id: 'customer-history', source: 'customer', target: 'history', type: 'association' },
          { id: 'teller-approve', source: 'teller', target: 'approve', type: 'association' },
          { id: 'riskSystem-monitor', source: 'riskSystem', target: 'monitor', type: 'association' }
        ]
      }
    },
    {
      id: 'uc-007',
      type: 'usecase',
      title: '医院管理系统',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-02-08'),
      metadata: {
        author: 'Healthcare IT Manager',
        version: '2.5.0',
        tags: ['医疗', '预约', '病历', '诊断'],
        exportFormats: []
      },
      content: {
        mermaidCode: 'graph TD\n    Patient[患者] --> Register[患者注册]\n    Patient --> Appointment[预约挂号]\n    Patient --> Payment[费用支付]\n    Doctor[医生] --> Diagnose[诊断治疗]\n    Doctor --> Prescription[开具处方]\n    Nurse[护士] --> Care[护理记录]\n    Admin[管理员] --> Schedule[排班管理]',
        actors: [
          { id: 'patient', name: '患者', description: '接受医疗服务的人员', type: 'primary' },
          { id: 'doctor', name: '医生', description: '提供医疗诊断和治疗', type: 'primary' },
          { id: 'nurse', name: '护士', description: '提供护理服务', type: 'primary' },
          { id: 'admin', name: '医院管理员', description: '医院运营管理人员', type: 'primary' },
          { id: 'pharmacy', name: '药房系统', description: '药品管理系统', type: 'system' },
          { id: 'insurance', name: '医保系统', description: '医疗保险结算系统', type: 'system' }
        ],
        useCases: [
          { id: 'register', name: '患者注册', description: '新患者信息登记', preconditions: [], postconditions: [], mainFlow: [], priority: 'medium' },
          { id: 'appointment', name: '预约挂号', description: '预约医生门诊时间', preconditions: [], postconditions: [], mainFlow: [], priority: 'high' },
          { id: 'diagnose', name: '诊断治疗', description: '医生诊断和制定治疗方案', preconditions: [], postconditions: [], mainFlow: [], priority: 'high' },
          { id: 'prescription', name: '开具处方', description: '医生开具药物处方', preconditions: [], postconditions: [], mainFlow: [], priority: 'high' },
          { id: 'care', name: '护理记录', description: '护士记录护理过程', preconditions: [], postconditions: [], mainFlow: [], priority: 'medium' },
          { id: 'payment', name: '费用支付', description: '医疗费用结算支付', preconditions: [], postconditions: [], mainFlow: [], priority: 'medium' },
          { id: 'schedule', name: '排班管理', description: '医护人员排班安排', preconditions: [], postconditions: [], mainFlow: [], priority: 'medium' }
        ],
        relationships: [
          { id: 'patient-register', source: 'patient', target: 'register', type: 'association' },
          { id: 'patient-appointment', source: 'patient', target: 'appointment', type: 'association' },
          { id: 'patient-payment', source: 'patient', target: 'payment', type: 'association' },
          { id: 'doctor-diagnose', source: 'doctor', target: 'diagnose', type: 'association' },
          { id: 'doctor-prescription', source: 'doctor', target: 'prescription', type: 'association' },
          { id: 'nurse-care', source: 'nurse', target: 'care', type: 'association' },
          { id: 'admin-schedule', source: 'admin', target: 'schedule', type: 'association' }
        ]
      }
    },
    {
      id: 'uc-008',
      type: 'usecase',
      title: '在线教育平台',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-02-10'),
      metadata: {
        author: 'Education Product Manager',
        version: '1.8.0',
        tags: ['教育', '在线学习', '课程', '考试'],
        exportFormats: []
      },
      content: {
        mermaidCode: 'graph TD\n    Student[学生] --> Enroll[课程报名]\n    Student --> Study[在线学习]\n    Student --> Exam[参加考试]\n    Teacher[教师] --> Create[创建课程]\n    Teacher --> Grade[批改作业]\n    Admin[管理员] --> Manage[平台管理]\n    System[学习系统] --> Track[学习跟踪]',
        actors: [
          { id: 'student', name: '学生', description: '在线学习的用户', type: 'primary' },
          { id: 'teacher', name: '教师', description: '课程内容创建者和指导者', type: 'primary' },
          { id: 'admin', name: '平台管理员', description: '教育平台运营管理', type: 'primary' },
          { id: 'parent', name: '家长', description: '学生家长监护人', type: 'primary' },
          { id: 'lms', name: '学习管理系统', description: '学习进度和成绩管理', type: 'system' },
          { id: 'payment', name: '支付系统', description: '课程费用支付处理', type: 'system' }
        ],
        useCases: [
          { id: 'enroll', name: '课程报名', description: '学生选择并报名课程', preconditions: [], postconditions: [], mainFlow: [], priority: 'high' },
          { id: 'study', name: '在线学习', description: '观看视频和完成练习', preconditions: [], postconditions: [], mainFlow: [], priority: 'high' },
          { id: 'exam', name: '在线考试', description: '参加课程考试和测验', preconditions: [], postconditions: [], mainFlow: [], priority: 'high' },
          { id: 'create', name: '创建课程', description: '教师制作课程内容', preconditions: [], postconditions: [], mainFlow: [], priority: 'high' },
          { id: 'grade', name: '批改评分', description: '教师批改作业和考试', preconditions: [], postconditions: [], mainFlow: [], priority: 'medium' },
          { id: 'track', name: '学习跟踪', description: '跟踪学习进度和效果', preconditions: [], postconditions: [], mainFlow: [], priority: 'medium' },
          { id: 'manage', name: '平台管理', description: '用户和内容管理', preconditions: [], postconditions: [], mainFlow: [], priority: 'medium' }
        ],
        relationships: [
          { id: 'student-enroll', source: 'student', target: 'enroll', type: 'association' },
          { id: 'student-study', source: 'student', target: 'study', type: 'association' },
          { id: 'student-exam', source: 'student', target: 'exam', type: 'association' },
          { id: 'teacher-create', source: 'teacher', target: 'create', type: 'association' },
          { id: 'teacher-grade', source: 'teacher', target: 'grade', type: 'association' },
          { id: 'admin-manage', source: 'admin', target: 'manage', type: 'association' },
          { id: 'lms-track', source: 'lms', target: 'track', type: 'association' }
        ]
      }
    },
    {
      id: 'uc-009',
      type: 'usecase',
      title: '物流配送系统',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-02-12'),
      metadata: {
        author: 'Logistics Manager',
        version: '2.2.0',
        tags: ['物流', '配送', '跟踪', '仓储'],
        exportFormats: []
      },
      content: {
        mermaidCode: 'graph TD\n    Sender[寄件人] --> Ship[寄件下单]\n    Receiver[收件人] --> Track[包裹跟踪]\n    Driver[配送员] --> Pickup[取件配送]\n    Warehouse[仓库] --> Sort[分拣处理]\n    System[物流系统] --> Route[路线优化]',
        actors: [
          { id: 'sender', name: '寄件人', description: '发送包裹的客户', type: 'primary' },
          { id: 'receiver', name: '收件人', description: '接收包裹的客户', type: 'primary' },
          { id: 'driver', name: '配送员', description: '负责包裹配送的人员', type: 'primary' },
          { id: 'warehouse', name: '仓库管理员', description: '仓库操作人员', type: 'primary' },
          { id: 'gps', name: 'GPS系统', description: '定位和导航服务', type: 'system' },
          { id: 'payment', name: '支付系统', description: '运费支付处理', type: 'system' }
        ],
        useCases: [
          { id: 'ship', name: '寄件下单', description: '客户提交寄件订单', preconditions: [], postconditions: [], mainFlow: [], priority: 'high' },
          { id: 'pickup', name: '上门取件', description: '配送员上门收取包裹', preconditions: [], postconditions: [], mainFlow: [], priority: 'high' },
          { id: 'sort', name: '分拣处理', description: '仓库分拣和中转处理', preconditions: [], postconditions: [], mainFlow: [], priority: 'high' },
          { id: 'deliver', name: '派送配送', description: '最后一公里配送服务', preconditions: [], postconditions: [], mainFlow: [], priority: 'high' },
          { id: 'track', name: '包裹跟踪', description: '实时查询包裹位置', preconditions: [], postconditions: [], mainFlow: [], priority: 'medium' },
          { id: 'route', name: '路线优化', description: '智能规划配送路线', preconditions: [], postconditions: [], mainFlow: [], priority: 'medium' },
          { id: 'signature', name: '签收确认', description: '收件人签收确认', preconditions: [], postconditions: [], mainFlow: [], priority: 'medium' }
        ],
        relationships: [
          { id: 'sender-ship', source: 'sender', target: 'ship', type: 'association' },
          { id: 'driver-pickup', source: 'driver', target: 'pickup', type: 'association' },
          { id: 'warehouse-sort', source: 'warehouse', target: 'sort', type: 'association' },
          { id: 'driver-deliver', source: 'driver', target: 'deliver', type: 'association' },
          { id: 'receiver-track', source: 'receiver', target: 'track', type: 'association' },
          { id: 'receiver-signature', source: 'receiver', target: 'signature', type: 'association' }
        ]
      }
    },
    {
      id: 'uc-010',
      type: 'usecase',
      title: '智能制造系统',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-02-15'),
      metadata: {
        author: 'Manufacturing Engineer',
        version: '3.1.0',
        tags: ['制造', '生产', 'IoT', '质量控制'],
        exportFormats: []
      },
      content: {
        mermaidCode: 'graph TD\n    Operator[操作员] --> Control[设备控制]\n    QC[质检员] --> Inspect[质量检测]\n    Manager[生产经理] --> Plan[生产计划]\n    System[MES系统] --> Monitor[生产监控]\n    Robot[工业机器人] --> Produce[自动生产]',
        actors: [
          { id: 'operator', name: '设备操作员', description: '操作生产设备的工人', type: 'primary' },
          { id: 'qc', name: '质检员', description: '负责产品质量检测', type: 'primary' },
          { id: 'manager', name: '生产经理', description: '生产计划和管理', type: 'primary' },
          { id: 'engineer', name: '工艺工程师', description: '生产工艺设计和优化', type: 'primary' },
          { id: 'mes', name: 'MES系统', description: '制造执行系统', type: 'system' },
          { id: 'iot', name: 'IoT传感器', description: '物联网设备监控', type: 'system' }
        ],
        useCases: [
          { id: 'plan', name: '生产计划', description: '制定和调整生产计划', preconditions: [], postconditions: [], mainFlow: [], priority: 'high' },
          { id: 'control', name: '设备控制', description: '操作和控制生产设备', preconditions: [], postconditions: [], mainFlow: [], priority: 'high' },
          { id: 'produce', name: '自动生产', description: '机器人自动化生产', preconditions: [], postconditions: [], mainFlow: [], priority: 'high' },
          { id: 'inspect', name: '质量检测', description: '产品质量检验和测试', preconditions: [], postconditions: [], mainFlow: [], priority: 'high' },
          { id: 'monitor', name: '生产监控', description: '实时监控生产状态', preconditions: [], postconditions: [], mainFlow: [], priority: 'medium' },
          { id: 'maintain', name: '设备维护', description: '预防性设备维护', preconditions: [], postconditions: [], mainFlow: [], priority: 'medium' },
          { id: 'optimize', name: '工艺优化', description: '生产工艺持续改进', preconditions: [], postconditions: [], mainFlow: [], priority: 'medium' }
        ],
        relationships: [
          { id: 'manager-plan', source: 'manager', target: 'plan', type: 'association' },
          { id: 'operator-control', source: 'operator', target: 'control', type: 'association' },
          { id: 'qc-inspect', source: 'qc', target: 'inspect', type: 'association' },
          { id: 'mes-monitor', source: 'mes', target: 'monitor', type: 'association' },
          { id: 'engineer-optimize', source: 'engineer', target: 'optimize', type: 'association' },
          { id: 'operator-maintain', source: 'operator', target: 'maintain', type: 'association' }
        ]
      }
    }
  ];
  
  const mockDomainModels: DomainModel[] = [
    {
      id: 'dm-001',
      type: 'domain-model',
      title: '用户管理领域模型',
      createdAt: new Date('2024-01-12'),
      updatedAt: new Date('2024-01-22'),
      metadata: {
        author: 'Domain Expert',
        version: '1.1.0',
        tags: ['用户', '权限', '领域模型'],
        exportFormats: []
      },
      content: {
        mermaidCode: 'classDiagram\n    class User {\n        +string id\n        +string username\n        +string email\n        +date createdAt\n    }\n    class Role {\n        +string id\n        +string name\n        +array permissions\n    }\n    User }|--|| Role : has',
        entities: [
          {
            id: 'user',
            name: 'User',
            attributes: [
              { name: 'id', type: 'string', description: '用户唯一标识', required: true },
              { name: 'username', type: 'string', description: '用户名', required: true },
              { name: 'email', type: 'string', description: '邮箱地址', required: false },
              { name: 'createdAt', type: 'date', description: '创建时间', required: false }
            ],
            methods: [],
            isAggregateRoot: true
          },
          {
            id: 'role',
            name: 'Role',
            attributes: [
              { name: 'id', type: 'string', description: '角色标识', required: true },
              { name: 'name', type: 'string', description: '角色名称', required: true },
              { name: 'permissions', type: 'array', description: '权限列表', required: false }
            ],
            methods: [],
            isAggregateRoot: false
          }
        ],
        valueObjects: [
          {
            id: 'email',
            name: 'Email',
            attributes: [
              { name: 'address', type: 'string', description: '邮箱地址', required: true },
              { name: 'verified', type: 'boolean', description: '是否已验证', required: false }
            ],
            invariants: []
          }
        ],
        aggregates: [
          {
            id: 'user-aggregate',
            name: 'UserAggregate',
            root: 'user',
            entities: ['user'],
            valueObjects: ['email'],
            boundaryRules: []
          }
        ],
        relationships: [
          { id: 'user-role', source: 'user', target: 'role', type: 'association' },
          { id: 'user-email', source: 'user', target: 'email', type: 'composition' }
        ],
        knowledgeGraph: [
           { id: 'user', label: 'User', type: 'entity', properties: { core: true }, connections: [] },
           { id: 'role', label: 'Role', type: 'entity', properties: { core: true }, connections: [] },
           { id: 'permission', label: 'Permission', type: 'concept', properties: { abstract: true }, connections: [] }
         ]
      }
    },
    {
      id: 'dm-002',
      type: 'domain-model',
      title: '电商订单领域模型',
      createdAt: new Date('2024-01-10'),
      updatedAt: new Date('2024-01-25'),
      metadata: {
        author: 'E-commerce Architect',
        version: '2.0.0',
        tags: ['电商', '订单', '支付', '领域模型'],
        exportFormats: []
      },
      content: {
        mermaidCode: 'classDiagram\n    class Order {\n        +string id\n        +string customerId\n        +decimal totalAmount\n        +string status\n        +date createdAt\n    }\n    class OrderItem {\n        +string id\n        +string productId\n        +int quantity\n        +decimal price\n    }\n    class Payment {\n        +string id\n        +string orderId\n        +decimal amount\n        +string method\n        +string status\n    }\n    Order ||--o{ OrderItem : contains\n    Order ||--|| Payment : has',
        entities: [
          {
            id: 'order',
            name: 'Order',
            attributes: [
              { name: 'id', type: 'string', description: '订单唯一标识', required: true },
              { name: 'customerId', type: 'string', description: '客户ID', required: true },
              { name: 'totalAmount', type: 'decimal', description: '订单总金额', required: true },
              { name: 'status', type: 'string', description: '订单状态', required: true },
              { name: 'createdAt', type: 'date', description: '创建时间', required: true }
            ],
            methods: [],
            isAggregateRoot: true
          },
          {
            id: 'orderItem',
            name: 'OrderItem',
            attributes: [
              { name: 'id', type: 'string', description: '订单项ID', required: true },
              { name: 'productId', type: 'string', description: '商品ID', required: true },
              { name: 'quantity', type: 'int', description: '数量', required: true },
              { name: 'price', type: 'decimal', description: '单价', required: true }
            ],
            methods: [],
            isAggregateRoot: false
          },
          {
            id: 'payment',
            name: 'Payment',
            attributes: [
              { name: 'id', type: 'string', description: '支付ID', required: true },
              { name: 'orderId', type: 'string', description: '订单ID', required: true },
              { name: 'amount', type: 'decimal', description: '支付金额', required: true },
              { name: 'method', type: 'string', description: '支付方式', required: true },
              { name: 'status', type: 'string', description: '支付状态', required: true }
            ],
            methods: [],
            isAggregateRoot: true
          }
        ],
        valueObjects: [
          {
            id: 'money',
            name: 'Money',
            attributes: [
              { name: 'amount', type: 'decimal', description: '金额', required: true },
              { name: 'currency', type: 'string', description: '货币类型', required: true }
            ],
            invariants: []
          },
          {
            id: 'address',
            name: 'Address',
            attributes: [
              { name: 'street', type: 'string', description: '街道地址', required: true },
              { name: 'city', type: 'string', description: '城市', required: true },
              { name: 'zipCode', type: 'string', description: '邮编', required: true }
            ],
            invariants: []
          }
        ],
        aggregates: [
          {
            id: 'order-aggregate',
            name: 'OrderAggregate',
            root: 'order',
            entities: ['order', 'orderItem'],
            valueObjects: ['money', 'address'],
            boundaryRules: []
          },
          {
            id: 'payment-aggregate',
            name: 'PaymentAggregate',
            root: 'payment',
            entities: ['payment'],
            valueObjects: ['money'],
            boundaryRules: []
          }
        ],
        relationships: [
          { id: 'order-orderItem', source: 'order', target: 'orderItem', type: 'composition' },
          { id: 'order-payment', source: 'order', target: 'payment', type: 'association' }
        ],
        knowledgeGraph: [
           { id: 'order', label: 'Order', type: 'entity', properties: { core: true }, connections: [] },
           { id: 'payment', label: 'Payment', type: 'entity', properties: { core: true }, connections: [] },
           { id: 'product', label: 'Product', type: 'entity', properties: { external: true }, connections: [] }
         ]
      }
    },
    {
      id: 'dm-003',
      type: 'domain-model',
      title: '库存管理领域模型',
      createdAt: new Date('2024-01-08'),
      updatedAt: new Date('2024-01-28'),
      metadata: {
        author: 'Inventory Specialist',
        version: '1.3.0',
        tags: ['库存', '仓储', '物流', '领域模型'],
        exportFormats: []
      },
      content: {
        mermaidCode: 'classDiagram\n    class Warehouse {\n        +string id\n        +string name\n        +string location\n        +int capacity\n    }\n    class Product {\n        +string id\n        +string name\n        +string sku\n        +string category\n    }\n    class Inventory {\n        +string id\n        +string warehouseId\n        +string productId\n        +int quantity\n        +int reservedQuantity\n    }\n    class StockMovement {\n        +string id\n        +string inventoryId\n        +string type\n        +int quantity\n        +date timestamp\n    }\n    Warehouse ||--o{ Inventory : contains\n    Product ||--o{ Inventory : tracked_in\n    Inventory ||--o{ StockMovement : has',
        entities: [
          {
            id: 'warehouse',
            name: 'Warehouse',
            attributes: [
              { name: 'id', type: 'string', description: '仓库ID', required: true },
              { name: 'name', type: 'string', description: '仓库名称', required: true },
              { name: 'location', type: 'string', description: '仓库位置', required: true },
              { name: 'capacity', type: 'int', description: '仓库容量', required: true }
            ],
            methods: [],
            isAggregateRoot: true
          },
          {
            id: 'product',
            name: 'Product',
            attributes: [
              { name: 'id', type: 'string', description: '商品ID', required: true },
              { name: 'name', type: 'string', description: '商品名称', required: true },
              { name: 'sku', type: 'string', description: '商品编码', required: true },
              { name: 'category', type: 'string', description: '商品分类', required: true }
            ],
            methods: [],
            isAggregateRoot: true
          },
          {
            id: 'inventory',
            name: 'Inventory',
            attributes: [
              { name: 'id', type: 'string', description: '库存ID', required: true },
              { name: 'warehouseId', type: 'string', description: '仓库ID', required: true },
              { name: 'productId', type: 'string', description: '商品ID', required: true },
              { name: 'quantity', type: 'int', description: '可用数量', required: true },
              { name: 'reservedQuantity', type: 'int', description: '预留数量', required: true }
            ],
            methods: [],
            isAggregateRoot: false
          }
        ],
        valueObjects: [
          {
            id: 'location',
            name: 'Location',
            attributes: [
              { name: 'zone', type: 'string', description: '区域', required: true },
              { name: 'aisle', type: 'string', description: '通道', required: true },
              { name: 'shelf', type: 'string', description: '货架', required: true }
            ],
            invariants: []
          }
        ],
        aggregates: [
          {
            id: 'warehouse-aggregate',
            name: 'WarehouseAggregate',
            root: 'warehouse',
            entities: ['warehouse', 'inventory'],
            valueObjects: ['location'],
            boundaryRules: []
          }
        ],
        relationships: [
          { id: 'warehouse-inventory', source: 'warehouse', target: 'inventory', type: 'composition' },
          { id: 'product-inventory', source: 'product', target: 'inventory', type: 'association' }
        ],
        knowledgeGraph: [
           { id: 'warehouse', label: 'Warehouse', type: 'entity', properties: { core: true }, connections: [] },
           { id: 'inventory', label: 'Inventory', type: 'entity', properties: { core: true }, connections: [] },
           { id: 'movement', label: 'Movement', type: 'event', properties: { temporal: true }, connections: [] }
         ]
      }
    },
    {
      id: 'dm-004',
      type: 'domain-model',
      title: '银行账户领域模型',
      createdAt: new Date('2024-01-05'),
      updatedAt: new Date('2024-02-01'),
      metadata: {
        author: 'Banking Domain Expert',
        version: '3.2.0',
        tags: ['银行', '账户', '交易', '风控'],
        exportFormats: []
      },
      content: {
        mermaidCode: 'classDiagram\n    class Account {\n        +string accountNumber\n        +decimal balance\n        +string accountType\n        +string status\n        +date openDate\n    }\n    class Transaction {\n        +string id\n        +decimal amount\n        +string type\n        +date timestamp\n        +string description\n    }\n    class Customer {\n        +string customerId\n        +string name\n        +string idNumber\n        +string creditRating\n    }\n    Customer ||--o{ Account : owns\n    Account ||--o{ Transaction : has',
        entities: [
          {
            id: 'account',
            name: 'Account',
            attributes: [
              { name: 'accountNumber', type: 'string', description: '账户号码', required: true },
              { name: 'balance', type: 'decimal', description: '账户余额', required: true },
              { name: 'accountType', type: 'string', description: '账户类型', required: true },
              { name: 'status', type: 'string', description: '账户状态', required: true },
              { name: 'openDate', type: 'date', description: '开户日期', required: true }
            ],
            methods: [],
            isAggregateRoot: true
          },
          {
            id: 'transaction',
            name: 'Transaction',
            attributes: [
              { name: 'id', type: 'string', description: '交易ID', required: true },
              { name: 'amount', type: 'decimal', description: '交易金额', required: true },
              { name: 'type', type: 'string', description: '交易类型', required: true },
              { name: 'timestamp', type: 'date', description: '交易时间', required: true },
              { name: 'description', type: 'string', description: '交易描述', required: false }
            ],
            methods: [],
            isAggregateRoot: false
          },
          {
            id: 'customer',
            name: 'Customer',
            attributes: [
              { name: 'customerId', type: 'string', description: '客户ID', required: true },
              { name: 'name', type: 'string', description: '客户姓名', required: true },
              { name: 'idNumber', type: 'string', description: '身份证号', required: true },
              { name: 'creditRating', type: 'string', description: '信用等级', required: false }
            ],
            methods: [],
            isAggregateRoot: true
          }
        ],
        valueObjects: [
          {
            id: 'money',
            name: 'Money',
            attributes: [
              { name: 'amount', type: 'decimal', description: '金额', required: true },
              { name: 'currency', type: 'string', description: '货币类型', required: true }
            ],
            invariants: []
          },
          {
            id: 'accountNumber',
            name: 'AccountNumber',
            attributes: [
              { name: 'value', type: 'string', description: '账户号码', required: true }
            ],
            invariants: []
          }
        ],
        aggregates: [
          {
            id: 'account-aggregate',
            name: 'AccountAggregate',
            root: 'account',
            entities: ['account', 'transaction'],
            valueObjects: ['money', 'accountNumber'],
            boundaryRules: []
          },
          {
            id: 'customer-aggregate',
            name: 'CustomerAggregate',
            root: 'customer',
            entities: ['customer'],
            valueObjects: [],
            boundaryRules: []
          }
        ],
        relationships: [
          { id: 'customer-account', source: 'customer', target: 'account', type: 'composition' },
          { id: 'account-transaction', source: 'account', target: 'transaction', type: 'composition' }
        ],
        knowledgeGraph: [
           { id: 'account', label: 'Account', type: 'entity', properties: { core: true }, connections: [] },
           { id: 'transaction', label: 'Transaction', type: 'entity', properties: { core: true }, connections: [] },
           { id: 'customer', label: 'Customer', type: 'entity', properties: { core: true }, connections: [] }
         ]
      }
    },
    {
      id: 'dm-005',
      type: 'domain-model',
      title: '医疗诊断领域模型',
      createdAt: new Date('2024-01-03'),
      updatedAt: new Date('2024-02-03'),
      metadata: {
        author: 'Healthcare Domain Expert',
        version: '2.0.0',
        tags: ['医疗', '诊断', '病历', '处方'],
        exportFormats: []
      },
      content: {
        mermaidCode: 'classDiagram\n    class Patient {\n        +string patientId\n        +string name\n        +date birthDate\n        +string gender\n    }\n    class Diagnosis {\n        +string diagnosisId\n        +string code\n        +string description\n        +date diagnosisDate\n        +string severity\n    }\n    class Doctor {\n        +string doctorId\n        +string name\n        +string specialty\n        +string licenseNumber\n    }\n    Patient ||--o{ Diagnosis : has\n    Doctor ||--o{ Diagnosis : makes',
        entities: [
          {
            id: 'patient',
            name: 'Patient',
            attributes: [
              { name: 'patientId', type: 'string', description: '患者ID', required: true },
              { name: 'name', type: 'string', description: '患者姓名', required: true },
              { name: 'birthDate', type: 'date', description: '出生日期', required: true },
              { name: 'gender', type: 'string', description: '性别', required: true }
            ],
            methods: [],
            isAggregateRoot: true
          },
          {
            id: 'diagnosis',
            name: 'Diagnosis',
            attributes: [
              { name: 'diagnosisId', type: 'string', description: '诊断ID', required: true },
              { name: 'code', type: 'string', description: '诊断代码', required: true },
              { name: 'description', type: 'string', description: '诊断描述', required: true },
              { name: 'diagnosisDate', type: 'date', description: '诊断日期', required: true },
              { name: 'severity', type: 'string', description: '严重程度', required: false }
            ],
            methods: [],
            isAggregateRoot: false
          },
          {
            id: 'doctor',
            name: 'Doctor',
            attributes: [
              { name: 'doctorId', type: 'string', description: '医生ID', required: true },
              { name: 'name', type: 'string', description: '医生姓名', required: true },
              { name: 'specialty', type: 'string', description: '专业领域', required: true },
              { name: 'licenseNumber', type: 'string', description: '执业证号', required: true }
            ],
            methods: [],
            isAggregateRoot: true
          }
        ],
        valueObjects: [
          {
            id: 'prescription',
            name: 'Prescription',
            attributes: [
              { name: 'medicationName', type: 'string', description: '药物名称', required: true },
              { name: 'dosage', type: 'string', description: '剂量', required: true },
              { name: 'frequency', type: 'string', description: '用药频率', required: true },
              { name: 'duration', type: 'string', description: '用药时长', required: true }
            ],
            invariants: []
          },
          {
            id: 'contactInfo',
            name: 'ContactInfo',
            attributes: [
              { name: 'phone', type: 'string', description: '电话号码', required: true },
              { name: 'email', type: 'string', description: '邮箱', required: false },
              { name: 'address', type: 'string', description: '地址', required: true }
            ],
            invariants: []
          }
        ],
        aggregates: [
          {
            id: 'patient-aggregate',
            name: 'PatientAggregate',
            root: 'patient',
            entities: ['patient', 'diagnosis'],
            valueObjects: ['prescription', 'contactInfo'],
            boundaryRules: []
          },
          {
            id: 'doctor-aggregate',
            name: 'DoctorAggregate',
            root: 'doctor',
            entities: ['doctor'],
            valueObjects: [],
            boundaryRules: []
          }
        ],
        relationships: [
          { id: 'patient-diagnosis', source: 'patient', target: 'diagnosis', type: 'composition' },
          { id: 'doctor-diagnosis', source: 'doctor', target: 'diagnosis', type: 'association' }
        ],
        knowledgeGraph: [
           { id: 'patient', label: 'Patient', type: 'entity', properties: { core: true }, connections: [] },
           { id: 'diagnosis', label: 'Diagnosis', type: 'entity', properties: { core: true }, connections: [] },
           { id: 'doctor', label: 'Doctor', type: 'entity', properties: { core: true }, connections: [] }
         ]
      }
    },
    {
      id: 'dm-006',
      type: 'domain-model',
      title: '在线教育领域模型',
      createdAt: new Date('2024-01-02'),
      updatedAt: new Date('2024-02-05'),
      metadata: {
        author: 'Education Domain Expert',
        version: '1.5.0',
        tags: ['教育', '课程', '学习', '评估'],
        exportFormats: []
      },
      content: {
        mermaidCode: 'classDiagram\n    class Student {\n        +string studentId\n        +string name\n        +string email\n        +date enrollmentDate\n        +string level\n    }\n    class Course {\n        +string courseId\n        +string title\n        +string description\n        +int duration\n        +string difficulty\n    }\n    class Instructor {\n        +string instructorId\n        +string name\n        +array expertise\n        +decimal rating\n    }\n    Student }|--|| Course : enrolls\n    Instructor ||--o{ Course : teaches',
        entities: [
          {
            id: 'student',
            name: 'Student',
            attributes: [
              { name: 'studentId', type: 'string', description: '学生ID', required: true },
              { name: 'name', type: 'string', description: '学生姓名', required: true },
              { name: 'email', type: 'string', description: '邮箱', required: true },
              { name: 'enrollmentDate', type: 'date', description: '注册日期', required: true },
              { name: 'level', type: 'string', description: '学习等级', required: false }
            ],
            methods: [],
            isAggregateRoot: true
          },
          {
            id: 'course',
            name: 'Course',
            attributes: [
              { name: 'courseId', type: 'string', description: '课程ID', required: true },
              { name: 'title', type: 'string', description: '课程标题', required: true },
              { name: 'description', type: 'string', description: '课程描述', required: true },
              { name: 'duration', type: 'int', description: '课程时长', required: true },
              { name: 'difficulty', type: 'string', description: '难度等级', required: true }
            ],
            methods: [],
            isAggregateRoot: true
          },
          {
            id: 'instructor',
            name: 'Instructor',
            attributes: [
              { name: 'instructorId', type: 'string', description: '讲师ID', required: true },
              { name: 'name', type: 'string', description: '讲师姓名', required: true },
              { name: 'expertise', type: 'array', description: '专业领域', required: true },
              { name: 'rating', type: 'decimal', description: '评分', required: false }
            ],
            methods: [],
            isAggregateRoot: true
          }
        ],
        valueObjects: [
          {
            id: 'lesson',
            name: 'Lesson',
            attributes: [
              { name: 'lessonId', type: 'string', description: '课时ID', required: true },
              { name: 'title', type: 'string', description: '课时标题', required: true },
              { name: 'content', type: 'string', description: '课时内容', required: true },
              { name: 'videoUrl', type: 'string', description: '视频链接', required: false },
              { name: 'duration', type: 'int', description: '时长', required: true }
            ],
            invariants: []
          },
          {
            id: 'grade',
            name: 'Grade',
            attributes: [
              { name: 'score', type: 'decimal', description: '分数', required: true },
              { name: 'maxScore', type: 'decimal', description: '满分', required: true },
              { name: 'feedback', type: 'string', description: '反馈', required: false }
            ],
            invariants: []
          }
        ],
        aggregates: [
          {
            id: 'course-aggregate',
            name: 'CourseAggregate',
            root: 'course',
            entities: ['course', 'instructor'],
            valueObjects: ['lesson', 'grade'],
            boundaryRules: []
          },
          {
            id: 'student-aggregate',
            name: 'StudentAggregate',
            root: 'student',
            entities: ['student'],
            valueObjects: ['grade'],
            boundaryRules: []
          }
        ],
        relationships: [
          { id: 'student-course', source: 'student', target: 'course', type: 'association' },
          { id: 'instructor-course', source: 'instructor', target: 'course', type: 'composition' }
        ],
        knowledgeGraph: [
           { id: 'student', label: 'Student', type: 'entity', properties: { core: true }, connections: [] },
           { id: 'course', label: 'Course', type: 'entity', properties: { core: true }, connections: [] },
           { id: 'instructor', label: 'Instructor', type: 'entity', properties: { core: true }, connections: [] }
         ]
      }
    },
    {
      id: 'dm-007',
      type: 'domain-model',
      title: '物流配送领域模型',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-02-07'),
      metadata: {
        author: 'Logistics Domain Expert',
        version: '2.3.0',
        tags: ['物流', '配送', '运输', '仓储'],
        exportFormats: []
      },
      content: {
        mermaidCode: 'classDiagram\n    class Package {\n        +string trackingNumber\n        +decimal weight\n        +string dimensions\n        +string status\n        +string contents\n    }\n    class Shipment {\n        +string shipmentId\n        +string origin\n        +string destination\n        +date estimatedDelivery\n        +decimal cost\n    }\n    class Driver {\n        +string driverId\n        +string name\n        +string licenseNumber\n        +string vehicleType\n    }\n    Shipment ||--o{ Package : contains\n    Driver ||--o{ Shipment : handles',
        entities: [
          {
            id: 'package',
            name: 'Package',
            attributes: [
              { name: 'trackingNumber', type: 'string', description: '追踪号码', required: true },
              { name: 'weight', type: 'decimal', description: '重量', required: true },
              { name: 'dimensions', type: 'string', description: '尺寸', required: true },
              { name: 'status', type: 'string', description: '包裹状态', required: true },
              { name: 'contents', type: 'string', description: '包裹内容', required: true }
            ],
            methods: [],
            isAggregateRoot: false
          },
          {
            id: 'shipment',
            name: 'Shipment',
            attributes: [
              { name: 'shipmentId', type: 'string', description: '货运ID', required: true },
              { name: 'origin', type: 'string', description: '起始地址', required: true },
              { name: 'destination', type: 'string', description: '目的地址', required: true },
              { name: 'estimatedDelivery', type: 'date', description: '预计送达时间', required: true },
              { name: 'cost', type: 'decimal', description: '运费', required: true }
            ],
            methods: [],
            isAggregateRoot: true
          },
          {
            id: 'driver',
            name: 'Driver',
            attributes: [
              { name: 'driverId', type: 'string', description: '司机ID', required: true },
              { name: 'name', type: 'string', description: '司机姓名', required: true },
              { name: 'licenseNumber', type: 'string', description: '驾照号码', required: true },
              { name: 'vehicleType', type: 'string', description: '车辆类型', required: true }
            ],
            methods: [],
            isAggregateRoot: true
          }
        ],
        valueObjects: [
          {
            id: 'address',
            name: 'Address',
            attributes: [
              { name: 'street', type: 'string', description: '街道', required: true },
              { name: 'city', type: 'string', description: '城市', required: true },
              { name: 'state', type: 'string', description: '省份', required: true },
              { name: 'zipCode', type: 'string', description: '邮编', required: true },
              { name: 'country', type: 'string', description: '国家', required: true }
            ],
            invariants: []
          },
          {
            id: 'weight',
            name: 'Weight',
            attributes: [
              { name: 'value', type: 'decimal', description: '重量值', required: true },
              { name: 'unit', type: 'string', description: '重量单位', required: true }
            ],
            invariants: []
          }
        ],
        aggregates: [
          {
            id: 'shipment-aggregate',
            name: 'ShipmentAggregate',
            root: 'shipment',
            entities: ['shipment', 'package'],
            valueObjects: ['address', 'weight'],
            boundaryRules: []
          },
          {
            id: 'driver-aggregate',
            name: 'DriverAggregate',
            root: 'driver',
            entities: ['driver'],
            valueObjects: [],
            boundaryRules: []
          }
        ],
        relationships: [
          { id: 'shipment-package', source: 'shipment', target: 'package', type: 'composition' },
          { id: 'driver-shipment', source: 'driver', target: 'shipment', type: 'association' }
        ],
        knowledgeGraph: [
           { id: 'shipment', label: 'Shipment', type: 'entity', properties: { core: true }, connections: [] },
           { id: 'package', label: 'Package', type: 'entity', properties: { core: true }, connections: [] },
           { id: 'driver', label: 'Driver', type: 'entity', properties: { core: true }, connections: [] }
         ]
      }
    },
    {
      id: 'dm-008',
      type: 'domain-model',
      title: '人力资源管理领域模型',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-02-09'),
      metadata: {
        author: 'HR Domain Expert',
        version: '1.8.0',
        tags: ['人力资源', '员工', '薪酬', '绩效'],
        exportFormats: []
      },
      content: {
        mermaidCode: 'classDiagram\n    class Employee {\n        +string employeeId\n        +string name\n        +string position\n        +string department\n        +date hireDate\n    }\n    class Department {\n        +string departmentId\n        +string name\n        +string manager\n        +int budget\n    }\n    class Salary {\n        +string salaryId\n        +decimal baseSalary\n        +decimal bonus\n        +date effectiveDate\n    }\n    Department ||--o{ Employee : contains\n    Employee ||--|| Salary : has',
        entities: [
          {
            id: 'employee',
            name: 'Employee',
            attributes: [
              { name: 'employeeId', type: 'string', description: '员工ID', required: true },
              { name: 'name', type: 'string', description: '员工姓名', required: true },
              { name: 'position', type: 'string', description: '职位', required: true },
              { name: 'department', type: 'string', description: '部门', required: true },
              { name: 'hireDate', type: 'date', description: '入职日期', required: true }
            ],
            methods: [],
            isAggregateRoot: true
          },
          {
            id: 'department',
            name: 'Department',
            attributes: [
              { name: 'departmentId', type: 'string', description: '部门ID', required: true },
              { name: 'name', type: 'string', description: '部门名称', required: true },
              { name: 'manager', type: 'string', description: '部门经理', required: true },
              { name: 'budget', type: 'int', description: '预算', required: true }
            ],
            methods: [],
            isAggregateRoot: true
          },
          {
            id: 'salary',
            name: 'Salary',
            attributes: [
              { name: 'salaryId', type: 'string', description: '薪酬ID', required: true },
              { name: 'baseSalary', type: 'decimal', description: '基本工资', required: true },
              { name: 'bonus', type: 'decimal', description: '奖金', required: false },
              { name: 'effectiveDate', type: 'date', description: '生效日期', required: true }
            ],
            methods: [],
            isAggregateRoot: false
          }
        ],
        valueObjects: [
          {
            id: 'performance',
            name: 'Performance',
            attributes: [
              { name: 'score', type: 'decimal', description: '绩效分数', required: true },
              { name: 'period', type: 'string', description: '考核周期', required: true },
              { name: 'goals', type: 'array', description: '目标完成情况', required: true },
              { name: 'feedback', type: 'string', description: '反馈意见', required: false }
            ],
            invariants: []
          },
          {
            id: 'contact',
            name: 'Contact',
            attributes: [
              { name: 'phone', type: 'string', description: '电话', required: true },
              { name: 'email', type: 'string', description: '邮箱', required: true },
              { name: 'address', type: 'string', description: '地址', required: true }
            ],
            invariants: []
          }
        ],
        aggregates: [
          {
            id: 'employee-aggregate',
            name: 'EmployeeAggregate',
            root: 'employee',
            entities: ['employee', 'salary'],
            valueObjects: ['performance', 'contact'],
            boundaryRules: []
          },
          {
            id: 'department-aggregate',
            name: 'DepartmentAggregate',
            root: 'department',
            entities: ['department'],
            valueObjects: [],
            boundaryRules: []
          }
        ],
        relationships: [
          { id: 'department-employee', source: 'department', target: 'employee', type: 'composition' },
          { id: 'employee-salary', source: 'employee', target: 'salary', type: 'composition' }
        ],
        knowledgeGraph: [
           { id: 'employee', label: 'Employee', type: 'entity', properties: { core: true }, connections: [] },
           { id: 'department', label: 'Department', type: 'entity', properties: { core: true }, connections: [] },
           { id: 'salary', label: 'Salary', type: 'entity', properties: { core: true }, connections: [] }
         ]
      }
    }
  ];
  
  // 清除缓存并重新初始化数据
  const clearCacheAndReload = () => {
    // 清除所有相关的localStorage
    localStorage.removeItem('core-assets-storage');
    localStorage.removeItem('document-engine-storage');
    localStorage.removeItem('chart-engine-storage');
    localStorage.removeItem('customization-storage');
    localStorage.removeItem('mcp-storage');
    
    // 刷新页面
    window.location.reload();
  };

  // 初始化模拟数据
  useEffect(() => {
    // 检查useCaseModels是否为空（兼容Map和普通对象）
    const useCaseCount = useCaseModels instanceof Map ? useCaseModels.size : Object.keys(useCaseModels || {}).length;
    const domainCount = domainModels instanceof Map ? domainModels.size : Object.keys(domainModels || {}).length;
    
    console.log('当前数据状态:', { useCaseCount, domainCount, useCaseModels, domainModels });
    
    if (useCaseCount === 0) {
      console.log('初始化用例模型数据...');
      mockUseCaseModels.forEach(model => addUseCaseModel(model));
    }
    if (domainCount === 0) {
      console.log('初始化领域模型数据...');
      mockDomainModels.forEach(model => addDomainModel(model));
    }
  }, [useCaseModels, domainModels, addUseCaseModel, addDomainModel]);
  
  // 获取当前标签页的资产列表
  const getCurrentAssets = () => {
    switch (activeTab) {
      case 'usecase':
        return useCaseModels instanceof Map ? Array.from(useCaseModels.values()) : Object.values(useCaseModels || {});
      case 'domain':
        return domainModels instanceof Map ? Array.from(domainModels.values()) : Object.values(domainModels || {});
      case 'process':
        return businessProcesses instanceof Map ? Array.from(businessProcesses.values()) : Object.values(businessProcesses || {});
      default:
        return [];
    }
  };
  
  // 过滤资产列表
  const filteredAssets = getCurrentAssets().filter(asset => {
    const matchesSearch = searchTerm === '' || 
                         (asset as any).title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (asset as any).description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || (asset as any).metadata?.category === filterCategory;
    return matchesSearch && matchesCategory;
  });
  
  // 处理新建资产
  const handleCreateAsset = (type: 'usecase' | 'domain' | 'process') => {
    setDesignerType(type as 'usecase' | 'domain');
    setSelectedAsset(null);
    setIsDesignerVisible(true);
  };
  
  // 处理编辑资产
  const handleEditAsset = (asset: UseCaseModel | DomainModel) => {
    setSelectedAsset(asset);
    setDesignerType(asset.type === 'usecase' ? 'usecase' : 'domain');
    setIsDesignerVisible(true);
  };
  
  // 处理预览资产
  const handlePreviewAsset = (asset: UseCaseModel | DomainModel) => {
    setSelectedAsset(asset);
    setIsPreviewVisible(true);
  };
  
  // 处理删除资产
  const handleDeleteAsset = (asset: UseCaseModel | DomainModel) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除 "${asset.title}" 吗？此操作不可撤销。`,
      okText: '删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: () => {
        if (asset.type === 'usecase') {
          removeUseCaseModel(asset.id);
        } else {
          removeDomainModel(asset.id);
        }
        message.success('删除成功');
      }
    });
  };
  
  // 处理复制资产
  const handleCopyAsset = (asset: UseCaseModel | DomainModel) => {
    const newAsset = {
      ...asset,
      id: `${asset.id}-copy-${Date.now()}`,
      title: `${asset.title} (副本)`,
      metadata: {
        ...asset.metadata,
        createdAt: new Date(),
        updatedAt: new Date(),
        version: '1.0.0'
      }
    };
    
    if (asset.type === 'usecase') {
      addUseCaseModel(newAsset as UseCaseModel);
    } else {
      addDomainModel(newAsset as DomainModel);
    }
    
    message.success('复制成功');
  };
  
  // 处理导出资产
  const handleExportAsset = (asset: UseCaseModel | DomainModel) => {
    const dataStr = JSON.stringify(asset, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${asset.title}.json`;
    link.click();
    URL.revokeObjectURL(url);
    message.success('导出成功');
  };
  
  // 资产操作菜单
  const getAssetActions = (asset: UseCaseModel | DomainModel) => [
    {
      key: 'edit',
      label: '编辑',
      icon: <EditOutlined />,
      onClick: () => handleEditAsset(asset)
    },
    {
      key: 'preview',
      label: '预览',
      icon: <EyeOutlined />,
      onClick: () => handlePreviewAsset(asset)
    },
    {
      key: 'copy',
      label: '复制',
      icon: <CopyOutlined />,
      onClick: () => handleCopyAsset(asset)
    },
    {
      key: 'export',
      label: '导出',
      icon: <DownloadOutlined />,
      onClick: () => handleExportAsset(asset)
    },
    {
      type: 'divider' as const
    },
    {
      key: 'delete',
      label: '删除',
      icon: <DeleteOutlined />,
      danger: true,
      onClick: () => handleDeleteAsset(asset)
    }
  ];
  
  // 渲染资产卡片
  const renderAssetCard = (asset: UseCaseModel | DomainModel) => {
    const isUseCase = asset.type === 'usecase';
    const icon = isUseCase ? <ProjectOutlined /> : <NodeIndexOutlined />;
    const color = isUseCase ? '#1890ff' : '#52c41a';
    
    return (
      <Card
        key={asset.id}
        hoverable
        className="mb-4"
        actions={[
          <Tooltip title="编辑">
            <EditOutlined onClick={() => handleEditAsset(asset)} />
          </Tooltip>,
          <Tooltip title="预览">
            <EyeOutlined onClick={() => handlePreviewAsset(asset)} />
          </Tooltip>,
          <Tooltip title="复制">
            <CopyOutlined onClick={() => handleCopyAsset(asset)} />
          </Tooltip>,
          <Dropdown menu={{ items: getAssetActions(asset) }} trigger={['click']}>
            <MoreOutlined />
          </Dropdown>
        ]}
      >
        <Card.Meta
          avatar={
            <Avatar
              style={{ backgroundColor: color }}
              icon={icon}
              size="large"
            />
          }
          title={
            <Space>
              <Text strong>{asset.title}</Text>
              <Tag color={color}>
                v{asset.metadata.version}
              </Tag>
            </Space>
          }
          description={
            <div>
              <Paragraph
                ellipsis={{ rows: 2, expandable: true }}
                className="mb-2"
              >
                {(asset as any).description || '暂无描述'}
              </Paragraph>
              <Space wrap>
                {(asset as any).metadata?.tags?.map((tag: string) => (
                  <Tag key={tag}>{tag}</Tag>
                )) || []}
              </Space>
              <div className="mt-2 text-gray-500 text-sm">
                <Space split={<Divider type="vertical" />}>
                  <span>作者: {asset.metadata.author}</span>
                  <span>更新: {(asset.metadata as any).updatedAt?.toLocaleDateString() || '未知'}</span>
                  <span>分类: {(asset.metadata as any).category || '未分类'}</span>
                </Space>
              </div>
            </div>
          }
        />
      </Card>
    );
  };
  
  return (
    <div className="p-6">
      {/* 页面头部 */}
      <div className="mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <Title level={2} className="mb-2">
              <NodeIndexOutlined className="mr-2" />
              核心业务资产
            </Title>
            <Text type="secondary" className="text-lg">
              管理项目的核心业务资产：用例图、领域模型和业务流程
            </Text>
          </div>
          <Space>
            <Button
              type="primary"
              icon={<RobotOutlined />}
              onClick={() => openAIModal(activeTab as 'usecase' | 'domain')}
              disabled={activeTab === 'process'}
            >
              AI生成{activeTab === 'usecase' ? '用例图' : activeTab === 'domain' ? '领域模型' : '业务流程'}
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => handleCreateAsset(activeTab as 'usecase' | 'domain')}
            >
              手动创建{activeTab === 'usecase' ? '用例图' : activeTab === 'domain' ? '领域模型' : '业务流程'}
            </Button>
            <Button
              danger
              onClick={clearCacheAndReload}
              title="清除缓存并重新加载数据"
            >
              重置数据
            </Button>
          </Space>
        </div>
        
        {/* 统计信息 */}
        <Row gutter={16} className="mb-4">
          <Col span={6}>
            <Card size="small">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {useCaseModels?.size || 0}
                </div>
                <div className="text-gray-500">用例图</div>
              </div>
            </Card>
          </Col>
          <Col span={6}>
            <Card size="small">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {domainModels?.size || 0}
                </div>
                <div className="text-gray-500">领域模型</div>
              </div>
            </Card>
          </Col>
          <Col span={6}>
            <Card size="small">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {businessProcesses?.size || 0}
                </div>
                <div className="text-gray-500">业务流程</div>
              </div>
            </Card>
          </Col>
          <Col span={6}>
            <Card size="small">
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {(useCaseModels?.size || 0) + (domainModels?.size || 0) + (businessProcesses?.size || 0)}
                </div>
                <div className="text-gray-500">总计</div>
              </div>
            </Card>
          </Col>
        </Row>
      </div>
      
      {/* 搜索和过滤 */}
      <Card className="mb-6">
        <Row gutter={16} align="middle">
          <Col span={8}>
            <Search
              placeholder="搜索资产名称或描述"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              allowClear
            />
          </Col>
          <Col span={6}>
            <Select
              placeholder="选择分类"
              value={filterCategory}
              onChange={setFilterCategory}
              style={{ width: '100%' }}
            >
              <Option value="all">全部分类</Option>
              <Option value="core">核心</Option>
              <Option value="business">业务</Option>
              <Option value="technical">技术</Option>
              <Option value="integration">集成</Option>
            </Select>
          </Col>
          <Col span={10}>
            <Space>
              <Text type="secondary">
                共找到 {filteredAssets.length} 个资产
              </Text>
            </Space>
          </Col>
        </Row>
      </Card>
      
      {/* 资产列表 */}
      <Card>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: 'usecase',
              label: (
                <Space>
                  <ProjectOutlined />
                  <span>用例图</span>
                  <Badge count={useCaseModels?.size || 0} showZero />
                </Space>
              ),
              children: (
                <div>
                  {filteredAssets.length > 0 ? (
                    <Row gutter={[16, 16]}>
                      {filteredAssets.map(asset => (
                        <Col key={(asset as any).id} xs={24} sm={12} lg={8} xl={6}>
                          {renderAssetCard(asset as UseCaseModel | DomainModel)}
                        </Col>
                      ))}
                    </Row>
                  ) : (
                    <Empty
                      description="暂无用例图"
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                    >
                      <Space>
                        <Button
                          type="primary"
                          icon={<RobotOutlined />}
                          onClick={() => openAIModal('usecase')}
                        >
                          AI生成用例图
                        </Button>
                        <Button
                          icon={<PlusOutlined />}
                          onClick={() => handleCreateAsset('usecase')}
                        >
                          手动创建
                        </Button>
                      </Space>
                    </Empty>
                  )}
                </div>
              )
            },
            {
              key: 'domain',
              label: (
                <Space>
                  <NodeIndexOutlined />
                  <span>领域模型</span>
                  <Badge count={domainModels?.size || 0} showZero />
                </Space>
              ),
              children: (
                <div>
                  {filteredAssets.length > 0 ? (
                    <Row gutter={[16, 16]}>
                      {filteredAssets.map(asset => (
                        <Col key={(asset as any).id} xs={24} sm={12} lg={8} xl={6}>
                          {renderAssetCard(asset as UseCaseModel | DomainModel)}
                        </Col>
                      ))}
                    </Row>
                  ) : (
                    <Empty
                      description="暂无领域模型"
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                    >
                      <Space>
                        <Button
                          type="primary"
                          icon={<RobotOutlined />}
                          onClick={() => openAIModal('domain')}
                        >
                          AI生成领域模型
                        </Button>
                        <Button
                          icon={<PlusOutlined />}
                          onClick={() => handleCreateAsset('domain')}
                        >
                          手动创建
                        </Button>
                      </Space>
                    </Empty>
                  )}
                </div>
              )
            },
            {
              key: 'process',
              label: (
                <Space>
                  <BranchesOutlined />
                  <span>业务流程</span>
                  <Badge count={businessProcesses?.size || 0} showZero />
                </Space>
              ),
              children: (
                <div>
                  {filteredAssets.length > 0 ? (
                    <Row gutter={[16, 16]}>
                      {filteredAssets.map(asset => (
                        <Col key={(asset as any).id} xs={24} sm={12} lg={8} xl={6}>
                          {renderAssetCard(asset as UseCaseModel | DomainModel)}
                        </Col>
                      ))}
                    </Row>
                  ) : (
                    <Empty
                      description="暂无业务流程"
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                    >
                      <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => handleCreateAsset('process')}
                      >
                        创建第一个业务流程
                      </Button>
                    </Empty>
                  )}
                </div>
              )
            }
          ]}
        />
      </Card>
      
      {/* 设计器模态框 */}
      <Modal
        title={`${selectedAsset ? '编辑' : '新建'}${designerType === 'usecase' ? '用例图' : '领域模型'}`}
        open={isDesignerVisible}
        onCancel={() => setIsDesignerVisible(false)}
        width={1200}
        footer={null}
        destroyOnHidden
      >
        {designerType === 'usecase' ? (
          <UseCaseDesigner
            initialData={selectedAsset as UseCaseModel}
            onSave={(data) => {
              if (selectedAsset) {
                updateUseCaseModel(selectedAsset.id, data);
                message.success('用例图更新成功');
              } else {
                addUseCaseModel(data);
                message.success('用例图创建成功');
              }
              setIsDesignerVisible(false);
            }}

          />
        ) : (
          <DomainModelDesigner
            initialData={selectedAsset as DomainModel}
            onSave={(data) => {
              if (selectedAsset) {
                updateDomainModel(selectedAsset.id, data);
                message.success('领域模型更新成功');
              } else {
                addDomainModel(data);
                message.success('领域模型创建成功');
              }
              setIsDesignerVisible(false);
            }}
          />
        )}
      </Modal>
      
      {/* 预览模态框 */}
      <Modal
        title={selectedAsset?.title}
        open={isPreviewVisible}
        onCancel={() => setIsPreviewVisible(false)}
        width={1000}
        footer={[
          <Button key="close" onClick={() => setIsPreviewVisible(false)}>
            关闭
          </Button>,
          <Button
            key="edit"
            type="primary"
            onClick={() => {
              setIsPreviewVisible(false);
              if (selectedAsset) {
                handleEditAsset(selectedAsset);
              }
            }}
          >
            编辑
          </Button>
        ]}
      >
        {selectedAsset && selectedAsset.content && selectedAsset.content.mermaidCode && (
          <MermaidChart
            chart={{
              id: selectedAsset.id,
              type: detectMermaidChartType(selectedAsset.content.mermaidCode),
              code: selectedAsset.content.mermaidCode,
              title: selectedAsset.title
            }}
            height={500}
          />
        )}
      </Modal>
      
      {/* AI生成对话框 */}
      <Modal
        title={
          <Space>
            <RobotOutlined />
            <span>AI智能生成{aiGenerationType === 'usecase' ? '用例图' : '领域模型'}</span>
          </Space>
        }
        open={isAIModalVisible}
        onCancel={() => setIsAIModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setIsAIModalVisible(false)}>
            取消
          </Button>,
          <Button
            key="generate"
            type="primary"
            icon={<ThunderboltOutlined />}
            loading={isAIGenerating}
            onClick={() => form.submit()}
          >
            {isAIGenerating ? '生成中...' : '开始生成'}
          </Button>
        ]}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleAIGenerate}
        >
          {aiGenerationType === 'usecase' ? (
            <Form.Item
              name="requirements"
              label="需求描述"
              rules={[
                { required: true, message: '请输入需求描述' },
                { min: 10, message: '需求描述至少10个字符' }
              ]}
            >
              <TextArea
                rows={6}
                placeholder="请详细描述您的业务需求，例如：\n\n我需要一个用户管理系统，包含以下功能：\n1. 用户注册和登录\n2. 个人信息管理\n3. 密码修改\n4. 管理员用户管理\n\nAI将根据您的描述自动生成用例图..."
                showCount
                maxLength={1000}
              />
            </Form.Item>
          ) : (
            <Form.Item
              name="businessContext"
              label="业务上下文"
              rules={[
                { required: true, message: '请输入业务上下文' },
                { min: 10, message: '业务上下文至少10个字符' }
              ]}
            >
              <TextArea
                rows={6}
                placeholder="请描述您的业务领域和上下文，例如：\n\n电商平台业务：\n- 用户可以浏览和购买商品\n- 商家可以管理商品和订单\n- 系统需要处理支付和物流\n- 包含用户、订单、商品、支付等核心概念\n\nAI将根据您的描述自动生成领域模型..."
                showCount
                maxLength={1000}
              />
            </Form.Item>
          )}
          
          <div className="bg-blue-50 p-4 rounded-lg">
            <Space direction="vertical" size="small">
              <Text strong className="text-blue-600">
                <RobotOutlined /> AI生成提示
              </Text>
              <Text type="secondary" className="text-sm">
                • 请尽可能详细地描述您的{aiGenerationType === 'usecase' ? '业务需求' : '业务上下文'}
              </Text>
              <Text type="secondary" className="text-sm">
                • 包含关键的{aiGenerationType === 'usecase' ? '功能点和用户角色' : '业务概念和实体关系'}
              </Text>
              <Text type="secondary" className="text-sm">
                • AI将自动分析并生成相应的{aiGenerationType === 'usecase' ? '用例图' : '领域模型'}和Mermaid代码
              </Text>
            </Space>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default CoreAssets;