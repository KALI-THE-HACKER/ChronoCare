import React, { useState } from "react";

export default function HumanBody() {
  const [hoveredPart, setHoveredPart] = useState(null);
  const [selectedPart, setSelectedPart] = useState(null);

  const handleBodyPartClick = (part) => {
    setSelectedPart(part);
    alert(`${part.charAt(0).toUpperCase() + part.slice(1)} clicked - Medical data would be displayed here`);
  };

  // Complete SVG path from the original data
  const completePath = "M104.265,117.959c-0.304,3.58,2.126,22.529,3.38,29.959c0.597,3.52,2.234,9.255,1.645,12.3c-0.841,4.244-1.084,9.736-0.621,12.934c0.292,1.942,1.211,10.899-0.104,14.175c-0.688,1.718-1.949,10.522-1.949,10.522c-3.285,8.294-1.431,7.886-1.431,7.886c1.017,1.248,2.759,0.098,2.759,0.098c1.327,0.846,2.246-0.201,2.246-0.201c1.139,0.943,2.467-0.116,2.467-0.116c1.431,0.743,2.758-0.627,2.758-0.627c0.822,0.414,1.023-0.109,1.023-0.109c2.466-0.158-1.376-8.05-1.376-8.05c-0.92-7.088,0.913-11.033,0.913-11.033c6.004-17.805,6.309-22.53,3.909-29.24c-0.676-1.937-0.847-2.704-0.536-3.545c0.719-1.941,0.195-9.748,1.072-12.848c1.692-5.979,3.361-21.142,4.231-28.217c1.169-9.53-4.141-22.308-4.141-22.308c-1.163-5.2,0.542-23.727,0.542-23.727c2.381,3.705,2.29,10.245,2.29,10.245c-0.378,6.859,5.541,17.342,5.541,17.342c2.844,4.332,3.921,8.442,3.921,8.747c0,1.248-0.273,4.269-0.273,4.269l0.109,2.631c0.049,0.67,0.426,2.977,0.365,4.092c-0.444,6.862,0.646,5.571,0.646,5.571c0.92,0,1.931-5.522,1.931-5.522c0,1.424-0.348,5.687,0.42,7.295c0.919,1.918,1.595-0.329,1.607-0.78c0.243-8.737,0.768-6.448,0.768-6.448c0.511,7.088,1.139,8.689,2.265,8.135c0.853-0.407,0.073-8.506,0.073-8.506c1.461,4.811,2.569,5.577,2.569,5.577c2.411,1.693,0.92-2.983,0.585-3.909c-1.784-4.92-1.839-6.625-1.839-6.625c2.229,4.421,3.909,4.257,3.909,4.257c2.174-0.694-1.9-6.954-4.287-9.953c-1.218-1.528-2.789-3.574-3.245-4.789c-0.743-2.058-1.304-8.674-1.304-8.674c-0.225-7.807-2.155-11.198-2.155-11.198c-3.3-5.282-3.921-15.135-3.921-15.135l-0.146-16.635c-1.157-11.347-9.518-11.429-9.518-11.429c-8.451-1.258-9.627-3.988-9.627-3.988c-1.79-2.576-0.767-7.514-0.767-7.514c1.485-1.208,2.058-4.415,2.058-4.415c2.466-1.891,2.345-4.658,1.206-4.628c-0.914,0.024-0.707-0.733-0.707-0.733C115.068,0.636,104.01,0,104.01,0h-1.688c0,0-11.063,0.636-9.523,13.089c0,0,0.207,0.758-0.715,0.733c-1.136-0.03-1.242,2.737,1.215,4.628c0,0,0.572,3.206,2.058,4.415c0,0,1.023,4.938-0.767,7.514c0,0-1.172,2.73-9.627,3.988c0,0-8.375,0.082-9.514,11.429l-0.158,16.635c0,0-0.609,9.853-3.922,15.135c0,0-1.921,3.392-2.143,11.198c0,0-0.563,6.616-1.303,8.674c-0.451,1.209-2.021,3.255-3.249,4.789c-2.408,2.993-6.455,9.24-4.29,9.953c0,0,1.689,0.164,3.909-4.257c0,0-0.046,1.693-1.827,6.625c-0.35,0.914-1.839,5.59,0.573,3.909c0,0,1.117-0.767,2.569-5.577c0,0-0.779,8.099,0.088,8.506c1.133,0.555,1.751-1.047,2.262-8.135c0,0,0.524-2.289,0.767,6.448c0.012,0.451,0.673,2.698,1.596,0.78c0.779-1.608,0.429-5.864,0.429-7.295c0,0,0.999,5.522,1.933,5.522c0,0,1.099,1.291,0.648-5.571c-0.073-1.121,0.32-3.422,0.369-4.092l0.106-2.631c0,0-0.274-3.014-0.274-4.269c0-0.311,1.078-4.415,3.921-8.747c0,0,5.913-10.488,5.532-17.342c0,0-0.082-6.54,2.299-10.245c0,0,1.69,18.526,0.545,23.727c0,0-5.319,12.778-4.146,22.308c0.864,7.094,2.53,22.237,4.226,28.217c0.886,3.094,0.362,10.899,1.072,12.848c0.32,0.847,0.152,1.627-0.536,3.545c-2.387,6.71-2.083,11.436,3.921,29.24c0,0,1.848,3.945,0.914,11.033c0,0-3.836,7.892-1.379,8.05c0,0,0.192,0.523,1.023,0.109c0,0,1.327,1.37,2.761,0.627c0,0,1.328,1.06,2.463,0.116c0,0,0.91,1.047,2.237,0.201c0,0,1.742,1.175,2.777-0.098c0,0,1.839,0.408-1.435-7.886c0,0-1.254-8.793-1.945-10.522c-1.318-3.275-0.387-12.251-0.106-14.175c0.453-3.216,0.21-8.695-0.618-12.934c-0.606-3.038,1.035-8.774,1.641-12.3c1.245-7.423,3.685-26.373,3.38-29.959l1.008,0.354C103.809,118.312,104.265,117.959,104.265,117.959z";

  return (
    <div className="bg-white shadow-xl border border-blue-200 rounded-2xl p-8 h-full">
      <h3 className="text-2xl font-bold text-blue-900 mb-8 text-center">Interactive Human Body</h3>
      
      <div className="relative flex justify-center items-center">
        {/* Human Body SVG with Divided Parts */}
        <svg
          viewBox="0 0 206.326 206.326"
          xmlns="http://www.w3.org/2000/svg"
          className="w-64 h-80 drop-shadow-2xl"
        >
        <defs>
          {/* Gradients for realistic skin tone */}
          <linearGradient id="skinGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FDBCB4" />
            <stop offset="50%" stopColor="#F5A596" />
            <stop offset="100%" stopColor="#E8907A" />
          </linearGradient>
          
          {/* Head gradient */}
          <radialGradient id="headGrad" cx="50%" cy="30%" r="60%">
            <stop offset="0%" stopColor="#FFD7CC" />
            <stop offset="70%" stopColor="#F5A596" />
            <stop offset="100%" stopColor="#E8907A" />
          </radialGradient>
          
          {/* Hover effects */}
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge> 
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          
          {/* Shadow effects */}
          <filter id="dropShadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="3" dy="5" stdDeviation="4" floodOpacity="0.3" floodColor="#1f2937"/>
          </filter>
        </defs>

        {/* Complete Human Body using original SVG path */}
        <path
          d={completePath}
          fill={hoveredPart === 'body' ? "#FFE5B4" : "url(#skinGrad)"}
          stroke={selectedPart === 'body' ? "#FF6B6B" : "#8B7D6B"}
          strokeWidth={selectedPart === 'body' ? "2" : "1"}
          className="cursor-pointer transition-all duration-300"
          onClick={() => handleBodyPartClick('body')}
          onMouseEnter={() => setHoveredPart('body')}
          onMouseLeave={() => setHoveredPart(null)}
          filter="url(#dropShadow)"
        />

        {/* Interactive overlay regions for body parts */}
        {/* Head region overlay */}
        <circle 
          cx="103" 
          cy="20" 
          r="15" 
          fill="transparent" 
          className="cursor-pointer transition-all duration-300"
          onClick={() => handleBodyPartClick('head')}
          onMouseEnter={() => setHoveredPart('head')}
          onMouseLeave={() => setHoveredPart(null)}
        />
        
        {/* Chest region overlay */}
        <rect 
          x="85" 
          y="40" 
          width="36" 
          height="40" 
          fill="transparent" 
          className="cursor-pointer transition-all duration-300"
          onClick={() => handleBodyPartClick('chest')}
          onMouseEnter={() => setHoveredPart('chest')}
          onMouseLeave={() => setHoveredPart(null)}
        />
        
        {/* Abdomen region overlay */}
        <rect 
          x="90" 
          y="80" 
          width="26" 
          height="40" 
          fill="transparent" 
          className="cursor-pointer transition-all duration-300"
          onClick={() => handleBodyPartClick('abdomen')}
          onMouseEnter={() => setHoveredPart('abdomen')}
          onMouseLeave={() => setHoveredPart(null)}
        />
        
        {/* Left leg region overlay */}
        <rect 
          x="85" 
          y="120" 
          width="15" 
          height="80" 
          fill="transparent" 
          className="cursor-pointer transition-all duration-300"
          onClick={() => handleBodyPartClick('leftLeg')}
          onMouseEnter={() => setHoveredPart('leftLeg')}
          onMouseLeave={() => setHoveredPart(null)}
        />
        
        {/* Right leg region overlay */}
        <rect 
          x="106" 
          y="120" 
          width="15" 
          height="80" 
          fill="transparent" 
          className="cursor-pointer transition-all duration-300"
          onClick={() => handleBodyPartClick('rightLeg')}
          onMouseEnter={() => setHoveredPart('rightLeg')}
          onMouseLeave={() => setHoveredPart(null)}
        />

        {/* Body part highlighting */}
        {hoveredPart && (
          <g opacity="0.3">
            {hoveredPart === 'head' && <circle cx="103" cy="20" r="15" fill="#FF6B6B" />}
            {hoveredPart === 'chest' && <rect x="85" y="40" width="36" height="40" fill="#4ECDC4" />}
            {hoveredPart === 'abdomen' && <rect x="90" y="80" width="26" height="40" fill="#FFE066" />}
            {hoveredPart === 'leftLeg' && <rect x="85" y="120" width="15" height="80" fill="#FF9FF3" />}
            {hoveredPart === 'rightLeg' && <rect x="106" y="120" width="15" height="80" fill="#54A0FF" />}
          </g>
        )}
      </svg>

        {/* Dynamic Labels with improved positioning */}
        {hoveredPart && (
          <div className="absolute top-2 left-1/2 transform -translate-x-1/2 z-10">
            <div className="bg-blue-900/90 text-white px-3 py-1 rounded-lg shadow-lg text-sm">
              <span className="font-semibold capitalize">{hoveredPart.replace('leftArm', 'Left Arm').replace('rightArm', 'Right Arm')}</span>
            </div>
          </div>
        )}
      </div>

      {/* Body part indicators */}
      <div className="mt-6 text-center">
        <p className="text-gray-600 text-sm mb-2">Click on the human body to view medical information</p>
        {selectedPart && (
          <div className="bg-blue-100 text-blue-900 px-4 py-2 rounded-lg inline-block">
            <span className="font-semibold">Selected: {selectedPart.charAt(0).toUpperCase() + selectedPart.slice(1)}</span>
          </div>
        )}
      </div>
    </div>
  );
}
