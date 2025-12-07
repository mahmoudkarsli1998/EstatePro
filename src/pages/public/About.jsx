import React, { useRef } from 'react';
import LiquidBackground from '../../components/shared/LiquidBackground';
import FloatingGeometry from '../../components/shared/FloatingGeometry';
import { Shield, Users, Globe, Award } from 'lucide-react';
import { useFadeIn, useSlideIn, useStaggerList } from '../../hooks/useGSAPAnimations';

const About = () => {
  const headerRef = useFadeIn({ delay: 0.2 });
  const missionTextRef = useSlideIn({ direction: 'left', delay: 0.2 });
  const missionImageRef = useSlideIn({ direction: 'right', delay: 0.2 });
  const featuresRef = useStaggerList({ selector: '.feature-item', delay: 0.2 });
  const teamRef = useFadeIn({ delay: 0.2, distance: 30 });

  return (
    <div className="min-h-screen relative pt-24 pb-12 overflow-hidden">
      <LiquidBackground />
      <FloatingGeometry className="opacity-50" />
      
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div ref={headerRef} className="text-center mb-16 opacity-0">
          <h1 className="text-4xl md:text-6xl font-bold font-heading text-white mb-6 drop-shadow-[0_0_15px_rgba(0,240,255,0.3)]">
            About <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">EstatePro</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            We are redefining the real estate experience through immersive technology and premium service.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-24">
          <div ref={missionTextRef} className="glass-panel p-8 opacity-0">
            <h2 className="text-3xl font-bold font-heading text-white mb-6">Our Mission</h2>
            <p className="text-gray-400 mb-6 leading-relaxed">
              At EstatePro, we believe that finding your dream home should be an inspiring journey, not a stressful chore. We leverage cutting-edge 3D visualization, AI-driven insights, and a seamless digital interface to connect you with properties that perfectly match your lifestyle.
            </p>
            <p className="text-gray-400 leading-relaxed">
              Our platform bridges the gap between the physical and digital worlds, allowing you to explore properties in the metaverse before stepping foot in the real world.
            </p>
          </div>
          <div ref={missionImageRef} className="relative h-[400px] rounded-2xl overflow-hidden shadow-[0_0_30px_rgba(0,240,255,0.2)] opacity-0">
            <img 
              src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80" 
              alt="Modern Building" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#050510] to-transparent opacity-60"></div>
          </div>
        </div>

        <div ref={featuresRef} className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-24">
          {[
            { icon: Shield, title: "Trusted", desc: "Verified listings and secure transactions." },
            { icon: Users, title: "Community", desc: "Join a network of premium buyers and sellers." },
            { icon: Globe, title: "Global", desc: "Access properties from top cities worldwide." },
            { icon: Award, title: "Excellence", desc: "Award-winning service and support." }
          ].map((item, index) => (
            <div
              key={index}
              className="feature-item glass-panel p-6 text-center hover:bg-white/5 transition-colors group opacity-0"
            >
              <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(0,240,255,0.2)]">
                <item.icon size={28} />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
              <p className="text-gray-400 text-sm">{item.desc}</p>
            </div>
          ))}
        </div>

        <div ref={teamRef} className="text-center opacity-0">
          <h2 className="text-3xl font-bold font-heading text-white mb-12">Meet Our Team</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="glass-panel p-6 group">
                <div className="w-32 h-32 mx-auto mb-6 rounded-full overflow-hidden border-2 border-primary/30 shadow-[0_0_20px_rgba(0,240,255,0.2)]">
                  <img src={`https://i.pravatar.cc/150?img=${i + 10}`} alt="Team Member" className="w-full h-full object-cover" />
                </div>
                <h3 className="text-xl font-bold text-white mb-1">Alex Morgan</h3>
                <p className="text-primary text-sm mb-4">Senior Broker</p>
                <div className="flex justify-center gap-4">
                  {/* Social Icons Placeholder */}
                  <div className="w-8 h-8 rounded-full bg-white/5 hover:bg-primary hover:text-white transition-colors cursor-pointer flex items-center justify-center">in</div>
                  <div className="w-8 h-8 rounded-full bg-white/5 hover:bg-primary hover:text-white transition-colors cursor-pointer flex items-center justify-center">tw</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
