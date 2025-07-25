import React, { useState, useEffect } from 'react';
import { Card, Button, Input, Select, Table, Modal, Form, message, Tag, Space, Tabs, Upload, Progress } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, FolderOutlined, GitlabOutlined, UploadOutlined, EyeOutlined, SettingOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

interface Project {
  id: string;
  name: string;
  description: string;
  type: 'web' | 'mobile' | 'desktop' | 'api' | 'microservice';
  status: 'active' | 'inactive' | 'archived';
  repository?: {
    type: 'git' | 'upload';
    url?: string;
    branch?: string;
    token?: string;
  };
  createdAt: string;
  updatedAt: string;
  modules: string[];
  teamMembers: string[];
}

interface ProjectFormData {
  name: string;
  description: string;
  type: 'web' | 'mobile' | 'desktop' | 'api' | 'microservice';
  repositoryType: 'git' | 'upload';
  repositoryUrl?: string;
  repositoryBranch?: string;
  repositoryToken?: string;
}

const ProjectManagement: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // 模拟数据
  useEffect(() => {
    const mockProjects: Project[] = [
      {
        id: '1',
        name: '电商平台',
        description: '基于React的现代化电商平台',
        type: 'web',
        status: 'active',
        repository: {
          type: 'git',
          url: 'https://github.com/company/ecommerce-platform',
          branch: 'main'
        },
        createdAt: '2024-01-15',
        updatedAt: '2024-12-20',
        modules: ['系统架构', '代码分析', '文档管理', '测试平台'],
        teamMembers: ['张三', '李四', '王五']
      },
      {
        id: '2',
        name: '移动端APP',
        description: 'React Native跨平台移动应用',
        type: 'mobile',
        status: 'active',
        repository: {
          type: 'upload'
        },
        createdAt: '2024-02-01',
        updatedAt: '2024-12-19',
        modules: ['系统架构', '代码分析'],
        teamMembers: ['赵六', '钱七']
      },
      {
        id: '3',
        name: '微服务网关',
        description: 'Spring Cloud Gateway微服务网关',
        type: 'microservice',
        status: 'inactive',
        repository: {
          type: 'git',
          url: 'https://gitlab.com/company/gateway-service',
          branch: 'develop'
        },
        createdAt: '2024-03-10',
        updatedAt: '2024-12-18',
        modules: ['系统架构', '文档管理', '自动化部署'],
        teamMembers: ['孙八']
      }
    ];
    setProjects(mockProjects);
  }, []);

  const columns: ColumnsType<Project> = [
    {
      title: '项目名称',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Space>
          <FolderOutlined />
          <span>{text}</span>
        </Space>
      )
    },
    {
      title: '项目类型',
      dataIndex: 'type',
      key: 'type',
      render: (type) => {
        const typeMap = {
          web: { color: 'blue', text: 'Web应用' },
          mobile: { color: 'green', text: '移动应用' },
          desktop: { color: 'purple', text: '桌面应用' },
          api: { color: 'orange', text: 'API服务' },
          microservice: { color: 'red', text: '微服务' }
        };
        const config = typeMap[type];
        return <Tag color={config.color}>{config.text}</Tag>;
      }
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const statusMap = {
          active: { color: 'success', text: '活跃' },
          inactive: { color: 'warning', text: '非活跃' },
          archived: { color: 'default', text: '已归档' }
        };
        const config = statusMap[status];
        return <Tag color={config.color}>{config.text}</Tag>;
      }
    },
    {
      title: '代码仓库',
      dataIndex: 'repository',
      key: 'repository',
      render: (repository) => {
        if (!repository) return '-';
        return (
          <Space>
            {repository.type === 'git' ? <GitlabOutlined /> : <UploadOutlined />}
            <span>{repository.type === 'git' ? 'Git仓库' : '本地上传'}</span>
          </Space>
        );
      }
    },
    {
      title: '启用模块',
      dataIndex: 'modules',
      key: 'modules',
      render: (modules) => (
        <div>
          {modules.map((module: string) => (
            <Tag key={module} style={{ marginBottom: 4 }}>{module}</Tag>
          ))}
        </div>
      )
    },
    {
      title: '更新时间',
      dataIndex: 'updatedAt',
      key: 'updatedAt'
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleSelectProject(record)}
          >
            选择
          </Button>
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEditProject(record)}
          >
            编辑
          </Button>
          <Button
            size="small"
            icon={<SettingOutlined />}
            onClick={() => handleProjectSettings(record)}
          >
            配置
          </Button>
          <Button
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteProject(record.id)}
          >
            删除
          </Button>
        </Space>
      )
    }
  ];

  const handleSelectProject = (project: Project) => {
    setSelectedProject(project);
    message.success(`已选择项目：${project.name}`);
    // 这里可以触发全局状态更新，让其他模块知道当前选择的项目
    localStorage.setItem('selectedProject', JSON.stringify(project));
  };

  const handleCreateProject = () => {
    setEditingProject(null);
    setIsModalVisible(true);
    form.resetFields();
  };

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    setIsModalVisible(true);
    form.setFieldsValue({
      name: project.name,
      description: project.description,
      type: project.type,
      repositoryType: project.repository?.type || 'git',
      repositoryUrl: project.repository?.url,
      repositoryBranch: project.repository?.branch,
      repositoryToken: project.repository?.token
    });
  };

  const handleProjectSettings = (project: Project) => {
    // 打开项目配置页面
    message.info(`打开项目配置：${project.name}`);
  };

  const handleDeleteProject = (projectId: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个项目吗？此操作不可恢复。',
      onOk: () => {
        setProjects(projects.filter(p => p.id !== projectId));
        message.success('项目删除成功');
      }
    });
  };

  const handleModalOk = async () => {
    try {
      const values: ProjectFormData = await form.validateFields();
      setLoading(true);

      // 模拟创建/更新项目
      await new Promise(resolve => setTimeout(resolve, 1000));

      const projectData: Project = {
        id: editingProject?.id || Date.now().toString(),
        name: values.name,
        description: values.description,
        type: values.type,
        status: 'active',
        repository: values.repositoryType === 'git' ? {
          type: 'git',
          url: values.repositoryUrl,
          branch: values.repositoryBranch || 'main',
          token: values.repositoryToken
        } : {
          type: 'upload'
        },
        createdAt: editingProject?.createdAt || new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0],
        modules: ['系统架构', '代码分析', '文档管理'],
        teamMembers: []
      };

      if (editingProject) {
        setProjects(projects.map(p => p.id === editingProject.id ? projectData : p));
        message.success('项目更新成功');
      } else {
        setProjects([...projects, projectData]);
        message.success('项目创建成功');
      }

      setIsModalVisible(false);
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    setEditingProject(null);
  };

  const uploadProps = {
    name: 'file',
    multiple: false,
    accept: '.zip,.tar.gz,.rar',
    beforeUpload: () => false, // 阻止自动上传
    onChange: (info: any) => {
      const { status } = info.file;
      if (status === 'uploading') {
        setUploadProgress(Math.random() * 100);
      }
      if (status === 'done') {
        message.success(`${info.file.name} 文件上传成功`);
        setUploadProgress(100);
      } else if (status === 'error') {
        message.error(`${info.file.name} 文件上传失败`);
      }
    }
  };

  const repositoryTypeWatch = Form.useWatch('repositoryType', form);

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">项目管理</h1>
            <p className="text-gray-600 mt-1">管理和配置您的项目，选择项目后可访问相关功能模块</p>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleCreateProject}
          >
            新建项目
          </Button>
        </div>

        {selectedProject && (
          <Card className="mb-4 bg-blue-50 border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-blue-900">当前选择的项目</h3>
                <p className="text-blue-700">{selectedProject.name} - {selectedProject.description}</p>
              </div>
              <div className="flex space-x-2">
                <Tag color="blue">已选择</Tag>
                <Button size="small" onClick={() => setSelectedProject(null)}>取消选择</Button>
              </div>
            </div>
          </Card>
        )}
      </div>

      <Card>
        <Table
          columns={columns}
          dataSource={projects}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 个项目`
          }}
        />
      </Card>

      <Modal
        title={editingProject ? '编辑项目' : '新建项目'}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        confirmLoading={loading}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            type: 'web',
            repositoryType: 'git',
            repositoryBranch: 'main'
          }}
        >
          <Form.Item
            label="项目名称"
            name="name"
            rules={[{ required: true, message: '请输入项目名称' }]}
          >
            <Input placeholder="请输入项目名称" />
          </Form.Item>

          <Form.Item
            label="项目描述"
            name="description"
            rules={[{ required: true, message: '请输入项目描述' }]}
          >
            <Input.TextArea rows={3} placeholder="请输入项目描述" />
          </Form.Item>

          <Form.Item
            label="项目类型"
            name="type"
            rules={[{ required: true, message: '请选择项目类型' }]}
          >
            <Select placeholder="请选择项目类型">
              <Select.Option value="web">Web应用</Select.Option>
              <Select.Option value="mobile">移动应用</Select.Option>
              <Select.Option value="desktop">桌面应用</Select.Option>
              <Select.Option value="api">API服务</Select.Option>
              <Select.Option value="microservice">微服务</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="代码仓库类型"
            name="repositoryType"
            rules={[{ required: true, message: '请选择代码仓库类型' }]}
          >
            <Select placeholder="请选择代码仓库类型">
              <Select.Option value="git">Git仓库</Select.Option>
              <Select.Option value="upload">本地上传</Select.Option>
            </Select>
          </Form.Item>

          {repositoryTypeWatch === 'git' && (
            <>
              <Form.Item
                label="仓库地址"
                name="repositoryUrl"
                rules={[{ required: true, message: '请输入仓库地址' }]}
              >
                <Input placeholder="https://github.com/username/repository" />
              </Form.Item>

              <Form.Item
                label="分支名称"
                name="repositoryBranch"
              >
                <Input placeholder="main" />
              </Form.Item>

              <Form.Item
                label="访问令牌"
                name="repositoryToken"
              >
                <Input.Password placeholder="可选，私有仓库需要" />
              </Form.Item>
            </>
          )}

          {repositoryTypeWatch === 'upload' && (
            <Form.Item label="上传代码包">
              <Upload.Dragger {...uploadProps}>
                <p className="ant-upload-drag-icon">
                  <UploadOutlined />
                </p>
                <p className="ant-upload-text">点击或拖拽文件到此区域上传</p>
                <p className="ant-upload-hint">
                  支持 .zip, .tar.gz, .rar 格式的压缩包
                </p>
              </Upload.Dragger>
              {uploadProgress > 0 && uploadProgress < 100 && (
                <Progress percent={uploadProgress} className="mt-2" />
              )}
            </Form.Item>
          )}
        </Form>
      </Modal>
    </div>
  );
};

export default ProjectManagement;