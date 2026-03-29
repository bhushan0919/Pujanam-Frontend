// Frontend/src/api/serviceApi.js
import api from "./apiClient";

export const serviceApi = {
  getAllServices: async () => {
    console.log('📡 serviceApi.getAllServices called');
    const res = await api.get("/services");
    console.log('✅ getAllServices response:', res.data);
    return res.data;
  },

  getActiveServices: async (category = "") => {
    console.log('📡 serviceApi.getActiveServices called with category:', category);
    const params = {};
    if (category) params.category = category;
    
    console.log('   Request params:', params);
    console.log('   Full URL: /services/active');
    
    const res = await api.get("/services/active", { params });
    console.log('✅ getActiveServices response:', res.data);
    console.log('   Number of services:', res.data.length);
    
    return res.data;
  },

  getServiceById: async (id) => {
    console.log('📡 serviceApi.getServiceById called:', id);
    const res = await api.get(`/services/${id}`);
    console.log('✅ getServiceById response:', res.data);
    return res.data;
  }
};
