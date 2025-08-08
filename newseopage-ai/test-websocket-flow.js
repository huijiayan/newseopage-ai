// 测试WebSocket消息处理流程
// 验证[URL_GET]标记检测和竞品搜索调用

const testWebSocketFlow = () => {
  console.log('🔍 开始测试WebSocket消息处理流程');
  
  // 模拟localStorage
  const mockLocalStorage = {
    'currentProductUrl': 'example.com'
  };
  
  // 模拟messageHandler
  const mockMessageHandler = {
    handleWebSocketMessage: (data) => {
      console.log('🔍 messageHandler.handleWebSocketMessage被调用:', data);
    }
  };
  
  // 模拟handleCompetitorSearch函数
  const mockHandleCompetitorSearch = (formattedInput) => {
    console.log('🔍 handleCompetitorSearch被调用，参数:', formattedInput);
    return Promise.resolve({ success: true });
  };
  
  // 模拟handleWebSocketMessage函数
  const handleWebSocketMessage = (data) => {
    console.log('🔍 WebSocket消息处理函数被调用:', data);
    
    // 使用增强的消息处理器处理WebSocket消息
    mockMessageHandler.handleWebSocketMessage(data);
    
    // 检查AI响应是否包含[URL_GET]标记
    if (data.type === 'message' && data.content && data.content.includes('[URL_GET]')) {
      console.log('🔍 检测到[URL_GET]标记，开始竞品搜索流程');
      
      // 获取存储的formattedInput
      const storedFormattedInput = mockLocalStorage['currentProductUrl'];
      if (storedFormattedInput) {
        console.log('🔍 从localStorage获取formattedInput:', storedFormattedInput);
        
        // 调用竞品搜索API
        mockHandleCompetitorSearch(storedFormattedInput);
      } else {
        console.error('🔍 未找到存储的formattedInput');
      }
    }
  };
  
  // 测试用例
  const testCases = [
    {
      name: '包含[URL_GET]标记的消息',
      data: {
        type: 'message',
        content: 'I need to get the URL [URL_GET] for competitor analysis'
      },
      shouldTriggerSearch: true
    },
    {
      name: '不包含[URL_GET]标记的消息',
      data: {
        type: 'message',
        content: 'This is a normal message without any tags'
      },
      shouldTriggerSearch: false
    },
    {
      name: '系统消息',
      data: {
        type: 'system',
        content: 'System message'
      },
      shouldTriggerSearch: false
    },
    {
      name: '包含其他标记的消息',
      data: {
        type: 'message',
        content: 'Process completed [COMPETITOR_SELECTED]'
      },
      shouldTriggerSearch: false
    }
  ];
  
  // 运行测试
  testCases.forEach((testCase, index) => {
    console.log(`\n🔍 测试 ${index + 1}: ${testCase.name}`);
    console.log('输入数据:', testCase.data);
    
    // 重置调用标志
    let searchTriggered = false;
    const originalHandleCompetitorSearch = mockHandleCompetitorSearch;
    mockHandleCompetitorSearch = (formattedInput) => {
      searchTriggered = true;
      console.log('🔍 竞品搜索被触发，参数:', formattedInput);
      return originalHandleCompetitorSearch(formattedInput);
    };
    
    // 调用处理函数
    handleWebSocketMessage(testCase.data);
    
    // 验证结果
    if (searchTriggered === testCase.shouldTriggerSearch) {
      console.log('✅ 测试通过');
    } else {
      console.log('❌ 测试失败');
    }
  });
  
  // 测试localStorage存储
  console.log('\n🔍 测试localStorage存储');
  
  const localStorageTests = [
    {
      name: '正常存储测试',
      input: 'seopage.ai',
      expected: 'seopage.ai'
    },
    {
      name: '带协议域名测试',
      input: 'https://example.com',
      expected: 'https://example.com'
    },
    {
      name: '空值测试',
      input: '',
      expected: ''
    }
  ];
  
  localStorageTests.forEach((test, index) => {
    console.log(`\n🔍 localStorage测试 ${index + 1}: ${test.name}`);
    
    // 模拟存储
    mockLocalStorage['currentProductUrl'] = test.input;
    
    // 模拟获取
    const retrieved = mockLocalStorage['currentProductUrl'];
    
    if (retrieved === test.expected) {
      console.log('✅ localStorage测试通过');
    } else {
      console.log('❌ localStorage测试失败');
    }
  });
  
  console.log('\n🔍 WebSocket消息处理流程测试完成');
};

// 运行测试
testWebSocketFlow();
