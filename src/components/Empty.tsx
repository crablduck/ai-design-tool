import React from 'react';
import { Empty as AntEmpty, Button, Typography } from 'antd';
import { InboxOutlined, PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import { cn } from "@/lib/utils";

const { Text } = Typography;

interface EmptyProps {
  className?: string;
  image?: React.ReactNode;
  title?: string;
  description?: string;
  showAction?: boolean;
  actionText?: string;
  onAction?: () => void;
  type?: 'default' | 'coming-soon' | 'no-data' | 'error';
}

export default function Empty({
  className,
  image,
  title,
  description,
  showAction = false,
  actionText = '立即创建',
  onAction,
  type = 'coming-soon'
}: EmptyProps) {
  const getEmptyConfig = () => {
    switch (type) {
      case 'coming-soon':
        return {
          image: <InboxOutlined style={{ fontSize: 64, color: '#d9d9d9' }} />,
          title: '功能即将上线',
          description: '我们正在努力开发这个功能，敬请期待！',
          actionText: '了解更多'
        };
      case 'no-data':
        return {
          image: <InboxOutlined style={{ fontSize: 64, color: '#d9d9d9' }} />,
          title: '暂无数据',
          description: '当前没有可显示的内容，您可以创建新的数据',
          actionText: '创建数据'
        };
      case 'error':
        return {
          image: <ReloadOutlined style={{ fontSize: 64, color: '#ff4d4f' }} />,
          title: '加载失败',
          description: '数据加载出现问题，请稍后重试',
          actionText: '重新加载'
        };
      default:
        return {
          image: <InboxOutlined style={{ fontSize: 64, color: '#d9d9d9' }} />,
          title: '暂无内容',
          description: '这里还没有任何内容',
          actionText: '开始使用'
        };
    }
  };

  const config = getEmptyConfig();
  const finalImage = image || config.image;
  const finalTitle = title || config.title;
  const finalDescription = description || config.description;
  const finalActionText = actionText || config.actionText;

  return (
    <div className={cn("flex h-full items-center justify-center p-8", className)}>
      <div className="text-center max-w-md">
        <div className="mb-4">
          {finalImage}
        </div>
        
        <div className="mb-2">
          <Text strong className="text-lg text-gray-800">
            {finalTitle}
          </Text>
        </div>
        
        <div className="mb-6">
          <Text type="secondary" className="text-gray-500">
            {finalDescription}
          </Text>
        </div>
        
        {showAction && onAction && (
          <Button 
            type="primary" 
            icon={type === 'error' ? <ReloadOutlined /> : <PlusOutlined />}
            onClick={onAction}
            size="large"
          >
            {finalActionText}
          </Button>
        )}
        
        {type === 'coming-soon' && (
          <div className="mt-4">
            <div className="flex justify-center space-x-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
            <Text type="secondary" className="text-xs mt-2 block">
              开发进度：正在设计中...
            </Text>
          </div>
        )}
      </div>
    </div>
  );
}

// 导出一些预设的空状态组件
export const ComingSoonEmpty = (props: Omit<EmptyProps, 'type'>) => (
  <Empty {...props} type="coming-soon" />
);

export const NoDataEmpty = (props: Omit<EmptyProps, 'type'>) => (
  <Empty {...props} type="no-data" showAction={true} />
);

export const ErrorEmpty = (props: Omit<EmptyProps, 'type'>) => (
  <Empty {...props} type="error" showAction={true} />
);