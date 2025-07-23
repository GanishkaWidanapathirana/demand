import { useState, useEffect } from 'react';
import { TrendingUp,  Upload, Zap,  Target, ArrowRight, Play, CheckCircle, ClipboardList } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function FruitDemandLanding() {
  const [isVisible, setIsVisible] = useState(false);
  const [currentFeature, setCurrentFeature] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    setIsVisible(true);
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % 3);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const features = [
    { icon: ClipboardList, title: "Inventory Entry", desc: "Easily manage and validate items" },
    { icon: TrendingUp, title: "Demand Forecasting", desc: "ML-powered prediction algorithms" },
    { icon: Target, title: "Price Optimization", desc: "Maximize profits with data insights" }
  ];

  const stats = [
    { value: "98.7%", label: "Accuracy Rate" },
    { value: "45%", label: "Profit Increase" },
    { value: "1000+", label: "Happy Clients" }
  ];

  return (
    <div className="min-h-screen w-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-800 text-white overflow-hidden">
      
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-emerald-400/20 to-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-pink-400/20 to-orange-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-cyan-400/10 to-purple-500/10 rounded-full blur-3xl animate-spin" style={{animationDuration: '20s'}}></div>
      </div>

      {/* Navigation */}
      <nav className={`relative z-10 w-full p-4 lg:p-6 transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}`}>
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-r from-emerald-400 to-blue-500 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-4 h-4 lg:w-6 lg:h-6" />
            </div>
            <span className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent">FruitFlow</span>
          </div>
          <div className="hidden md:flex space-x-6 lg:space-x-8">
            <a href="#features" className="hover:text-emerald-400 transition-colors text-sm lg:text-base">Features</a>
            <a href="#how-it-works" className="hover:text-emerald-400 transition-colors text-sm lg:text-base">How It Works</a>
            <a href="#pricing" className="hover:text-emerald-400 transition-colors text-sm lg:text-base">Pricing</a>
          </div>
          <div className="flex space-x-3 lg:space-x-4">
            <button
              onClick={() => navigate('/login')}
             className="bg-gradient-to-r from-emerald-500 to-blue-500 px-4 lg:px-6 py-2 rounded-full hover:from-emerald-400 hover:to-blue-400 transition-all duration-300 transform hover:scale-105 hover:shadow-lg text-sm lg:text-base">
              Login
            </button>
            <button
              onClick={() => navigate('/signup')}
             className="bg-gradient-to-r from-emerald-500 to-blue-500 px-4 lg:px-6 py-2 rounded-full hover:from-emerald-400 hover:to-blue-400 transition-all duration-300 transform hover:scale-105 hover:shadow-lg text-sm lg:text-base">
              Sign Up
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pt-12 lg:pt-20 pb-16 lg:pb-32">
        <div className="text-center">
          <div className={`transition-all duration-1000 delay-300 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}>
            <div className="inline-flex items-center bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-8 border border-white/20">
              <Zap className="w-4 h-4 mr-2 text-yellow-400" />
              <span className="text-sm">AI-Powered Demand Forecasting</span>
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl xl:text-8xl font-bold mb-6 leading-tight">
              <span className="bg-gradient-to-r from-emerald-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                Predict
              </span>
              <br />
              <span className="text-white">Fruit Demand</span>
              <br />
              <span className="bg-gradient-to-r from-pink-400 to-orange-400 bg-clip-text text-transparent">
                Like Magic
              </span>
            </h1>
            <p className="text-lg md:text-xl lg:text-2xl text-gray-300 mb-8 lg:mb-12 max-w-3xl mx-auto leading-relaxed">
              Transform your fruit business with AI-powered demand forecasting. Upload your sales data and get accurate predictions that boost profits by up to 45%.
            </p>
          </div>

          <div className={`flex flex-col md:flex-row gap-6 justify-center items-center transition-all duration-1000 delay-500 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}>
            <button className="group bg-gradient-to-r from-emerald-500 to-blue-500 px-8 py-4 rounded-full text-lg font-semibold hover:from-emerald-400 hover:to-blue-400 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl flex items-center space-x-2">
              <span>Get Started Now</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="group flex items-center space-x-2 text-gray-300 hover:text-white transition-colors">
              <div className="w-12 h-12 border-2 border-gray-300 rounded-full flex items-center justify-center group-hover:border-white transition-colors group-hover:bg-white/10">
                <Play className="w-5 h-5 ml-1" />
              </div>
              <span>Watch Demo</span>
            </button>
          </div>

          {/* Stats */}
          <div className={`grid grid-cols-3 gap-4 lg:gap-8 mt-12 lg:mt-20 transition-all duration-1000 delay-700 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}>
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-2xl lg:text-3xl xl:text-4xl font-bold bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent">
                  {stat.value}
                </div>
                <div className="text-gray-400 mt-2 text-sm lg:text-base">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-10 max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-12 lg:mb-20">
          <h2 className="text-3xl lg:text-4xl xl:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent">
              Powerful Features
            </span>
          </h2>
          <p className="text-lg lg:text-xl text-gray-300 max-w-2xl mx-auto">
            Everything you need to transform your fruit business with data-driven insights
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            const isActive = currentFeature === index;
            return (
              <div
                key={index}
                className={`relative group p-6 lg:p-8 rounded-2xl backdrop-blur-sm border transition-all duration-500 ${
                  isActive 
                    ? 'bg-gradient-to-br from-emerald-500/20 to-blue-500/20 border-emerald-400/50 scale-105' 
                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                }`}
              >
                <div className={`w-12 h-12 lg:w-16 lg:h-16 rounded-2xl flex items-center justify-center mb-4 lg:mb-6 transition-all duration-300 ${
                  isActive 
                    ? 'bg-gradient-to-r from-emerald-500 to-blue-500 scale-110' 
                    : 'bg-white/10 group-hover:bg-white/20'
                }`}>
                  <Icon className="w-6 h-6 lg:w-8 lg:h-8" />
                </div>
                <h3 className="text-xl lg:text-2xl font-semibold mb-3 lg:mb-4">{feature.title}</h3>
                <p className="text-gray-300 text-sm lg:text-base">{feature.desc}</p>
                
                {/* Animated indicator */}
                <div className={`absolute -inset-1 bg-gradient-to-r from-emerald-500/20 to-blue-500/20 rounded-2xl blur opacity-0 transition-opacity duration-300 ${
                  isActive ? 'opacity-100' : ''
                }`}></div>
              </div>
            );
          })}
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="relative z-10 max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-12 lg:mb-20">
          <h2 className="text-3xl lg:text-4xl xl:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-pink-400 to-orange-400 bg-clip-text text-transparent">
              How It Works
            </span>
          </h2>
          <p className="text-lg lg:text-xl text-gray-300 max-w-2xl mx-auto">
            Three simple steps to revolutionize your fruit business
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          {[
            { step: "01", title: "Enter Data", desc: "Input your sales data directly through our intuitive interface" },
            { step: "02", title: "AI Analysis", desc: "Our machine learning algorithms analyze patterns" },
            { step: "03", title: "Get Insights", desc: "Receive accurate forecasts and optimization tips" }
          ].map((item, index) => (
            <div key={index} className="relative text-center group">
              <div className="w-16 h-16 lg:w-20 lg:h-20 bg-gradient-to-r from-pink-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 lg:mb-6 text-lg lg:text-2xl font-bold group-hover:scale-110 transition-transform duration-300">
                {item.step}
              </div>
              <h3 className="text-xl lg:text-2xl font-semibold mb-3 lg:mb-4">{item.title}</h3>
              <p className="text-gray-300 text-sm lg:text-base">{item.desc}</p>
              
              {/* Connection line */}
              {index < 2 && (
                <div className="hidden lg:block absolute top-8 lg:top-10 left-full w-8 lg:w-12 h-0.5 bg-gradient-to-r from-pink-500 to-orange-500 transform -translate-x-4 lg:-translate-x-6"></div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 py-20 text-center">
        <div className="bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-sm rounded-3xl p-8 lg:p-12 border border-white/20">
          <h2 className="text-3xl lg:text-4xl xl:text-5xl font-bold mb-4 lg:mb-6">
            Ready to <span className="bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent">Transform</span> Your Business?
          </h2>
          <p className="text-lg lg:text-xl text-gray-300 mb-6 lg:mb-8">
            Join thousands of fruit businesses already using FruitFlow to maximize their profits
          </p>
          
          <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
            <button className="bg-gradient-to-r from-emerald-500 to-blue-500 px-8 py-4 rounded-full text-lg font-semibold hover:from-emerald-400 hover:to-blue-400 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl flex items-center space-x-2">
              <span>Get Started Today</span>
              <ArrowRight className="w-5 h-5" />
            </button>
            <div className="flex items-center space-x-2 text-sm text-gray-400">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>No setup fees • Easy integration</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 mt-20">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-r from-emerald-400 to-blue-500 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent">FruitFlow</span>
            </div>
            <div className="text-gray-400 text-sm">
              © 2025 FruitFlow. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}