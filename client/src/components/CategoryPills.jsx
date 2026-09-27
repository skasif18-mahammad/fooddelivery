import React from 'react';

export default function CategoryPills({ selectedCategory, onSelectCategory, counts }) {
  const categories = [
    { id: 'all', name: 'All Specialties', icon: '🍽️', count: counts.all },
    { id: 'mangoes', name: 'Juicy Mangoes', icon: '🥭', count: counts.mangoes, subtitle: 'Naturally Tree-Ripened' },
    { id: 'pickles', name: 'Authentic Pickles', icon: '🌶️', count: counts.pickles, subtitle: 'Grandma’s Sun-Cured' },
    { id: 'cooking-oil', name: 'Wood-Pressed Oils', icon: '🛢️', count: counts.oils, subtitle: 'Cold Pressed / Chekku' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center max-w-xl mx-auto mb-8">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 font-serif">
          Handcrafted Fresh Categories
        </h2>
        <p className="text-stone-500 text-sm mt-1.5">
          Select a category to explore authentic farm harvest and homemade treasures
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`relative text-left p-4 sm:p-5 rounded-2xl border transition-all duration-300 flex flex-col justify-between ${
                isSelected
                  ? 'bg-gradient-to-br from-amber-500 to-amber-600 text-stone-950 border-amber-600 shadow-lg shadow-amber-500/25 scale-[1.02]'
                  : 'bg-white hover:bg-stone-50 border-stone-200/80 text-stone-800 shadow-sm hover:shadow-md'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-3">
                <span className="text-3xl sm:text-4xl filter drop-shadow-sm">{cat.icon}</span>
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    isSelected ? 'bg-stone-950 text-white' : 'bg-stone-100 text-stone-600'
                  }`}
                >
                  {cat.count} items
                </span>
              </div>

              <div>
                <h3 className={`font-bold text-base sm:text-lg leading-snug ${isSelected ? 'text-stone-950 font-extrabold' : 'text-stone-900'}`}>
                  {cat.name}
                </h3>
                {cat.subtitle && (
                  <p className={`text-xs mt-0.5 ${isSelected ? 'text-amber-950/80 font-medium' : 'text-stone-500'}`}>
                    {cat.subtitle}
                  </p>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
