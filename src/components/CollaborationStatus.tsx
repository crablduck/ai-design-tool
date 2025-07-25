import React, { useState } from 'react';
import {
  Card,
  Avatar,
  Badge,
  Tooltip,
  List,
  Typography,
  Space,
  Button,
  Drawer,
  Timeline,
  Tag,
  Popover,
  Empty
} from 'antd';
import {
  TeamOutlined,
  MessageOutlined,
  FileTextOutlined,
  SettingOutlined,
  ClockCircleOutlined,
  EyeOutlined,
  EditOutlined,
  UserOutlined
} from '@ant-design/icons';
import { OnlineUser, CollaborationEvent } from '../services/collaborationService';

const { Text } = Typography;

export interface CollaborationStatusProps {
  onlineUsers: OnlineUser[];
  recentEvents: CollaborationEvent[];
  isConnected: boolean;
  className?: string;
}

const CollaborationStatus: React.FC<CollaborationStatusProps> = ({
  onlineUsers,
  recentEvents,
  isConnected,
  className
}) => {
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<'users' | 'activity'>('users');

  // 获取用户状态配置
  const getUserStatusConfig = (status: OnlineUser['status']) => {
    const configs = {
      active: { color: 'green', text: '活跃', dot: 'success' as const },
      idle: { color: 'orange', text: '空闲', dot: 'warning' as const },
      away: { color: 'gray', text: '离开', dot: 'default' as const }
    };
    return configs[status] || configs.away;
  };

  // 获取事件图标
  const getEventIcon = (type: CollaborationEvent['type']) => {
    const icons = {
      user_join: <UserOutlined className="text-green-500" />,
      user_leave: <UserOutlined className="text-gray-500" />,
      document_edit: <EditOutlined className="text-blue-500" />,
      comment_add: <MessageOutlined className="text-purple-500" />,
      task_update: <FileTextOutlined className="text-orange-500" />,
      status_change: <SettingOutlined className="text-gray-500" />
    };
    return icons[type] || <SettingOutlined />;
  };

  // 获取事件描述
  const getEventDescription = (event: CollaborationEvent) => {
    switch (event.type) {
      case 'user_join':
        return '加入了协作';
      case 'user_leave':
        return '离开了协作';
      case 'document_edit':
        return '正在编辑文档';
      case 'comment_add':
        return `评论了: ${event.data.content?.substring(0, 30)}${event.data.content?.length > 30 ? '...' : ''}`;
      case 'task_update':
        return '更新了任务状态';
      case 'status_change':
        return `状态变更为 ${getUserStatusConfig(event.data.status).text}`;
      default:
        return '执行了操作';
    }
  };

  // 格式化时间
  const formatTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    
    if (diff < 60000) {
      return '刚刚';
    } else if (diff < 3600000) {
      return `${Math.floor(diff / 60000)}分钟前`;
    } else if (diff < 86400000) {
      return `${Math.floor(diff / 3600000)}小时前`;
    } else {
      return new Date(timestamp).toLocaleDateString();
    }
  };

  // 在线用户头像组
  const renderUserAvatars = () => {
    const maxVisible = 5;
    const visibleUsers = onlineUsers.slice(0, maxVisible);
    const hiddenCount = onlineUsers.length - maxVisible;

    return (
      <Avatar.Group maxCount={maxVisible} size="small">
        {visibleUsers.map(user => {
          const statusConfig = getUserStatusConfig(user.status);
          return (
            <Tooltip key={user.id} title={`${user.name} - ${statusConfig.text}`}>
              <Badge dot status={statusConfig.dot}>
                <Avatar size="small">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} />
                  ) : (
                    user.name[0]
                  )}
                </Avatar>
              </Badge>
            </Tooltip>
          );
        })}
        {hiddenCount > 0 && (
          <Tooltip title={`还有 ${hiddenCount} 人在线`}>
            <Avatar size="small">+{hiddenCount}</Avatar>
          </Tooltip>
        )}
      </Avatar.Group>
    );
  };

  // 用户详情弹出框内容
  const renderUserPopover = (user: OnlineUser) => {
    const statusConfig = getUserStatusConfig(user.status);
    
    return (
      <div className="w-64">
        <div className="flex items-center mb-3">
          <Badge dot status={statusConfig.dot}>
            <Avatar size={40}>
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} />
              ) : (
                user.name[0]
              )}
            </Avatar>
          </Badge>
          <div className="ml-3">
            <div className="font-medium">{user.name}</div>
            <div className="text-sm text-gray-500">{statusConfig.text}</div>
          </div>
        </div>
        
        {user.currentPage && (
          <div className="mb-2">
            <Text className="text-sm text-gray-600">
              <EyeOutlined className="mr-1" />
              正在查看: {user.currentPage}
            </Text>
          </div>
        )}
        
        <div className="text-xs text-gray-500">
          最后活动: {formatTime(user.lastActivity)}
        </div>
      </div>
    );
  };

  return (
    <>
      <div className={`flex items-center space-x-3 ${className}`}>
        {/* 连接状态指示器 */}
        <Badge 
          dot 
          status={isConnected ? 'success' : 'error'}
          title={isConnected ? '已连接' : '未连接'}
        >
          <TeamOutlined className={isConnected ? 'text-green-500' : 'text-gray-400'} />
        </Badge>

        {/* 在线用户数量 */}
        <Text className="text-sm text-gray-600">
          {onlineUsers.length} 人在线
        </Text>

        {/* 用户头像组 */}
        {onlineUsers.length > 0 && renderUserAvatars()}

        {/* 查看详情按钮 */}
        <Button 
          type="text" 
          size="small" 
          icon={<EyeOutlined />}
          onClick={() => setDrawerVisible(true)}
        >
          详情
        </Button>
      </div>

      {/* 详情抽屉 */}
      <Drawer
        title="协作状态"
        placement="right"
        width={400}
        open={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        extra={
          <Space>
            <Button 
              type={activeTab === 'users' ? 'primary' : 'default'}
              size="small"
              onClick={() => setActiveTab('users')}
            >
              在线用户
            </Button>
            <Button 
              type={activeTab === 'activity' ? 'primary' : 'default'}
              size="small"
              onClick={() => setActiveTab('activity')}
            >
              最近活动
            </Button>
          </Space>
        }
      >
        {activeTab === 'users' && (
          <div>
            {/* 连接状态 */}
            <Card size="small" className="mb-4">
              <div className="flex items-center justify-between">
                <Text>协作状态</Text>
                <Badge 
                  status={isConnected ? 'success' : 'error'} 
                  text={isConnected ? '已连接' : '未连接'}
                />
              </div>
            </Card>

            {/* 在线用户列表 */}
            <Card title={`在线用户 (${onlineUsers.length})`} size="small">
              {onlineUsers.length > 0 ? (
                <List
                  dataSource={onlineUsers}
                  renderItem={user => {
                    const statusConfig = getUserStatusConfig(user.status);
                    
                    return (
                      <List.Item>
                        <Popover 
                          content={renderUserPopover(user)}
                          trigger="hover"
                          placement="left"
                        >
                          <div className="flex items-center w-full cursor-pointer">
                            <Badge dot status={statusConfig.dot}>
                              <Avatar size={32}>
                                {user.avatar ? (
                                  <img src={user.avatar} alt={user.name} />
                                ) : (
                                  user.name[0]
                                )}
                              </Avatar>
                            </Badge>
                            <div className="ml-3 flex-1">
                              <div className="font-medium">{user.name}</div>
                              <div className="text-sm text-gray-500">
                                <Tag size="small" color={statusConfig.color}>
                                  {statusConfig.text}
                                </Tag>
                                {user.currentPage && (
                                  <span className="ml-2">{user.currentPage}</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </Popover>
                      </List.Item>
                    );
                  }}
                />
              ) : (
                <Empty 
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="暂无在线用户"
                />
              )}
            </Card>
          </div>
        )}

        {activeTab === 'activity' && (
          <Card title="最近活动" size="small">
            {recentEvents.length > 0 ? (
              <Timeline>
                {recentEvents.slice(-10).reverse().map(event => (
                  <Timeline.Item
                    key={event.id}
                    dot={getEventIcon(event.type)}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <Text strong>{event.userName}</Text>
                        <Text className="text-xs text-gray-500">
                          {formatTime(event.timestamp)}
                        </Text>
                      </div>
                      <div className="text-sm text-gray-600">
                        {getEventDescription(event)}
                      </div>
                      {event.data && event.type === 'comment_add' && (
                        <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                          "{event.data.content}"
                        </div>
                      )}
                    </div>
                  </Timeline.Item>
                ))}
              </Timeline>
            ) : (
              <Empty 
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="暂无活动记录"
              />
            )}
          </Card>
        )}
      </Drawer>
    </>
  );
};

export default CollaborationStatus;