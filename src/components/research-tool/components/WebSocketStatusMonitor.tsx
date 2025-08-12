// WebSocket状态监控组件
// 提供详细的连接状态监控、性能指标和诊断信息

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { websocketDebugger, WebSocketDebugInfo, WebSocketMetrics } from '@/lib/api/websocket-debug';

interface WebSocketStatusMonitorProps {
  websocket: WebSocket | null;
  url: string;
  conversationId?: string;
  onReconnect?: () => void;
  showDetails?: boolean;
  refreshInterval?: number;
}

export const WebSocketStatusMonitor: React.FC<WebSocketStatusMonitorProps> = ({
  websocket,
  url,
  conversationId,
  onReconnect,
  showDetails = false,
  refreshInterval = 2000
}) => {
  const [debugInfo, setDebugInfo] = useState<WebSocketDebugInfo | null>(null);
  const [metrics, setMetrics] = useState<WebSocketMetrics | null>(null);
  const [issues, setIssues] = useState<string[]>([]);
  const [advice, setAdvice] = useState<string[]>([]);
  const [showDiagnostic, setShowDiagnostic] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // 更新状态信息
  const updateStatus = useCallback(() => {
    const info = websocketDebugger.getConnectionInfo(websocket, url);
    const metricsData = websocketDebugger.getMetrics();
    const detectedIssues = websocketDebugger.diagnoseConnection(websocket, url);
    const connectionAdvice = websocketDebugger.getConnectionAdvice(detectedIssues);

    setDebugInfo(info);
    setMetrics(metricsData);
    setIssues(detectedIssues);
    setAdvice(connectionAdvice);
    setLastUpdate(new Date());
  }, [websocket, url]);

  // 定期更新状态
  useEffect(() => {
    updateStatus();
    
    const interval = setInterval(updateStatus, refreshInterval);
    return () => clearInterval(interval);
  }, [updateStatus, refreshInterval]);

  // 获取状态颜色
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN':
        return '#52c41a';
      case 'CONNECTING':
        return '#faad14';
      case 'CLOSING':
        return '#fa8c16';
      case 'CLOSED':
        return '#ff4d4f';
      default:
        return '#666';
    }
  };

  // 获取连接质量颜色
  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'excellent':
        return '#52c41a';
      case 'good':
        return '#1890ff';
      case 'poor':
        return '#faad14';
      case 'disconnected':
        return '#ff4d4f';
      default:
        return '#666';
    }
  };

  // 格式化时间
  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
  };

  // 生成诊断报告
  const generateReport = () => {
    if (!websocket) return '';
    return websocketDebugger.generateDiagnosticReport(websocket, url);
  };

  // 复制诊断报告到剪贴板
  const copyDiagnosticReport = async () => {
    try {
      const report = generateReport();
      await navigator.clipboard.writeText(report);
      alert('诊断报告已复制到剪贴板');
    } catch (error) {
      console.error('复制失败:', error);
      alert('复制失败，请手动复制');
    }
  };

  if (!debugInfo) {
    return <div>加载中...</div>;
  }

  return (
    <div style={{ 
      padding: '16px', 
      border: '1px solid #d9d9d9', 
      borderRadius: '8px', 
      backgroundColor: '#fafafa',
      marginBottom: '16px'
    }}>
      {/* 标题和基本状态 */}
      <div style={{ marginBottom: '16px' }}>
        <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: 'bold' }}>
          WebSocket 状态监控
        </h3>
        <div style={{ fontSize: '12px', color: '#666' }}>
          最后更新: {lastUpdate.toLocaleTimeString()}
        </div>
      </div>

      {/* 连接状态概览 */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '12px', 
        marginBottom: '16px' 
      }}>
        <div style={{ 
          padding: '12px', 
          backgroundColor: 'white', 
          borderRadius: '6px', 
          border: '1px solid #e8e8e8' 
        }}>
          <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>连接状态</div>
          <div style={{ 
            fontSize: '16px', 
            fontWeight: 'bold', 
            color: getStatusColor(debugInfo.readyStateText) 
          }}>
            {debugInfo.readyStateText}
          </div>
        </div>

        <div style={{ 
          padding: '12px', 
          backgroundColor: 'white', 
          borderRadius: '6px', 
          border: '1px solid #e8e8e8' 
        }}>
          <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>连接质量</div>
          <div style={{ 
            fontSize: '16px', 
            fontWeight: 'bold', 
            color: getQualityColor(debugInfo.connectionQuality) 
          }}>
            {debugInfo.connectionQuality === 'excellent' ? '优秀' :
             debugInfo.connectionQuality === 'good' ? '良好' :
             debugInfo.connectionQuality === 'poor' ? '较差' : '断开'}
          </div>
        </div>

        <div style={{ 
          padding: '12px', 
          backgroundColor: 'white', 
          borderRadius: '6px', 
          border: '1px solid #e8e8e8' 
        }}>
          <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>消息数量</div>
          <div style={{ fontSize: '16px', fontWeight: 'bold' }}>
            {debugInfo.messageCount}
          </div>
        </div>

        <div style={{ 
          padding: '12px', 
          backgroundColor: 'white', 
          borderRadius: '6px', 
          border: '1px solid #e8e8e8' 
        }}>
          <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>错误数量</div>
          <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#ff4d4f' }}>
            {debugInfo.errorCount}
          </div>
        </div>
      </div>

      {/* 详细信息 */}
      {showDetails && (
        <div style={{ marginBottom: '16px' }}>
          <details style={{ border: '1px solid #e8e8e8', borderRadius: '6px', padding: '12px' }}>
            <summary style={{ cursor: 'pointer', fontWeight: 'bold', marginBottom: '8px' }}>
              详细信息
            </summary>
            <div style={{ fontSize: '12px', lineHeight: '1.6' }}>
              <div>URL: {debugInfo.url}</div>
              <div>协议: {debugInfo.protocol || 'N/A'}</div>
              <div>扩展: {debugInfo.extensions || 'N/A'}</div>
              <div>缓冲大小: {debugInfo.bufferedAmount} bytes</div>
              <div>连接时长: {formatDuration(debugInfo.connectionDuration)}</div>
              <div>重连次数: {debugInfo.reconnectAttempts}</div>
              {debugInfo.lastMessageTime && (
                <div>最后消息: {new Date(debugInfo.lastMessageTime).toLocaleTimeString()}</div>
              )}
            </div>
          </details>
        </div>
      )}

      {/* 性能指标 */}
      {metrics && (
        <div style={{ marginBottom: '16px' }}>
          <details style={{ border: '1px solid #e8e8e8', borderRadius: '6px', padding: '12px' }}>
            <summary style={{ cursor: 'pointer', fontWeight: 'bold', marginBottom: '8px' }}>
              性能指标
            </summary>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
              gap: '8px',
              fontSize: '12px',
              lineHeight: '1.6'
            }}>
              <div>总连接: {metrics.totalConnections}</div>
              <div>成功连接: {metrics.successfulConnections}</div>
              <div>失败连接: {metrics.failedConnections}</div>
              <div>总消息: {metrics.totalMessages}</div>
              <div>总错误: {metrics.totalErrors}</div>
              <div>平均连接时间: {metrics.averageConnectionTime.toFixed(0)}ms</div>
            </div>
          </details>
        </div>
      )}

      {/* 问题诊断 */}
      {issues.length > 0 && (
        <div style={{ 
          marginBottom: '16px', 
          padding: '12px', 
          backgroundColor: '#fff2f0', 
          border: '1px solid #ffccc7', 
          borderRadius: '6px' 
        }}>
          <div style={{ fontWeight: 'bold', marginBottom: '8px', color: '#cf1322' }}>
            ⚠️ 检测到的问题
          </div>
          <ul style={{ margin: '0', paddingLeft: '20px', fontSize: '12px' }}>
            {issues.map((issue, index) => (
              <li key={index} style={{ marginBottom: '4px' }}>{issue}</li>
            ))}
          </ul>
        </div>
      )}

      {/* 解决建议 */}
      {advice.length > 0 && (
        <div style={{ 
          marginBottom: '16px', 
          padding: '12px', 
          backgroundColor: '#f6ffed', 
          border: '1px solid #b7eb8f', 
          borderRadius: '6px' 
        }}>
          <div style={{ fontWeight: 'bold', marginBottom: '8px', color: '#52c41a' }}>
            💡 解决建议
          </div>
          <ul style={{ margin: '0', paddingLeft: '20px', fontSize: '12px' }}>
            {advice.map((advice, index) => (
              <li key={index} style={{ marginBottom: '4px' }}>{advice}</li>
            ))}
          </ul>
        </div>
      )}

      {/* 操作按钮 */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {onReconnect && !debugInfo.readyStateText.includes('OPEN') && (
          <button 
            onClick={onReconnect}
            style={{ 
              padding: '6px 12px', 
              backgroundColor: '#1890ff', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            重新连接
          </button>
        )}

        <button 
          onClick={() => setShowDiagnostic(!showDiagnostic)}
          style={{ 
            padding: '6px 12px', 
            backgroundColor: '#faad14', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '12px'
          }}
        >
          {showDiagnostic ? '隐藏诊断' : '显示诊断'}
        </button>

        <button 
          onClick={copyDiagnosticReport}
          style={{ 
            padding: '6px 12px', 
            backgroundColor: '#52c41a', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '12px'
          }}
        >
          复制诊断报告
        </button>
      </div>

      {/* 诊断报告 */}
      {showDiagnostic && (
        <div style={{ 
          marginTop: '16px', 
          padding: '12px', 
          backgroundColor: 'white', 
          border: '1px solid #e8e8e8', 
          borderRadius: '6px',
          fontSize: '11px',
          fontFamily: 'monospace',
          whiteSpace: 'pre-wrap',
          maxHeight: '300px',
          overflow: 'auto'
        }}>
          {generateReport()}
        </div>
      )}
    </div>
  );
};
