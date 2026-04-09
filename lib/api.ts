import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the auth token
apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const apiService = {
  // Auth
  login: (credentials: any) => apiClient.post('/auth/login', credentials),
  
  // Contacts
  getContacts: () => apiClient.get('/contacts'),
  createContact: (data: any) => apiClient.post('/contacts', data),
  updateContactStatus: (id: number, status: string) => apiClient.patch(`/contacts/${id}/status`, { status }),
  deleteContact: (id: number) => apiClient.delete(`/contacts/${id}`),
  
  // Blogs
  getBlogs: () => apiClient.get('/blogs'),
  getBlogBySlug: (slug: string) => apiClient.get(`/blogs/${slug}`),
  createBlog: (data: any) => apiClient.post('/blogs', data),
  updateBlog: (id: number, data: any) => apiClient.put(`/blogs/${id}`, data),
  deleteBlog: (id: number) => apiClient.delete(`/blogs/${id}`),
  
  // Content (Generic)
  getFaqs: () => apiClient.get('/content/faqs'),
  getReviews: () => apiClient.get('/content/reviews'),
  getPortfolio: () => apiClient.get('/content/portfolio'),
  
  createContent: (type: string, data: any) => apiClient.post(`/content/${type}`, data),
  updateContent: (type: string, id: number, data: any) => apiClient.put(`/content/${type}/${id}`, data),
  deleteContent: (type: string, id: number) => apiClient.delete(`/content/${type}/${id}`),
};

export default apiService;
