import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import MainLayout from '@/components/Layout/MainLayout';

import ProjectCreate from '@/pages/ProjectCreate';
import DocumentGenerate from '@/pages/DocumentGenerate';
import DocumentManage from '@/pages/DocumentManage';
import TemplateCenter from '@/pages/TemplateCenter';
import ProjectCollaboration from '@/pages/ProjectCollaboration';
import UserCenter from '@/pages/UserCenter';
import CoreAssets from '@/pages/CoreAssets';
import VocabularyManagement from '@/pages/VocabularyManagement';
import { initializeStores } from '@/stores';

// Ant Design 主题配置
const theme = {
  token: {
    colorPrimary: '#2563EB',
    colorSuccess: '#10B981',
    colorWarning: '#F59E0B',
    colorError: '#EF4444',
    borderRadius: 8,
    fontFamily: "'Inter', 'PingFang SC', 'Microsoft YaHei', system-ui, -apple-system, sans-serif",
  },
  components: {
    Button: {
      borderRadius: 8,
      controlHeight: 40,
    },
    Input: {
      borderRadius: 8,
      controlHeight: 40,
    },
    Card: {
      borderRadius: 12,
    },
  },
};

export default function App() {
  // 初始化stores
  useEffect(() => {
    initializeStores();
  }, []);

  return (
    <ConfigProvider locale={zhCN} theme={theme}>
      <Router>
        <MainLayout>
          <Routes>
            <Route path="/" element={<CoreAssets />} />
            <Route path="/core/assets" element={<CoreAssets />} />
            <Route path="/project/create" element={<ProjectCreate />} />
            <Route path="/project/generate/:id" element={<DocumentGenerate />} />
            <Route path="/documents" element={<DocumentManage />} />
            <Route path="/templates" element={<TemplateCenter />} />
            <Route path="/collaboration" element={<ProjectCollaboration />} />
            <Route path="/vocabulary" element={<VocabularyManagement />} />
            <Route path="/profile" element={<UserCenter />} />
            <Route path="/mcp/console" element={
              <div className="p-6">
                <h2>MCP协议控制台</h2>
                <p>MCP协议集成功能开发中...</p>
              </div>
            } />
            {/* 404页面 */}
            <Route path="*" element={
              <div className="flex flex-col items-center justify-center h-96">
                <h1 className="text-4xl font-bold text-gray-400 mb-4">404</h1>
                <p className="text-gray-500">页面未找到</p>
              </div>
            } />
          </Routes>
        </MainLayout>
      </Router>
    </ConfigProvider>
  );
}
