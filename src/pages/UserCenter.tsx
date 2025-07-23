import React from 'react';
import { Card, Typography, Space } from 'antd';
import { UserOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const UserCenter: React.FC = () => {
  return (
    <div className="p-6">
      <Card>
        <Space direction="vertical" size="large" className="w-full">
          <div className="text-center">
            <UserOutlined className="text-6xl text-blue-500 mb-4" />
            <Title level={2}>用户中心</Title>
            <Text type="secondary">用户个人信息管理</Text>
          </div>
          <div className="text-center text-gray-500">
            <p>用户中心功能开发中...</p>
          </div>
        </Space>
      </Card>
    </div>
  );
};

export default UserCenter;