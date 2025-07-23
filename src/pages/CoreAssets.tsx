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
  message
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
  BranchesOutlined
} from '@ant-design/icons';
import { useCoreAssetsStore } from '@/stores';
import UseCaseDesigner from '../components/Designer/UseCaseDesigner';
import DomainModelDesigner from '../components/Designer/DomainModelDesigner';
import MermaidChart from '../components/Chart/MermaidChart';
import type { UseCaseModel, DomainModel } from '../types/document';

const { Title, Text, Paragraph } = Typography;
const { Search } = Input;
const { Option } = Select;

// 核心业务资产页面组件
export const CoreAssets: React.FC = () => {
  const [activeTab, setActiveTab] = useState('usecase');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [isDesignerVisible, setIsDesignerVisible] = useState(false);
  const [designerType, setDesignerType] = useState<'usecase' | 'domain'>('usecase');
  const [selectedAsset, setSelectedAsset] = useState<UseCaseModel | DomainModel | null>(null);
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);
  
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
    }
  ];
  
  // 初始化模拟数据
  useEffect(() => {
    if (useCaseModels.size === 0) {
      mockUseCaseModels.forEach(model => addUseCaseModel(model));
    }
    if (domainModels.size === 0) {
      mockDomainModels.forEach(model => addDomainModel(model));
    }
  }, []);
  
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
              icon={<PlusOutlined />}
              onClick={() => handleCreateAsset(activeTab as any)}
            >
              新建{activeTab === 'usecase' ? '用例图' : activeTab === 'domain' ? '领域模型' : '业务流程'}
            </Button>
          </Space>
        </div>
        
        {/* 统计信息 */}
        <Row gutter={16} className="mb-4">
          <Col span={6}>
            <Card size="small">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {useCaseModels.size}
                </div>
                <div className="text-gray-500">用例图</div>
              </div>
            </Card>
          </Col>
          <Col span={6}>
            <Card size="small">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {domainModels.size}
                </div>
                <div className="text-gray-500">领域模型</div>
              </div>
            </Card>
          </Col>
          <Col span={6}>
            <Card size="small">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {businessProcesses.size}
                </div>
                <div className="text-gray-500">业务流程</div>
              </div>
            </Card>
          </Col>
          <Col span={6}>
            <Card size="small">
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {useCaseModels.size + domainModels.size + businessProcesses.size}
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
                  <Badge count={useCaseModels.size} showZero />
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
                      <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => handleCreateAsset('usecase')}
                      >
                        创建第一个用例图
                      </Button>
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
                  <Badge count={domainModels.size} showZero />
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
                      <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => handleCreateAsset('domain')}
                      >
                        创建第一个领域模型
                      </Button>
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
                  <Badge count={businessProcesses.size} showZero />
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
        destroyOnClose
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
        {selectedAsset && 'mermaidCode' in selectedAsset && (
          <MermaidChart
            chart={{
              id: selectedAsset.id,
              type: 'flowchart',
              code: (selectedAsset as any).mermaidCode,
              title: selectedAsset.title
            }}
            height={500}
          />
        )}
      </Modal>
    </div>
  );
};

export default CoreAssets;