import React from 'react';
import { useParams } from 'react-router-dom';

const ProductDetailPage = () => {
  const { id } = useParams();
  
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Product Detail Page</h1>
        <p className="text-gray-600">Product ID: {id}</p>
        <p className="text-sm text-gray-500 mt-4">This page is under construction</p>
      </div>
    </div>
  );
};

export default ProductDetailPage;
