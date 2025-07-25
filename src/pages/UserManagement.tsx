import React, { useState, useEffect } from 'react';
import { Card, Button, Input, Select, Table, Modal, Form, message, Tag, Space, Avatar, Tabs, Switch, Transfer, TreeSelect } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, UserOutlined, TeamOutlined, SettingOutlined, KeyOutlined, LockOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { TransferDirection } from 'antd/es/transfer';

interface User {
  id: string;
  username: string;
  email: string;
  name: string;
  avatar?: string;
  role: 'admin' | 'manager' | 'developer' | 'tester' | 'viewer';
  status: 'active' | 'inactive' | 'locked';
  permissions: string[];
  projects: string[];
  teams: string[];
  lastLogin?: string;
  createdAt: string;
}

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  level: number;
}

interface Permission {
  id: string;
  name: string;
  description: string;
  module: string;
  actions: string[];
}

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [isUserModalVisible, setIsUserModalVisible] = useState(false);
  const [isRoleModalVisible, setIsRoleModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [userForm] = Form.useForm();
  const [roleForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('users');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [targetKeys, setTargetKeys] = useState<string[]>([]);

  // 模拟数据
  useEffect(() => {
    const mockPermissions: Permission[] = [
      { id: 'project_create', name: '创建项目', description: '创建新项目', module: '项目管理', actions: ['create'] },
      { id: 'project_edit', name: '编辑项目', description: '编辑项目信息', module: '项目管理', actions: ['update'] },
      { id: 'project_delete', name: '删除项目', description: '删除项目', module: '项目管理', actions: ['delete'] },
      { id: 'project_view', name: '查看项目', description: '查看项目详情', module: '项目管理', actions: ['read'] },
      { id: 'code_analyze', name: '代码分析', description: '执行代码分析', module: '代码分析', actions: ['execute'] },
      { id: 'doc_generate', name: '文档生成', description: '生成项目文档', module: '文档管理', actions: ['generate'] },
      { id: 'doc_edit', name: '编辑文档', description: '编辑文档内容', module: '文档管理', actions: ['update'] },
      { id: 'test_create', name: '创建测试', description: '创建测试用例', module: '测试平台', actions: ['create'] },
      { id: 'test_execute', name: '执行测试', description: '执行自动化测试', module: '测试平台', actions: ['execute'] },
      { id: 'deploy_manage', name: '部署管理', description: '管理自动化部署', module: '部署平台', actions: ['deploy'] },
      { id: 'user_manage', name: '用户管理', description: '管理系统用户', module: '用户管理', actions: ['create', 'read', 'update', 'delete'] },
      { id: 'system_config', name: '系统配置', description: '系统配置管理', module: '系统管理', actions: ['config'] }
    ];

    const mockRoles: Role[] = [
      {
        id: 'admin',
        name: '系统管理员',
        description: '拥有系统所有权限',
        permissions: mockPermissions.map(p => p.id),
        level: 1
      },
      {
        id: 'manager',
        name: '项目经理',
        description: '项目管理和团队协调',
        permissions: ['project_create', 'project_edit', 'project_view', 'doc_generate', 'doc_edit', 'test_create', 'deploy_manage'],
        level: 2
      },
      {
        id: 'developer',
        name: '开发工程师',
        description: '代码开发和分析',
        permissions: ['project_view', 'code_analyze', 'doc_edit', 'test_create', 'test_execute'],
        level: 3
      },
      {
        id: 'tester',
        name: '测试工程师',
        description: '测试用例和自动化测试',
        permissions: ['project_view', 'test_create', 'test_execute', 'doc_edit'],
        level: 3
      },
      {
        id: 'viewer',
        name: '访客',
        description: '只读权限',
        permissions: ['project_view'],
        level: 4
      }
    ];

    const mockUsers: User[] = [
      {
        id: '1',
        username: 'admin',
        email: 'admin@company.com',
        name: '系统管理员',
        role: 'admin',
        status: 'active',
        permissions: mockPermissions.map(p => p.id),
        projects: ['1', '2', '3'],
        teams: ['team1', 'team2'],
        lastLogin: '2024-12-20 10:30:00',
        createdAt: '2024-01-01'
      },
      {
        id: '2',
        username: 'zhangsan',
        email: 'zhangsan@company.com',
        name: '张三',
        role: 'manager',
        status: 'active',
        permissions: ['project_create', 'project_edit', 'project_view', 'doc_generate', 'doc_edit'],
        projects: ['1', '2'],
        teams: ['team1'],
        lastLogin: '2024-12-20 09:15:00',
        createdAt: '2024-01-15'
      },
      {
        id: '3',
        username: 'lisi',
        email: 'lisi@company.com',
        name: '李四',
        role: 'developer',
        status: 'active',
        permissions: ['project_view', 'code_analyze', 'doc_edit', 'test_create'],
        projects: ['1'],
        teams: ['team1'],
        lastLogin: '2024-12-19 16:45:00',
        createdAt: '2024-02-01'
      },
      {
        id: '4',
        username: 'wangwu',
        email: 'wangwu@company.com',
        name: '王五',
        role: 'tester',
        status: 'inactive',
        permissions: ['project_view', 'test_create', 'test_execute'],
        projects: ['2'],
        teams: ['team2'],
        lastLogin: '2024-12-18 14:20:00',
        createdAt: '2024-03-01'
      }
    ];

    setPermissions(mockPermissions);
    setRoles(mockRoles);
    setUsers(mockUsers);
  }, []);

  const userColumns: ColumnsType<User> = [
    {
      title: '用户',
      key: 'user',
      render: (_, record) => (
        <Space>
          <Avatar src={record.avatar} icon={<UserOutlined />} />
          <div>
            <div className="font-medium">{record.name}</div>
            <div className="text-sm text-gray-500">@{record.username}</div>
          </div>
        </Space>
      )
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email'
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      render: (role) => {
        const roleMap = {
          admin: { color: 'red', text: '系统管理员' },
          manager: { color: 'blue', text: '项目经理' },
          developer: { color: 'green', text: '开发工程师' },
          tester: { color: 'orange', text: '测试工程师' },
          viewer: { color: 'default', text: '访客' }
        };
        const config = roleMap[role];
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
          locked: { color: 'error', text: '已锁定' }
        };
        const config = statusMap[status];
        return <Tag color={config.color}>{config.text}</Tag>;
      }
    },
    {
      title: '项目数',
      dataIndex: 'projects',
      key: 'projects',
      render: (projects) => projects.length
    },
    {
      title: '最后登录',
      dataIndex: 'lastLogin',
      key: 'lastLogin'
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEditUser(record)}
          >
            编辑
          </Button>
          <Button
            size="small"
            icon={<KeyOutlined />}
            onClick={() => handleResetPassword(record)}
          >
            重置密码
          </Button>
          <Button
            size="small"
            icon={<LockOutlined />}
            onClick={() => handleToggleUserStatus(record)}
          >
            {record.status === 'active' ? '锁定' : '解锁'}
          </Button>
          <Button
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteUser(record.id)}
          >
            删除
          </Button>
        </Space>
      )
    }
  ];

  const roleColumns: ColumnsType<Role> = [
    {
      title: '角色名称',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description'
    },
    {
      title: '权限数量',
      dataIndex: 'permissions',
      key: 'permissions',
      render: (permissions) => permissions.length
    },
    {
      title: '级别',
      dataIndex: 'level',
      key: 'level',
      render: (level) => {
        const levelMap = {
          1: { color: 'red', text: '最高级' },
          2: { color: 'blue', text: '高级' },
          3: { color: 'green', text: '中级' },
          4: { color: 'default', text: '基础级' }
        };
        const config = levelMap[level as keyof typeof levelMap];
        return <Tag color={config.color}>{config.text}</Tag>;
      }
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEditRole(record)}
          >
            编辑
          </Button>
          <Button
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteRole(record.id)}
            disabled={record.id === 'admin'}
          >
            删除
          </Button>
        </Space>
      )
    }
  ];

  const handleCreateUser = () => {
    setEditingUser(null);
    setIsUserModalVisible(true);
    userForm.resetFields();
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setIsUserModalVisible(true);
    userForm.setFieldsValue({
      username: user.username,
      email: user.email,
      name: user.name,
      role: user.role,
      status: user.status
    });
    setSelectedPermissions(user.permissions);
  };

  const handleCreateRole = () => {
    setEditingRole(null);
    setIsRoleModalVisible(true);
    roleForm.resetFields();
    setTargetKeys([]);
  };

  const handleEditRole = (role: Role) => {
    setEditingRole(role);
    setIsRoleModalVisible(true);
    roleForm.setFieldsValue({
      name: role.name,
      description: role.description,
      level: role.level
    });
    setTargetKeys(role.permissions);
  };

  const handleResetPassword = (user: User) => {
    Modal.confirm({
      title: '重置密码',
      content: `确定要重置用户 ${user.name} 的密码吗？`,
      onOk: () => {
        message.success('密码重置成功，新密码已发送到用户邮箱');
      }
    });
  };

  const handleToggleUserStatus = (user: User) => {
    const newStatus = user.status === 'active' ? 'locked' : 'active';
    const action = newStatus === 'locked' ? '锁定' : '解锁';
    
    Modal.confirm({
      title: `${action}用户`,
      content: `确定要${action}用户 ${user.name} 吗？`,
      onOk: () => {
        setUsers(users.map(u => u.id === user.id ? { ...u, status: newStatus } : u));
        message.success(`用户${action}成功`);
      }
    });
  };

  const handleDeleteUser = (userId: string) => {
    Modal.confirm({
      title: '删除用户',
      content: '确定要删除这个用户吗？此操作不可恢复。',
      onOk: () => {
        setUsers(users.filter(u => u.id !== userId));
        message.success('用户删除成功');
      }
    });
  };

  const handleDeleteRole = (roleId: string) => {
    Modal.confirm({
      title: '删除角色',
      content: '确定要删除这个角色吗？此操作不可恢复。',
      onOk: () => {
        setRoles(roles.filter(r => r.id !== roleId));
        message.success('角色删除成功');
      }
    });
  };

  const handleUserModalOk = async () => {
    try {
      const values = await userForm.validateFields();
      setLoading(true);

      await new Promise(resolve => setTimeout(resolve, 1000));

      const userData: User = {
        id: editingUser?.id || Date.now().toString(),
        username: values.username,
        email: values.email,
        name: values.name,
        role: values.role,
        status: values.status || 'active',
        permissions: selectedPermissions,
        projects: editingUser?.projects || [],
        teams: editingUser?.teams || [],
        lastLogin: editingUser?.lastLogin,
        createdAt: editingUser?.createdAt || new Date().toISOString().split('T')[0]
      };

      if (editingUser) {
        setUsers(users.map(u => u.id === editingUser.id ? userData : u));
        message.success('用户更新成功');
      } else {
        setUsers([...users, userData]);
        message.success('用户创建成功');
      }

      setIsUserModalVisible(false);
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };

  const handleRoleModalOk = async () => {
    try {
      const values = await roleForm.validateFields();
      setLoading(true);

      await new Promise(resolve => setTimeout(resolve, 1000));

      const roleData: Role = {
        id: editingRole?.id || values.name.toLowerCase().replace(/\s+/g, '_'),
        name: values.name,
        description: values.description,
        permissions: targetKeys,
        level: values.level
      };

      if (editingRole) {
        setRoles(roles.map(r => r.id === editingRole.id ? roleData : r));
        message.success('角色更新成功');
      } else {
        setRoles([...roles, roleData]);
        message.success('角色创建成功');
      }

      setIsRoleModalVisible(false);
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };

  const handleTransferChange = (newTargetKeys: string[], direction: TransferDirection, moveKeys: string[]) => {
    setTargetKeys(newTargetKeys);
  };

  const transferData = permissions.map(permission => ({
    key: permission.id,
    title: permission.name,
    description: permission.description,
    module: permission.module
  }));

  const tabItems = [
    {
      key: 'users',
      label: (
        <span>
          <UserOutlined />
          用户管理
        </span>
      ),
      children: (
        <div>
          <div className="mb-4 flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">用户列表</h3>
              <p className="text-gray-600">管理系统用户和权限</p>
            </div>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleCreateUser}>
              新建用户
            </Button>
          </div>
          <Table
            columns={userColumns}
            dataSource={users}
            rowKey="id"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `共 ${total} 个用户`
            }}
          />
        </div>
      )
    },
    {
      key: 'roles',
      label: (
        <span>
          <TeamOutlined />
          角色管理
        </span>
      ),
      children: (
        <div>
          <div className="mb-4 flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">角色列表</h3>
              <p className="text-gray-600">管理系统角色和权限</p>
            </div>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleCreateRole}>
              新建角色
            </Button>
          </div>
          <Table
            columns={roleColumns}
            dataSource={roles}
            rowKey="id"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `共 ${total} 个角色`
            }}
          />
        </div>
      )
    },
    {
      key: 'permissions',
      label: (
        <span>
          <SettingOutlined />
          权限管理
        </span>
      ),
      children: (
        <div>
          <div className="mb-4">
            <h3 className="text-lg font-semibold">系统权限</h3>
            <p className="text-gray-600">查看系统所有权限</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(
              permissions.reduce((acc, permission) => {
                if (!acc[permission.module]) {
                  acc[permission.module] = [];
                }
                acc[permission.module].push(permission);
                return acc;
              }, {} as Record<string, Permission[]>)
            ).map(([module, modulePermissions]) => (
              <Card key={module} title={module} size="small">
                <div className="space-y-2">
                  {modulePermissions.map(permission => (
                    <div key={permission.id} className="flex justify-between items-center">
                      <div>
                        <div className="font-medium">{permission.name}</div>
                        <div className="text-sm text-gray-500">{permission.description}</div>
                      </div>
                      <Tag>{permission.actions.join(', ')}</Tag>
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">用户管理</h1>
        <p className="text-gray-600 mt-1">管理系统用户、角色和权限</p>
      </div>

      <Card>
        <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} />
      </Card>

      {/* 用户编辑模态框 */}
      <Modal
        title={editingUser ? '编辑用户' : '新建用户'}
        open={isUserModalVisible}
        onOk={handleUserModalOk}
        onCancel={() => setIsUserModalVisible(false)}
        confirmLoading={loading}
        width={600}
      >
        <Form form={userForm} layout="vertical">
          <Form.Item
            label="用户名"
            name="username"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input placeholder="请输入用户名" />
          </Form.Item>

          <Form.Item
            label="邮箱"
            name="email"
            rules={[
              { required: true, message: '请输入邮箱' },
              { type: 'email', message: '请输入有效的邮箱地址' }
            ]}
          >
            <Input placeholder="请输入邮箱" />
          </Form.Item>

          <Form.Item
            label="姓名"
            name="name"
            rules={[{ required: true, message: '请输入姓名' }]}
          >
            <Input placeholder="请输入姓名" />
          </Form.Item>

          <Form.Item
            label="角色"
            name="role"
            rules={[{ required: true, message: '请选择角色' }]}
          >
            <Select placeholder="请选择角色">
              {roles.map(role => (
                <Select.Option key={role.id} value={role.id}>
                  {role.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item label="状态" name="status">
            <Select placeholder="请选择状态">
              <Select.Option value="active">活跃</Select.Option>
              <Select.Option value="inactive">非活跃</Select.Option>
              <Select.Option value="locked">已锁定</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* 角色编辑模态框 */}
      <Modal
        title={editingRole ? '编辑角色' : '新建角色'}
        open={isRoleModalVisible}
        onOk={handleRoleModalOk}
        onCancel={() => setIsRoleModalVisible(false)}
        confirmLoading={loading}
        width={800}
      >
        <Form form={roleForm} layout="vertical">
          <Form.Item
            label="角色名称"
            name="name"
            rules={[{ required: true, message: '请输入角色名称' }]}
          >
            <Input placeholder="请输入角色名称" />
          </Form.Item>

          <Form.Item
            label="角色描述"
            name="description"
            rules={[{ required: true, message: '请输入角色描述' }]}
          >
            <Input.TextArea rows={3} placeholder="请输入角色描述" />
          </Form.Item>

          <Form.Item
            label="角色级别"
            name="level"
            rules={[{ required: true, message: '请选择角色级别' }]}
          >
            <Select placeholder="请选择角色级别">
              <Select.Option value={1}>最高级</Select.Option>
              <Select.Option value={2}>高级</Select.Option>
              <Select.Option value={3}>中级</Select.Option>
              <Select.Option value={4}>基础级</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item label="权限配置">
            <Transfer
              dataSource={transferData}
              targetKeys={targetKeys}
              onChange={handleTransferChange}
              render={item => `${item.title} - ${item.description}`}
              titles={['可用权限', '已选权限']}
              showSearch
              listStyle={{
                width: 300,
                height: 300
              }}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default UserManagement;