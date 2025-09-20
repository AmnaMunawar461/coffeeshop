import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { productsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import ProductCard from '../components/Product/ProductCard';
import { ArrowRight, Star, Users, Award } from 'lucide-react';

const HomePage = () => {
  const { isAuthenticated } = useAuth();

  // Fetch featured products
  const { data: featuredProducts = [], isLoading: featuredLoading } = useQuery(
    'featured-products',
    productsAPI.getFeatured,
    {
      select: (response) => response.data || [],
    }
  );

  // Fetch personalized recommendations for authenticated users
  const { data: recommendations = [], isLoading: recommendationsLoading } = useQuery(
    'recommendations',
    productsAPI.getRecommendations,
    {
      enabled: isAuthenticated,
      select: (response) => response.data || [],
    }
  );

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary to-primary-dark text-white">
        <div className="container mx-auto py-20 lg:py-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
                Crafted with Love,
                <br />
                <span className="text-accent-color">Served with Passion</span>
              </h1>
              <p className="text-xl text-gray-200 leading-relaxed">
                Experience the finest coffee beans from around the world, expertly roasted 
                and brewed to perfection. Every cup tells a story of quality and craftsmanship.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/products"
                  className="btn btn-secondary btn-lg inline-flex items-center"
                >
                  Explore Our Menu
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
                {!isAuthenticated && (
                  <Link
                    to="/register"
                    className="btn btn-outline btn-lg text-white border-white hover:bg-white hover:text-primary"
                  >
                    Join Our Community
                  </Link>
                )}
              </div>
            </div>
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                alt="Premium Coffee"
                className="rounded-2xl shadow-2xl w-full h-96 object-cover"
              />
              <div className="absolute -bottom-6 -left-6 bg-white text-primary p-4 rounded-xl shadow-lg">
                <div className="flex items-center space-x-2">
                  <Star className="h-5 w-5 text-yellow-400 fill-current" />
                  <span className="font-semibold">4.9/5</span>
                </div>
                <p className="text-sm text-gray-600">1000+ Reviews</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="bg-primary text-white p-4 rounded-full">
                  <Users className="h-8 w-8" />
                </div>
              </div>
              <h3 className="text-3xl font-bold text-primary mb-2">10,000+</h3>
              <p className="text-gray-600">Happy Customers</p>
            </div>
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="bg-primary text-white p-4 rounded-full">
                  <Award className="h-8 w-8" />
                </div>
              </div>
              <h3 className="text-3xl font-bold text-primary mb-2">15+</h3>
              <p className="text-gray-600">Premium Blends</p>
            </div>
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="bg-primary text-white p-4 rounded-full">
                  <Star className="h-8 w-8" />
                </div>
              </div>
              <h3 className="text-3xl font-bold text-primary mb-2">4.9/5</h3>
              <p className="text-gray-600">Average Rating</p>
            </div>
          </div>
        </div>
      </section>

      {/* Personalized Recommendations */}
      {isAuthenticated && recommendations.length > 0 && (
        <section className="py-16">
          <div className="container mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Just for You</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Based on your order history, we think you'll love these selections
              </p>
            </div>
            
            {recommendationsLoading ? (
              <div className="flex justify-center">
                <div className="spinner"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {recommendations.slice(0, 4).map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Featured Products */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {isAuthenticated ? 'Popular This Week' : 'Featured Products'}
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Discover our most loved coffee creations and delicious pastries
            </p>
          </div>
          
          {featuredLoading ? (
            <div className="flex justify-center">
              <div className="spinner"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.slice(0, 8).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Link
              to="/products"
              className="btn btn-primary btn-lg inline-flex items-center"
            >
              View All Products
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-16">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-gray-900">
                Our Story
              </h2>
              <p className="text-gray-600 leading-relaxed">
                Founded in 2020, Brew & Beans started as a small neighborhood coffee shop 
                with a big dream: to serve the perfect cup of coffee to every customer. 
                Today, we're proud to offer a carefully curated selection of premium 
                coffee beans, artisanal pastries, and exceptional service.
              </p>
              <p className="text-gray-600 leading-relaxed">
                Every bean is sourced directly from farmers who share our commitment 
                to quality and sustainability. We roast in small batches to ensure 
                maximum freshness and flavor in every cup.
              </p>
              <Link
                to="/products"
                className="btn btn-primary inline-flex items-center"
              >
                Taste the Difference
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <img
                src="https://images.unsplash.com/photo-1447933601403-0c6688de566e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
                alt="Coffee beans"
                className="rounded-lg shadow-lg h-48 object-cover"
              />
              <img
                src="https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
                alt="Latte art"
                className="rounded-lg shadow-lg h-48 object-cover mt-8"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary text-white">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Start Your Coffee Journey?
          </h2>
          <p className="text-xl text-gray-200 mb-8 max-w-2xl mx-auto">
            Join thousands of coffee lovers who trust us for their daily brew. 
            Sign up today and get 10% off your first order!
          </p>
          {!isAuthenticated ? (
            <Link
              to="/register"
              className="btn btn-secondary btn-lg inline-flex items-center"
            >
              Get Started Today
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          ) : (
            <Link
              to="/products"
              className="btn btn-secondary btn-lg inline-flex items-center"
            >
              Shop Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          )}
        </div>
      </section>
    </div>
  );
};

export default HomePage;
