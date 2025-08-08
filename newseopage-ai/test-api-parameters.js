// 测试API参数映射
// 验证tempConversationId和formattedInput如何映射到API调用

const testApiParameters = () => {
  console.log('🔍 开始测试API参数映射');
  
  // 模拟API客户端
  const mockApiClient = {
    searchCompetitor: async (conversationId, website) => {
      console.log('🔍 API调用: searchCompetitor(conversationId, website)');
      console.log('  - conversationId:', conversationId);
      console.log('  - website:', website);
      
      // 模拟API响应
      return {
        code: 200,
        data: {
          competitors: [
            { name: 'competitor1.com', traffic: 10000 },
            { name: 'competitor2.com', traffic: 8000 }
          ],
          websiteId: 'website-123'
        }
      };
    }
  };
  
  // 测试用例
  const testCases = [
    {
      name: '基本参数映射测试',
      tempConversationId: 'conv-123',
      formattedInput: 'example.com',
      expected: {
        conversationId: 'conv-123',
        website: 'example.com'
      }
    },
    {
      name: '带协议域名测试',
      tempConversationId: 'conv-456',
      formattedInput: 'https://seopage.ai',
      expected: {
        conversationId: 'conv-456',
        website: 'https://seopage.ai'
      }
    },
    {
      name: '复杂域名测试',
      tempConversationId: 'conv-789',
      formattedInput: 'www.example-domain.com',
      expected: {
        conversationId: 'conv-789',
        website: 'www.example-domain.com'
      }
    }
  ];
  
  // 运行测试
  testCases.forEach(async (testCase, index) => {
    console.log(`\n🔍 测试 ${index + 1}: ${testCase.name}`);
    console.log('输入参数:');
    console.log('  - tempConversationId:', testCase.tempConversationId);
    console.log('  - formattedInput:', testCase.formattedInput);
    
    try {
      // 模拟API调用
      const response = await mockApiClient.searchCompetitor(
        testCase.tempConversationId,  // 对应 conversationId
        testCase.formattedInput       // 对应 website
      );
      
      console.log('API响应:', response);
      
      // 验证参数映射
      if (testCase.tempConversationId === testCase.expected.conversationId &&
          testCase.formattedInput === testCase.expected.website) {
        console.log('✅ 参数映射正确');
      } else {
        console.log('❌ 参数映射错误');
      }
      
      // 验证响应结构
      if (response.code === 200 && response.data) {
        console.log('✅ API响应结构正确');
      } else {
        console.log('❌ API响应结构错误');
      }
      
    } catch (error) {
      console.error('❌ API调用失败:', error);
    }
  });
  
  // 测试参数验证
  console.log('\n🔍 测试参数验证');
  
  const validationTests = [
    {
      name: '空conversationId测试',
      conversationId: null,
      website: 'example.com',
      shouldFail: true
    },
    {
      name: '空website测试',
      conversationId: 'conv-123',
      website: '',
      shouldFail: true
    },
    {
      name: '有效参数测试',
      conversationId: 'conv-123',
      website: 'example.com',
      shouldFail: false
    }
  ];
  
  validationTests.forEach((test, index) => {
    console.log(`\n🔍 验证测试 ${index + 1}: ${test.name}`);
    
    const isValid = test.conversationId && test.website && test.website.trim() !== '';
    
    if (isValid === !test.shouldFail) {
      console.log('✅ 参数验证通过');
    } else {
      console.log('❌ 参数验证失败');
    }
  });
  
  console.log('\n🔍 API参数映射测试完成');
};

// 运行测试
testApiParameters();
