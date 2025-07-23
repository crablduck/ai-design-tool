import React, { useState } from 'react';
import { Layout, Menu, Button, Avatar, Dropdown, Space, Badge } from 'antd';
import {
  ProjectOutlined,
  FileTextOutlined,
  FolderOutlined,
  TeamOutlined,
  UserOutlined,
  SettingOutlined,
  BellOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  LogoutOutlined,
  NodeIndexOutlined,
  ApiOutlined,
  BookOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import type { MenuProps } from 'antd';

const { Header, Sider, Content } = Layout;

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // 菜单项配置
  const menuItems: MenuProps['items'] = [
    {
      key: '/core/assets',
      icon: <NodeIndexOutlined />,
      label: '核心业务资产',
    },
    {
      key: '/project/create',
      icon: <ProjectOutlined />,
      label: '创建项目',
    },
    {
      key: '/documents',
      icon: <FileTextOutlined />,
      label: '文档管理',
    },
    {
      key: '/templates',
      icon: <FolderOutlined />,
      label: '模板中心',
    },
    {
      key: '/collaboration',
      icon: <TeamOutlined />,
      label: '项目协作',
    },
    {
      key: '/vocabulary',
      icon: <BookOutlined />,
      label: '领域词汇',
    },
    {
      key: '/mcp/console',
      icon: <ApiOutlined />,
      label: 'MCP协议',
    },
    {
      key: '/profile',
      icon: <UserOutlined />,
      label: '用户中心',
    },
  ];

  // 用户下拉菜单
  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人资料',
      onClick: () => navigate('/profile'),
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: '设置',
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: () => {
        // 这里可以添加退出登录逻辑
        console.log('退出登录');
      },
    },
  ];

  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key);
  };

  return (
    <Layout className="min-h-screen">
      {/* 侧边栏 */}
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        className="bg-white border-r border-gray-200"
        width={240}
        collapsedWidth={80}
      >
        {/* Logo区域 */}
        <div className="h-16 flex items-center justify-center border-b border-gray-200">
          {collapsed ? (
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">AI</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">AI</span>
              </div>
              <span className="text-lg font-semibold text-gray-800">智能设计工具</span>
            </div>
          )}
        </div>

        {/* 导航菜单 */}
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={handleMenuClick}
          className="border-none"
          style={{ backgroundColor: 'transparent' }}
        />
      </Sider>

      <Layout>
        {/* 顶部导航栏 */}
        <Header className="bg-white border-b border-gray-200 px-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              className="text-gray-600 hover:text-gray-800"
            />
            
            {/* 面包屑导航 */}
            <div className="text-gray-600">
              {location.pathname === '/core/assets' && '核心业务资产'}
              {location.pathname === '/project/create' && '创建项目'}
              {location.pathname === '/documents' && '文档管理'}
              {location.pathname === '/templates' && '模板中心'}
              {location.pathname === '/collaboration' && '项目协作'}
              {location.pathname === '/vocabulary' && '领域词汇管理'}
              {location.pathname === '/mcp/console' && 'MCP协议'}
              {location.pathname === '/profile' && '用户中心'}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* 通知铃铛 */}
            <Badge count={3} size="small">
              <Button
                type="text"
                icon={<BellOutlined />}
                className="text-gray-600 hover:text-gray-800"
              />
            </Badge>

            {/* 用户头像和下拉菜单 */}
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <Space className="cursor-pointer hover:bg-gray-50 px-2 py-1 rounded-lg transition-colors">
                <Avatar
                  size="small"
                  icon={<UserOutlined />}
                  className="bg-blue-500"
                />
                <span className="text-gray-700 font-medium">用户名</span>
              </Space>
            </Dropdown>
          </div>
        </Header>

        {/* 主内容区域 */}
        <Content className="bg-gray-50 overflow-auto">
          <div className="p-6">
            {children}
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;