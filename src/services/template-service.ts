// Template service for managing different website templates
export interface WebsiteTemplate {
  id: string;
  name: string;
  description: string;
  category: 'business' | 'ecommerce' | 'portfolio' | 'blog' | 'dashboard' | 'landing';
  pages: TemplatePageConfig[];
  sharedStyles: string;
  features: string[];
}

export interface TemplatePageConfig {
  name: string;
  filename: string;
  title: string;
  sections: string[];
  isRequired: boolean;
}

export class TemplateService {
  private templates: WebsiteTemplate[] = [
    {
      id: 'business-corporate',
      name: 'Corporate Business',
      description: 'Professional business website with company information',
      category: 'business',
      features: ['Responsive Design', 'Contact Forms', 'Team Section', 'Services'],
      pages: [
        { name: 'Home', filename: 'index.html', title: 'Home', sections: ['hero', 'about-preview', 'services-preview', 'cta'], isRequired: true },
        { name: 'About', filename: 'about.html', title: 'About Us', sections: ['company-story', 'team', 'values', 'history'], isRequired: true },
        { name: 'Services', filename: 'services.html', title: 'Our Services', sections: ['services-grid', 'process', 'pricing'], isRequired: true },
        { name: 'Contact', filename: 'contact.html', title: 'Contact Us', sections: ['contact-form', 'location', 'info'], isRequired: true }
      ],
      sharedStyles: `
        /* Corporate Business Styles */
        :root {
          --primary-color: #34bfc2;
          --secondary-color: #F78D2B;
          --dark-color: #2c3e50;
          --light-color: #ecf0f1;
          --text-color: #2c3e50;
        }
        
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        body {
          font-family: 'IBM Plex Sans', sans-serif;
          line-height: 1.6;
          color: var(--text-color);
        }
        
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
        }
        
        /* Header */
        .header {
          background: white;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          position: fixed;
          width: 100%;
          top: 0;
          z-index: 1000;
        }
        
        .nav {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 0;
        }
        
        .logo {
          font-family: 'Source Sans Pro', sans-serif;
          font-size: 1.8rem;
          font-weight: 700;
          color: var(--primary-color);
        }
        
        .nav-links {
          display: flex;
          list-style: none;
          gap: 2rem;
        }
        
        .nav-links a {
          text-decoration: none;
          color: var(--text-color);
          font-weight: 500;
          transition: color 0.3s;
        }
        
        .nav-links a:hover {
          color: var(--primary-color);
        }
        
        /* Buttons */
        .btn {
          display: inline-block;
          padding: 12px 30px;
          background: var(--primary-color);
          color: white;
          text-decoration: none;
          border-radius: 5px;
          font-weight: 600;
          transition: all 0.3s;
          border: none;
          cursor: pointer;
        }
        
        .btn:hover {
          background: var(--secondary-color);
          transform: translateY(-2px);
        }
        
        .btn-secondary {
          background: transparent;
          color: var(--primary-color);
          border: 2px solid var(--primary-color);
        }
        
        /* Sections */
        .section {
          padding: 80px 0;
        }
        
        .section-title {
          font-family: 'Source Sans Pro', sans-serif;
          font-size: 2.5rem;
          text-align: center;
          margin-bottom: 3rem;
          color: var(--dark-color);
        }
        
        /* Footer */
        .footer {
          background: var(--dark-color);
          color: white;
          padding: 40px 0;
          text-align: center;
        }
        
        /* Responsive */
        @media (max-width: 768px) {
          .nav-links { display: none; }
          .section-title { font-size: 2rem; }
        }
      `
    },
    
    {
      id: 'ecommerce-store',
      name: 'E-commerce Store',
      description: 'Complete online store with product catalog and shopping features',
      category: 'ecommerce',
      features: ['Product Catalog', 'Shopping Cart', 'User Accounts', 'Payment Integration'],
      pages: [
        { name: 'Home', filename: 'index.html', title: 'Home', sections: ['hero-banner', 'featured-products', 'categories', 'testimonials'], isRequired: true },
        { name: 'Products', filename: 'products.html', title: 'Products', sections: ['product-grid', 'filters', 'pagination'], isRequired: true },
        { name: 'Product Detail', filename: 'product.html', title: 'Product Details', sections: ['product-images', 'product-info', 'reviews', 'related'], isRequired: true },
        { name: 'Cart', filename: 'cart.html', title: 'Shopping Cart', sections: ['cart-items', 'summary', 'checkout-btn'], isRequired: true },
        { name: 'About', filename: 'about.html', title: 'About Us', sections: ['company-story', 'mission'], isRequired: false },
        { name: 'Contact', filename: 'contact.html', title: 'Contact', sections: ['contact-form', 'support-info'], isRequired: false }
      ],
      sharedStyles: `
        /* E-commerce Store Styles */
        :root {
          --primary-color: #34bfc2;
          --secondary-color: #F78D2B;
          --success-color: #27ae60;
          --danger-color: #e74c3c;
          --dark-color: #2c3e50;
          --light-color: #f8f9fa;
        }
        
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        body {
          font-family: 'IBM Plex Sans', sans-serif;
          line-height: 1.6;
          color: #333;
        }
        
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
        }
        
        /* Product Grid */
        .product-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 2rem;
          margin: 2rem 0;
        }
        
        .product-card {
          background: white;
          border-radius: 10px;
          overflow: hidden;
          box-shadow: 0 5px 15px rgba(0,0,0,0.1);
          transition: transform 0.3s;
        }
        
        .product-card:hover {
          transform: translateY(-5px);
        }
        
        .product-image {
          width: 100%;
          height: 250px;
          object-fit: cover;
        }
        
        .product-info {
          padding: 1.5rem;
        }
        
        .product-title {
          font-size: 1.2rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
        }
        
        .product-price {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--primary-color);
          margin-bottom: 1rem;
        }
        
        /* Cart Styles */
        .cart-item {
          display: flex;
          align-items: center;
          padding: 1rem;
          border-bottom: 1px solid #eee;
        }
        
        .cart-summary {
          background: var(--light-color);
          padding: 2rem;
          border-radius: 10px;
          margin-top: 2rem;
        }
        
        /* Header with Cart */
        .header {
          background: white;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          position: fixed;
          width: 100%;
          top: 0;
          z-index: 1000;
        }
        
        .nav {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 0;
        }
        
        .cart-icon {
          position: relative;
          font-size: 1.5rem;
          color: var(--primary-color);
        }
        
        .cart-count {
          position: absolute;
          top: -8px;
          right: -8px;
          background: var(--secondary-color);
          color: white;
          border-radius: 50%;
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.8rem;
        }
      `
    },
    
    {
      id: 'portfolio-creative',
      name: 'Creative Portfolio',
      description: 'Showcase your work with a stunning portfolio website',
      category: 'portfolio',
      features: ['Project Gallery', 'About Section', 'Contact Form', 'Responsive Design'],
      pages: [
        { name: 'Home', filename: 'index.html', title: 'Portfolio', sections: ['hero', 'featured-work', 'about-preview', 'contact-cta'], isRequired: true },
        { name: 'Portfolio', filename: 'portfolio.html', title: 'My Work', sections: ['project-grid', 'categories-filter'], isRequired: true },
        { name: 'About', filename: 'about.html', title: 'About Me', sections: ['bio', 'skills', 'experience'], isRequired: true },
        { name: 'Contact', filename: 'contact.html', title: 'Contact', sections: ['contact-form', 'social-links'], isRequired: true }
      ],
      sharedStyles: `
        /* Creative Portfolio Styles */
        :root {
          --primary-color: #34bfc2;
          --secondary-color: #F78D2B;
          --dark-color: #1a1a1a;
          --light-color: #f8f8f8;
        }
        
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        body {
          font-family: 'IBM Plex Sans', sans-serif;
          line-height: 1.6;
          color: #333;
          background: #fff;
        }
        
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
        }
        
        /* Portfolio Grid */
        .portfolio-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          gap: 2rem;
          margin: 3rem 0;
        }
        
        .portfolio-item {
          position: relative;
          overflow: hidden;
          border-radius: 10px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        }
        
        .portfolio-image {
          width: 100%;
          height: 300px;
          object-fit: cover;
          transition: transform 0.3s;
        }
        
        .portfolio-item:hover .portfolio-image {
          transform: scale(1.05);
        }
        
        .portfolio-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(52, 191, 194, 0.9);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity 0.3s;
        }
        
        .portfolio-item:hover .portfolio-overlay {
          opacity: 1;
        }
        
        .portfolio-info {
          text-align: center;
          color: white;
        }
        
        .portfolio-title {
          font-size: 1.5rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
        }
        
        .portfolio-category {
          font-size: 1rem;
          opacity: 0.9;
        }
        
        /* Skills Section */
        .skills-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 2rem;
          margin: 2rem 0;
        }
        
        .skill-item {
          text-align: center;
          padding: 2rem;
          background: var(--light-color);
          border-radius: 10px;
        }
        
        .skill-icon {
          font-size: 3rem;
          color: var(--primary-color);
          margin-bottom: 1rem;
        }
      `
    },
    
    {
      id: 'blog-magazine',
      name: 'Blog & Magazine',
      description: 'Content-focused website for blogs and online magazines',
      category: 'blog',
      features: ['Article Listings', 'Categories', 'Search', 'Author Profiles'],
      pages: [
        { name: 'Home', filename: 'index.html', title: 'Blog', sections: ['featured-posts', 'recent-posts', 'categories'], isRequired: true },
        { name: 'Blog', filename: 'blog.html', title: 'All Posts', sections: ['post-grid', 'sidebar', 'pagination'], isRequired: true },
        { name: 'Post', filename: 'post.html', title: 'Blog Post', sections: ['post-content', 'author-bio', 'related-posts'], isRequired: true },
        { name: 'About', filename: 'about.html', title: 'About', sections: ['author-info', 'mission'], isRequired: true },
        { name: 'Contact', filename: 'contact.html', title: 'Contact', sections: ['contact-form'], isRequired: false }
      ],
      sharedStyles: `
        /* Blog & Magazine Styles */
        :root {
          --primary-color: #34bfc2;
          --secondary-color: #F78D2B;
          --text-color: #2c3e50;
          --light-gray: #f8f9fa;
          --border-color: #e9ecef;
        }
        
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        body {
          font-family: 'IBM Plex Sans', sans-serif;
          line-height: 1.7;
          color: var(--text-color);
        }
        
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
        }
        
        /* Blog Grid */
        .blog-grid {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 3rem;
          margin: 2rem 0;
        }
        
        .post-grid {
          display: grid;
          gap: 2rem;
        }
        
        .post-card {
          background: white;
          border-radius: 10px;
          overflow: hidden;
          box-shadow: 0 5px 15px rgba(0,0,0,0.08);
          transition: transform 0.3s;
        }
        
        .post-card:hover {
          transform: translateY(-5px);
        }
        
        .post-image {
          width: 100%;
          height: 200px;
          object-fit: cover;
        }
        
        .post-content {
          padding: 1.5rem;
        }
        
        .post-meta {
          display: flex;
          gap: 1rem;
          font-size: 0.9rem;
          color: #666;
          margin-bottom: 1rem;
        }
        
        .post-title {
          font-size: 1.3rem;
          font-weight: 600;
          margin-bottom: 1rem;
          color: var(--text-color);
        }
        
        .post-excerpt {
          color: #666;
          margin-bottom: 1rem;
        }
        
        .read-more {
          color: var(--primary-color);
          text-decoration: none;
          font-weight: 500;
        }
        
        /* Sidebar */
        .sidebar {
          background: var(--light-gray);
          padding: 2rem;
          border-radius: 10px;
          height: fit-content;
        }
        
        .widget {
          margin-bottom: 2rem;
        }
        
        .widget-title {
          font-size: 1.2rem;
          font-weight: 600;
          margin-bottom: 1rem;
          color: var(--text-color);
        }
        
        .category-list {
          list-style: none;
        }
        
        .category-list li {
          padding: 0.5rem 0;
          border-bottom: 1px solid var(--border-color);
        }
        
        .category-list a {
          color: var(--text-color);
          text-decoration: none;
        }
        
        .category-list a:hover {
          color: var(--primary-color);
        }
      `
    },
    
    {
      id: 'dashboard-app',
      name: 'Dashboard Application',
      description: 'Data-driven dashboard with analytics and management features',
      category: 'dashboard',
      features: ['Data Visualization', 'User Management', 'Analytics', 'Responsive Layout'],
      pages: [
        { name: 'Dashboard', filename: 'index.html', title: 'Dashboard', sections: ['stats-cards', 'charts', 'recent-activity'], isRequired: true },
        { name: 'Analytics', filename: 'analytics.html', title: 'Analytics', sections: ['performance-metrics', 'charts-grid'], isRequired: true },
        { name: 'Users', filename: 'users.html', title: 'User Management', sections: ['user-table', 'user-actions'], isRequired: false },
        { name: 'Settings', filename: 'settings.html', title: 'Settings', sections: ['account-settings', 'preferences'], isRequired: false },
        { name: 'Login', filename: 'login.html', title: 'Login', sections: ['login-form'], isRequired: true }
      ],
      sharedStyles: `
        /* Dashboard Application Styles */
        :root {
          --primary-color: #34bfc2;
          --secondary-color: #F78D2B;
          --success-color: #27ae60;
          --warning-color: #f39c12;
          --danger-color: #e74c3c;
          --dark-color: #2c3e50;
          --light-color: #f8f9fa;
          --sidebar-width: 250px;
        }
        
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        body {
          font-family: 'IBM Plex Sans', sans-serif;
          background: var(--light-color);
          color: #333;
        }
        
        .dashboard-container {
          display: flex;
          min-height: 100vh;
        }
        
        /* Sidebar */
        .sidebar {
          width: var(--sidebar-width);
          background: white;
          box-shadow: 2px 0 10px rgba(0,0,0,0.1);
          position: fixed;
          height: 100vh;
          overflow-y: auto;
        }
        
        .sidebar-header {
          padding: 2rem;
          border-bottom: 1px solid #eee;
        }
        
        .logo {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--primary-color);
        }
        
        .sidebar-menu {
          padding: 1rem 0;
        }
        
        .menu-item {
          display: flex;
          align-items: center;
          padding: 1rem 2rem;
          color: #666;
          text-decoration: none;
          transition: all 0.3s;
        }
        
        .menu-item:hover,
        .menu-item.active {
          background: var(--primary-color);
          color: white;
        }
        
        .menu-item i {
          margin-right: 1rem;
          width: 20px;
        }
        
        /* Main Content */
        .main-content {
          flex: 1;
          margin-left: var(--sidebar-width);
          padding: 2rem;
        }
        
        /* Stats Cards */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 2rem;
          margin-bottom: 2rem;
        }
        
        .stat-card {
          background: white;
          padding: 2rem;
          border-radius: 10px;
          box-shadow: 0 5px 15px rgba(0,0,0,0.08);
        }
        
        .stat-value {
          font-size: 2.5rem;
          font-weight: 700;
          color: var(--primary-color);
          margin-bottom: 0.5rem;
        }
        
        .stat-label {
          color: #666;
          font-size: 0.9rem;
        }
        
        /* Charts */
        .chart-container {
          background: white;
          padding: 2rem;
          border-radius: 10px;
          box-shadow: 0 5px 15px rgba(0,0,0,0.08);
          margin-bottom: 2rem;
        }
        
        .chart-title {
          font-size: 1.2rem;
          font-weight: 600;
          margin-bottom: 1rem;
          color: var(--dark-color);
        }
        
        .chart-placeholder {
          height: 300px;
          background: var(--light-color);
          border-radius: 5px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #666;
        }
        
        /* Tables */
        .data-table {
          background: white;
          border-radius: 10px;
          overflow: hidden;
          box-shadow: 0 5px 15px rgba(0,0,0,0.08);
        }
        
        .table-header {
          background: var(--light-color);
          padding: 1rem 2rem;
          border-bottom: 1px solid #eee;
        }
        
        table {
          width: 100%;
          border-collapse: collapse;
        }
        
        th, td {
          padding: 1rem 2rem;
          text-align: left;
          border-bottom: 1px solid #eee;
        }
        
        th {
          background: var(--light-color);
          font-weight: 600;
          color: var(--dark-color);
        }
        
        /* Responsive */
        @media (max-width: 768px) {
          .sidebar {
            transform: translateX(-100%);
            transition: transform 0.3s;
          }
          
          .sidebar.active {
            transform: translateX(0);
          }
          
          .main-content {
            margin-left: 0;
          }
          
          .stats-grid {
            grid-template-columns: 1fr;
          }
        }
      `
    },
    
    {
      id: 'landing-page',
      name: 'Landing Page',
      description: 'High-converting single page for products or services',
      category: 'landing',
      features: ['Hero Section', 'Features', 'Testimonials', 'Call-to-Action'],
      pages: [
        { name: 'Landing', filename: 'index.html', title: 'Landing Page', sections: ['hero', 'features', 'testimonials', 'pricing', 'cta', 'footer'], isRequired: true }
      ],
      sharedStyles: `
        /* Landing Page Styles */
        :root {
          --primary-color: #34bfc2;
          --secondary-color: #F78D2B;
          --dark-color: #2c3e50;
          --light-color: #f8f9fa;
          --text-color: #333;
        }
        
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        body {
          font-family: 'IBM Plex Sans', sans-serif;
          line-height: 1.6;
          color: var(--text-color);
        }
        
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
        }
        
        /* Hero Section */
        .hero {
          background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
          color: white;
          padding: 100px 0;
          text-align: center;
        }
        
        .hero h1 {
          font-family: 'Source Sans Pro', sans-serif;
          font-size: 3.5rem;
          font-weight: 700;
          margin-bottom: 1rem;
        }
        
        .hero p {
          font-size: 1.2rem;
          margin-bottom: 2rem;
          opacity: 0.9;
        }
        
        .hero-cta {
          display: inline-block;
          background: white;
          color: var(--primary-color);
          padding: 15px 40px;
          border-radius: 50px;
          text-decoration: none;
          font-weight: 600;
          font-size: 1.1rem;
          transition: transform 0.3s;
        }
        
        .hero-cta:hover {
          transform: translateY(-3px);
        }
        
        /* Features Section */
        .features {
          padding: 80px 0;
          background: white;
        }
        
        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 3rem;
          margin-top: 3rem;
        }
        
        .feature-item {
          text-align: center;
          padding: 2rem;
        }
        
        .feature-icon {
          width: 80px;
          height: 80px;
          background: var(--primary-color);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1.5rem;
          font-size: 2rem;
          color: white;
        }
        
        .feature-title {
          font-size: 1.3rem;
          font-weight: 600;
          margin-bottom: 1rem;
          color: var(--dark-color);
        }
        
        .feature-description {
          color: #666;
        }
        
        /* Testimonials */
        .testimonials {
          padding: 80px 0;
          background: var(--light-color);
        }
        
        .testimonials-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          gap: 2rem;
          margin-top: 3rem;
        }
        
        .testimonial-item {
          background: white;
          padding: 2rem;
          border-radius: 10px;
          box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        }
        
        .testimonial-text {
          font-style: italic;
          margin-bottom: 1.5rem;
          color: #666;
        }
        
        .testimonial-author {
          display: flex;
          align-items: center;
        }
        
        .author-avatar {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          background: var(--primary-color);
          margin-right: 1rem;
        }
        
        .author-name {
          font-weight: 600;
          color: var(--dark-color);
        }
        
        .author-title {
          font-size: 0.9rem;
          color: #666;
        }
        
        /* CTA Section */
        .cta-section {
          background: var(--dark-color);
          color: white;
          padding: 80px 0;
          text-align: center;
        }
        
        .cta-title {
          font-size: 2.5rem;
          font-weight: 700;
          margin-bottom: 1rem;
        }
        
        .cta-description {
          font-size: 1.1rem;
          margin-bottom: 2rem;
          opacity: 0.9;
        }
        
        /* Responsive */
        @media (max-width: 768px) {
          .hero h1 { font-size: 2.5rem; }
          .features-grid { grid-template-columns: 1fr; }
          .testimonials-grid { grid-template-columns: 1fr; }
        }
      `
    }
  ];

  getTemplateById(id: string): WebsiteTemplate | undefined {
    return this.templates.find(template => template.id === id);
  }

  getTemplatesByCategory(category: string): WebsiteTemplate[] {
    return this.templates.filter(template => template.category === category);
  }

  getAllTemplates(): WebsiteTemplate[] {
    return this.templates;
  }

  detectTemplateFromPrompt(prompt: string): WebsiteTemplate {
    const lowerPrompt = prompt.toLowerCase();
    
    // E-commerce keywords
    if (lowerPrompt.includes('shop') || lowerPrompt.includes('store') || 
        lowerPrompt.includes('ecommerce') || lowerPrompt.includes('product') ||
        lowerPrompt.includes('cart') || lowerPrompt.includes('buy') || 
        lowerPrompt.includes('sell')) {
      return this.getTemplateById('ecommerce-store')!;
    }
    
    // Portfolio keywords
    if (lowerPrompt.includes('portfolio') || lowerPrompt.includes('showcase') ||
        lowerPrompt.includes('gallery') || lowerPrompt.includes('creative') ||
        lowerPrompt.includes('designer') || lowerPrompt.includes('artist')) {
      return this.getTemplateById('portfolio-creative')!;
    }
    
    // Blog keywords
    if (lowerPrompt.includes('blog') || lowerPrompt.includes('article') ||
        lowerPrompt.includes('news') || lowerPrompt.includes('magazine') ||
        lowerPrompt.includes('content') || lowerPrompt.includes('post')) {
      return this.getTemplateById('blog-magazine')!;
    }
    
    // Dashboard keywords
    if (lowerPrompt.includes('dashboard') || lowerPrompt.includes('admin') ||
        lowerPrompt.includes('analytics') || lowerPrompt.includes('management') ||
        lowerPrompt.includes('data') || lowerPrompt.includes('chart')) {
      return this.getTemplateById('dashboard-app')!;
    }
    
    // Landing page keywords
    if (lowerPrompt.includes('landing') || lowerPrompt.includes('single page') ||
        lowerPrompt.includes('conversion') || lowerPrompt.includes('marketing')) {
      return this.getTemplateById('landing-page')!;
    }
    
    // Check for multi-page indicators
    if (lowerPrompt.includes('about') && lowerPrompt.includes('contact') &&
        (lowerPrompt.includes('service') || lowerPrompt.includes('company'))) {
      return this.getTemplateById('business-corporate')!;
    }
    
    // Default to business template for multi-page, landing for single page
    if (lowerPrompt.includes('page') && !lowerPrompt.includes('single')) {
      return this.getTemplateById('business-corporate')!;
    }
    
    return this.getTemplateById('landing-page')!;
  }

  isSinglePage(prompt: string): boolean {
    const lowerPrompt = prompt.toLowerCase();
    return lowerPrompt.includes('single page') || 
           lowerPrompt.includes('landing') ||
           lowerPrompt.includes('one page') ||
           (!lowerPrompt.includes('about') && !lowerPrompt.includes('contact') && !lowerPrompt.includes('service'));
  }
}