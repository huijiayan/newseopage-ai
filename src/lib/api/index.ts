import axios, { AxiosInstance } from 'axios';

// 定义扩展的 API 客户端接口
interface ApiClient extends AxiosInstance {
  getCompetitorResearch: typeof getCompetitorResearch;
  login: typeof login;
  register: typeof register;
  sendEmailCode: typeof sendEmailCode;
  resetPassword: typeof resetPassword;
  googleLogin: typeof googleLogin;
  googleCallback: typeof googleCallback;
  getAlternativeStatus: typeof getAlternativeStatus;
  searchCompetitor: typeof searchCompetitor;
  generateAlternative: typeof generateAlternative;
  getAlternativeDetail: typeof getAlternativeDetail;
  getAlternativeSources: typeof getAlternativeSources;
  getAlternativeResult: typeof getAlternativeResult;
  chatWithAI: typeof chatWithAI;
  changeStyle: typeof changeStyle;
  getAlternativeWebsiteList: typeof getAlternativeWebsiteList;
  getAlternativeWebsiteHistory: typeof getAlternativeWebsiteHistory;
  getCustomerPackage: typeof getCustomerPackage;
  getAlternativeChatHistory: typeof getAlternativeChatHistory;
  googleOneTapLogin: typeof googleOneTapLogin;
  deletePage: typeof deletePage;
  generateWebsiteId: typeof generateWebsiteId;
  getAlternativeWebsiteResultList: typeof getAlternativeWebsiteResultList;
  getProductsByCustomerId: typeof getProductsByCustomerId;
  getSubfolders: typeof getSubfolders;
  updateSubfolders: typeof updateSubfolders;
  getVercelDomainInfo: typeof getVercelDomainInfo;
  getVercelDomainConfig: typeof getVercelDomainConfig;
  updateAlternativePublishStatus: typeof updateAlternativePublishStatus;
  updateAlternativeSlug: typeof updateAlternativeSlug;
  getPackageFeatures: typeof getPackageFeatures;
  createSubscription: typeof createSubscription;
  getPageBySlug: typeof getPageBySlug;
  editAlternativeHtml: typeof editAlternativeHtml;
  uploadMedia: typeof uploadMedia;
  getMedia: typeof getMedia;
  deleteMedia: typeof deleteMedia;
  regenerateSection: typeof regenerateSection;
  createDomainWithTXT: typeof createDomainWithTXT;
  validateDomain: typeof validateDomain;
  updateProduct: typeof updateProduct;
  addVercelDomain: typeof addVercelDomain;
  deleteVercelDomain: typeof deleteVercelDomain;
  getDomain: typeof getDomain;
  deleteDomain: typeof deleteDomain;
  getBrandAssets: typeof getBrandAssets;
  upsertBrandAssets: typeof upsertBrandAssets;
  createBrandAssets: typeof createBrandAssets;
  getCustomerInfo: typeof getCustomerInfo;
  setWatermark: typeof setWatermark;
  deleteAlternativeResult: typeof deleteAlternativeResult;
  updateNotificationPreferences: typeof updateNotificationPreferences;
  getWebsiteSitemap: typeof getWebsiteSitemap;
  getChatHistoryList: typeof getChatHistoryList;
  deleteChatMessage: typeof deleteChatMessage;
  createCustomerHubPageEntry: typeof createCustomerHubPageEntry;
  generateHubPageTitleAndKeywords: typeof generateHubPageTitleAndKeywords;
  updateCustomerHubPageEntry: typeof updateCustomerHubPageEntry;
  deleteCustomerHubPageEntry: typeof deleteCustomerHubPageEntry;
  gscAuth: typeof gscAuth;
  gscCallback: typeof gscCallback;
  checkGscAuth: typeof checkGscAuth;
  cancelGscAuth: typeof cancelGscAuth;
  getGscSites: typeof getGscSites;
  getSiteAnalytics: typeof getSiteAnalytics;
  uploadFavicon: typeof uploadFavicon;

}

const vercelApiClient = axios.create({
  baseURL: 'https://api.vercel.com',
  timeout: 10000,
  headers: {
    'Authorization': 'Bearer 3LSBxZQ35VdhqRW7tzGs1oYo',
    'Content-Type': 'application/json',
  },
});

// const API_URL = 'https://api.websitelm.com/v1';
// const API_URL = 'http://api.zhuyuejoey.com/v1';
const CHAT_API_URL = process.env.NEXT_PUBLIC_CHAT_API_URL || 'https://agents.zhuyuejoey.com'; // 聊天服务器地址
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.websitelm.com/v1'; // 主API服务器地址
const CHAT_WS_URL = process.env.NEXT_PUBLIC_CHAT_WS_URL || 'wss://agents.zhuyuejoey.com'; // WebSocket服务器地址


// 创建 axios 实例，更新配置
const apiClient: ApiClient = axios.create({
  baseURL: API_URL,
  timeout: 300000,
  headers: {
    'Content-Type': 'application/json',
  },  
}) as ApiClient;

// 创建聊天专用的 axios 实例 - 使用新的聊天服务器地址
const chatApiClient = axios.create({
  baseURL: CHAT_API_URL,
  timeout: 300000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 拦截器添加认证头
apiClient.interceptors.request.use((config: any) => {
  const token = localStorage.getItem('alternativelyAccessToken'); // 或从其他地方获取 token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 聊天API客户端拦截器添加认证头
chatApiClient.interceptors.request.use((config: any) => {
  const token = localStorage.getItem('alternativelyAccessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 聊天API客户端响应拦截器处理token失效
chatApiClient.interceptors.response.use(
  (response: any) => response,
  (error: any) => {
    if (error.response && error.response.status === 401) {
      // 触发一个自定义事件
      const tokenExpiredEvent = new CustomEvent('tokenExpired');
      window.dispatchEvent(tokenExpiredEvent);
      
      // 清除本地存储的token
      localStorage.removeItem('alternativelyAccessToken');
      localStorage.removeItem('alternativelyIsLoggedIn');
      localStorage.removeItem('alternativelyCustomerEmail');
      localStorage.removeItem('alternativelyCustomerId');
    }
    return Promise.reject(error);
  }
);

// 添加响应拦截器处理token失效
apiClient.interceptors.response.use(
  (response: any) => response,
  (error: any) => {
    if (error.response && error.response.status === 401) {
      // 触发一个自定义事件
      const tokenExpiredEvent = new CustomEvent('tokenExpired');
      window.dispatchEvent(tokenExpiredEvent);
      
      // 清除本地存储的token
      localStorage.removeItem('alternativelyAccessToken');
      localStorage.removeItem('alternativelyIsLoggedIn');
      localStorage.removeItem('alternativelyCustomerEmail');
      localStorage.removeItem('alternativelyCustomerId');
    }
    return Promise.reject(error);
  }
);

const getCompetitorResearch = async (website: any, apiKey: any) => {
  try {
    const response = await apiClient.post('/competitor/research', {
      website,
    }, {
      headers: {
        'api-key': 'difymr1234'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to get competitor research:', error);
    return null;
  }
};

// Add regular login method
const login = async (email: any, password: any) => {
  try {
    const response = await apiClient.post('/login', {
      email,
      password
    });
    return response.data;
  } catch (error) {
    console.error('Failed to login:', error);
    throw error;
  }
};

// Add register method
const register = async (registerData: any) => {
  try {
    // registerData 现在应包含 code, email, inviteCode, password
    const response = await apiClient.post('/customer/register', {
      code: registerData.code,
      email: registerData.email,
      inviteCode: registerData.inviteCode,
      password: registerData.password
    });
    return response.data;
  } catch (error) {
    console.error('Failed to register:', error);
    throw error;
  }
};

// Add send verification code method
const sendEmailCode = async (email: any, codeType: any) => {
  try {
    const response = await apiClient.post('/customer/send-email', {
      email,
      codeType // Available values: forgot_password, change_email, register
    });
    return response.data;
  } catch (error) {
    console.error('Failed to send email verification code:', error);
    throw error;
  }
};

// Add reset password method
const resetPassword = async (resetData: any) => {
  try {
    const response = await apiClient.post('/customer/reset-password', resetData);
    return response.data;
  } catch (error) {
    console.error('Failed to reset password:', error);
    throw error;
  }
};

// Google 登录
const googleLogin = async (inviteCode: any, source = 'alternatively') => {
  try {
    const params: any = { source };
    if (inviteCode) params.inviteCode = inviteCode;
    const response = await apiClient.get('/customer/google', { params });
    return response.data;
  } catch (error) {
    console.error('Failed to login with Google:', error);
    return null;
  }
};

// Google登录回调
const googleCallback = async (code: any, state: any) => {
  try {
    const response = await apiClient.get('/customer/google/callback', {
      params: { 
        code,
        state 
      }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to handle Google callback:', error);
    throw error;
  }
};

// 获取替代方案状态
const getAlternativeStatus = async (websiteId: any) => {
  try {
    const response = await apiClient.get(`/alternatively/${websiteId}/status`);
    return response.data;
  } catch (error) {
    console.error('Failed to get alternative status:', error);
    throw error;
  }
};

const searchCompetitor = async (conversationId: any, website: any) => {
  try {
    const response = await apiClient.post(`/alternatively/search`, {
      conversationId,
      website
    });
    return response.data;
  } catch (error) {
    console.error('Failed to search competitor:', error);
    throw error;
  }
};

// 生成替代方案
const generateAlternative = async (conversationId: any, hubPageIds: any, websiteId: any) => {
  try {
    const response = await apiClient.post('/alternatively/generate', {
      conversationId,
      hubPageIds,
      websiteId
    });
    return response.data;
  } catch (error) {
    console.error('Failed to generate alternative:', error);
    throw error;
  }
};

// 获取竞品分析详情
const getAlternativeDetail = async (websiteId: any, options: any = {}) => {
  try {
    const { planningId, page, limit } = options as any;
    const params: any = {};
    
    if (planningId) params.planningId = planningId;
    if (page !== undefined) params.page = page;
    if (limit !== undefined) params.limit = limit;
    
    const response = await apiClient.get(`/alternatively/${websiteId}/detail`, { params });
    return response.data;
  } catch (error) {
    console.error('Failed to get alternative details:', error);
    throw error;
  }
};

// 获取分析竞品的来源
const getAlternativeSources = async (websiteId: any) => {
  try {
    const response = await apiClient.get(`/alternatively/${websiteId}/sources`);
    return response.data;
  } catch (error) {
    console.error('Failed to get alternative sources:', error);
    throw error;
  }
};

// 获取竞品分析结果
const getAlternativeResult = async (websiteId: any) => {
  try {
    const response = await apiClient.get(`/alternatively/${websiteId}/result`);
    return response.data;
  } catch (error) {
    console.error('Failed to get alternative result:', error);
    throw error;
  }
};

// 创建新聊天 - 使用WebSocket流式响应
const chatWithAI = async (chatType: any, message: any, conversationId: any, onMessage?: (data: any) => void) => {
  try {
    console.log('🔍 chatWithAI 调用开始:', {
      chatType,
      message: message?.substring(0, 100) + (message?.length > 100 ? '...' : ''),
      conversationId,
      hasOnMessage: !!onMessage
    });

    // 检查是否在客户端环境
    if (typeof window === 'undefined') {
      throw new Error('WebSocket只在客户端可用');
    }

    // 获取访问令牌
    const token = localStorage.getItem('alternativelyAccessToken');
    console.log('🔍 WebSocket模式 - Token:', token ? '存在' : '不存在');
    
    if (!token) {
      console.error('🔍 WebSocket模式 - 缺少Token');
      throw new Error('缺少访问令牌');
    }
    
    // 使用正确的WebSocket URL格式
    const wsUrl = `${CHAT_WS_URL}/ws/chat/${conversationId || 'new'}?token=${token}`;
    console.log('🔍 WebSocket URL:', wsUrl);
    
    const websocket = new WebSocket(wsUrl);
    
    // 发送初始消息
    try {
      const initialResponse = await chatApiClient.post('/api/chat/new', {
        chatType,
        message,
        conversationId,
      });
      console.log('🔍 WebSocket初始消息响应:', initialResponse.data);
    } catch (error) {
      console.error('🔍 WebSocket初始消息发送失败:', error);
    }
    
    // 监听 WebSocket 消息
    websocket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('🔍 WebSocket消息接收:', data);
        if (onMessage) {
          onMessage(data);
        }
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };
    
    websocket.onerror = (error) => {
      console.error('WebSocket connection error:', error);
      websocket.close();
    };
    
    websocket.onclose = (event) => {
      console.log('WebSocket connection closed:', event.code, event.reason);
    };
    
    return { websocket }; // 返回 WebSocket 实例以便外部控制
  } catch (error: any) {
    console.error('Failed to chat with AI:', error);
    throw error;
  }
};

// 新增设计样式修改接口
const changeStyle = async (styleColor: any, websiteId: any) => {
  try {
    const response = await apiClient.post('/alternatively/style', {
      styleColor,
      websiteId
    });
    return response.data;
  } catch (error) {
    console.error('Failed to change website style:', error);
    throw error;
  }
};

// 修改获取客户生成信息列表接口，添加分页支持
const getAlternativeWebsiteList = async (page = 1, limit = 100) => {
  try {
    const response = await apiClient.get('/alternatively/website', {
      params: { page, limit }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to get alternative website list:', error);
    throw error;
  }
};

// 新增获取生成信息历史记录接口
const getAlternativeWebsiteHistory = async (websiteId: any) => {
  try {
    const response = await apiClient.get('/alternatively/website/history', {
      params: { websiteId }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to get alternative website history:', error);
    throw error;
  }
};

// 新增：获取客户Package的方法
const getCustomerPackage = async () => {
  try {
    const response = await apiClient.get('/customer/package');
    return response.data;
  } catch (error) {
    console.error('Failed to get customer package:', error);
    return null;
  }
};

// 获取聊天历史记录 - 使用新的聊天服务器
const getAlternativeChatHistory = async (conversationId: any) => {
  try {
    const response = await chatApiClient.get('/api/chat/history', {
      params: { conversationId }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to get chat history:', error);
    throw error;
  }
};

// 新增：Google One Tap 登录方法
const googleOneTapLogin = async (credential: any) => {
  try {
    const response = await apiClient.post('/customer/google/one-tap', {
      credential
    });
    return response.data;
  } catch (error) {
    console.error('Failed to login with Google One Tap:', error);
    throw error;
  }
};

// 新增：删除页面接口
const deletePage = async (websiteId: any) => {
  try {
    const response = await apiClient.delete(`/alternatively/${websiteId}`);
    return response.data;
  } catch (error) {
    console.error('Failed to delete page:', error);
    return null;
  }
};

// 新增：生成 websiteId 接口
const generateWebsiteId = async () => {
  try {
    // 发送 POST 请求到 /alternatively/generate/websiteId
    const response = await apiClient.post('/alternatively/generate/websiteId');
    // 返回响应数据，通常包含生成的 websiteId
    return response.data;
  } catch (error) {
    // 记录错误信息并重新抛出，以便调用者处理
    console.error('Failed to generate websiteId:', error);
    throw error;
  }
};

// 新增：根据 websiteId 获取生成 alternatively 页面列表
const getAlternativeWebsiteResultList = async (websiteId: any) => {
  try {
    const response = await apiClient.get(`/alternatively/results/${websiteId}`);
    return response.data;
  } catch (error) {
    console.error('Failed to get alternative website result list:', error);
    throw error;
  }
};

// 新增：根据客户ID获取产品列表
const getProductsByCustomerId = async () => {
  try {
    const response = await apiClient.get(`/products/customer`);
    return response.data;
  } catch (error) {
    console.error('Failed to get customer product list:', error);
    return null;
  }
};

// 新增：获取用户子文件夹
const getSubfolders = async () => {
  try {
    const response = await apiClient.get('/customer/subfolder');
    return response.data;
  } catch (error) {
    console.error('Failed to get user subfolder:', error);
    return null;
  }
};

// 新增：更新子文件夹的方法
const updateSubfolders = async (subfolders: any) => {
  try {
    const response = await apiClient.put('/customer/subfolder', {
      subfolder: subfolders
    });
    return response.data;
  } catch (error) {
    console.error('Failed to update subfolder:', error);
    return null;
  }
};

// 新增：获取 Vercel 项目域名信息
const getVercelDomainInfo = async (projectId: any, options: any = {}) => {
  try {
    const { limit = 100, since, until } = options as any;
    const params: any = { limit };
    
    if (since) params.since = since;
    if (until) params.until = until;
    
    const queryString = new URLSearchParams(params).toString();
    const response = await vercelApiClient.get(`/v9/projects/${projectId}/domains?${queryString}`);
    return response.data;
  } catch (error) {
    console.error('Failed to get Vercel domain info:', error);
    throw error;
  }
};

// 新增：获取 Vercel 域名配置
const getVercelDomainConfig = async (domainName: any, params: any = {}) => {
  try {
    const queryParams = new URLSearchParams({
      ...(params as any).slug && { slug: (params as any).slug },
      ...(params as any).strict && { strict: (params as any).strict },
      ...(params as any).teamId && { teamId: (params as any).teamId }
    }).toString();
    
    const response = await vercelApiClient.get(
      `/v6/domains/${domainName}/config${queryParams ? `?${queryParams}` : ''}`
    );
    return response.data;
  } catch (error) {
    console.error('Failed to get Vercel domain config:', error);
    throw error;
  }
};

// 新增：更新 alternatively 发布状态
const updateAlternativePublishStatus = async (resultId: any, status: any, siteURL: any) => {
  try {
    const params: any = {};
    if (siteURL) params.siteURL = siteURL;
    const response = await apiClient.put(
      `/alternatively/${resultId}/${status}`,
      {},
      { params }
    );
    return response.data;
  } catch (error) {
    console.error('Failed to update alternative publish status:', error);
    throw error;
  }
};

// 新增：编辑生成内容的 slug
const updateAlternativeSlug = async (resultId: any, slug: any) => {
  try {
    const response = await apiClient.put(
      `/alternatively/slug/${resultId}`,
      { slug }
    );
    return response.data;
  } catch (error) {
    console.error('Failed to update alternative slug:', error);
    throw error;
  }
};

// 新增：获取套餐功能列表接口
const getPackageFeatures = async () => {
  try {
    const response = await apiClient.get('/features-package');
    return response.data;
  } catch (error) {
    console.error('获取套餐功能列表失败:', error);
    return null;
  }
};

// 新增：创建订阅接口
const createSubscription = async (subscriptionData: any) => {
  try {
    const response = await apiClient.post('/payment/subscribe', {
      customerId: subscriptionData.customerId,
      email: subscriptionData.email,
      name: subscriptionData.name,
      packageId: subscriptionData.packageId,
      paymentMethodId: subscriptionData.paymentMethodId
    });
    return response.data;
  } catch (error) {
    console.error('创建订阅失败:', error);
    return null;
  }
};

// 新增：根据 slug 获取页面内容
const getPageBySlug = async (slug: any, lang: any, domain: any) => {
  try {
    const response = await apiClient.get(`/pages/view/${slug}`, {
      params: { domain, lang }
    });
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      return { notFound: true };
    }
    console.error('Failed to get article by slug:', error.response?.data || error.message);
    throw error;
  }
};

// 新增：编辑生成内容的 HTML
const editAlternativeHtml = async (editData: any) => {
  try {
    const response = await apiClient.put('/alternatively/html', {
      html: editData.html,
      resultId: editData.resultId,
      websiteId: editData.websiteId
    });
    return response.data;
  } catch (error) {
    console.error('Failed to edit alternative HTML:', error);
    return null;
  }
};

// Add: Upload media file API
const uploadMedia = async (formData: any) => {
  try {
    const response = await apiClient.post('/media', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 5 * 60 * 1000, // 5 minutes
    });
    return response.data;
  } catch (error) {
    console.error('Failed to upload media:', error);
    return null;
  }
};

// Get: Fetch media file list API
const getMedia = async (customerId: any, mediaType: any, categoryId: any, page: any, limit: any) => {
  try {
    const params = {
      customerId,
      page,
      limit,
      ...(mediaType && { mediaType }),
      ...(categoryId && { categoryId })
    };
    const response = await apiClient.get('/media', { params });
    return response.data;
  } catch (error) {
    console.error('Failed to get media list:', error);
    return null;
  }
};

// Delete: Delete media file API
const deleteMedia = async (mediaId: any) => {
  try {
    const response = await apiClient.delete(`/media/${mediaId}`);
    return response.data;
  } catch (error) {
    console.error('Failed to delete media:', error);
    return null;
  }
};

// 新增：重新生成网页的特定区块
const regenerateSection = async (regenerateData: any) => {
  try {
    const response = await apiClient.post('/alternatively/section/regenerate', regenerateData);
    return response.data;
  } catch (error) {
    console.error('Failed to regenerate section:', error);
    throw error;
  }
};

// 新增：创建域名并添加 TXT 记录
const createDomainWithTXT = async (domainData: any) => {
  try {
    const response = await apiClient.post('/domain', domainData);
    return response.data;
  } catch (error) {
    console.error('Failed to create domain and add TXT record:', error);
    return null; // 或者根据需要抛出错误 throw error;
  }
};

// 新增：验证域名接口
const validateDomain = async (customerId: any) => {
  try {
    const response = await apiClient.get('/domain/validate', {
      params: { customerId }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to validate domain:', error);
    return null;
  }
};

// 新增：更新产品的方法
const updateProduct = async (productId: any, productData: any) => {
  try {
    const response = await apiClient.put(`/products/${productId}`, productData);
    return response.data;
  } catch (error) {
    console.error('Failed to update product:', error);
    return null;
  }
};

// 新增：添加 Vercel 域名
const addVercelDomain = async (projectId: any, domainData: any) => {
  try {
    const response = await vercelApiClient.post(`/v10/projects/${projectId}/domains`, domainData);
    return response.data;
  } catch (error) {
    console.error('Failed to add Vercel domain:', error);
    throw error;
  }
};

// 新增：删除 Vercel 域名
const deleteVercelDomain = async (projectId: any, domainName: any) => {
  try {
    const response = await vercelApiClient.delete(`/v9/projects/${projectId}/domains/${domainName}`);
    return response.data;
  } catch (error) {
    console.error('Failed to delete Vercel domain:', error);
    throw error;
  }
};

// 新增：获取域名
const getDomain = async (customerId: any) => {
  try {
    const response = await apiClient.get('/domain', {
      params: { customerId }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to get domain:', error);
    return null; // 或者根据需要抛出错误 throw error;
  }
};

// 新增：删除客户域名
const deleteDomain = async (domainId: any) => {
  try {
    const response = await apiClient.delete(`/domain/${domainId}`);
    return response.data;
  } catch (error) {
    console.error('Failed to delete domain:', error);
    throw error; // 或者返回 null，取决于错误处理策略
  }
};

// 新增：通过客户ID获取品牌资产
const getBrandAssets = async () => {
  try {
    // 发送 GET 请求到 /customer/brand-assets/current
    // Authorization 头已由拦截器自动添加
    const response = await apiClient.get('/customer/brand-assets/current');
    // 返回响应数据
    return response.data;
  } catch (error) {
    // 记录错误信息并返回 null 或根据需要抛出错误
    console.error('Failed to get brand assets:', error);
    return null; // 或者 throw error;
  }
};

// 更新：创建或更新品牌资产 (现在使用 PUT 方法并包含 brandId)
const upsertBrandAssets = async (brandId: any, brandAssetData: any) => {
  try {
    // 发送 PUT 请求到 /customer/brand-assets/{brandId}
    // Authorization 头已由拦截器自动添加
    // brandAssetData 是包含品牌资产信息的对象
    const response = await apiClient.put(`/customer/brand-assets/${brandId}`, brandAssetData);
    // 返回响应数据
    return response.data;
  } catch (error) {
    // 记录错误信息并返回 null 或根据需要抛出错误
    console.error('Failed to upsert brand assets:', error);
    return null; // 或者 throw error;
  }
};

// 新增：创建品牌资产
const createBrandAssets = async (brandAssetData: any) => {
  try {
    // 发送 POST 请求到 /customer/brand-assets
    // Authorization 头已由拦截器自动添加
    // brandAssetData 是包含品牌资产信息的对象
    const response = await apiClient.post('/customer/brand-assets', brandAssetData);
    // 返回响应数据
    return response.data;
  } catch (error) {
    // 记录错误信息并返回 null 或根据需要抛出错误
    console.error('Failed to create brand assets:', error);
    return null; // 或者 throw error;
  }
};

// 新增：获取用户信息
const getCustomerInfo = async () => {
  try {
    // 发送 GET 请求到 /customer/info
    // Authorization 头已由拦截器自动添加
    const response = await apiClient.get('/customer/info');
    // 返回响应数据
    return response.data;
  } catch (error) {
    // 记录错误信息并返回 null 或根据需要抛出错误
    console.error('Failed to get customer info:', error);
    return null; // 或者 throw error;
  }
};

// 新增：设置去除水印
const setWatermark = async (removeWatermark: any) => {
  try {
    const response = await apiClient.put('/customer/watermark', {
      removeWatermark
    });
    return response.data;
  } catch (error) {
    console.error('Failed to set watermark:', error);
    throw error;
  }
};

// 新增：删除替代方案结果
const deleteAlternativeResult = async (resultId: any) => {
  try {
    const response = await apiClient.delete(`/alternatively/result/${resultId}`);
    return response.data;
  } catch (error) {
    console.error('Failed to delete alternative result:', error);
    throw error;
  }
};

// 新增：更新通知偏好设置
const updateNotificationPreferences = async (notificationData: any) => {
  try {
    const response = await apiClient.put('/customer/notification-preferences', {
      channel: notificationData.channel,
      enabled: notificationData.enabled,
      notificationType: notificationData.notificationType
    });
    return response.data;
  } catch (error) {
    console.error('Failed to update notification preferences:', error);
    throw error;
  }
};

// 新增：获取website所有 hub sitemap
const getWebsiteSitemap = async (websiteId: any) => {
  try {
    const response = await apiClient.get('/alternatively/website/sitemap', {
      params: { websiteId }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to get website sitemap:', error);
    throw error;
  }
};

// 获取聊天历史列表 - 使用主API服务器
const getChatHistoryList = async (conversationId: any, page: any, limit: any) => {
  try {
    const params: any = { conversationId };
    if (page !== undefined) params.page = page;
    if (limit !== undefined) params.limit = limit;
    
    const response = await apiClient.get('/alternatively/chat/list', { params });
    return response.data;
  } catch (error) {
    console.error('获取聊天历史列表失败:', error);
    throw error;
  }
};

// 新增：删除聊天消息
const deleteChatMessage = async (conversationId: any) => {
  try {
    const response = await apiClient.delete(`/alternatively/chat/${conversationId}`);
    return response.data;
  } catch (error) {
    console.error('删除聊天消息失败:', error);
    throw error;
  }
};

// 新增：创建客户Hub页面条目
const createCustomerHubPageEntry = async (entryData: any) => {
  try {
    const response = await apiClient.post('/sitemap/hub-entry', {
      competitors: entryData.competitors,
      description: entryData.description,
      pageTitle: entryData.pageTitle,
      pageType: entryData.pageType,
      relatedKeywords: entryData.relatedKeywords,
      websiteId: entryData.websiteId,
      websiteURL: entryData.websiteURL
    });
    return response.data;
  } catch (error) {
    console.error('创建客户Hub页面条目失败:', error);
    throw error;
  }
};

// 新增：Hub页面AI生成器标题和关键词
const generateHubPageTitleAndKeywords = async (hubPageData: any) => {
  try {
    const response = await apiClient.post('/sitemap/hub-entry/generator', {
      competitors: hubPageData.competitors,
      description: hubPageData.description,
      pageTitle: hubPageData.pageTitle,
      pageType: hubPageData.pageType,
      relatedKeywords: hubPageData.relatedKeywords,
      websiteId: hubPageData.websiteId,
      websiteURL: hubPageData.websiteURL
    });
    return response.data;
  } catch (error) {
    console.error('Hub页面AI生成器失败:', error);
    throw error;
  }
};

// 新增：更新客户Hub页面条目
const updateCustomerHubPageEntry = async (hubPageId: any, entryData: any) => {
  try {
    const response = await apiClient.put(`/sitemap/hub-entry/${hubPageId}`, {
      competitors: entryData.competitors,
      description: entryData.description,
      pageTitle: entryData.pageTitle,
      pageType: entryData.pageType,
      relatedKeywords: entryData.relatedKeywords,
      websiteId: entryData.websiteId,
      websiteURL: entryData.websiteURL
    });
    return response.data;
  } catch (error) {
    console.error('更新客户Hub页面条目失败:', error);
    throw error;
  }
};

// 新增：删除客户Hub页面条目
const deleteCustomerHubPageEntry = async (hubPageId: any) => {
  try {
    const response = await apiClient.delete(`/sitemap/hub-entry/${hubPageId}`);
    return response.data;
  } catch (error) {
    console.error('删除客户Hub页面条目失败:', error);
    throw error;
  }
};

// 在现有接口之后添加以下新接口

// 1. 获取GSC授权链接
const gscAuth = async (customerId: any) => {
  try {
    const response = await apiClient.get('/auth', { params: { customerId } });
    return response.data;
  } catch (error) {
    console.error('GSC auth failed:', error);
    return null;
  }
};

// 2. 处理GSC回调
const gscCallback = async (code: any) => {
  try {
    const response = await apiClient.get('/callback', { params: { code } });
    return response.data;
  } catch (error) {
    console.error('GSC callback failed:', error);
    return null;
  }
};

// 3. 检查GSC授权状态
const checkGscAuth = async (customerId: any) => {
  try {
    const response = await apiClient.get('/sites/check', { 
      params: { customerId } 
    });
    return response.data;
  } catch (error) {
    console.error('Failed to check GSC authorization:', error);
    return null;
  }
};

// 4. 取消GSC授权
const cancelGscAuth = async () => {
  try {
    const response = await apiClient.delete('/auth/cancel');
    return response.data;
  } catch (error) {
    console.error('Failed to cancel GSC OAuth:', error);
    return null;
  }
};

// 5. 获取GSC站点数据
const getGscSites = async (customerId: any) => {
  try {
    const response = await apiClient.get('/sites', { 
      params: { customerId } 
    });
    return response.data;
  } catch (error) {
    console.error('Failed to get GSC sites:', error);
    return null;
  }
};

// 新增：获取站点分析数据
const getSiteAnalytics = async (params: any = {}) => {
  try {
    const { startDate, endDate, dimensions, queryURL } = params as any;
    const response = await apiClient.get('/sites/analytics', {
      params: {
        startDate,
        endDate,
        dimensions,
        queryURL
      }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to get site analytics:', error);
    return null;
  }
};

// 新增：上传客户favicon
const uploadFavicon = async (file: any) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await apiClient.put('/customer/favicon', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 5 * 60 * 1000, // 5 minutes
    });
    return response.data;
  } catch (error) {
    console.error('Failed to upload favicon:', error);
    return null;
  }
};

apiClient.getCompetitorResearch = getCompetitorResearch;
apiClient.login = login;
apiClient.register = register;
apiClient.sendEmailCode = sendEmailCode;
apiClient.resetPassword = resetPassword;
apiClient.googleLogin = googleLogin;
apiClient.googleCallback = googleCallback;
apiClient.getAlternativeStatus = getAlternativeStatus;
apiClient.generateAlternative = generateAlternative;
apiClient.getAlternativeDetail = getAlternativeDetail;
apiClient.getAlternativeSources = getAlternativeSources;
apiClient.getAlternativeResult = getAlternativeResult;
apiClient.searchCompetitor = searchCompetitor;
apiClient.chatWithAI = chatWithAI;
apiClient.changeStyle = changeStyle;
apiClient.getAlternativeWebsiteList = getAlternativeWebsiteList;
apiClient.getAlternativeWebsiteHistory = getAlternativeWebsiteHistory;
apiClient.getCustomerPackage = getCustomerPackage;
apiClient.getAlternativeChatHistory = getAlternativeChatHistory;
apiClient.googleOneTapLogin = googleOneTapLogin;
apiClient.deletePage = deletePage;
apiClient.generateWebsiteId = generateWebsiteId;
apiClient.getAlternativeWebsiteResultList = getAlternativeWebsiteResultList;
apiClient.getProductsByCustomerId = getProductsByCustomerId;
apiClient.getSubfolders = getSubfolders;
apiClient.updateSubfolders = updateSubfolders;
apiClient.getVercelDomainInfo = getVercelDomainInfo;
apiClient.getVercelDomainConfig = getVercelDomainConfig;
apiClient.updateAlternativePublishStatus = updateAlternativePublishStatus;
apiClient.updateAlternativeSlug = updateAlternativeSlug;
apiClient.getPackageFeatures = getPackageFeatures;
apiClient.createSubscription = createSubscription;
apiClient.getPageBySlug = getPageBySlug;
apiClient.editAlternativeHtml = editAlternativeHtml;
apiClient.uploadMedia = uploadMedia;
apiClient.getMedia = getMedia;
apiClient.deleteMedia = deleteMedia;
apiClient.regenerateSection = regenerateSection;
apiClient.createDomainWithTXT = createDomainWithTXT;
apiClient.validateDomain = validateDomain;
apiClient.updateProduct = updateProduct;
apiClient.addVercelDomain = addVercelDomain;
apiClient.deleteVercelDomain = deleteVercelDomain;
apiClient.getDomain = getDomain;
apiClient.deleteDomain = deleteDomain;
apiClient.getBrandAssets = getBrandAssets;
apiClient.upsertBrandAssets = upsertBrandAssets;
apiClient.createBrandAssets = createBrandAssets;
apiClient.getCustomerInfo = getCustomerInfo;
apiClient.setWatermark = setWatermark;
apiClient.deleteAlternativeResult = deleteAlternativeResult;
apiClient.updateNotificationPreferences = updateNotificationPreferences;
apiClient.getWebsiteSitemap = getWebsiteSitemap;
apiClient.getChatHistoryList = getChatHistoryList;
apiClient.deleteChatMessage = deleteChatMessage;
apiClient.createCustomerHubPageEntry = createCustomerHubPageEntry;
apiClient.generateHubPageTitleAndKeywords = generateHubPageTitleAndKeywords;
apiClient.updateCustomerHubPageEntry = updateCustomerHubPageEntry;
apiClient.deleteCustomerHubPageEntry = deleteCustomerHubPageEntry;
apiClient.gscAuth = gscAuth;
apiClient.gscCallback = gscCallback;
apiClient.checkGscAuth = checkGscAuth;
apiClient.cancelGscAuth = cancelGscAuth;
apiClient.getGscSites = getGscSites;
apiClient.getSiteAnalytics = getSiteAnalytics;
apiClient.uploadFavicon = uploadFavicon;

// WebSocket连接辅助函数
export const createChatWebSocket = (conversationId: string) => {
  const token = localStorage.getItem('alternativelyAccessToken');
  const wsUrl = `${CHAT_WS_URL}?conversationId=${conversationId}&token=${token}`;
  return new WebSocket(wsUrl);
};

// SSE连接辅助函数 - 已注释，改用WebSocket
// export const createChatSSE = (conversationId: string) => {
//   const token = localStorage.getItem('alternativelyAccessToken');
//   const sseUrl = `${CHAT_API_URL}/api/chat/stream?conversationId=${conversationId}&token=${token}`;
//   return new EventSource(sseUrl);
// };

// 使用示例：
// 1. 传统HTTP聊天：
// const response = await apiClient.chatWithAI('search', 'hello', 'conv123');
//
// 2. WebSocket流式聊天：
// const { websocket } = await apiClient.chatWithAI('search', 'hello', 'conv123', (data) => {
//   console.log('收到流式消息:', data);
// });
// // 记得在适当时机关闭连接
// websocket.close();
//
// 3. 直接使用WebSocket连接：
// const ws = createChatWebSocket('conv123');
// ws.onmessage = (event) => {
//   const data = JSON.parse(event.data);
//   console.log('WebSocket消息:', data);
// };
// ws.onerror = (error) => {
//   console.error('WebSocket错误:', error);
//   ws.close();
// };

export default apiClient as ApiClient;
