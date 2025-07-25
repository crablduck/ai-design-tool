import React, { useEffect, useRef } from 'react';
import mermaid from 'mermaid';

interface SimpleMermaidTestProps {
  code: string;
  title?: string;
}

const SimpleMermaidTest: React.FC<SimpleMermaidTestProps> = ({ code, title }) => {
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    console.log('SimpleMermaidTest: Component mounted');
    
    // 初始化 Mermaid
    mermaid.initialize({
      startOnLoad: false,
      theme: 'default',
      securityLevel: 'loose'
    });

    const renderChart = async () => {
      console.log('SimpleMermaidTest: Starting render');
      console.log('SimpleMermaidTest: Code to render:', code);
      
      if (!chartRef.current) {
        console.log('SimpleMermaidTest: No chart ref');
        return;
      }

      try {
        // 清空容器
        chartRef.current.innerHTML = '';
        
        // 生成唯一ID
        const chartId = `simple-mermaid-${Date.now()}`;
        console.log('SimpleMermaidTest: Chart ID:', chartId);
        
        // 渲染图表
        const { svg } = await mermaid.render(chartId, code);
        console.log('SimpleMermaidTest: Render successful, SVG length:', svg.length);
        
        // 插入SVG
        if (chartRef.current) {
          chartRef.current.innerHTML = svg;
          console.log('SimpleMermaidTest: SVG inserted into DOM');
        }
        
      } catch (error) {
        console.error('SimpleMermaidTest: Render error:', error);
        if (chartRef.current) {
          chartRef.current.innerHTML = `<div style="color: red; padding: 20px; border: 1px solid red;">
            <h3>渲染错误</h3>
            <p>${error instanceof Error ? error.message : 'Unknown error'}</p>
            <pre>${code}</pre>
          </div>`;
        }
      }
    };

    // 延迟渲染确保DOM就绪
    const timer = setTimeout(renderChart, 100);
    return () => clearTimeout(timer);
  }, [code]);

  return (
    <div style={{ border: '1px solid #ccc', padding: '20px', margin: '20px 0' }}>
      <h3>{title || '简单 Mermaid 测试'}</h3>
      <div 
        ref={chartRef}
        style={{ 
          minHeight: '200px', 
          background: '#f9f9f9',
          padding: '10px',
          border: '1px dashed #999'
        }}
      />
    </div>
  );
};

export default SimpleMermaidTest;