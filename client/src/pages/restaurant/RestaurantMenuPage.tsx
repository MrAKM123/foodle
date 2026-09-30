import React, { useState, useEffect } from 'react';
import { apiClient } from '../../api/client.js';
import {
  BookOpen,
  Plus,
  Trash2,
  Edit2,
  CheckCircle,
  XCircle,
  Flame,
  Search,
  SlidersHorizontal,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const RestaurantMenuPage: React.FC = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showAddDishModal, setShowAddDishModal] = useState<boolean>(false);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState<boolean>(false);

  // New Category Form
  const [categoryName, setCategoryName] = useState<string>('');

  // New Dish Form
  const [dishCategoryId, setDishCategoryId] = useState<string>('');
  const [dishName, setDishName] = useState<string>('');
  const [dishDescription, setDishDescription] = useState<string>('');
  const [dishPrice, setDishPrice] = useState<string>('');
  const [dishIsVeg, setDishIsVeg] = useState<boolean>(true);
  const [dishSpiceLevel, setDishSpiceLevel] = useState<number>(1);
  const [dishPrepTime, setDishPrepTime] = useState<string>('15');
  const [dishImageUrl, setDishImageUrl] = useState<string>('');

  const fetchMenu = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/restaurant/menu');
      if (res.data.success) {
        setCategories(res.data.data || []);
        if (res.data.data?.length > 0) {
          setDishCategoryId(res.data.data[0].id);
        }
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenu();
  }, []);

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryName.trim()) return;
    try {
      const res = await apiClient.post('/restaurant/menu/categories', {
        name: categoryName.trim(),
        sortOrder: categories.length + 1,
      });
      if (res.data.success) {
        toast.success(`Category "${categoryName}" created`);
        setCategoryName('');
        setShowAddCategoryModal(false);
        fetchMenu();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create category');
    }
  };

  const handleCreateDish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dishName.trim() || !dishPrice || !dishCategoryId) return;

    try {
      const res = await apiClient.post('/restaurant/menu/items', {
        categoryId: dishCategoryId,
        name: dishName.trim(),
        description: dishDescription.trim() || null,
        price: parseFloat(dishPrice),
        isVeg: dishIsVeg,
        spiceLevel: dishSpiceLevel,
        prepTimeMinutes: parseInt(dishPrepTime, 10) || 15,
        imageUrl: dishImageUrl.trim() || null,
      });

      if (res.data.success) {
        toast.success(`Dish "${dishName}" added to menu!`);
        setShowAddDishModal(false);
        setDishName('');
        setDishDescription('');
        setDishPrice('');
        setDishImageUrl('');
        fetchMenu();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to add dish');
    }
  };

  const handleToggleStock = async (itemId: string, currentAvailable: boolean) => {
    try {
      const res = await apiClient.put(`/restaurant/menu/items/${itemId}`, {
        isAvailable: !currentAvailable,
      });
      if (res.data.success) {
        toast.success(!currentAvailable ? 'Item marked In-Stock' : 'Item marked Out of Stock');
        fetchMenu();
      }
    } catch (err: any) {
      toast.error('Failed to update item availability');
    }
  };

  const handleDeleteDish = async (itemId: string, dishName: string) => {
    if (!window.confirm(`Are you sure you want to delete "${dishName}" from your menu?`)) return;
    try {
      const res = await apiClient.delete(`/restaurant/menu/items/${itemId}`);
      if (res.data.success) {
        toast.success('Dish removed from menu');
        fetchMenu();
      }
    } catch (err: any) {
      toast.error('Failed to delete dish');
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 font-display flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-emerald-600" /> Menu Catalog & Stock Management
          </h1>
          <p className="text-xs text-slate-500">
            Add dishes, organize categories, and toggle real-time stock availability
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddCategoryModal(true)}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Category</span>
          </button>

          <button
            onClick={() => setShowAddDishModal(true)}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-sm transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Dish</span>
          </button>
        </div>
      </div>

      {/* Categories & Dishes */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((n) => (
            <div key={n} className="h-44 bg-white rounded-2xl border border-slate-200 animate-pulse"></div>
          ))}
        </div>
      ) : categories.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 max-w-md mx-auto shadow-sm my-8">
          <BookOpen className="w-16 h-16 text-slate-300 mx-auto mb-3" />
          <h3 className="font-bold text-slate-900 text-base mb-1">Your menu catalog is empty</h3>
          <p className="text-xs text-slate-500 mb-6">
            Create your first menu category (e.g. Starters, Biryani, Curries) and add your signature dishes.
          </p>
          <button
            onClick={() => setShowAddCategoryModal(true)}
            className="px-5 py-2.5 bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-sm"
          >
            Create First Category
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {categories.map((cat) => (
            <div key={cat.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <span>{cat.name}</span>
                  <span className="text-xs text-slate-500 font-normal">
                    ({cat.menuItems?.length || 0} items)
                  </span>
                </h3>
              </div>

              <div className="divide-y divide-slate-100">
                {cat.menuItems?.map((item: any) => (
                  <div
                    key={item.id}
                    className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-1">
                        {item.isVeg ? (
                          <span className="veg-indicator" title="Veg"></span>
                        ) : (
                          <span className="nonveg-indicator" title="Non-Veg"></span>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-xs text-slate-900">{item.name}</h4>
                          {item.spiceLevel > 1 && (
                            <span className="text-[10px] text-rose-600 font-bold bg-rose-50 px-1.5 py-0.2 rounded border border-rose-200 flex items-center gap-0.5">
                              <Flame className="w-2.5 h-2.5 fill-current" /> Spicy
                            </span>
                          )}
                        </div>
                        <p className="text-xs font-bold text-slate-800 mt-0.5">₹{item.price.toFixed(2)}</p>
                        {item.description && (
                          <p className="text-[11px] text-slate-500 line-clamp-1 max-w-md mt-0.5">
                            {item.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                      {/* Stock Toggle Switch */}
                      <button
                        onClick={() => handleToggleStock(item.id, item.isAvailable)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                          item.isAvailable
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-300'
                            : 'bg-rose-50 text-rose-700 border border-rose-300'
                        }`}
                      >
                        <span
                          className={`w-2 h-2 rounded-full ${
                            item.isAvailable ? 'bg-emerald-500' : 'bg-rose-500'
                          }`}
                        ></span>
                        <span>{item.isAvailable ? 'In Stock' : 'Out of Stock'}</span>
                      </button>

                      {/* Delete button */}
                      <button
                        onClick={() => handleDeleteDish(item.id, item.name)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 transition-colors"
                        title="Delete Dish"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Category Modal */}
      {showAddCategoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="font-bold text-base text-slate-900 mb-3">Add Menu Category</h3>
            <form onSubmit={handleCreateCategory} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Category Name
                </label>
                <input
                  type="text"
                  required
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  placeholder="e.g. Signature Kebabs & Rolls"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddCategoryModal(false)}
                  className="flex-1 py-2 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-sm"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Dish Modal */}
      {showAddDishModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="font-bold text-base text-slate-900 mb-1">Add Dish to Menu</h3>
            <p className="text-xs text-slate-500 mb-4">Add a new delicious item with price and tags</p>

            <form onSubmit={handleCreateDish} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Category
                </label>
                <select
                  value={dishCategoryId}
                  onChange={(e) => setDishCategoryId(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Dish Name
                </label>
                <input
                  type="text"
                  required
                  value={dishName}
                  onChange={(e) => setDishName(e.target.value)}
                  placeholder="e.g. Paneer Lababdar"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Price in INR (₹)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={dishPrice}
                    onChange={(e) => setDishPrice(e.target.value)}
                    placeholder="299.00"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Food Type
                  </label>
                  <div className="flex items-center gap-2 mt-1">
                    <button
                      type="button"
                      onClick={() => setDishIsVeg(true)}
                      className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold border ${
                        dishIsVeg ? 'bg-emerald-50 text-emerald-700 border-emerald-400' : 'border-slate-200'
                      }`}
                    >
                      Veg
                    </button>
                    <button
                      type="button"
                      onClick={() => setDishIsVeg(false)}
                      className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold border ${
                        !dishIsVeg ? 'bg-rose-50 text-rose-700 border-rose-400' : 'border-slate-200'
                      }`}
                    >
                      Non-Veg
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={dishDescription}
                  onChange={(e) => setDishDescription(e.target.value)}
                  placeholder="Rich cottage cheese cubes cooked with chopped ginger and cashew tomato gravy..."
                  className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                ></textarea>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Image URL (Optional)
                </label>
                <input
                  type="url"
                  value={dishImageUrl}
                  onChange={(e) => setDishImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAddDishModal(false)}
                  className="flex-1 py-2.5 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-sm"
                >
                  Add Dish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
