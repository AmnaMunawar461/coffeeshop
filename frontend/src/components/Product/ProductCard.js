import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, Heart, ShoppingCart, Plus } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { favoritesAPI } from '../../services/api';
import toast from 'react-hot-toast';

const ProductCard = ({ product }) => {
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const queryClient = useQueryClient();

  // Check if product is in favorites
  const { data: favoriteStatus } = useQuery(
    ['favorite-status', product.id],
    () => favoritesAPI.check(product.id),
    {
      enabled: isAuthenticated,
      select: (response) => response.data.isFavorite,
    }
  );

  // Toggle favorite mutation
  const toggleFavoriteMutation = useMutation(
    (isFavorite) => {
      return isFavorite 
        ? favoritesAPI.remove(product.id)
        : favoritesAPI.add(product.id);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['favorite-status', product.id]);
        queryClient.invalidateQueries('favorites');
      },
      onError: (error) => {
        toast.error(error.response?.data?.error || 'Failed to update favorites');
      },
    }
  );

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.error('Please login to add items to cart');
      return;
    }

    setIsAddingToCart(true);
    
    // Add with default variants (first option for each type)
    const defaultCustomizations = {
      variants: []
    };

    if (product.variants?.size?.length > 0) {
      defaultCustomizations.variants.push({
        id: product.variants.size[0].id,
        type: 'size',
        name: product.variants.size[0].name,
        price_modifier: product.variants.size[0].price_modifier
      });
    }

    if (product.variants?.milk?.length > 0) {
      defaultCustomizations.variants.push({
        id: product.variants.milk[0].id,
        type: 'milk',
        name: product.variants.milk[0].name,
        price_modifier: product.variants.milk[0].price_modifier
      });
    }

    if (product.variants?.extra?.length > 0) {
      defaultCustomizations.variants.push({
        id: product.variants.extra[0].id,
        type: 'extra',
        name: product.variants.extra[0].name,
        price_modifier: product.variants.extra[0].price_modifier
      });
    }

    await addToCart(product.id, 1, defaultCustomizations);
    setIsAddingToCart(false);
  };

  const handleToggleFavorite = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.error('Please login to add favorites');
      return;
    }

    toggleFavoriteMutation.mutate(favoriteStatus);
  };

  const formatPrice = (price) => {
    return `$${parseFloat(price).toFixed(2)}`;
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
      );
    }

    if (hasHalfStar) {
      stars.push(
        <Star key="half" className="h-4 w-4 text-yellow-400 fill-current opacity-50" />
      );
    }

    const remainingStars = 5 - Math.ceil(rating);
    for (let i = 0; i < remainingStars; i++) {
      stars.push(
        <Star key={`empty-${i}`} className="h-4 w-4 text-gray-300" />
      );
    }

    return stars;
  };

  return (
    <div className="card group hover:shadow-lg transition-all duration-300">
      <Link to={`/products/${product.id}`} className="block">
        {/* Image */}
        <div className="relative overflow-hidden">
          <img
            src={product.image_url || 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085'}
            alt={product.name}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          />
          
          {/* Favorite button */}
          {isAuthenticated && (
            <button
              onClick={handleToggleFavorite}
              disabled={toggleFavoriteMutation.isLoading}
              className={`absolute top-3 right-3 p-2 rounded-full transition-all ${
                favoriteStatus
                  ? 'bg-red-500 text-white'
                  : 'bg-white text-gray-600 hover:bg-red-50 hover:text-red-500'
              }`}
            >
              <Heart 
                className={`h-4 w-4 ${favoriteStatus ? 'fill-current' : ''}`} 
              />
            </button>
          )}

          {/* Stock indicator */}
          {product.stock_quantity <= 5 && product.stock_quantity > 0 && (
            <div className="absolute top-3 left-3 bg-warning-color text-white px-2 py-1 rounded text-xs font-medium">
              Only {product.stock_quantity} left
            </div>
          )}
          
          {product.stock_quantity === 0 && (
            <div className="absolute top-3 left-3 bg-error-color text-white px-2 py-1 rounded text-xs font-medium">
              Out of Stock
            </div>
          )}
        </div>

        {/* Content */}
        <div className="card-body">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-semibold text-lg text-gray-900 group-hover:text-primary transition-colors">
              {product.name}
            </h3>
            <span className="text-lg font-bold text-primary">
              {formatPrice(product.base_price)}
            </span>
          </div>

          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {product.description}
          </p>

          {/* Rating */}
          <div className="flex items-center space-x-2 mb-4">
            <div className="flex">
              {renderStars(product.average_rating || 0)}
            </div>
            <span className="text-sm text-gray-500">
              ({product.review_count || 0})
            </span>
          </div>

          {/* Category */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
              {product.category_name}
            </span>
            
            {/* Add to cart button */}
            <button
              onClick={handleAddToCart}
              disabled={isAddingToCart || product.stock_quantity === 0}
              className="btn btn-primary btn-sm flex items-center space-x-1 disabled:opacity-50"
            >
              {isAddingToCart ? (
                <div className="spinner w-4 h-4"></div>
              ) : (
                <>
                  <ShoppingCart className="h-4 w-4" />
                  <Plus className="h-3 w-3" />
                </>
              )}
            </button>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;
