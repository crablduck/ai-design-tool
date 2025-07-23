import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import { Button, Card, Dropdown, Space, Spin, message } from 'antd';
import { 
  DownloadOutlined, 
  FullscreenOutlined, 
  CopyOutlined, 
  EditOutlined,
  ZoomInOutlined,
  ZoomOutOutlined
} from '@ant-design/icons';
import type { MermaidChart, MermaidConfig, ExportFormat } from '../../types/document';

interface MermaidChartProps {
  chart: MermaidChart;
  editable?: boolean;
  onEdit?: (code: string) => void;
  onExport?: (format: ExportFormat) => void;
  className?: string;
  height?: number;
}

const MermaidChartComponent: React.FC<MermaidChartProps> = ({
  chart,
  editable = false,
  onEdit,
  onExport,
  className,
  height = 400
}) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // 初始化Mermaid配置
  useEffect(() => {
    const defaultConfig: MermaidConfig = {
      theme: 'default',
      themeVariables: {
        primaryColor: '#1890ff',
        primaryTextColor: '#262626',
        primaryBorderColor: '#d9d9d9',
        lineColor: '#595959',
        sectionBkgColor: '#f5f5f5',
        altSectionBkgColor: '#fafafa',
        gridColor: '#e8e8e8',
        secondaryColor: '#52c41a',
        tertiaryColor: '#fa8c16'
      },
      flowchart: {
        diagramPadding: 20,
        htmlLabels: true,
        curve: 'basis'
      },
      sequence: {
        diagramMarginX: 50,
        diagramMarginY: 10,
        actorMargin: 50,
        width: 150,
        height: 65
      },
      class: {
        titleTopMargin: 25,
        arrowMarkerAbsolute: false
      }
    };

    mermaid.initialize({
      startOnLoad: false,
      ...defaultConfig,
      ...chart.config
    });
  }, [chart.config]);

  // 渲染图表
  useEffect(() => {
    const renderChart = async () => {
      if (!chartRef.current || !chart.code) return;

      setLoading(true);
      setError(null);

      try {
        // 清空容器
        chartRef.current.innerHTML = '';
        
        // 生成唯一ID
        const chartId = `mermaid-${chart.id}-${Date.now()}`;
        
        // 验证Mermaid语法
        const isValid = await mermaid.parse(chart.code);
        if (!isValid) {
          throw new Error('Invalid Mermaid syntax');
        }

        // 渲染图表
        const { svg } = await mermaid.render(chartId, chart.code);
        chartRef.current.innerHTML = svg;

        // 应用缩放
        const svgElement = chartRef.current.querySelector('svg');
        if (svgElement) {
          svgElement.style.transform = `scale(${zoom})`;
          svgElement.style.transformOrigin = 'top left';
          svgElement.style.width = `${100 / zoom}%`;
          svgElement.style.height = `${100 / zoom}%`;
        }

        setLoading(false);
      } catch {
        console.error('Mermaid rendering error');
        setError('Failed to render chart');
        setLoading(false);
      }
    };

    renderChart();
  }, [chart.code, chart.id, zoom]);

  // 复制图表代码
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(chart.code);
      message.success('Chart code copied to clipboard');
    } catch {
      message.error('Failed to copy chart code');
    }
  };

  // 导出图表
  const handleExport = async (format: ExportFormat) => {
    if (onExport) {
      onExport(format);
      return;
    }

    try {
      const svgElement = chartRef.current?.querySelector('svg');
      if (!svgElement) {
        message.error('No chart to export');
        return;
      }

      if (format === 'svg') {
        const svgData = new XMLSerializer().serializeToString(svgElement);
        const blob = new Blob([svgData], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${chart.title || 'chart'}.svg`;
        link.click();
        URL.revokeObjectURL(url);
      } else if (format === 'png') {
        // 转换SVG为PNG
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        
        const svgData = new XMLSerializer().serializeToString(svgElement);
        const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(svgBlob);
        
        img.onload = () => {
          canvas.width = img.width;
          canvas.height = img.height;
          ctx?.drawImage(img, 0, 0);
          
          canvas.toBlob((blob) => {
            if (blob) {
              const pngUrl = URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = pngUrl;
              link.download = `${chart.title || 'chart'}.png`;
              link.click();
              URL.revokeObjectURL(pngUrl);
            }
          }, 'image/png');
          
          URL.revokeObjectURL(url);
        };
        
        img.src = url;
      }
      
      message.success(`Chart exported as ${format.toUpperCase()}`);
    } catch {
      message.error('Failed to export chart');
    }
  };

  // 缩放控制
  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.1, 2));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.1, 0.5));
  };

  const handleResetZoom = () => {
    setZoom(1);
  };

  // 全屏切换
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // 导出菜单项
  const exportMenuItems = [
    {
      key: 'svg',
      label: 'Export as SVG',
      onClick: () => handleExport('svg')
    },
    {
      key: 'png',
      label: 'Export as PNG',
      onClick: () => handleExport('png')
    },
    {
      key: 'json',
      label: 'Export as JSON',
      onClick: () => handleExport('json')
    }
  ];

  const chartContent = (
    <div className="relative">
      {/* 工具栏 */}
      <div className="absolute top-2 right-2 z-10 bg-white/90 backdrop-blur-sm rounded-lg shadow-sm border border-gray-200 p-1">
        <Space size="small">
          <Button 
            type="text" 
            size="small" 
            icon={<ZoomOutOutlined />}
            onClick={handleZoomOut}
            disabled={zoom <= 0.5}
            title="Zoom Out"
          />
          <Button 
            type="text" 
            size="small"
            onClick={handleResetZoom}
            title="Reset Zoom"
            className="text-xs px-2"
          >
            {Math.round(zoom * 100)}%
          </Button>
          <Button 
            type="text" 
            size="small" 
            icon={<ZoomInOutlined />}
            onClick={handleZoomIn}
            disabled={zoom >= 2}
            title="Zoom In"
          />
          <Button 
            type="text" 
            size="small" 
            icon={<CopyOutlined />}
            onClick={handleCopy}
            title="Copy Code"
          />
          {editable && (
            <Button 
              type="text" 
              size="small" 
              icon={<EditOutlined />}
              onClick={() => onEdit?.(chart.code)}
              title="Edit Chart"
            />
          )}
          <Dropdown menu={{ items: exportMenuItems }} trigger={['click']}>
            <Button 
              type="text" 
              size="small" 
              icon={<DownloadOutlined />}
              title="Export Chart"
            />
          </Dropdown>
          <Button 
            type="text" 
            size="small" 
            icon={<FullscreenOutlined />}
            onClick={toggleFullscreen}
            title="Fullscreen"
          />
        </Space>
      </div>

      {/* 图表容器 */}
      <div 
        className="overflow-auto"
        style={{ height: isFullscreen ? '80vh' : height }}
      >
        {loading && (
          <div className="flex items-center justify-center h-full">
            <Spin size="large" tip="Rendering chart..." />
          </div>
        )}
        
        {error && (
          <div className="flex items-center justify-center h-full text-red-500">
            <div className="text-center">
              <div className="text-lg font-medium mb-2">Chart Rendering Error</div>
              <div className="text-sm text-gray-600">{error}</div>
              <Button 
                type="link" 
                onClick={() => window.location.reload()}
                className="mt-2"
              >
                Retry
              </Button>
            </div>
          </div>
        )}
        
        {!loading && !error && (
          <div 
            ref={chartRef}
            className="mermaid-chart w-full h-full flex items-center justify-center"
            style={{ minHeight: height }}
          />
        )}
      </div>
    </div>
  );

  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-white">
        <div className="h-full flex flex-col">
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="text-lg font-medium">{chart.title || 'Chart'}</h3>
            <Button onClick={toggleFullscreen}>Exit Fullscreen</Button>
          </div>
          <div className="flex-1">
            {chartContent}
          </div>
        </div>
      </div>
    );
  }

  return (
    <Card 
      title={chart.title}
      className={className}
      bodyStyle={{ padding: 0 }}
    >
      {chartContent}
    </Card>
  );
};

export default MermaidChartComponent;