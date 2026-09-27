import React from 'react';
import { Sparkles, ShieldCheck, Heart, Truck, Star, Award, CheckCircle2 } from 'lucide-react';

export default function WhyChooseUs() {
  const features = [
    {
      icon: '🥭',
      title: '100% Naturally Ripened Mangoes',
      desc: 'Zero chemical calcium carbide. Harvested mature from select organic orchards and ripened in traditional grass-lined crates for luscious nectar sweetness.'
    },
    {
      icon: '🌶️',
      title: 'Grandma’s Heritage Pickles',
      desc: 'Handcrafted in small batches using traditional sun-curing methods, cold-pressed sesame oil, and authentic Andhra & Tamil stone-ground spices.'
    },
    {
      icon: '🛢️',
      title: 'Wood-Pressed Pure Cooking Oils',
      desc: 'Extracted using traditional Vaagai wood churners (Chekku) at temperatures below 40°C. Single-filtered to preserve vital nutrients, aroma, and natural heart health.'
    },
    {
      icon: '🛵',
      title: 'Punctual Doorstep Delivery',
      desc: 'Our central commitment: delivering fresh food directly to your doorstep the moment you order, packaged carefully in insulated, cushioned food-grade containers.'
    }
  ];

  const testimonials = [
    {
      name: 'Dr. Radhika Rao',
      city: 'Hyderabad',
      review: 'The Banganapalli mangoes delivered by Nikhila Foods were heavenly sweet and completely fiberless. The packaging was immaculate with zero bruises!',
      rating: 5,
      item: 'Banganapalli Sweet Mangoes'
    },
    {
      name: 'Venkatesh Iyer',
      city: 'Bengaluru',
      review: 'Their Andhra Avakaya pickle took me back to my grandmother’s village. The punch of mustard and pure sesame oil aroma is unmatchable.',
      rating: 5,
      item: 'Grandma’s Avakaya Pickle'
    },
    {
      name: 'Sunita Mehra',
      city: 'Chennai',
      review: 'Switched all our cooking to Nikhila Foods Wood-Pressed Groundnut Oil. Food tastes so much lighter and aromatic. Plus, delivery was completed in under an hour!',
      rating: 5,
      item: 'Wood-Pressed Groundnut Oil'
    }
  ];

  return (
    <div className="bg-stone-100/60 py-16 sm:py-24 border-y border-stone-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Core Pillars */}
        <div>
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold text-nikhila-amber-700 uppercase tracking-widest bg-amber-100/80 px-3 py-1 rounded-full border border-amber-300">
              The Nikhila Foods Promise
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-stone-900 font-serif mt-3">
              Why Food Lovers Choose Us
            </h2>
            <p className="text-stone-600 text-sm sm:text-base mt-2">
              From our partner orchards and village presses straight to your dining table
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feat, i) => (
              <div
                key={i}
                className="bg-white p-6 rounded-3xl border border-stone-200/80 shadow-sm hover:shadow-md transition-all space-y-3"
              >
                <div className="text-4xl">{feat.icon}</div>
                <h3 className="font-bold text-stone-900 text-base leading-snug">
                  {feat.title}
                </h3>
                <p className="text-stone-500 text-xs sm:text-sm leading-relaxed">
                  {feat.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Customer Testimonials */}
        <div>
          <div className="text-center max-w-xl mx-auto mb-10">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-stone-900 font-serif">
              Loved by Over 10,000+ Happy Families
            </h3>
            <p className="text-stone-500 text-xs sm:text-sm mt-1">
              Read real experiences from our daily food lovers
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, idx) => (
              <div
                key={idx}
                className="bg-white p-6 rounded-3xl border border-stone-200/80 shadow-xs flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex text-amber-500">
                    {[...Array(t.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <p className="text-stone-700 text-xs sm:text-sm italic leading-relaxed">
                    "{t.review}"
                  </p>
                </div>

                <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-xs text-stone-900">{t.name}</div>
                    <div className="text-[11px] text-stone-400">{t.city}</div>
                  </div>
                  <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    {t.item}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
