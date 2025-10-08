import api from './api';

export const cartApi = {
  getCart: (userId) => api.get(`/cart?userId=${userId}`),
  addToCart: (courseId) => api.post('/cart', { courseId, userId: 1 }), // Mock user ID
  removeFromCart: (cartItemId) => api.delete(`/cart/${cartItemId}`),
  clearCart: (userId) => {
    return api.get(`/cart?userId=${userId}`)
      .then(response => {
        const deletePromises = response.data.map(item => 
          api.delete(`/cart/${item.id}`)
        );
        return Promise.all(deletePromises);
      });
  },
  
  // Checkout and orders
  createOrder: (orderData) => api.post('/orders', orderData),
  getOrders: (userId) => api.get(`/orders?userId=${userId}`),
  getOrder: (orderId) => api.get(`/orders/${orderId}`),
};

export const checkoutService = {
  processCheckout: async (cartItems, paymentMethod) => {
    const totalAmount = cartItems.reduce((total, item) => total + item.course.price, 0);
    
    const order = {
      userId: 1, 
      courses: cartItems.map(item => item.courseId),
      totalAmount,
      status: 'completed',
      paymentMethod,
      createdAt: new Date().toISOString()
    };
    
    const orderResponse = await cartApi.createOrder(order);
    
    await cartApi.clearCart(1);
    
    const enrollmentPromises = cartItems.map(item =>
      courseApi.enrollCourse(item.courseId)
    );
    
    await Promise.all(enrollmentPromises);
    
    return orderResponse.data;
  }
};