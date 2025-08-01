import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Typography,
  Button,
  Space,
  Tag,
  Avatar,
  List,
  Timeline,
  Tabs,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  Progress,
  Badge,
  message,
  Alert
} from 'antd';
import {
  TeamOutlined,
  UserAddOutlined,
  MessageOutlined,
  FileTextOutlined,
  SettingOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ShareAltOutlined,
  ClockCircleOutlined,
  WifiOutlined,
  DisconnectOutlined
} from '@ant-design/icons';
import useCollaboration from '../hooks/useCollaboration';
import CollaborationStatus from '../components/CollaborationStatus';
import { OnlineUser } from '../services/collaborationService';


const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;
// const { TabPane } = Tabs; // 已弃用，使用items属性替代

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: string;
  status: 'online' | 'offline' | 'busy';
  joinDate: string;
  permissions: string[];
}

interface Project {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'completed' | 'paused';
  progress: number;
  startDate: string;
  endDate: string;
  members: string[];
  documents: number;
}

interface Activity {
  id: string;
  user: string;
  action: string;
  target: string;
  timestamp: string;
  type: 'document' | 'comment' | 'member' | 'project';
}

interface Task {
  id: string;
  title: string;
  description: string;
  assignee: string;
  status: 'todo' | 'inprogress' | 'review' | 'completed';
  priority: 'low' | 'medium' | 'high';
  dueDate: string;
  createdAt: string;
}

const ProjectCollaboration: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [inviteModalVisible, setInviteModalVisible] = useState(false);
  const [taskModalVisible, setTaskModalVisible] = useState(false);
  const [selectedProject, setSelectedProject] = useState<string>('1');
  const [form] = Form.useForm();
  const [taskForm] = Form.useForm();
  
  // 当前用户信息（实际项目中应从用户认证系统获取）
  const currentUser: OnlineUser = {
    id: '1',
    name: '张三',
    avatar: '',
    status: 'active',
    currentPage: '/collaboration',
    lastActivity: Date.now()
  };
  
  // 实时协作功能
  const collaboration = useCollaboration({
    projectId: selectedProject,
    user: currentUser,
    autoConnect: true
  });

  // 模拟数据
  const [teamMembers] = useState<TeamMember[]>([
    {
      id: '1',
      name: '张三',
      email: 'zhangsan@example.com',
      role: '项目经理',
      avatar: '',
      status: 'online',
      joinDate: '2024-01-01',
      permissions: ['read', 'write', 'admin'],
    },
    {
      id: '2',
      name: '李四',
      email: 'lisi@example.com',
      role: '前端开发',
      avatar: '',
      status: 'online',
      joinDate: '2024-01-02',
      permissions: ['read', 'write'],
    },
    {
      id: '3',
      name: '王五',
      email: 'wangwu@example.com',
      role: '后端开发',
      avatar: '',
      status: 'busy',
      joinDate: '2024-01-03',
      permissions: ['read', 'write'],
    },
    {
      id: '4',
      name: '赵六',
      email: 'zhaoliu@example.com',
      role: 'UI设计师',
      avatar: '',
      status: 'offline',
      joinDate: '2024-01-04',
      permissions: ['read'],
    },
  ]);

  const [projects] = useState<Project[]>([
    {
      id: '1',
      name: '电商平台项目',
      description: '构建现代化的电商平台系统',
      status: 'active',
      progress: 65,
      startDate: '2024-01-01',
      endDate: '2024-03-31',
      members: ['1', '2', '3'],
      documents: 12,
    },
    {
      id: '2',
      name: '移动应用开发',
      description: '开发跨平台移动应用',
      status: 'active',
      progress: 30,
      startDate: '2024-01-15',
      endDate: '2024-04-15',
      members: ['2', '4'],
      documents: 8,
    },
  ]);

  const [activities] = useState<Activity[]>([
    {
      id: '1',
      user: '张三',
      action: '创建了文档',
      target: 'API接口设计文档',
      timestamp: '2024-01-16 14:30:00',
      type: 'document',
    },
    {
      id: '2',
      user: '李四',
      action: '评论了',
      target: '用户界面设计',
      timestamp: '2024-01-16 13:45:00',
      type: 'comment',
    },
    {
      id: '3',
      user: '王五',
      action: '加入了项目',
      target: '电商平台项目',
      timestamp: '2024-01-16 10:20:00',
      type: 'member',
    },
    {
      id: '4',
      user: '赵六',
      action: '更新了',
      target: '项目进度',
      timestamp: '2024-01-16 09:15:00',
      type: 'project',
    },
  ]);

  const [tasks] = useState<Task[]>([
    {
      id: '1',
      title: '完成用户登录功能',
      description: '实现用户注册、登录、密码重置功能',
      assignee: '李四',
      status: 'inprogress',
      priority: 'high',
      dueDate: '2024-01-20',
      createdAt: '2024-01-15',
    },
    {
      id: '2',
      title: '设计商品详情页',
      description: '设计商品详情页面的UI界面',
      assignee: '赵六',
      status: 'review',
      priority: 'medium',
      dueDate: '2024-01-18',
      createdAt: '2024-01-14',
    },
    {
      id: '3',
      title: '数据库优化',
      description: '优化数据库查询性能',
      assignee: '王五',
      status: 'todo',
      priority: 'low',
      dueDate: '2024-01-25',
      createdAt: '2024-01-16',
    },
  ]);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      online: { color: 'green', text: '在线' },
      offline: { color: 'gray', text: '离线' },
      busy: { color: 'orange', text: '忙碌' },
    };
    const config = statusConfig[status as keyof typeof statusConfig];
    return <Badge color={config.color} text={config.text} />;
  };

  const getTaskStatusTag = (status: string) => {
    const statusConfig = {
      todo: { color: 'default', text: '待办' },
      inprogress: { color: 'processing', text: '进行中' },
      review: { color: 'warning', text: '待审核' },
      completed: { color: 'success', text: '已完成' },
    };
    const config = statusConfig[status as keyof typeof statusConfig];
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const getPriorityTag = (priority: string) => {
    const priorityConfig = {
      low: { color: 'blue', text: '低' },
      medium: { color: 'orange', text: '中' },
      high: { color: 'red', text: '高' },
    };
    const config = priorityConfig[priority as keyof typeof priorityConfig];
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const getActivityIcon = (type: string) => {
    const iconConfig = {
      document: <FileTextOutlined className="text-blue-500" />,
      comment: <MessageOutlined className="text-green-500" />,
      member: <TeamOutlined className="text-purple-500" />,
      project: <SettingOutlined className="text-orange-500" />,
    };
    return iconConfig[type as keyof typeof iconConfig];
  };

  const handleInviteMember = (values: any) => {
    console.log('邀请成员:', values);
    
    // 发送协作事件
    collaboration.sendEvent({
      type: 'user_join',
      userId: 'new_user_id',
      userName: values.email,
      projectId: selectedProject,
      data: {
        email: values.email,
        role: values.role,
        message: values.message
      }
    });
    
    setInviteModalVisible(false);
    form.resetFields();
    message.success(`邀请已发送至 ${values.email}`);
  };

  const handleCreateTask = (values: any) => {
    console.log('创建任务:', values);
    
    // 发送协作事件
    collaboration.updateTask('new_task', {
      action: 'create',
      title: values.title,
      assignee: values.assignee
    });
    
    setTaskModalVisible(false);
    taskForm.resetFields();
    message.success('任务创建成功');
  };
  
  // 监听协作事件
  useEffect(() => {
    const unsubscribe = collaboration.onEvent((event) => {
      console.log('收到协作事件:', event);
      
      // 根据事件类型更新本地状态
      switch (event.type) {
        case 'task_update':
          // 这里可以更新本地任务状态
          break;
        case 'comment_add':
          // 这里可以更新评论列表
          break;
      }
    });
    
    return unsubscribe;
  }, [collaboration]);
  
  // 当项目切换时重新连接协作服务
  useEffect(() => {
    if (collaboration.isConnected) {
      collaboration.disconnect();
      setTimeout(() => {
        collaboration.connect();
      }, 100);
    }
  }, [selectedProject]);

  const currentProject = projects.find(p => p.id === selectedProject);

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <Title level={2} className="mb-2">项目协作</Title>
            <Text className="text-lg text-gray-600">
              与团队成员协作，共同推进项目进展
            </Text>
          </div>
          
          {/* 协作状态显示 */}
          <CollaborationStatus
            onlineUsers={collaboration.onlineUsers}
            recentEvents={collaboration.recentEvents}
            isConnected={collaboration.isConnected}
            className="flex-shrink-0"
          />
        </div>
        
        {/* 连接状态提示 */}
        {!collaboration.isConnected && (
          <Alert
            message="协作服务未连接"
            description="实时协作功能暂时不可用，请检查网络连接或稍后重试。"
            type="warning"
            icon={<DisconnectOutlined />}
            action={
              <Button 
                size="small" 
                type="primary" 
                loading={collaboration.isConnecting}
                onClick={collaboration.connect}
              >
                重新连接
              </Button>
            }
            className="mb-4"
            closable
          />
        )}
        
        {collaboration.isConnected && collaboration.onlineUsers.length > 1 && (
          <Alert
            message={`当前有 ${collaboration.onlineUsers.length} 人在线协作`}
            type="info"
            icon={<WifiOutlined />}
            className="mb-4"
            closable
          />
        )}
      </div>

      {/* 项目选择 */}
      <Card className="mb-6">
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={8}>
            <div className="flex items-center">
              <Text strong className="mr-3">当前项目：</Text>
              <Select
                value={selectedProject}
                onChange={setSelectedProject}
                style={{ width: 200 }}
              >
                {projects.map(project => (
                  <Option key={project.id} value={project.id}>{project.name}</Option>
                ))}
              </Select>
            </div>
          </Col>
          <Col xs={24} sm={12} md={16}>
            <div className="flex justify-end">
              <Space>
                <Button 
                  type="primary" 
                  icon={<UserAddOutlined />}
                  onClick={() => setInviteModalVisible(true)}
                >
                  邀请成员
                </Button>
                <Button icon={<ShareAltOutlined />}>
                  分享项目
                </Button>
                <Button icon={<SettingOutlined />}>
                  项目设置
                </Button>
              </Space>
            </div>
          </Col>
        </Row>
      </Card>

      <Tabs 
        activeKey={activeTab} 
        onChange={setActiveTab}
        items={[
          {
            key: 'overview',
            label: '项目概览',
            children: (
          <Row gutter={[24, 24]}>
            <Col xs={24} lg={16}>
              {/* 项目信息 */}
              <Card title="项目信息" className="mb-6">
                {currentProject && (
                  <div>
                    <Row gutter={[16, 16]}>
                      <Col span={12}>
                        <div className="mb-4">
                          <Text strong>项目名称：</Text>
                          <div className="mt-1">{currentProject.name}</div>
                        </div>
                        <div className="mb-4">
                          <Text strong>项目状态：</Text>
                          <div className="mt-1">
                            <Tag color={currentProject.status === 'active' ? 'green' : 'orange'}>
                              {currentProject.status === 'active' ? '进行中' : '已暂停'}
                            </Tag>
                          </div>
                        </div>
                      </Col>
                      <Col span={12}>
                        <div className="mb-4">
                          <Text strong>开始时间：</Text>
                          <div className="mt-1">{currentProject.startDate}</div>
                        </div>
                        <div className="mb-4">
                          <Text strong>预计完成：</Text>
                          <div className="mt-1">{currentProject.endDate}</div>
                        </div>
                      </Col>
                    </Row>
                    <div className="mb-4">
                      <Text strong>项目描述：</Text>
                      <div className="mt-1">{currentProject.description}</div>
                    </div>
                    <div className="mb-4">
                      <Text strong>项目进度：</Text>
                      <Progress 
                        percent={currentProject.progress} 
                        strokeColor={{
                          '0%': '#2563EB',
                          '100%': '#10B981',
                        }}
                        className="mt-2"
                      />
                    </div>
                  </div>
                )}
              </Card>

              {/* 最近活动 */}
              <Card title="最近活动" extra={<Button type="link">查看全部</Button>}>
                <Timeline>
                  {activities.slice(0, 5).map(activity => (
                    <Timeline.Item
                      key={activity.id}
                      dot={getActivityIcon(activity.type)}
                    >
                      <div>
                        <Text strong>{activity.user}</Text>
                        <span className="mx-2">{activity.action}</span>
                        <Text className="text-blue-600">{activity.target}</Text>
                        <div className="text-sm text-gray-500 mt-1">
                          <ClockCircleOutlined className="mr-1" />
                          {activity.timestamp}
                        </div>
                      </div>
                    </Timeline.Item>
                  ))}
                </Timeline>
              </Card>
            </Col>

            <Col xs={24} lg={8}>
              {/* 团队成员 */}
              <Card 
                title={
                  <div className="flex items-center justify-between">
                    <span>团队成员</span>
                    {collaboration.isConnected && (
                      <Badge 
                        count={collaboration.onlineUsers.length} 
                        showZero 
                        style={{ backgroundColor: '#52c41a' }}
                        title="在线人数"
                      />
                    )}
                  </div>
                }
                extra={
                  <Button 
                    type="link" 
                    icon={<UserAddOutlined />}
                    onClick={() => setInviteModalVisible(true)}
                  >
                    邀请
                  </Button>
                }
                className="mb-6"
              >
                <List
                  dataSource={teamMembers.map(member => {
                    // 查找对应的在线用户状态
                    const onlineUser = collaboration.onlineUsers.find(u => u.id === member.id);
                    return {
                      ...member,
                      isOnline: !!onlineUser,
                      realTimeStatus: onlineUser?.status || 'offline'
                    };
                  })}
                  renderItem={member => {
                    const statusConfig = {
                      active: { color: 'green', text: '活跃', dot: 'success' as const },
                      idle: { color: 'orange', text: '空闲', dot: 'warning' as const },
                      away: { color: 'gray', text: '离开', dot: 'default' as const },
                      offline: { color: 'gray', text: '离线', dot: 'default' as const }
                    };
                    
                    const currentStatus = member.isOnline ? member.realTimeStatus : 'offline';
                    const config = statusConfig[currentStatus as keyof typeof statusConfig];
                    
                    return (
                      <List.Item>
                        <List.Item.Meta
                          avatar={
                            <Badge dot status={config.dot}>
                              <Avatar>{member.name[0]}</Avatar>
                            </Badge>
                          }
                          title={
                            <div className="flex items-center justify-between">
                              <span>{member.name}</span>
                              {member.isOnline && (
                                 <Tag color={config.color}>
                                   {config.text}
                                 </Tag>
                               )}
                            </div>
                          }
                          description={
                            <div>
                              <div>{member.role}</div>
                              <div className="text-xs text-gray-500">
                                {member.isOnline ? '在线' : '离线'}
                              </div>
                            </div>
                          }
                        />
                      </List.Item>
                    );
                  }}
                />
              </Card>

              {/* 项目统计 */}
              <Card title="项目统计">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <Text>团队成员</Text>
                    <Text strong>{teamMembers.length} 人</Text>
                  </div>
                  <div className="flex justify-between items-center">
                    <Text>项目文档</Text>
                    <Text strong>{currentProject?.documents || 0} 个</Text>
                  </div>
                  <div className="flex justify-between items-center">
                    <Text>待办任务</Text>
                    <Text strong>{tasks.filter(t => t.status !== 'completed').length} 个</Text>
                  </div>
                  <div className="flex justify-between items-center">
                    <Text>项目进度</Text>
                    <Text strong>{currentProject?.progress || 0}%</Text>
                  </div>
                </div>
              </Card>
            </Col>
          </Row>
             )
           },
           {
             key: 'tasks',
             label: '任务管理',
             children: (
          <Card 
            title="任务列表" 
            extra={
              <Button 
                type="primary" 
                icon={<PlusOutlined />}
                onClick={() => setTaskModalVisible(true)}
              >
                创建任务
              </Button>
            }
          >
            <List
              dataSource={tasks}
              renderItem={task => {
                const handleTaskStatusChange = (newStatus: string) => {
                  // 发送协作事件
                  collaboration.updateTask(task.id, {
                    action: 'status_change',
                    oldStatus: task.status,
                    newStatus,
                    title: task.title
                  });
                  
                  message.success(`任务状态已更新为: ${getTaskStatusTag(newStatus).props.children}`);
                };
                
                const handleTaskEdit = () => {
                  // 发送协作事件
                  collaboration.updateTask(task.id, {
                    action: 'edit',
                    title: task.title
                  });
                };
                
                return (
                  <List.Item
                    actions={[
                      <Button 
                        type="link" 
                        icon={<EditOutlined />}
                        onClick={handleTaskEdit}
                      >
                        编辑
                      </Button>,
                      <Button type="link" danger icon={<DeleteOutlined />}>删除</Button>,
                      <Select
                        value={task.status}
                        size="small"
                        style={{ width: 100 }}
                        onChange={handleTaskStatusChange}
                      >
                        <Select.Option value="todo">待办</Select.Option>
                        <Select.Option value="inprogress">进行中</Select.Option>
                        <Select.Option value="review">待审核</Select.Option>
                        <Select.Option value="completed">已完成</Select.Option>
                      </Select>
                    ]}
                  >
                    <List.Item.Meta
                      title={
                        <div className="flex items-center justify-between">
                          <span>{task.title}</span>
                          <Space>
                            {getTaskStatusTag(task.status)}
                            {getPriorityTag(task.priority)}
                          </Space>
                        </div>
                      }
                      description={
                        <div>
                          <Paragraph ellipsis={{ rows: 2 }} className="mb-2">
                            {task.description}
                          </Paragraph>
                          <div className="flex items-center justify-between text-sm text-gray-500">
                            <span>负责人: {task.assignee}</span>
                            <span>截止时间: {task.dueDate}</span>
                          </div>
                        </div>
                      }
                    />
                  </List.Item>
                );
              }}
            />
          </Card>
             )
           },
           {
             key: 'members',
             label: '团队成员',
             children: (
          <Card 
            title="成员管理" 
            extra={
              <Button 
                type="primary" 
                icon={<UserAddOutlined />}
                onClick={() => setInviteModalVisible(true)}
              >
                邀请成员
              </Button>
            }
          >
            <List
              dataSource={teamMembers}
              renderItem={member => (
                <List.Item
                  actions={[
                    <Button type="link" icon={<EditOutlined />}>编辑</Button>,
                    <Button type="link" danger icon={<DeleteOutlined />}>移除</Button>,
                  ]}
                >
                  <List.Item.Meta
                    avatar={
                      <Badge dot status={member.status === 'online' ? 'success' : member.status === 'busy' ? 'warning' : 'default'}>
                        <Avatar size={48}>{member.name[0]}</Avatar>
                      </Badge>
                    }
                    title={
                      <div className="flex items-center justify-between">
                        <div>
                          <div>{member.name}</div>
                          <div className="text-sm text-gray-500">{member.email}</div>
                        </div>
                        {getStatusBadge(member.status)}
                      </div>
                    }
                    description={
                      <div>
                        <div className="mb-2">
                          <Text strong>角色：</Text> {member.role}
                        </div>
                        <div className="mb-2">
                          <Text strong>加入时间：</Text> {member.joinDate}
                        </div>
                        <div>
                          <Text strong>权限：</Text>
                          <Space className="ml-2">
                            {member.permissions.map(permission => (
                              <Tag key={permission}>{permission}</Tag>
                            ))}
                          </Space>
                        </div>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
             )
           }
         ]}
       />

      {/* 邀请成员模态框 */}
      <Modal
        title="邀请团队成员"
        open={inviteModalVisible}
        onCancel={() => setInviteModalVisible(false)}
        footer={null}
      >
        <Form form={form} onFinish={handleInviteMember} layout="vertical">
          <Form.Item
            name="email"
            label="邮箱地址"
            rules={[{ required: true, type: 'email', message: '请输入有效的邮箱地址' }]}
          >
            <Input placeholder="请输入要邀请的成员邮箱" />
          </Form.Item>
          <Form.Item
            name="role"
            label="角色"
            rules={[{ required: true, message: '请选择角色' }]}
          >
            <Select placeholder="请选择角色">
              <Option value="viewer">查看者</Option>
              <Option value="editor">编辑者</Option>
              <Option value="admin">管理员</Option>
            </Select>
          </Form.Item>
          <Form.Item name="message" label="邀请消息">
            <TextArea rows={3} placeholder="可选：添加邀请消息" />
          </Form.Item>
          <Form.Item>
            <Space className="w-full justify-end">
              <Button onClick={() => setInviteModalVisible(false)}>取消</Button>
              <Button type="primary" htmlType="submit">发送邀请</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* 创建任务模态框 */}
      <Modal
        title="创建新任务"
        open={taskModalVisible}
        onCancel={() => setTaskModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form form={taskForm} onFinish={handleCreateTask} layout="vertical">
          <Form.Item
            name="title"
            label="任务标题"
            rules={[{ required: true, message: '请输入任务标题' }]}
          >
            <Input placeholder="请输入任务标题" />
          </Form.Item>
          <Form.Item
            name="description"
            label="任务描述"
            rules={[{ required: true, message: '请输入任务描述' }]}
          >
            <TextArea rows={3} placeholder="请详细描述任务内容" />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="assignee"
                label="负责人"
                rules={[{ required: true, message: '请选择负责人' }]}
              >
                <Select placeholder="请选择负责人">
                  {teamMembers.map(member => (
                    <Option key={member.id} value={member.name}>{member.name}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="priority"
                label="优先级"
                rules={[{ required: true, message: '请选择优先级' }]}
              >
                <Select placeholder="请选择优先级">
                  <Option value="low">低</Option>
                  <Option value="medium">中</Option>
                  <Option value="high">高</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            name="dueDate"
            label="截止时间"
            rules={[{ required: true, message: '请选择截止时间' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item>
            <Space className="w-full justify-end">
              <Button onClick={() => setTaskModalVisible(false)}>取消</Button>
              <Button type="primary" htmlType="submit">创建任务</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ProjectCollaboration;