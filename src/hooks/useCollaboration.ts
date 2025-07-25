import { useState, useEffect, useCallback, useRef } from 'react';
import { message } from 'antd';
import collaborationService, {
  CollaborationEvent,
  OnlineUser,
  CursorPosition,
  CollaborationState
} from '../services/collaborationService';

export interface UseCollaborationOptions {
  projectId: string;
  user: OnlineUser;
  autoConnect?: boolean;
}

export interface UseCollaborationReturn {
  // 连接状态
  isConnected: boolean;
  isConnecting: boolean;
  
  // 在线用户
  onlineUsers: OnlineUser[];
  
  // 光标位置
  cursors: CursorPosition[];
  
  // 最近事件
  recentEvents: CollaborationEvent[];
  
  // 操作方法
  connect: () => Promise<void>;
  disconnect: () => void;
  sendEvent: (event: Omit<CollaborationEvent, 'id' | 'timestamp'>) => void;
  updateUserStatus: (status: OnlineUser['status']) => void;
  updateCursor: (documentId: string, position: CursorPosition['position'], selection?: CursorPosition['selection']) => void;
  addComment: (documentId: string, content: string, position?: any) => void;
  updateTask: (taskId: string, updates: any) => void;
  
  // 事件监听
  onEvent: (callback: (event: CollaborationEvent) => void) => () => void;
}

export const useCollaboration = (options: UseCollaborationOptions): UseCollaborationReturn => {
  const { projectId, user, autoConnect = true } = options;
  
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [cursors, setCursors] = useState<CursorPosition[]>([]);
  const [recentEvents, setRecentEvents] = useState<CollaborationEvent[]>([]);
  
  const eventCallbacksRef = useRef<Set<(event: CollaborationEvent) => void>>(new Set());
  
  // 连接到协作服务
  const connect = useCallback(async () => {
    if (isConnected || isConnecting) return;
    
    setIsConnecting(true);
    try {
      await collaborationService.connect(projectId, user);
      setIsConnected(true);
      message.success('已连接到协作服务');
    } catch (error) {
      console.error('连接协作服务失败:', error);
      message.error('连接协作服务失败');
    } finally {
      setIsConnecting(false);
    }
  }, [projectId, user, isConnected, isConnecting]);
  
  // 断开连接
  const disconnect = useCallback(() => {
    collaborationService.disconnect();
    setIsConnected(false);
    setOnlineUsers([]);
    setCursors([]);
    setRecentEvents([]);
  }, []);
  
  // 发送协作事件
  const sendEvent = useCallback((event: Omit<CollaborationEvent, 'id' | 'timestamp'>) => {
    collaborationService.sendEvent(event);
  }, []);
  
  // 更新用户状态
  const updateUserStatus = useCallback((status: OnlineUser['status']) => {
    collaborationService.updateUserStatus(status);
  }, []);
  
  // 更新光标位置
  const updateCursor = useCallback((documentId: string, position: CursorPosition['position'], selection?: CursorPosition['selection']) => {
    collaborationService.updateCursor(documentId, position, selection);
  }, []);
  
  // 添加评论
  const addComment = useCallback((documentId: string, content: string, position?: any) => {
    collaborationService.addComment(documentId, content, position);
  }, []);
  
  // 更新任务
  const updateTask = useCallback((taskId: string, updates: any) => {
    collaborationService.updateTask(taskId, updates);
  }, []);
  
  // 事件监听
  const onEvent = useCallback((callback: (event: CollaborationEvent) => void) => {
    eventCallbacksRef.current.add(callback);
    
    return () => {
      eventCallbacksRef.current.delete(callback);
    };
  }, []);
  
  // 处理协作事件
  const handleCollaborationEvent = useCallback((event: CollaborationEvent) => {
    // 更新状态
    setOnlineUsers(collaborationService.getOnlineUsers());
    setCursors(collaborationService.getCursors());
    setRecentEvents(collaborationService.getRecentEvents());
    
    // 调用事件回调
    eventCallbacksRef.current.forEach(callback => {
      try {
        callback(event);
      } catch (error) {
        console.error('协作事件回调执行失败:', error);
      }
    });
    
    // 显示事件通知
    showEventNotification(event);
  }, []);
  
  // 显示事件通知
  const showEventNotification = useCallback((event: CollaborationEvent) => {
    // 不显示自己的事件通知
    if (event.userId === user.id) return;
    
    switch (event.type) {
      case 'user_join':
        message.info(`${event.userName} 加入了协作`);
        break;
      case 'user_leave':
        message.info(`${event.userName} 离开了协作`);
        break;
      case 'comment_add':
        message.info(`${event.userName} 添加了评论`);
        break;
      case 'task_update':
        message.info(`${event.userName} 更新了任务`);
        break;
    }
  }, [user.id]);
  
  // 监听页面可见性变化
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (isConnected) {
        const status = document.hidden ? 'away' : 'active';
        updateUserStatus(status);
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isConnected, updateUserStatus]);
  
  // 监听鼠标活动
  useEffect(() => {
    let idleTimer: NodeJS.Timeout;
    
    const resetIdleTimer = () => {
      clearTimeout(idleTimer);
      if (isConnected) {
        updateUserStatus('active');
        
        idleTimer = setTimeout(() => {
          updateUserStatus('idle');
        }, 5 * 60 * 1000); // 5分钟无活动则设为空闲
      }
    };
    
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach(event => {
      document.addEventListener(event, resetIdleTimer, true);
    });
    
    return () => {
      clearTimeout(idleTimer);
      events.forEach(event => {
        document.removeEventListener(event, resetIdleTimer, true);
      });
    };
  }, [isConnected, updateUserStatus]);
  
  // 设置事件监听器
  useEffect(() => {
    const handleConnected = () => {
      setIsConnected(true);
      setOnlineUsers(collaborationService.getOnlineUsers());
    };
    
    const handleDisconnected = () => {
      setIsConnected(false);
      setOnlineUsers([]);
      setCursors([]);
      setRecentEvents([]);
    };
    
    collaborationService.on('connected', handleConnected);
    collaborationService.on('disconnected', handleDisconnected);
    collaborationService.on('event', handleCollaborationEvent);
    
    return () => {
      collaborationService.off('connected', handleConnected);
      collaborationService.off('disconnected', handleDisconnected);
      collaborationService.off('event', handleCollaborationEvent);
    };
  }, [handleCollaborationEvent]);
  
  // 自动连接
  useEffect(() => {
    if (autoConnect && !isConnected && !isConnecting) {
      connect();
    }
  }, [autoConnect, isConnected, isConnecting, connect]);
  
  // 组件卸载时断开连接
  useEffect(() => {
    return () => {
      if (isConnected) {
        disconnect();
      }
    };
  }, []);
  
  return {
    isConnected,
    isConnecting,
    onlineUsers,
    cursors,
    recentEvents,
    connect,
    disconnect,
    sendEvent,
    updateUserStatus,
    updateCursor,
    addComment,
    updateTask,
    onEvent
  };
};

export default useCollaboration;