// Mermaid 渲染测试页面

import React from 'react';
import { Card, Space, Typography, Divider, Alert } from 'antd';
import { MermaidChart } from '../components/Chart';
import SimpleMermaidTest from '../components/Chart/SimpleMermaidTest';
import type { MermaidChart as MermaidChartType } from '../types/document';

const { Title, Text } = Typography;

const MermaidTest: React.FC = () => {
  console.log('MermaidTest: Component rendering');
  
  // 测试图表数据 - 使用简单的英文版本避免编码问题
  const testCharts: MermaidChartType[] = [
    {
      id: 'test-flowchart',
      type: 'flowchart',
      title: '流程图测试',
      code: `graph TD
    A[Start] --> B{Decision}
    B -->|Yes| C[Action A]
    B -->|No| D[Action B]
    C --> E[End]
    D --> E`
    },
    {
      id: 'test-class',
      type: 'class',
      title: '类图测试',
      code: `classDiagram
    class Animal {
        +String name
        +int age
        +makeSound()
    }
    
    class Dog {
        +String breed
        +bark()
    }
    
    class Cat {
        +boolean indoor
        +meow()
    }
    
    Animal <|-- Dog
    Animal <|-- Cat`
    },
    {
      id: 'test-sequence',
      type: 'sequence',
      title: '序列图测试',
      code: `sequenceDiagram
    participant A as User
    participant B as System
    participant C as Database
    
    A->>B: Login Request
    B->>C: Validate User
    C-->>B: Return Result
    B-->>A: Login Response`
    },
    {
      id: 'test-simple',
      type: 'flowchart',
      title: '简单测试',
      code: `graph LR
    A --> B
    B --> C`
    }
  ];

  console.log('MermaidTest: Test charts data', testCharts);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <Title level={2}>Mermaid 渲染测试</Title>
        <Text type="secondary">
          此页面用于测试 Mermaid 图表的渲染功能，包含流程图、类图和序列图。
        </Text>
      </div>
      
      <Alert 
        message="测试状态" 
        description="所有图表类型已修复，请检查渲染效果。如有问题请查看浏览器控制台日志。" 
        type="success" 
        showIcon 
        className="mb-6"
      />
      
      {/* 简单测试区域 */}
      <Card title="简单 Mermaid 测试" className="w-full mb-6">
        <SimpleMermaidTest 
          code={`graph LR
    A --> B
    B --> C`}
          title="最简单的流程图"
        />
        <SimpleMermaidTest 
          code={`graph TD
    Start --> End`}
          title="垂直流程图"
        />
      </Card>

      <Space direction="vertical" size="large" className="w-full">
        {testCharts.map((chart) => (
          <Card key={chart.id} title={chart.title} className="w-full">
            <div className="mb-4">
              <Text strong>图表类型: </Text>
              <Text code>{chart.type}</Text>
            </div>
            <div className="mb-4">
              <Text strong>Mermaid 代码:</Text>
              <pre className="bg-gray-50 p-3 rounded mt-2 text-sm overflow-x-auto">
                {chart.code}
              </pre>
            </div>
            <Divider />
            <div className="border border-gray-200 rounded p-4">
              <MermaidChart
                chart={chart}
                height={400}
              />
            </div>
          </Card>
        ))}
      </Space>
    </div>
  );
};

export default MermaidTest;