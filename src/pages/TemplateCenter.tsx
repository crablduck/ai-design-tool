import React, { useState } from 'react';
import {
  Card,
  Row,
  Col,
  Typography,
  Button,
  Space,
  Tag,
  Input,
  Select,
  Modal,
  Tabs,
  Rate,
  Avatar,
  Divider,
  Badge,
  Tooltip,
} from 'antd';
import {
  SearchOutlined,
  FilterOutlined,

  DownloadOutlined,
  EyeOutlined,
  HeartOutlined,
  UserOutlined,
  ClockCircleOutlined,
  FireOutlined,
  CrownOutlined,
  GiftOutlined,
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;
const { Search } = Input;
const { Option } = Select;
// const { TabPane } = Tabs; // 已弃用，使用items属性替代

interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  type: 'project' | 'document';
  thumbnail: string;
  author: string;
  authorAvatar: string;
  rating: number;
  downloads: number;
  likes: number;
  tags: string[];
  isPremium: boolean;
  isPopular: boolean;
  createdAt: string;
  preview: string;
}

const TemplateCenter: React.FC = () => {
  const [searchText, setSearchText] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('all');
  const [previewVisible, setPreviewVisible] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);

  // 模拟模板数据
  const [templates] = useState<Template[]>([
    {
      id: '1',
      name: '电商平台完整模板',
      description: '包含用户管理、商品管理、订单处理、支付系统等完整电商功能的项目模板',
      category: 'ecommerce',
      type: 'project',
      thumbnail: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20ecommerce%20platform%20interface%20design%20with%20shopping%20cart%20and%20product%20grid&image_size=landscape_4_3',
      author: '张三',
      authorAvatar: '',
      rating: 4.8,
      downloads: 1250,
      likes: 89,
      tags: ['电商', '全栈', 'React', 'Node.js'],
      isPremium: true,
      isPopular: true,
      createdAt: '2024-01-10',
      preview: '完整的电商平台解决方案，包含前端界面设计、后端API、数据库设计等',
    },
    {
      id: '2',
      name: '企业管理系统模板',
      description: '适用于中小企业的综合管理系统，包含人事、财务、项目管理等模块',
      category: 'enterprise',
      type: 'project',
      thumbnail: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=enterprise%20management%20system%20dashboard%20with%20charts%20and%20data%20visualization&image_size=landscape_4_3',
      author: '李四',
      authorAvatar: '',
      rating: 4.6,
      downloads: 890,
      likes: 67,
      tags: ['企业', '管理', 'Vue', 'Spring Boot'],
      isPremium: false,
      isPopular: true,
      createdAt: '2024-01-08',
      preview: '企业级管理系统，模块化设计，易于扩展和定制',
    },
    {
      id: '3',
      name: '移动应用UI模板',
      description: '现代化移动应用界面设计模板，包含常用页面和组件',
      category: 'mobile',
      type: 'project',
      thumbnail: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=mobile%20app%20ui%20design%20template%20with%20modern%20interface%20elements&image_size=portrait_4_3',
      author: '王五',
      authorAvatar: '',
      rating: 4.7,
      downloads: 2100,
      likes: 156,
      tags: ['移动端', 'UI设计', 'React Native', 'Flutter'],
      isPremium: false,
      isPopular: true,
      createdAt: '2024-01-12',
      preview: '精美的移动应用界面设计，支持多种屏幕尺寸',
    },
    {
      id: '4',
      name: 'API文档模板',
      description: '标准化的API接口文档模板，包含完整的接口规范和示例',
      category: 'documentation',
      type: 'document',
      thumbnail: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=api%20documentation%20template%20with%20code%20examples%20and%20specifications&image_size=landscape_4_3',
      author: '赵六',
      authorAvatar: '',
      rating: 4.9,
      downloads: 3200,
      likes: 245,
      tags: ['API', '文档', 'OpenAPI', 'Swagger'],
      isPremium: false,
      isPopular: true,
      createdAt: '2024-01-05',
      preview: '规范化的API文档模板，支持自动生成和在线测试',
    },
    {
      id: '5',
      name: '需求分析文档模板',
      description: '软件项目需求分析的标准化文档模板，包含用例图、流程图等',
      category: 'documentation',
      type: 'document',
      thumbnail: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=software%20requirements%20analysis%20document%20template%20with%20diagrams&image_size=landscape_4_3',
      author: '孙七',
      authorAvatar: '',
      rating: 4.5,
      downloads: 1800,
      likes: 134,
      tags: ['需求分析', '文档', 'UML', '流程图'],
      isPremium: true,
      isPopular: false,
      createdAt: '2024-01-03',
      preview: '专业的需求分析文档模板，帮助规范化项目需求管理',
    },
    {
      id: '6',
      name: '数据库设计模板',
      description: '数据库设计文档模板，包含ER图、表结构设计等',
      category: 'database',
      type: 'document',
      thumbnail: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=database%20design%20template%20with%20er%20diagram%20and%20table%20structures&image_size=landscape_4_3',
      author: '周八',
      authorAvatar: '',
      rating: 4.4,
      downloads: 950,
      likes: 78,
      tags: ['数据库', 'ER图', 'MySQL', 'PostgreSQL'],
      isPremium: false,
      isPopular: false,
      createdAt: '2024-01-01',
      preview: '完整的数据库设计文档模板，包含设计规范和最佳实践',
    },
  ]);

  const categories = [
    { value: 'all', label: '全部分类' },
    { value: 'ecommerce', label: '电商平台' },
    { value: 'enterprise', label: '企业管理' },
    { value: 'mobile', label: '移动应用' },
    { value: 'documentation', label: '文档模板' },
    { value: 'database', label: '数据库' },
  ];

  const typeOptions = [
    { value: 'all', label: '全部类型' },
    { value: 'project', label: '项目模板' },
    { value: 'document', label: '文档模板' },
  ];

  const handlePreview = (template: Template) => {
    setSelectedTemplate(template);
    setPreviewVisible(true);
  };

  const handleUseTemplate = (template: Template) => {
    Modal.confirm({
      title: '使用模板',
      content: `确定要使用模板 "${template.name}" 创建新项目吗？`,
      onOk: () => {
        // 这里可以跳转到项目创建页面，并预填模板信息
        console.log('使用模板:', template.id);
      },
    });
  };

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchText.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchText.toLowerCase()) ||
                         template.tags.some(tag => tag.toLowerCase().includes(searchText.toLowerCase()));
    const matchesCategory = filterCategory === 'all' || template.category === filterCategory;
    const matchesType = filterType === 'all' || template.type === filterType;
    
    let matchesTab = true;
    if (activeTab === 'popular') {
      matchesTab = template.isPopular;
    } else if (activeTab === 'premium') {
      matchesTab = template.isPremium;
    } else if (activeTab === 'free') {
      matchesTab = !template.isPremium;
    }
    
    return matchesSearch && matchesCategory && matchesType && matchesTab;
  });

  const renderTemplateCard = (template: Template) => (
    <Card
      key={template.id}
      hoverable
      className="h-full"
      cover={
        <div className="relative">
          <img
            alt={template.name}
            src={template.thumbnail}
            className="h-48 w-full object-cover"
          />
          <div className="absolute top-2 right-2 flex gap-1">
            {template.isPremium && (
              <Badge.Ribbon text="Premium" color="gold">
                <div />
              </Badge.Ribbon>
            )}
            {template.isPopular && (
              <Tag color="red" icon={<FireOutlined />}>热门</Tag>
            )}
          </div>
        </div>
      }
      actions={[
        <Tooltip title="预览">
          <Button 
            type="text" 
            icon={<EyeOutlined />} 
            onClick={() => handlePreview(template)}
          />
        </Tooltip>,
        <Tooltip title="收藏">
          <Button type="text" icon={<HeartOutlined />} />
        </Tooltip>,
        <Button 
          type="primary" 
          size="small"
          onClick={() => handleUseTemplate(template)}
        >
          使用模板
        </Button>,
      ]}
    >
      <Card.Meta
        title={
          <div className="flex items-center justify-between">
            <span className="truncate">{template.name}</span>
            {template.isPremium && <CrownOutlined className="text-yellow-500" />}
          </div>
        }
        description={
          <div>
            <Paragraph 
              ellipsis={{ rows: 2 }} 
              className="text-gray-600 mb-3"
            >
              {template.description}
            </Paragraph>
            
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <Avatar size="small" icon={<UserOutlined />} className="mr-2" />
                <Text className="text-sm text-gray-500">{template.author}</Text>
              </div>
              <div className="flex items-center">
                <Rate disabled defaultValue={template.rating} className="text-xs mr-2" />
                <Text className="text-sm text-gray-500">({template.rating})</Text>
              </div>
            </div>
            
            <div className="flex items-center justify-between mb-3">
              <Space size="small">
                <Text className="text-sm text-gray-500">
                  <DownloadOutlined /> {template.downloads}
                </Text>
                <Text className="text-sm text-gray-500">
                  <HeartOutlined /> {template.likes}
                </Text>
              </Space>
              <Text className="text-sm text-gray-500">
                <ClockCircleOutlined /> {template.createdAt}
              </Text>
            </div>
            
            <div className="flex flex-wrap gap-1">
              {template.tags.slice(0, 3).map(tag => (
                <Tag key={tag}>{tag}</Tag>
              ))}
              {template.tags.length > 3 && (
                <Tag>+{template.tags.length - 3}</Tag>
              )}
            </div>
          </div>
        }
      />
    </Card>
  );

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <Title level={2} className="mb-2">模板中心</Title>
        <Text className="text-lg text-gray-600">
          发现和使用优质的项目模板，快速启动您的项目
        </Text>
      </div>

      {/* 搜索和筛选 */}
      <Card className="mb-6">
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={8}>
            <Search
              placeholder="搜索模板名称、描述或标签"
              allowClear
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              prefix={<SearchOutlined />}
            />
          </Col>
          <Col xs={12} sm={6} md={4}>
            <Select
              value={filterCategory}
              onChange={setFilterCategory}
              style={{ width: '100%' }}
              suffixIcon={<FilterOutlined />}
            >
              {categories.map(category => (
                <Option key={category.value} value={category.value}>{category.label}</Option>
              ))}
            </Select>
          </Col>
          <Col xs={12} sm={6} md={4}>
            <Select
              value={filterType}
              onChange={setFilterType}
              style={{ width: '100%' }}
            >
              {typeOptions.map(type => (
                <Option key={type.value} value={type.value}>{type.label}</Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} md={8}>
            <div className="flex justify-end">
              <Text className="text-sm text-gray-500">
                共找到 {filteredTemplates.length} 个模板
              </Text>
            </div>
          </Col>
        </Row>
      </Card>

      {/* 分类标签 */}
      <Card className="mb-6">
        <Tabs 
          activeKey={activeTab} 
          onChange={setActiveTab}
          items={[
            {
              key: 'all',
              label: '全部模板'
            },
            {
              key: 'popular',
              label: (
                <span>
                  <FireOutlined /> 热门推荐
                </span>
              )
            },
            {
              key: 'premium',
              label: (
                <span>
                  <CrownOutlined /> 高级模板
                </span>
              )
            },
            {
              key: 'free',
              label: (
                <span>
                  <GiftOutlined /> 免费模板
                </span>
              )
            }
          ]}
        />
      </Card>

      {/* 模板网格 */}
      <Row gutter={[24, 24]}>
        {filteredTemplates.map(template => (
          <Col key={template.id} xs={24} sm={12} lg={8} xl={6}>
            {renderTemplateCard(template)}
          </Col>
        ))}
      </Row>

      {filteredTemplates.length === 0 && (
        <Card className="text-center py-12">
          <Text className="text-gray-500">没有找到匹配的模板，请尝试调整搜索条件</Text>
        </Card>
      )}

      {/* 预览模态框 */}
      <Modal
        title={selectedTemplate?.name}
        open={previewVisible}
        onCancel={() => setPreviewVisible(false)}
        width={900}
        footer={[
          <Button key="cancel" onClick={() => setPreviewVisible(false)}>
            关闭
          </Button>,
          <Button 
            key="use" 
            type="primary" 
            onClick={() => selectedTemplate && handleUseTemplate(selectedTemplate)}
          >
            使用此模板
          </Button>,
        ]}
      >
        {selectedTemplate && (
          <div>
            <Row gutter={24}>
              <Col span={12}>
                <img
                  src={selectedTemplate.thumbnail}
                  alt={selectedTemplate.name}
                  className="w-full rounded-lg"
                />
              </Col>
              <Col span={12}>
                <div className="space-y-4">
                  <div>
                    <Text strong>作者：</Text>
                    <span className="ml-2">{selectedTemplate.author}</span>
                  </div>
                  <div>
                    <Text strong>评分：</Text>
                    <Rate disabled defaultValue={selectedTemplate.rating} className="ml-2" />
                    <span className="ml-2">({selectedTemplate.rating})</span>
                  </div>
                  <div>
                    <Text strong>下载量：</Text>
                    <span className="ml-2">{selectedTemplate.downloads}</span>
                  </div>
                  <div>
                    <Text strong>标签：</Text>
                    <div className="mt-2">
                      {selectedTemplate.tags.map(tag => (
                        <Tag key={tag} className="mb-1">{tag}</Tag>
                      ))}
                    </div>
                  </div>
                  {selectedTemplate.isPremium && (
                    <div>
                      <Tag color="gold" icon={<CrownOutlined />}>高级模板</Tag>
                    </div>
                  )}
                </div>
              </Col>
            </Row>
            <Divider />
            <div>
              <Title level={4}>模板描述</Title>
              <Paragraph>{selectedTemplate.description}</Paragraph>
              <Paragraph>{selectedTemplate.preview}</Paragraph>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default TemplateCenter;