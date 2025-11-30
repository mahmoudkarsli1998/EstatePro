import React from 'react';
import { motion } from 'framer-motion';
import LiquidBackground from '../../components/shared/LiquidBackground';
import ContactForm from '../../components/public/ContactForm'; // Reusing the component but adapting layout
import { MapPin, Phone, Mail, Clock } from 'lucide-react';

const Contact = () => {
  return (
    <div className="min-h-screen relative pt-24 pb-12 overflow-hidden">
      <LiquidBackground />
      
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-6xl font-bold font-heading text-white mb-6 drop-shadow-[0_0_15px_rgba(0,240,255,0.3)]">
            Get in <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Touch</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Have questions about a property or want to list with us? We're here to help.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Info */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-8"
          >
            <div className="glass-panel p-8">
              <h2 className="text-2xl font-bold font-heading text-white mb-6">Contact Information</h2>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <MapPin size={24} />
                  </div>
                  <div>
                    <h3 className="text-white font-bold mb-1">Visit Us</h3>
                    <p className="text-gray-400">123 Innovation Blvd, Tech City<br />Metaverse District, TC 90210</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <Phone size={24} />
                  </div>
                  <div>
                    <h3 className="text-white font-bold mb-1">Call Us</h3>
                    <p className="text-gray-400">+1 (555) 123-4567<br />+1 (555) 987-6543</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <Mail size={24} />
                  </div>
                  <div>
                    <h3 className="text-white font-bold mb-1">Email Us</h3>
                    <p className="text-gray-400">hello@estatepro.com<br />support@estatepro.com</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <Clock size={24} />
                  </div>
                  <div>
                    <h3 className="text-white font-bold mb-1">Working Hours</h3>
                    <p className="text-gray-400">Mon - Fri: 9:00 AM - 6:00 PM<br />Sat: 10:00 AM - 4:00 PM</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Map Placeholder */}
            <div className="glass-panel h-64 w-full overflow-hidden relative group">
              <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
                <p className="text-gray-500">Interactive Map Integration</p>
              </div>
              <div className="absolute inset-0 bg-primary/5 group-hover:bg-primary/10 transition-colors"></div>
            </div>
          </motion.div>

          {/* Contact Form Wrapper */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-panel p-8"
          >
             <h2 className="text-2xl font-bold font-heading text-white mb-6">Send us a Message</h2>
             <form className="space-y-6">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div>
                   <label className="block text-sm font-medium text-gray-300 mb-2">First Name</label>
                   <input type="text" className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white focus:ring-2 focus:ring-primary/50 focus:border-transparent outline-none transition-all" placeholder="John" />
                 </div>
                 <div>
                   <label className="block text-sm font-medium text-gray-300 mb-2">Last Name</label>
                   <input type="text" className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white focus:ring-2 focus:ring-primary/50 focus:border-transparent outline-none transition-all" placeholder="Doe" />
                 </div>
               </div>
               <div>
                 <label className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
                 <input type="email" className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white focus:ring-2 focus:ring-primary/50 focus:border-transparent outline-none transition-all" placeholder="john@example.com" />
               </div>
               <div>
                 <label className="block text-sm font-medium text-gray-300 mb-2">Subject</label>
                 <select className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white focus:ring-2 focus:ring-primary/50 focus:border-transparent outline-none transition-all [&>option]:bg-gray-900">
                   <option>General Inquiry</option>
                   <option>Property Listing</option>
                   <option>Partnership</option>
                   <option>Support</option>
                 </select>
               </div>
               <div>
                 <label className="block text-sm font-medium text-gray-300 mb-2">Message</label>
                 <textarea rows="4" className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white focus:ring-2 focus:ring-primary/50 focus:border-transparent outline-none transition-all" placeholder="How can we help you?"></textarea>
               </div>
               <button type="submit" className="w-full py-4 bg-gradient-to-r from-primary to-secondary text-white font-bold rounded-lg shadow-[0_0_20px_rgba(0,240,255,0.3)] hover:shadow-[0_0_30px_rgba(0,240,255,0.5)] transition-all transform hover:-translate-y-1">
                 Send Message
               </button>
             </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
