import axios from 'axios';

const apiBaseURL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: `${apiBaseURL}/api`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      typeof window !== 'undefined' && localStorage.removeItem('authToken');
    }
    return Promise.reject(error);
  }
);

export const apiService = {
  // Campaigns
  getCampaigns: (params?: any) => api.get('/campaigns/', { params }),
  getCampaignBySlug: (slug: string) => api.get(`/campaigns/${slug}/`),
  
  // Donations
  createDonation: (data: any) => api.post('/donations/', data),
  getDonations: (params?: any) => api.get('/donations/', { params }),
  
  // Events
  getEvents: (params?: any) => api.get('/events/', { params }),
  getEventBySlug: (slug: string) => api.get(`/events/${slug}/`),
  
  // Gallery
  getGalleryItems: (params?: any) => api.get('/gallery/', { params }),
  
  // Testimonials
  getTestimonials: (params?: any) => api.get('/testimonials/', { params }),
  
  // Blog
  getBlogPosts: (params?: any) => api.get('/blog/', { params }),
  getBlogPostBySlug: (slug: string) => api.get(`/blog/${slug}/`),
  
  // Impact Stats
  getImpactStats: (params?: any) => api.get('/impact-stats/', { params }),
  
  // Volunteers
  submitVolunteerForm: (data: any) => api.post('/volunteers/', data),
  
  // Settings/Contact
  submitContactForm: (data: any) => api.post('/settings/contact/contact_us/', data),
  getSiteSettings: () => api.get('/settings/site-config/'),
  
  // Health check
  healthCheck: () => api.get('/health/'),
};

export default api;
