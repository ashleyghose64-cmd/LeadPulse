import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import axios from 'axios';
import { motion } from 'framer-motion';

const Onboarding = () => {
  const { user, setUser } = useStore();
  const [companyName, setCompanyName] = useState('');
  const [fieldOfWork, setFieldOfWork] = useState('');
  const [customFieldOfWork, setCustomFieldOfWork] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const finalFieldOfWork = fieldOfWork === 'Other' ? customFieldOfWork : fieldOfWork;
      const res = await axios.post('http://localhost:3001/api/auth/onboarding', {
        userId: user?._id,
        company_name: companyName,
        field_of_work: finalFieldOfWork
      });
      setUser(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 bg-charcoal/50 flex items-center justify-center z-50 backdrop-blur-sm">
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white p-8 rounded-xl shadow-lg border border-borderline w-[500px]"
      >
        <h2 className="text-2xl font-bold mb-2">Welcome to LeadPulse</h2>
        <p className="text-sm text-gray-500 mb-6">Let's set up your profile to power personalized AI outreach.</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold mb-1 text-charcoal">First Name</label>
              <input 
                type="text" 
                required
                placeholder="Alex"
                className="w-full border border-[#E4E4E7] rounded-xl p-3 text-sm focus:ring-2 focus:ring-accent outline-none shadow-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1 text-charcoal">Last Name</label>
              <input 
                type="text" 
                required
                placeholder="Rivera"
                className="w-full border border-[#E4E4E7] rounded-xl p-3 text-sm focus:ring-2 focus:ring-accent outline-none shadow-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold mb-1 text-charcoal">Company Name</label>
            <input 
              type="text" 
              required
              placeholder="e.g. Acme Agency"
              className="w-full border border-[#E4E4E7] rounded-xl p-3 text-sm focus:ring-2 focus:ring-accent outline-none shadow-sm"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-bold mb-1 text-charcoal">Phone Number</label>
            <input 
              type="tel" 
              required
              placeholder="+1 (555) 000-0000"
              className="w-full border border-[#E4E4E7] rounded-xl p-3 text-sm focus:ring-2 focus:ring-accent outline-none shadow-sm"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold mb-1 text-charcoal">Field of Work</label>
              <select 
                required
                className="w-full border border-[#E4E4E7] rounded-xl p-3 text-sm focus:ring-2 focus:ring-accent outline-none bg-white shadow-sm"
                value={fieldOfWork}
                onChange={(e) => setFieldOfWork(e.target.value)}
              >
                <option value="" disabled>Select an industry</option>
                <option value="Digital Agency">Digital Agency / Marketing</option>
                <option value="Real Estate">Real Estate</option>
                <option value="Local F&B">Local Restaurants / F&B</option>
                <option value="SaaS">SaaS & Software</option>
                <option value="Healthcare">Healthcare & Clinics</option>
                <option value="E-Commerce">E-Commerce</option>
                <option value="Home Services">Home Services (Plumbing, HVAC)</option>
                <option value="Legal Services">Legal Services / Law Firm</option>
                <option value="Finance">Finance & Accounting</option>
                <option value="Fitness">Fitness & Wellness</option>
                <option value="Education">Education & Coaching</option>
                <option value="Other">Other (Custom)</option>
              </select>
            </div>
            
            {fieldOfWork === 'Other' && (
              <div className="col-span-2">
                <label className="block text-sm font-bold mb-1 text-charcoal">Custom Field of Work</label>
                <input 
                  type="text" 
                  required
                  placeholder="What is your niche?"
                  className="w-full border border-[#E4E4E7] rounded-xl p-3 text-sm focus:ring-2 focus:ring-accent outline-none shadow-sm"
                  value={customFieldOfWork}
                  onChange={(e) => setCustomFieldOfWork(e.target.value)}
                />
              </div>
            )}
            
            <div>
              <label className="block text-sm font-bold mb-1 text-charcoal">Company Size</label>
              <select 
                required
                className="w-full border border-[#E4E4E7] rounded-xl p-3 text-sm focus:ring-2 focus:ring-accent outline-none bg-white shadow-sm"
              >
                <option value="" disabled>Select size</option>
                <option value="1-10">1-10 employees</option>
                <option value="11-50">11-50 employees</option>
                <option value="51-200">51-200 employees</option>
                <option value="201+">201+ employees</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold mb-1 text-charcoal">Monthly Lead Target</label>
            <input 
              type="number" 
              required
              placeholder="e.g. 500"
              className="w-full border border-[#E4E4E7] rounded-xl p-3 text-sm focus:ring-2 focus:ring-accent outline-none shadow-sm"
            />
          </div>

          <button type="submit" className="w-full bg-accent text-white rounded-xl py-3.5 mt-2 hover:bg-accent-dark transition-colors font-bold shadow-md shadow-accent/20">
            Complete Setup & Enter Dashboard
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default Onboarding;
