import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft, Coffee } from 'lucide-react';

const NotFoundPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center space-y-8">
        {/* Coffee Icon */}
        <div className="flex justify-center">
          <Coffee className="h-24 w-24 text-primary opacity-50" />
        </div>

        {/* 404 */}
        <div>
          <h1 className="text-6xl font-bold text-primary">404</h1>
          <h2 className="mt-4 text-2xl font-semibold text-gray-900">
            Page Not Found
          </h2>
          <p className="mt-2 text-gray-600">
            Oops! The page you're looking for seems to have gone for a coffee break.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/"
            className="btn btn-primary inline-flex items-center"
          >
            <Home className="mr-2 h-4 w-4" />
            Go Home
          </Link>
          <button
            onClick={() => window.history.back()}
            className="btn btn-outline inline-flex items-center"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </button>
        </div>

        {/* Suggestions */}
        <div className="text-left">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Maybe you're looking for:
          </h3>
          <ul className="space-y-2">
            <li>
              <Link
                to="/products"
                className="text-primary hover:text-primary-dark"
              >
                • Browse our coffee menu
              </Link>
            </li>
            <li>
              <Link
                to="/cart"
                className="text-primary hover:text-primary-dark"
              >
                • Check your shopping cart
              </Link>
            </li>
            <li>
              <Link
                to="/orders"
                className="text-primary hover:text-primary-dark"
              >
                • View your order history
              </Link>
            </li>
            <li>
              <Link
                to="/login"
                className="text-primary hover:text-primary-dark"
              >
                • Sign in to your account
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
