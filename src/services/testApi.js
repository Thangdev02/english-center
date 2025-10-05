import api from './api';

export const testApiConnection = async () => {
  try {
    console.log('🧪 Testing API connection to localhost:3001...');
    
    const response = await api.get('/users');
    console.log('✅ API Connection successful!');
    
    return true;
  } catch (error) {
    console.error('❌ API Connection failed:', error.message);
    console.log('💡 Make sure JSON Server is running on port 3001');
    return false;
  }
};