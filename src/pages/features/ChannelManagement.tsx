import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Play, Calendar, Share2, RefreshCw, Award, BarChart, GitFork, Shield, Settings } from 'lucide-react';

export default function ChannelManagement() {
  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link to="/" className="inline-flex items-center text-slate-400 hover:text-white mb-8">
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to home
        </Link>
        
        <div className="bg-slate-800 rounded-lg p-8">
          <div className="flex items-center mb-6">
            <Play className="h-12 w-12 text-indigo-500 mr-4" />
            <h1 className="text-4xl font-bold text-white">Channel Management</h1>
          </div>
          
          <p className="text-xl text-slate-300 mb-8">
            Streamline your content distribution across multiple channels with our advanced management system.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-slate-700 p-6 rounded-lg relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500"></div>
              <Calendar className="h-8 w-8 text-indigo-400 mb-4 relative z-10" />
              <h3 className="text-xl font-semibold text-white mb-2 relative z-10">Content Scheduling</h3>
              <p className="text-slate-300 relative z-10">Plan and schedule your content across multiple platforms with our intuitive calendar interface.</p>
            </div>
            <div className="bg-slate-700 p-6 rounded-lg relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500"></div>
              <Share2 className="h-8 w-8 text-indigo-400 mb-4 relative z-10" />
              <h3 className="text-xl font-semibold text-white mb-2 relative z-10">Multi-Platform Distribution</h3>
              <p className="text-slate-300 relative z-10">Manage all your social media channels from a single, unified dashboard.</p>
            </div>
            <div className="bg-slate-700 p-6 rounded-lg relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-teal-500/10 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500"></div>
              <RefreshCw className="h-8 w-8 text-indigo-400 mb-4 relative z-10" />
              <h3 className="text-xl font-semibold text-white mb-2 relative z-10">Content Recycling</h3>
              <p className="text-slate-300 relative z-10">Automatically repurpose and redistribute your best-performing content.</p>
            </div>
            <div className="bg-slate-700 p-6 rounded-lg relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 to-green-500/10 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500"></div>
              <Award className="h-8 w-8 text-indigo-400 mb-4 relative z-10" />
              <h3 className="text-xl font-semibold text-white mb-2 relative z-10">YPP Support</h3>
              <p className="text-slate-300 relative z-10">Having issues with getting into YPP? As long as you make content that is sufficiently edited and have permissions taken care of, we can help get your channel monetized.</p>
            </div>
            <div className="bg-slate-700 p-6 rounded-lg relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-orange-500/10 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500"></div>
              <Shield className="h-8 w-8 text-indigo-400 mb-4 relative z-10" />
              <h3 className="text-xl font-semibold text-white mb-2 relative z-10">Copyright Strike Protections</h3>
              <p className="text-slate-300 relative z-10">Using someone else's content but have to deal with copyright strikes? We leverage our connections to provide you with resolutions to copyright strikes, whether that be using our existing connections over at Youtube or other alternatives. Never worry about having to get copyright striked ever again when working with MediaTiger. The uncertainty of using content, any amount of it whether it be audio or video that you don't own are subjected to be striked whenever. It doesn't matter how heavily you edit it or if you deem it fair use, any time you upload content to YouTube that is not yours, you potentially risking a copyright claim or takedown.</p>
            </div>
            <div className="bg-slate-700 p-6 rounded-lg relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-blue-500/10 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500"></div>
              <BarChart className="h-8 w-8 text-indigo-400 mb-4 relative z-10" />
              <h3 className="text-xl font-semibold text-white mb-2 relative z-10">Advanced Analytics Tracking</h3>
              <p className="text-slate-300 relative z-10">Get detailed insights into your content performance with comprehensive analytics dashboards and custom tracking capabilities.</p>
            </div>
            <div className="bg-slate-700 p-6 rounded-lg relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-emerald-500/10 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500"></div>
              <GitFork className="h-8 w-8 text-indigo-400 mb-4 relative z-10" />
              <h3 className="text-xl font-semibold text-white mb-2 relative z-10">Tailored Strategies</h3>
              <p className="text-slate-300 relative z-10">Receive personalized growth plans and content strategies based on your unique audience, niche, and platform performance data to maximize engagement and revenue.</p>
            </div>
            <div className="bg-slate-700 p-6 rounded-lg relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500"></div>
              <Settings className="h-8 w-8 text-indigo-400 mb-4 relative z-10" />
              <h3 className="text-xl font-semibold text-white mb-2 relative z-10">Hands Off Automation</h3>
              <p className="text-slate-300 relative z-10">Have no time or don't know the direction of where your channel is going to go? You can have your channel completely ran automated for you. At MediaTiger, we are well equipped to handle your Youtube Channel. With over a decade of hands-on experience, our team of experts has successfully built some of the largest profiles on the internet.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}