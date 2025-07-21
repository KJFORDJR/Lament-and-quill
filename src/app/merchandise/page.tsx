'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, Star, Eye, Heart, Filter } from 'lucide-react';

export default function Merchandise() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [sortBy, setSortBy] = useState('featured');

  const categories = [
    { id: 'all', label: 'All Items' },
    { id: 'apparel', label: 'Apparel' },
    { id: 'accessories', label: 'Accessories' },
    { id: 'collectibles', label: 'Collectibles' },
    { id: 'digital', label: 'Digital Goods' },
    { id: 'services', label: 'Services' }
  ];

  const products = [
    {
      id: 1,
      name: 'Crimson Quarter Hoodie',
      price: 89.99,
      originalPrice: 109.99,
      category: 'apparel',
      image: '/placeholder-hoodie.jpg',
      rating: 4.8,
      reviews: 124,
      description: 'Premium heavyweight hoodie with embroidered Crimson City sigil. Blood-red accents on charcoal black.',
      tags: ['Limited Edition', 'Bestseller'],
      inStock: true
    },
    {
      id: 2,
      name: 'Silver Heights Neural Interface Pin',
      price: 24.99,
      category: 'accessories',
      image: '/placeholder-pin.jpg',
      rating: 4.9,
      reviews: 89,
      description: 'Collectible enamel pin featuring the iconic neural interface design. Chrome finish with LED accent.',
      tags: ['New', 'Collector\'s Item'],
      inStock: true
    },
    {
      id: 3,
      name: 'Digital Dossier Pack',
      price: 15.99,
      category: 'digital',
      image: '/placeholder-digital.jpg',
      rating: 4.7,
      reviews: 67,
      description: 'Complete digital pack containing exclusive character backgrounds, city maps, and hidden lore.',
      tags: ['Digital Download', 'Instant Access'],
      inStock: true
    },
    {
      id: 4,
      name: 'Gothic Tech Noir Poster Set',
      price: 34.99,
      category: 'collectibles',
      image: '/placeholder-poster.jpg',
      rating: 4.6,
      reviews: 45,
      description: 'Set of 3 high-quality art prints featuring iconic scenes from both cities. Museum-grade paper.',
      tags: ['Art Print', 'Limited Run'],
      inStock: false
    },
    {
      id: 5,
      name: 'Personalized Chronicle Service',
      price: 199.99,
      category: 'services',
      image: '/placeholder-service.jpg',
      rating: 5.0,
      reviews: 12,
      description: 'Custom written chronicle entry featuring your character integrated into the official city records.',
      tags: ['Premium Service', 'Custom'],
      inStock: true
    },
    {
      id: 6,
      name: 'Binary Blood Coffee Mug',
      price: 19.99,
      category: 'accessories',
      image: '/placeholder-mug.jpg',
      rating: 4.5,
      reviews: 78,
      description: 'Heat-reactive mug that reveals hidden binary code when filled with hot liquid. Dishwasher safe.',
      tags: ['Interactive', 'Daily Use'],
      inStock: true
    }
  ];

  const filteredProducts = activeCategory === 'all' 
    ? products 
    : products.filter(product => product.category === activeCategory);

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center mb-6">
            <ShoppingBag size={60} className="text-gothic-silver mr-4 animate-pulse-slow" />
            <h1 className="text-5xl md:text-6xl font-gothic font-bold text-gothic-silver glow-text">
              Black Ledger Goods
            </h1>
          </div>
          <p className="text-xl text-gothic-steel max-w-3xl mx-auto">
            Exclusive merchandise and services from the shadow markets. Where style meets substance 
            in the convergence of Crimson passion and Silver precision.
          </p>
          <div className="mt-6 p-4 bg-gothic-dark-gray/20 border border-gothic-silver/30 rounded-lg inline-block">
            <p className="text-gothic-silver text-sm font-medium">
              🛒 Secure Transactions • Cross-City Delivery • Digital Instant Access
            </p>
          </div>
        </motion.div>

        {/* Filters and Sort */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
        >
          {/* Category Filters */}
          <div className="flex flex-wrap gap-2">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`px-4 py-2 rounded-full transition-all duration-300 ${
                  activeCategory === category.id
                    ? 'bg-gothic-silver/20 text-gothic-silver border border-gothic-silver/40'
                    : 'bg-gothic-dark-gray/30 text-gothic-steel hover:text-gothic-silver border border-transparent'
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>

          {/* Sort Options */}
          <div className="flex items-center space-x-4">
            <span className="text-gothic-steel text-sm">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-gothic-charcoal/50 border border-gothic-dark-gray rounded-md px-3 py-2 text-gothic-silver focus:outline-none focus:border-gothic-silver"
            >
              <option value="featured">Featured</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
              <option value="newest">Newest</option>
            </select>
          </div>
        </motion.div>

        {/* Product Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {filteredProducts.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
              className="group cursor-pointer"
            >
              <div className="bg-gothic-dark-gray/20 hover:bg-gothic-dark-gray/30 rounded-lg overflow-hidden border border-gothic-dark-gray/30 hover:border-gothic-silver/30 transition-all duration-300">
                {/* Image Placeholder */}
                <div className="aspect-square bg-gradient-to-br from-gothic-charcoal to-gothic-black flex items-center justify-center relative overflow-hidden">
                  <div className="text-gothic-steel text-6xl opacity-20">📦</div>
                  {!product.inStock && (
                    <div className="absolute inset-0 bg-gothic-black/60 flex items-center justify-center">
                      <span className="text-red-400 font-bold text-lg">Out of Stock</span>
                    </div>
                  )}
                  {/* Tags */}
                  <div className="absolute top-3 left-3 flex flex-wrap gap-1">
                    {product.tags.map(tag => (
                      <span
                        key={tag}
                        className={`px-2 py-1 text-xs rounded-full font-medium ${
                          tag === 'New' ? 'bg-green-600/20 text-green-400' :
                          tag === 'Limited Edition' || tag === 'Limited Run' ? 'bg-red-600/20 text-red-400' :
                          tag === 'Bestseller' ? 'bg-yellow-600/20 text-yellow-400' :
                          'bg-gothic-silver/20 text-gothic-silver'
                        }`}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  {/* Quick Actions */}
                  <div className="absolute top-3 right-3 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-2 bg-gothic-black/60 rounded-full text-gothic-steel hover:text-gothic-silver">
                      <Eye size={16} />
                    </button>
                    <button className="p-2 bg-gothic-black/60 rounded-full text-gothic-steel hover:text-red-400">
                      <Heart size={16} />
                    </button>
                  </div>
                </div>

                {/* Product Info */}
                <div className="p-6">
                  <h3 className="text-lg font-gothic font-bold text-gothic-silver mb-2 group-hover:text-white transition-colors">
                    {product.name}
                  </h3>
                  
                  <p className="text-gothic-steel text-sm mb-4 leading-relaxed">
                    {product.description}
                  </p>

                  {/* Rating */}
                  <div className="flex items-center space-x-2 mb-4">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={14}
                          className={`${
                            i < Math.floor(product.rating) 
                              ? 'text-yellow-400 fill-current' 
                              : 'text-gothic-steel'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-gothic-steel text-sm">
                      {product.rating} ({product.reviews} reviews)
                    </span>
                  </div>

                  {/* Price and Actions */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-xl font-bold text-gothic-silver">
                        ${product.price}
                      </span>
                      {product.originalPrice && (
                        <span className="text-sm text-gothic-steel line-through">
                          ${product.originalPrice}
                        </span>
                      )}
                    </div>
                    <button 
                      disabled={!product.inStock}
                      className={`px-4 py-2 rounded-lg font-medium transition-all ${
                        product.inStock
                          ? 'cyber-button hover:shadow-lg hover:shadow-gothic-silver/20'
                          : 'bg-gothic-dark-gray text-gothic-steel cursor-not-allowed'
                      }`}
                    >
                      {product.inStock ? 'Add to Cart' : 'Out of Stock'}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Cart Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="fixed bottom-6 right-6 z-50"
        >
          <button className="cyber-button flex items-center space-x-2 shadow-lg shadow-gothic-silver/20">
            <ShoppingBag size={20} />
            <span>Cart (0)</span>
          </button>
        </motion.div>
      </div>
    </div>
  );
}
