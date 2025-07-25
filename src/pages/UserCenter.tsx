import React, { useState } from 'react';
import {
  Card,
  Typography,
  Tabs,
  Avatar,
  Button,
  Form,
  Input,
  Select,
  Switch,
  Divider,
  Space,
  Tag,
  List,
  Modal,
  Upload,
  message,
  Row,
  Col,
  Statistic,
  Progress
} from 'antd';
import {
  UserOutlined,
  SettingOutlined,
  BellOutlined,
  SecurityScanOutlined,
  TeamOutlined,
  ProjectOutlined,
  FileTextOutlined,
  EditOutlined,
  CameraOutlined,
  UploadOutlined,
  EyeOutlined
} from '@ant-design/icons';
import { MermaidChart } from '../components/Chart';

const { Title, Text, Paragraph } = Typography;
// const { TabPane } = Tabs; // 已弃用，使用items属性替代
const { Option } = Select;
const { TextArea } = Input;

interface UserProfile {
  id: string;
  username: string;
  email: string;
  fullName: string;
  avatar?: string;
  role: string;
  department: string;
  joinDate: string;
  lastLogin: string;
  status: 'active' | 'inactive';
}

interface UserProject {
  id: string;
  name: string;
  type: string;
  status: string;
  progress: number;
  lastModified: string;
}

interface UserActivity {
  id: string;
  type: 'create' | 'edit' | 'delete' | 'view';
  target: string;
  description: string;
  timestamp: string;
}

const UserCenter: React.FC = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [form] = Form.useForm();

  // 模拟用户数据
  const [userProfile] = useState<UserProfile>({
    id: 'user-001',
    username: 'designer_001',
    email: 'designer@example.com',
    fullName: '张设计师',
    avatar: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20avatar%20portrait%20of%20a%20software%20designer%20with%20modern%20style&image_size=square',
    role: '高级设计师',
    department: '产品设计部',
    joinDate: '2023-01-15',
    lastLogin: '2024-01-20 14:30:00',
    status: 'active'
  });

  const [userProjects] = useState<UserProject[]>([
    {
      id: 'proj-001',
      name: '电商平台设计',
      type: 'Web应用',
      status: '进行中',
      progress: 75,
      lastModified: '2024-01-20'
    },
    {
      id: 'proj-002',
      name: '移动端APP',
      type: '移动应用',
      status: '已完成',
      progress: 100,
      lastModified: '2024-01-18'
    },
    {
      id: 'proj-003',
      name: 'IoT管理系统',
      type: 'IoT系统',
      status: '计划中',
      progress: 25,
      lastModified: '2024-01-19'
    }
  ]);

  const [userActivities] = useState<UserActivity[]>([
    {
      id: 'act-001',
      type: 'create',
      target: '用例图',
      description: '创建了用户登录用例图',
      timestamp: '2024-01-20 14:30:00'
    },
    {
      id: 'act-002',
      type: 'edit',
      target: '系统架构',
      description: '更新了电商平台系统架构',
      timestamp: '2024-01-20 13:45:00'
    },
    {
      id: 'act-003',
      type: 'view',
      target: '领域模型',
      description: '查看了订单管理领域模型',
      timestamp: '2024-01-20 12:20:00'
    },
    {
      id: 'act-004',
      type: 'create',
      target: '架构图',
      description: '生成了微服务架构图',
      timestamp: '2024-01-20 11:15:00'
    }
  ]);

  // 生成用户活动图表
  const generateActivityChart = () => {
    return `graph LR
    A["项目创建"] --> B["需求分析"]
    B --> C["架构设计"]
    C --> D["用例建模"]
    D --> E["领域建模"]
    E --> F["代码生成"]
    F --> G["测试部署"]
    
    style A fill:#e1f5fe
    style B fill:#f3e5f5
    style C fill:#e8f5e8
    style D fill:#fff3e0
    style E fill:#fce4ec
    style F fill:#f1f8e9
    style G fill:#e0f2f1`;
  };

  const handleEditProfile = () => {
    form.setFieldsValue(userProfile);
    setIsEditModalVisible(true);
  };

  const handleSaveProfile = async () => {
    try {
      const values = await form.validateFields();
      console.log('保存用户信息:', values);
      message.success('用户信息更新成功');
      setIsEditModalVisible(false);
    } catch (error) {
      console.error('保存失败:', error);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'create': return <ProjectOutlined style={{ color: '#52c41a' }} />;
      case 'edit': return <EditOutlined style={{ color: '#1890ff' }} />;
      case 'delete': return <EditOutlined style={{ color: '#ff4d4f' }} />;
      case 'view': return <EyeOutlined style={{ color: '#722ed1' }} />;
      default: return <FileTextOutlined />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case '进行中': return 'processing';
      case '已完成': return 'success';
      case '计划中': return 'default';
      case '暂停': return 'warning';
      default: return 'default';
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <Title level={2}>
          <UserOutlined className="mr-2" />
          用户中心
        </Title>
        <Text type="secondary" className="text-lg">
          管理个人信息、项目和活动记录
        </Text>
      </div>

      <Tabs 
        activeKey={activeTab} 
        onChange={setActiveTab}
        items={[
          {
            key: 'profile',
            label: (
              <Space>
                <UserOutlined />
                <span>个人资料</span>
              </Space>
            ),
            children: (
              <Row gutter={24}>
            <Col span={8}>
              <Card>
                <div className="text-center">
                  <Avatar
                    size={120}
                    src={userProfile.avatar}
                    icon={<UserOutlined />}
                    className="mb-4"
                  />
                  <div>
                    <Title level={3} className="mb-2">{userProfile.fullName}</Title>
                    <Text type="secondary" className="block mb-2">@{userProfile.username}</Text>
                    <Tag color={userProfile.status === 'active' ? 'green' : 'red'}>
                      {userProfile.status === 'active' ? '在线' : '离线'}
                    </Tag>
                  </div>
                  <Divider />
                  <Button
                    type="primary"
                    icon={<EditOutlined />}
                    onClick={handleEditProfile}
                    block
                  >
                    编辑资料
                  </Button>
                </div>
              </Card>
            </Col>
            
            <Col span={16}>
              <Card title="基本信息">
                <Row gutter={[16, 16]}>
                  <Col span={12}>
                    <div>
                      <Text strong>邮箱地址</Text>
                      <div className="mt-1">
                        <Text>{userProfile.email}</Text>
                      </div>
                    </div>
                  </Col>
                  <Col span={12}>
                    <div>
                      <Text strong>职位角色</Text>
                      <div className="mt-1">
                        <Text>{userProfile.role}</Text>
                      </div>
                    </div>
                  </Col>
                  <Col span={12}>
                    <div>
                      <Text strong>所属部门</Text>
                      <div className="mt-1">
                        <Text>{userProfile.department}</Text>
                      </div>
                    </div>
                  </Col>
                  <Col span={12}>
                    <div>
                      <Text strong>加入时间</Text>
                      <div className="mt-1">
                        <Text>{userProfile.joinDate}</Text>
                      </div>
                    </div>
                  </Col>
                  <Col span={12}>
                    <div>
                      <Text strong>最后登录</Text>
                      <div className="mt-1">
                        <Text>{userProfile.lastLogin}</Text>
                      </div>
                    </div>
                  </Col>
                </Row>
              </Card>
              
              <Card title="统计信息" className="mt-4">
                <Row gutter={16}>
                  <Col span={6}>
                    <Statistic title="参与项目" value={userProjects.length} suffix="个" />
                  </Col>
                  <Col span={6}>
                    <Statistic title="完成项目" value={userProjects.filter(p => p.status === '已完成').length} suffix="个" />
                  </Col>
                  <Col span={6}>
                    <Statistic title="活动记录" value={userActivities.length} suffix="条" />
                  </Col>
                  <Col span={6}>
                    <Statistic title="平均进度" value={Math.round(userProjects.reduce((sum, p) => sum + p.progress, 0) / userProjects.length)} suffix="%" />
                  </Col>
                </Row>
              </Card>
            </Col>
          </Row>
            )
          },
          {
            key: 'projects',
            label: (
              <Space>
                <ProjectOutlined />
                <span>我的项目</span>
              </Space>
            ),
            children: (
              <List
            grid={{ gutter: 16, column: 2 }}
            dataSource={userProjects}
            renderItem={(project) => (
              <List.Item>
                <Card
                  title={project.name}
                  extra={<Tag color={getStatusColor(project.status)}>{project.status}</Tag>}
                  actions={[
                    <Button type="link" icon={<EyeOutlined />}>查看</Button>,
                    <Button type="link" icon={<EditOutlined />}>编辑</Button>
                  ]}
                >
                  <div className="mb-3">
                    <Text type="secondary">类型: {project.type}</Text>
                  </div>
                  <div className="mb-3">
                    <Text>进度: </Text>
                    <Progress percent={project.progress} size="small" />
                  </div>
                  <div>
                    <Text type="secondary">最后修改: {project.lastModified}</Text>
                  </div>
                </Card>
              </List.Item>
            )}
          />
            )
          },
          {
            key: 'activities',
            label: (
              <Space>
                <FileTextOutlined />
                <span>活动记录</span>
              </Space>
            ),
            children: (
              <Row gutter={24}>
            <Col span={16}>
              <Card title="最近活动">
                <List
                  dataSource={userActivities}
                  renderItem={(activity) => (
                    <List.Item>
                      <List.Item.Meta
                        avatar={getActivityIcon(activity.type)}
                        title={activity.description}
                        description={
                          <Space>
                            <Tag>{activity.target}</Tag>
                            <Text type="secondary">{activity.timestamp}</Text>
                          </Space>
                        }
                      />
                    </List.Item>
                  )}
                />
              </Card>
            </Col>
            
            <Col span={8}>
              <Card title="工作流程图">
                <MermaidChart
                  chart={{
                    id: 'user-workflow',
                    type: 'flowchart',
                    code: generateActivityChart(),
                    title: '用户工作流程'
                  }}
                  height={400}
                />
              </Card>
            </Col>
          </Row>
            )
          },
          {
            key: 'settings',
            label: (
              <Space>
                <SettingOutlined />
                <span>账户设置</span>
              </Space>
            ),
            children: (
              <Row gutter={24}>
            <Col span={12}>
              <Card title="通知设置">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <Text strong>邮件通知</Text>
                      <div><Text type="secondary">接收项目更新邮件</Text></div>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <Divider />
                  <div className="flex justify-between items-center">
                    <div>
                      <Text strong>系统通知</Text>
                      <div><Text type="secondary">接收系统消息推送</Text></div>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <Divider />
                  <div className="flex justify-between items-center">
                    <div>
                      <Text strong>活动提醒</Text>
                      <div><Text type="secondary">接收活动和截止日期提醒</Text></div>
                    </div>
                    <Switch />
                  </div>
                </div>
              </Card>
            </Col>
            
            <Col span={12}>
              <Card title="安全设置">
                <div className="space-y-4">
                  <Button block icon={<SecurityScanOutlined />}>
                    修改密码
                  </Button>
                  <Button block icon={<TeamOutlined />}>
                    两步验证
                  </Button>
                  <Button block icon={<BellOutlined />}>
                    登录设备管理
                  </Button>
                  <Divider />
                  <Button block danger>
                    注销账户
                  </Button>
                </div>
              </Card>
            </Col>
          </Row>
            )
          }
        ]}
      />

      {/* 编辑资料模态框 */}
      <Modal
        title="编辑个人资料"
        open={isEditModalVisible}
        onCancel={() => setIsEditModalVisible(false)}
        onOk={handleSaveProfile}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="fullName"
                label="姓名"
                rules={[{ required: true, message: '请输入姓名' }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="username"
                label="用户名"
                rules={[{ required: true, message: '请输入用户名' }]}
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="email"
                label="邮箱"
                rules={[
                  { required: true, message: '请输入邮箱' },
                  { type: 'email', message: '请输入有效的邮箱地址' }
                ]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="role"
                label="职位"
              >
                <Select>
                  <Option value="初级设计师">初级设计师</Option>
                  <Option value="中级设计师">中级设计师</Option>
                  <Option value="高级设计师">高级设计师</Option>
                  <Option value="架构师">架构师</Option>
                  <Option value="技术经理">技术经理</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          
          <Form.Item
            name="department"
            label="部门"
          >
            <Select>
              <Option value="产品设计部">产品设计部</Option>
              <Option value="技术开发部">技术开发部</Option>
              <Option value="架构设计部">架构设计部</Option>
              <Option value="项目管理部">项目管理部</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default UserCenter;