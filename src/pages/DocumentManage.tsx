import React, { useState } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Tag,
  Input,
  Select,
  Row,
  Col,
  Typography,
  Modal,
  Dropdown,
  Menu,
  message,
  Tooltip,
  Divider,
} from 'antd';
import {
  SearchOutlined,
  FilterOutlined,
  DownloadOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  ShareAltOutlined,
  CopyOutlined,
  FileTextOutlined,
  FolderOutlined,
  MoreOutlined,
  ExportOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;

interface Document {
  id: string;
  name: string;
  type: string;
  project: string;
  size: string;
  status: 'completed' | 'generating' | 'error';
  createdAt: string;
  updatedAt: string;
  author: string;
  tags: string[];
  description: string;
}

const DocumentManage: React.FC = () => {
  const [searchText, setSearchText] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewDocument, setPreviewDocument] = useState<Document | null>(null);

  // 模拟文档数据
  const [documents] = useState<Document[]>([
    {
      id: '1',
      name: '电商平台功能树',
      type: 'feature-tree',
      project: '电商平台项目',
      size: '45KB',
      status: 'completed',
      createdAt: '2024-01-15 10:30:00',
      updatedAt: '2024-01-15 14:20:00',
      author: '张三',
      tags: ['功能分析', '核心文档'],
      description: '电商平台完整功能树结构图',
    },
    {
      id: '2',
      name: '用户管理需求文档',
      type: 'requirements',
      project: '电商平台项目',
      size: '128KB',
      status: 'completed',
      createdAt: '2024-01-15 11:00:00',
      updatedAt: '2024-01-15 15:45:00',
      author: '李四',
      tags: ['需求分析', '用户模块'],
      description: '用户注册、登录、权限管理等需求详细说明',
    },
    {
      id: '3',
      name: '系统架构UML图',
      type: 'uml-diagram',
      project: '电商平台项目',
      size: '89KB',
      status: 'completed',
      createdAt: '2024-01-15 12:15:00',
      updatedAt: '2024-01-15 16:30:00',
      author: '王五',
      tags: ['架构设计', 'UML'],
      description: '系统整体架构和模块关系图',
    },
    {
      id: '4',
      name: 'API接口文档',
      type: 'api-spec',
      project: '移动应用项目',
      size: '256KB',
      status: 'generating',
      createdAt: '2024-01-16 09:00:00',
      updatedAt: '2024-01-16 09:00:00',
      author: '赵六',
      tags: ['接口设计', '开发文档'],
      description: 'RESTful API接口规范和示例',
    },
    {
      id: '5',
      name: '数据库设计文档',
      type: 'database',
      project: '移动应用项目',
      size: '178KB',
      status: 'completed',
      createdAt: '2024-01-16 10:30:00',
      updatedAt: '2024-01-16 14:15:00',
      author: '孙七',
      tags: ['数据库', '设计文档'],
      description: '数据库表结构设计和关系图',
    },
  ]);

  const documentTypes = [
    { value: 'all', label: '全部类型' },
    { value: 'feature-tree', label: '功能树' },
    { value: 'requirements', label: '需求文档' },
    { value: 'uml-diagram', label: 'UML图' },
    { value: 'api-spec', label: 'API文档' },
    { value: 'database', label: '数据库文档' },
  ];

  const statusOptions = [
    { value: 'all', label: '全部状态' },
    { value: 'completed', label: '已完成' },
    { value: 'generating', label: '生成中' },
    { value: 'error', label: '错误' },
  ];

  const getStatusTag = (status: string) => {
    const statusConfig = {
      completed: { color: 'success', text: '已完成' },
      generating: { color: 'processing', text: '生成中' },
      error: { color: 'error', text: '错误' },
    };
    const config = statusConfig[status as keyof typeof statusConfig];
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const getTypeIcon = (type: string) => {
    const typeIcons = {
      'feature-tree': <FolderOutlined className="text-blue-500" />,
      'requirements': <FileTextOutlined className="text-green-500" />,
      'uml-diagram': <FileTextOutlined className="text-purple-500" />,
      'api-spec': <FileTextOutlined className="text-orange-500" />,
      'database': <FileTextOutlined className="text-red-500" />,
    };
    return typeIcons[type as keyof typeof typeIcons] || <FileTextOutlined />;
  };

  const handlePreview = (document: Document) => {
    setPreviewDocument(document);
    setPreviewVisible(true);
  };

  const handleDownload = (document: Document) => {
    message.success(`开始下载: ${document.name}`);
  };

  const handleShare = (document: Document) => {
    navigator.clipboard.writeText(`${window.location.origin}/documents/${document.id}`);
    message.success('分享链接已复制到剪贴板');
  };

  const handleBatchDownload = () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请选择要下载的文档');
      return;
    }
    message.success(`开始批量下载 ${selectedRowKeys.length} 个文档`);
  };

  const handleBatchDelete = () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请选择要删除的文档');
      return;
    }
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除选中的 ${selectedRowKeys.length} 个文档吗？此操作不可恢复。`,
      onOk: () => {
        message.success(`已删除 ${selectedRowKeys.length} 个文档`);
        setSelectedRowKeys([]);
      },
    });
  };

  const actionMenu = (document: Document) => (
    <Menu>
      <Menu.Item key="preview" icon={<EyeOutlined />} onClick={() => handlePreview(document)}>
        预览
      </Menu.Item>
      <Menu.Item key="edit" icon={<EditOutlined />}>
        编辑
      </Menu.Item>
      <Menu.Item key="download" icon={<DownloadOutlined />} onClick={() => handleDownload(document)}>
        下载
      </Menu.Item>
      <Menu.Item key="share" icon={<ShareAltOutlined />} onClick={() => handleShare(document)}>
        分享
      </Menu.Item>
      <Menu.Item key="copy" icon={<CopyOutlined />}>
        复制
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="delete" icon={<DeleteOutlined />} danger>
        删除
      </Menu.Item>
    </Menu>
  );

  const columns: ColumnsType<Document> = [
    {
      title: '文档名称',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <div className="flex items-center">
          {getTypeIcon(record.type)}
          <div className="ml-3">
            <div className="font-medium text-gray-900">{text}</div>
            <div className="text-sm text-gray-500">{record.description}</div>
          </div>
        </div>
      ),
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      render: (type) => {
        const typeLabels = {
          'feature-tree': '功能树',
          'requirements': '需求文档',
          'uml-diagram': 'UML图',
          'api-spec': 'API文档',
          'database': '数据库文档',
        };
        return typeLabels[type as keyof typeof typeLabels] || type;
      },
    },
    {
      title: '项目',
      dataIndex: 'project',
      key: 'project',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => getStatusTag(status),
    },
    {
      title: '大小',
      dataIndex: 'size',
      key: 'size',
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (text) => (
        <div>
          <div>{text.split(' ')[0]}</div>
          <div className="text-sm text-gray-500">{text.split(' ')[1]}</div>
        </div>
      ),
    },
    {
      title: '标签',
      dataIndex: 'tags',
      key: 'tags',
      render: (tags: string[]) => (
        <div>
          {tags.map(tag => (
            <Tag key={tag} className="mb-1">{tag}</Tag>
          ))}
        </div>
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="预览">
            <Button 
              type="text" 
              icon={<EyeOutlined />} 
              onClick={() => handlePreview(record)}
            />
          </Tooltip>
          <Tooltip title="下载">
            <Button 
              type="text" 
              icon={<DownloadOutlined />} 
              onClick={() => handleDownload(record)}
            />
          </Tooltip>
          <Dropdown overlay={actionMenu(record)} trigger={['click']}>
            <Button type="text" icon={<MoreOutlined />} />
          </Dropdown>
        </Space>
      ),
    },
  ];

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchText.toLowerCase()) ||
                         doc.project.toLowerCase().includes(searchText.toLowerCase()) ||
                         doc.description.toLowerCase().includes(searchText.toLowerCase());
    const matchesType = filterType === 'all' || doc.type === filterType;
    const matchesStatus = filterStatus === 'all' || doc.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const rowSelection = {
    selectedRowKeys,
    onChange: (newSelectedRowKeys: React.Key[]) => {
      setSelectedRowKeys(newSelectedRowKeys);
    },
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <Title level={2} className="mb-2">文档管理</Title>
        <Text className="text-lg text-gray-600">
          管理和查看所有生成的项目文档
        </Text>
      </div>

      {/* 搜索和筛选 */}
      <Card className="mb-6">
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={8}>
            <Search
              placeholder="搜索文档名称、项目或描述"
              allowClear
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              prefix={<SearchOutlined />}
            />
          </Col>
          <Col xs={12} sm={6} md={4}>
            <Select
              value={filterType}
              onChange={setFilterType}
              style={{ width: '100%' }}
              suffixIcon={<FilterOutlined />}
            >
              {documentTypes.map(type => (
                <Option key={type.value} value={type.value}>{type.label}</Option>
              ))}
            </Select>
          </Col>
          <Col xs={12} sm={6} md={4}>
            <Select
              value={filterStatus}
              onChange={setFilterStatus}
              style={{ width: '100%' }}
            >
              {statusOptions.map(status => (
                <Option key={status.value} value={status.value}>{status.label}</Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} md={8}>
            <Space>
              <Button 
                type="primary" 
                icon={<DownloadOutlined />}
                onClick={handleBatchDownload}
                disabled={selectedRowKeys.length === 0}
              >
                批量下载
              </Button>
              <Button 
                icon={<ExportOutlined />}
                disabled={selectedRowKeys.length === 0}
              >
                导出
              </Button>
              <Button 
                danger 
                icon={<DeleteOutlined />}
                onClick={handleBatchDelete}
                disabled={selectedRowKeys.length === 0}
              >
                批量删除
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* 文档列表 */}
      <Card>
        <div className="mb-4 flex justify-between items-center">
          <div>
            <Text strong>共 {filteredDocuments.length} 个文档</Text>
            {selectedRowKeys.length > 0 && (
              <Text className="ml-4 text-blue-600">
                已选择 {selectedRowKeys.length} 个文档
              </Text>
            )}
          </div>
        </div>
        
        <Table
          rowSelection={rowSelection}
          columns={columns}
          dataSource={filteredDocuments}
          rowKey="id"
          pagination={{
            total: filteredDocuments.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
          }}
        />
      </Card>

      {/* 预览模态框 */}
      <Modal
        title={previewDocument?.name}
        open={previewVisible}
        onCancel={() => setPreviewVisible(false)}
        width={800}
        footer={[
          <Button key="download" icon={<DownloadOutlined />} onClick={() => previewDocument && handleDownload(previewDocument)}>
            下载
          </Button>,
          <Button key="edit" type="primary" icon={<EditOutlined />}>
            编辑
          </Button>,
        ]}
      >
        {previewDocument && (
          <div>
            <div className="mb-4 p-4 bg-gray-50 rounded">
              <Row gutter={16}>
                <Col span={12}>
                  <Text strong>项目：</Text> {previewDocument.project}
                </Col>
                <Col span={12}>
                  <Text strong>类型：</Text> {previewDocument.type}
                </Col>
                <Col span={12}>
                  <Text strong>大小：</Text> {previewDocument.size}
                </Col>
                <Col span={12}>
                  <Text strong>状态：</Text> {getStatusTag(previewDocument.status)}
                </Col>
                <Col span={24}>
                  <Text strong>描述：</Text> {previewDocument.description}
                </Col>
              </Row>
            </div>
            <Divider />
            <div className="bg-gray-50 p-4 rounded min-h-96">
              <Text className="text-gray-500">文档内容预览区域...</Text>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default DocumentManage;