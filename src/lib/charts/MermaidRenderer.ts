// Mermaid图表渲染引擎 - 统一的图表生成和渲染系统

import mermaid from 'mermaid';
import type {
  MermaidChart,
  MermaidChartType,
  MermaidConfig,
  ExportFormat
} from '../../types/document';

/**
 * 渲染选项
 */
export interface RenderOptions {
  theme?: 'default' | 'dark' | 'forest' | 'neutral';
  width?: number;
  height?: number;
  backgroundColor?: string;
  config?: Partial<MermaidConfig>;
}

/**
 * 渲染结果
 */
export interface RenderResult {
  svg: string;
  width: number;
  height: number;
  metadata: {
    chartType: MermaidChartType;
    renderTime: number;
    nodeCount?: number;
  };
}

/**
 * 导出结果
 */
export interface ExportResult {
  data: Buffer | string;
  mimeType: string;
  filename: string;
  size: number;
}

/**
 * Mermaid图表渲染引擎
 */
export class MermaidRenderer {
  private static instance: MermaidRenderer;
  private initialized = false;
  private defaultConfig: MermaidConfig;

  private constructor() {
    this.defaultConfig = {
      theme: 'default',
      themeVariables: {
        primaryColor: '#2563EB',
        primaryTextColor: '#1F2937',
        primaryBorderColor: '#3B82F6',
        lineColor: '#6B7280',
        secondaryColor: '#F3F4F6',
        tertiaryColor: '#FFFFFF'
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
  }

  /**
   * 获取渲染引擎单例实例
   */
  public static getInstance(): MermaidRenderer {
    if (!MermaidRenderer.instance) {
      MermaidRenderer.instance = new MermaidRenderer();
    }
    return MermaidRenderer.instance;
  }

  /**
   * 初始化Mermaid
   */
  public async initialize(config?: Partial<MermaidConfig>): Promise<void> {
    if (this.initialized) {
      return;
    }

    const mergedConfig = {
      ...this.defaultConfig,
      ...config
    };

    mermaid.initialize({
      startOnLoad: false,
      theme: mergedConfig.theme,
      themeVariables: mergedConfig.themeVariables,
      flowchart: mergedConfig.flowchart,
      sequence: mergedConfig.sequence,
      class: mergedConfig.class,
      securityLevel: 'loose', // 允许HTML标签
      fontFamily: 'Inter, system-ui, sans-serif'
    });

    this.initialized = true;
    console.log('MermaidRenderer initialized');
  }

  /**
   * 渲染图表
   */
  public async renderChart(
    chart: MermaidChart,
    options?: RenderOptions
  ): Promise<RenderResult> {
    if (!this.initialized) {
      await this.initialize();
    }

    const startTime = performance.now();

    try {
      // 应用渲染选项
      if (options?.config) {
        mermaid.initialize(options.config);
      }

      // 生成唯一ID
      const chartId = `mermaid-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      // 渲染图表
      const { svg, bindFunctions } = await mermaid.render(chartId, chart.code);

      // 计算渲染时间
      const renderTime = performance.now() - startTime;

      // 解析SVG获取尺寸
      const { width, height } = this.parseSVGDimensions(svg);

      // 分析图表节点数量
      const nodeCount = this.analyzeChartComplexity(chart.code, chart.type);

      return {
        svg,
        width,
        height,
        metadata: {
          chartType: chart.type,
          renderTime,
          nodeCount
        }
      };
    } catch (error) {
      console.error('Failed to render Mermaid chart:', error);
      throw new Error(`Chart rendering failed: ${error}`);
    }
  }

  /**
   * 验证图表代码
   */
  public validateChart(code: string, type: MermaidChartType): {
    valid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      // 基本语法检查
      if (!code || code.trim().length === 0) {
        errors.push('Chart code cannot be empty');
        return { valid: false, errors, warnings };
      }

      // 检查图表类型声明
      const typeDeclarations = {
        flowchart: ['flowchart', 'graph'],
        sequence: ['sequenceDiagram'],
        class: ['classDiagram'],
        state: ['stateDiagram', 'stateDiagram-v2'],
        'entity-relationship': ['erDiagram'],
        'user-journey': ['journey'],
        gantt: ['gantt'],
        pie: ['pie'],
        requirement: ['requirementDiagram'],
        gitgraph: ['gitGraph'],
        mindmap: ['mindmap'],
        timeline: ['timeline']
      };

      const expectedDeclarations = typeDeclarations[type] || [];
      const hasValidDeclaration = expectedDeclarations.some(decl => 
        code.trim().toLowerCase().startsWith(decl.toLowerCase())
      );

      if (!hasValidDeclaration && type !== 'custom') {
        warnings.push(`Chart code should start with one of: ${expectedDeclarations.join(', ')}`);
      }

      // 检查常见语法错误
      this.checkCommonSyntaxErrors(code, errors, warnings);

      return {
        valid: errors.length === 0,
        errors,
        warnings
      };
    } catch (error) {
      errors.push(`Validation error: ${error}`);
      return { valid: false, errors, warnings };
    }
  }

  /**
   * 导出图表
   */
  public async exportChart(
    chart: MermaidChart,
    format: ExportFormat,
    options?: RenderOptions
  ): Promise<ExportResult> {
    const renderResult = await this.renderChart(chart, options);

    switch (format) {
      case 'svg':
        return {
          data: renderResult.svg,
          mimeType: 'image/svg+xml',
          filename: `${chart.title || 'chart'}.svg`,
          size: Buffer.byteLength(renderResult.svg, 'utf8')
        };

      case 'png':
        return await this.convertSVGToPNG(renderResult.svg, chart.title);

      case 'pdf':
        return await this.convertSVGToPDF(renderResult.svg, chart.title);

      case 'json':
        const jsonData = JSON.stringify(chart, null, 2);
        return {
          data: jsonData,
          mimeType: 'application/json',
          filename: `${chart.title || 'chart'}.json`,
          size: Buffer.byteLength(jsonData, 'utf8')
        };

      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  }

  /**
   * 获取支持的图表类型
   */
  public getSupportedChartTypes(): MermaidChartType[] {
    return [
      'flowchart',
      'sequence',
      'class',
      'state',
      'entity-relationship',
      'user-journey',
      'gantt',
      'pie',
      'requirement',
      'gitgraph',
      'mindmap',
      'timeline',
      'custom'
    ];
  }

  /**
   * 获取图表类型的示例代码
   */
  public getExampleCode(type: MermaidChartType): string {
    const examples: Record<MermaidChartType, string> = {
      flowchart: `flowchart TD
    A[开始] --> B{判断条件}
    B -->|是| C[执行操作]
    B -->|否| D[跳过]
    C --> E[结束]
    D --> E`,
      
      sequence: `sequenceDiagram
    participant A as 用户
    participant B as 系统
    A->>B: 发送请求
    B-->>A: 返回响应`,
      
      class: `classDiagram
    class User {
        +String name
        +String email
        +login()
        +logout()
    }
    class Order {
        +String id
        +Date date
        +calculate()
    }
    User --> Order : places`,
      
      state: `stateDiagram-v2
    [*] --> 待处理
    待处理 --> 处理中 : 开始处理
    处理中 --> 已完成 : 处理完成
    处理中 --> 已取消 : 取消
    已完成 --> [*]
    已取消 --> [*]`,
      
      'entity-relationship': `erDiagram
    USER {
        int id PK
        string name
        string email
    }
    ORDER {
        int id PK
        int user_id FK
        date created_at
    }
    USER ||--o{ ORDER : places`,
      
      'user-journey': `journey
    title 用户购物流程
    section 浏览商品
      访问网站: 5: 用户
      搜索商品: 3: 用户
      查看详情: 4: 用户
    section 下单
      添加购物车: 2: 用户
      结算: 1: 用户`,
      
      gantt: `gantt
    title 项目时间线
    dateFormat YYYY-MM-DD
    section 设计阶段
    需求分析: 2024-01-01, 7d
    原型设计: 2024-01-08, 5d
    section 开发阶段
    前端开发: 2024-01-13, 14d
    后端开发: 2024-01-13, 14d`,
      
      pie: `pie title 销售占比
    "产品A" : 42.96
    "产品B" : 50.05
    "产品C" : 7.01`,
      
      requirement: `requirementDiagram
    requirement 用户登录 {
        id: 1
        text: 用户必须能够登录系统
        risk: high
        verifymethod: test
    }
    element 登录页面 {
        type: interface
    }
    用户登录 - satisfies -> 登录页面`,
      
      gitgraph: `gitGraph
    commit
    branch develop
    checkout develop
    commit
    commit
    checkout main
    merge develop`,
      
      mindmap: `mindmap
  root((项目规划))
    设计
      需求分析
      原型设计
    开发
      前端
      后端
    测试
      单元测试
      集成测试`,
      
      timeline: `timeline
    title 项目里程碑
    2024-01 : 项目启动
    2024-02 : 设计完成
    2024-03 : 开发完成
    2024-04 : 测试完成`,
      
      custom: `graph TD
    A[自定义图表] --> B[请编写您的Mermaid代码]`
    };

    return examples[type] || examples.custom;
  }

  /**
   * 解析SVG尺寸
   */
  private parseSVGDimensions(svg: string): { width: number; height: number } {
    const widthMatch = svg.match(/width="([^"]+)"/i);
    const heightMatch = svg.match(/height="([^"]+)"/i);
    
    const width = widthMatch ? parseFloat(widthMatch[1]) : 800;
    const height = heightMatch ? parseFloat(heightMatch[1]) : 600;
    
    return { width, height };
  }

  /**
   * 分析图表复杂度
   */
  private analyzeChartComplexity(code: string, type: MermaidChartType): number {
    // 简单的节点计数逻辑
    const lines = code.split('\n').filter(line => line.trim().length > 0);
    
    switch (type) {
      case 'flowchart':
        return (code.match(/\[.*?\]|\{.*?\}|\(.*?\)/g) || []).length;
      case 'sequence':
        return (code.match(/participant|actor/gi) || []).length;
      case 'class':
        return (code.match(/class\s+\w+/gi) || []).length;
      default:
        return lines.length;
    }
  }

  /**
   * 检查常见语法错误
   */
  private checkCommonSyntaxErrors(code: string, errors: string[], warnings: string[]): void {
    // 检查括号匹配
    const openBrackets = (code.match(/\[/g) || []).length;
    const closeBrackets = (code.match(/\]/g) || []).length;
    if (openBrackets !== closeBrackets) {
      errors.push('Mismatched square brackets');
    }

    const openParens = (code.match(/\(/g) || []).length;
    const closeParens = (code.match(/\)/g) || []).length;
    if (openParens !== closeParens) {
      errors.push('Mismatched parentheses');
    }

    const openBraces = (code.match(/\{/g) || []).length;
    const closeBraces = (code.match(/\}/g) || []).length;
    if (openBraces !== closeBraces) {
      errors.push('Mismatched curly braces');
    }

    // 检查常见的语法问题
    if (code.includes('-->') && code.includes('->')) {
      warnings.push('Mixed arrow styles detected. Consider using consistent arrow style.');
    }

    // 检查空节点
    if (code.match(/\[\s*\]|\(\s*\)|\{\s*\}/)) {
      warnings.push('Empty nodes detected. Consider adding labels.');
    }
  }

  /**
   * 转换SVG为PNG（简化实现，实际需要canvas或其他库）
   */
  private async convertSVGToPNG(svg: string, title?: string): Promise<ExportResult> {
    // 这里是简化实现，实际项目中需要使用canvas或服务端转换
    const data = Buffer.from(svg, 'utf8');
    return {
      data,
      mimeType: 'image/png',
      filename: `${title || 'chart'}.png`,
      size: data.length
    };
  }

  /**
   * 转换SVG为PDF（简化实现）
   */
  private async convertSVGToPDF(svg: string, title?: string): Promise<ExportResult> {
    // 这里是简化实现，实际项目中需要使用PDF库
    const data = Buffer.from(svg, 'utf8');
    return {
      data,
      mimeType: 'application/pdf',
      filename: `${title || 'chart'}.pdf`,
      size: data.length
    };
  }

  /**
   * 重置渲染引擎
   */
  public reset(): void {
    this.initialized = false;
    mermaid.initialize(this.defaultConfig);
  }
}

// 导出单例实例
export const mermaidRenderer = MermaidRenderer.getInstance();