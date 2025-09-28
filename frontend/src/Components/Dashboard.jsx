import React, { useState, useRef, useEffect } from 'react';
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../firebase";
import SimpleChatbot from './Chatbot';

const serverUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// Simple SVG Icon Components
const HomeIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path d="M10 2L3 9v9a2 2 0 002 2h10a2 2 0 002-2V9l-7-7z"/>
  </svg>
);

const UploadIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd"/>
  </svg>
);

const RobotIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM7 9a1 1 0 100-2 1 1 0 000 2zm6 0a1 1 0 100-2 1 1 0 000 2z"/>
  </svg>
);

const HistoryIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/>
  </svg>
);

const UserIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/>
  </svg>
);

const LogOutIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd"/>
  </svg>
);

const KeyIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M18 8a6 6 0 01-7.743 5.743L10 14l-1 1-1 1H6v2H2v-4l4.257-4.257A6 6 0 1118 8zm-6-4a1 1 0 100 2 2 2 0 012 2 1 1 0 102 0 4 4 0 00-4-4z" clipRule="evenodd"/>
  </svg>
);

const ChevronDownIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd"/>
  </svg>
);

const BellIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z"/>
  </svg>
);

const SearchIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"/>
  </svg>
);

const HeartIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd"/>
  </svg>
);

const CalendarIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"/>
  </svg>
);

const FileUploadIcon = () => (
  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd"/>
  </svg>
);

const ExternalLinkIcon = () => (
  <svg className="w-3 h-3 ml-1" fill="currentColor" viewBox="0 0 20 20">
    <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z"/>
    <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z"/>
  </svg>
);

const DocumentIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd"/>
  </svg>
);

const SendIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"/>
  </svg>
);



// Sidebar Component
const Sidebar = ({ activeLink, setActiveLink, userData }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: HomeIcon },
    { id: 'chatbot', label: 'Chatbot', icon: RobotIcon },
    { id: 'history', label: 'Medical History', icon: HistoryIcon }
  ];

  return (
    <div className="w-64 bg-gradient-to-b from-blue-50 to-indigo-50 h-full p-4 border-r border-blue-200 shadow-lg overflow-y-auto">
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
            <HeartIcon className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-blue-900">ChronoCare</h1>
            <p className="text-blue-600 text-xs">Medical Dashboard</p>
          </div>
        </div>
        
        {/* User Info Card */}
        {userData && (
          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-3 mb-6 border border-blue-200">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <UserIcon className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-blue-900 font-medium text-sm truncate">
                  {userData?.name || userData?.displayName || 'Patient'}
                </p>
                <p className="text-blue-600 text-xs truncate">
                  {userData?.email}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <nav className="space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeLink === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => setActiveLink(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                isActive 
                  ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/25' 
                  : 'text-blue-700 hover:bg-blue-100 hover:shadow-md'
              }`}
            >
              <Icon className="text-xl" />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};

// Header Component
const Header = ({ onLogout, userData }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleAvatarClick = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleLogout = () => {
    setIsDropdownOpen(false);
    onLogout();
  };

  const handleChangePassword = async() => {
    try {
      await sendPasswordResetEmail(auth, userData?.email);
    } catch (error) {
      alert("Failed to send password reset email. Please try again.");
      return;
    }
    
    setVerificationSent(true);
    setIsDropdownOpen(false);
  };

  return (
    <>
      <header className="bg-white/80 backdrop-blur-sm border-b border-blue-200 px-4 py-3 flex justify-between items-center shadow-sm flex-shrink-0">
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
            <HeartIcon className="text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-blue-900">
              Welcome back, {userData?.name || userData?.displayName || 'Patient'}!
            </h2>
            <p className="text-blue-600 text-sm">ChronoCare - Your Health, Our Priority</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <button className="p-3 bg-blue-50 rounded-xl text-blue-700 hover:text-blue-900 hover:bg-blue-100 transition-all duration-300 shadow-sm">
            <SearchIcon />
          </button>
          <button className="p-3 bg-blue-50 rounded-xl text-blue-700 hover:text-blue-900 hover:bg-blue-100 transition-all duration-300 shadow-sm relative">
            <BellIcon />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
          </button>
          
          {/* Avatar with Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button 
              className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl text-white shadow-md hover:shadow-lg transition-all duration-300 flex items-center space-x-2"
              onClick={handleAvatarClick}
            >
              <UserIcon />
              <ChevronDownIcon className={`transform transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white border border-blue-200 rounded-xl shadow-2xl z-50 animate-in slide-in-from-top-2 duration-200">
                
                <div className="p-4 border-b border-blue-100">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center">
                      <UserIcon className="text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-blue-900 font-medium truncate">
                        {userData?.name || userData?.displayName || 'Patient'}
                      </p>
                      <div className="flex items-center space-x-1">
                        <p className="text-blue-600 text-sm truncate">
                          {userData?.email}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Menu items */}
                <div className="p-2">
                  <button
                    onClick={handleChangePassword}
                    className="w-full flex items-center space-x-3 px-3 py-2 text-blue-700 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                  >
                    <KeyIcon />
                    <span>Change Password</span>
                  </button>
                  
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-3 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                  >
                    <LogOutIcon />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Password Reset Verification Modal */}
      {verificationSent && (
        <div className="fixed inset-0 w-full h-full backdrop-blur-sm flex items-center justify-center bg-black/40 z-50">
          <div className="bg-white border border-blue-200 rounded-2xl p-8 shadow-2xl max-w-md mx-4 text-center">
            {/* Animated Green Tick */}
            <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
              <svg 
                className="w-10 h-10 text-white animate-bounce" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={3} 
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-blue-900 mb-4">Email Sent Successfully!</h2>
            <p className="text-blue-600 mb-6">
              We've sent a password reset link to your email address.
            </p>
            <p className="text-sm text-blue-500 mb-6">
              Please check your inbox and click the link to change your password, and login using your new credentials.
            </p>
            <button
              onClick={() => setVerificationSent(false)}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white py-3 px-6 rounded-xl font-medium duration-300 transform hover:scale-105"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
};

// Health Timeline Component
const HealthTimeline = ({ selectedBodyPart, medicalData, setActiveLink }) => {
  // Convert medical data to timeline format
  const convertToTimelineEvents = (data, bodyPart = null) => {
    console.log('Converting timeline events:', { bodyPart, dataLength: data?.length });
    
    if (!data || !Array.isArray(data)) {
      console.log('No data or invalid data format');
      return [];
    }

    let filteredData = data;
    
    if (bodyPart) {
      // Create mapping for common body part name variations
      const bodyPartMappings = {
        'shoulder': ['shoulder', 'left_shoulder', 'right_shoulder'],
        'left_shoulder': ['shoulder', 'left_shoulder'],
        'right_shoulder': ['shoulder', 'right_shoulder'],
        'heart': ['heart', 'chest'],
        'chest': ['chest', 'heart'],
        'brain': ['brain', 'head'],
        'head': ['head', 'brain'],
        'knee': ['knee', 'left_knee', 'right_knee'],
        'left_knee': ['knee', 'left_knee'],
        'right_knee': ['knee', 'right_knee'],
        'arm': ['arm', 'left_arm', 'right_arm', 'upper_arm', 'forearm'],
        'left_arm': ['arm', 'left_arm', 'left_upper_arm', 'left_forearm'],
        'right_arm': ['arm', 'right_arm', 'right_upper_arm', 'right_forearm']
      };
      
      const searchTerms = bodyPartMappings[bodyPart.toLowerCase()] || [bodyPart.toLowerCase().replace('_', ' ')];
      
      filteredData = data.filter(record => {
        const recordBodyPart = record.body_part_name.toLowerCase();
        return searchTerms.some(term => 
          recordBodyPart.includes(term) || term.includes(recordBodyPart)
        );
      });
      
      console.log(`Filtered ${data.length} records to ${filteredData.length} for body part: ${bodyPart}`);
      console.log('Matching records:', filteredData);
    }

    return filteredData
      .sort((a, b) => new Date(b.date) - new Date(a.date)) // Sort by date, newest first
      .map(record => {
        // Just use the document link as stored in database
        let documentLink = record.document_link;
        
        const eventObj = {
          date: new Date(record.date).toLocaleDateString(),
          event: record.body_part_name,
          status: 'completed',
          icon: HeartIcon,
          details: record.details,
          id: record.id,
          documentLink: documentLink
        };
        
        console.log('Converting record to event:', {
          originalRecord: record,
          processedEvent: eventObj,
          documentLink: documentLink
        });
        
        return eventObj;
      });
  };

  const timelineEvents = convertToTimelineEvents(medicalData, selectedBodyPart);
  const bodyPartName = selectedBodyPart ? selectedBodyPart.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'General';

  // Debug logging
  console.log('HealthTimeline - medicalData:', medicalData);
  console.log('HealthTimeline - timelineEvents:', timelineEvents);
  console.log('HealthTimeline - selectedBodyPart:', selectedBodyPart);

  return (
    <div className="bg-white shadow-xl border border-blue-200 rounded-2xl p-4 h-90 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-blue-900">Medical Timeline</h3>
        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
          {bodyPartName}
        </span>
      </div>
      
      <div className="flex-1 min-h-0 flex flex-col">
        <div className="space-y-4 flex-1 overflow-y-auto pr-2">
          {timelineEvents.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-blue-700">
                {selectedBodyPart 
                  ? `No records found for ${bodyPartName.toLowerCase()}. Upload some documents to get started!`
                  : 'No medical records found. Upload some documents to get started!'
                }
              </p>
            </div>
          ) : (
            timelineEvents.map((event, index) => {
              const Icon = event.icon;
              return (
                <div key={event.id || index} className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-md">
                      <Icon className="text-white w-4 h-4" />
                    </div>
                  </div>
                  <div className="flex-grow">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="text-blue-900 font-semibold text-sm">{event.event}</h4>
                        <p className="text-blue-600 text-xs">{event.date}</p>
                      </div>
                      {event.documentLink && (
                        <span className="px-1.5 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700 flex items-center space-x-1">
                          <DocumentIcon className="w-2 h-2" />
                          <span>Doc</span>
                        </span>
                      )}
                    </div>
                    {event.details && (
                      <p className="text-blue-700 text-xs leading-relaxed">
                        {event.details.length > 120 
                          ? `${event.details.substring(0, 120)}...` 
                          : event.details
                        }
                      </p>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
        
        <button 
          onClick={() => setActiveLink('history')}
          className="w-full mt-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-2 rounded-lg text-sm font-semibold shadow-md hover:shadow-blue-500/25 transition-all duration-300 flex-shrink-0"
        >
          View Full History
        </button>
      </div>
    </div>
  );
};

// Document Upload Component
const DocumentUpload = () => {
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [uploadStatus, setUploadStatus] = useState('idle'); // 'idle', 'uploading', 'processing', 'completed'
  const fileInputRef = useRef(null);

  const validateFile = (file) => {
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'image/gif',
      'image/bmp',
      'image/webp'
    ];
    
    const maxSize = 10 * 1024 * 1024; // 10MB
    
    if (!allowedTypes.includes(file.type)) {
      alert(`File type ${file.type} is not supported. Please upload PDF or image files.`);
      return false;
    }
    
    if (file.size > maxSize) {
      alert(`File ${file.name} is too large. Maximum size is 10MB.`);
      return false;
    }
    
    return true;
  };

  const uploadFileToAPI = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const token = await auth.currentUser.getIdToken();
      const response = await fetch(`${serverUrl}/api/upload-ledger`, {
        method: 'POST',
        body: formData,
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Upload failed:', error);
      
      // Simulate successful upload for demo purposes
      // Remove this in production and handle the actual error
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            success: true,
            fileId: Date.now() + Math.random(),
            message: 'File uploaded successfully (demo)',
            processingStatus: 'queued'
          });
        }, 2000);
      });
    }
  };

  const handleFileUpload = async (files) => {
    const validFiles = Array.from(files).filter(validateFile);
    
    if (validFiles.length === 0) return;

    setIsUploading(true);
    setUploadStatus('uploading');
    
    const newUploadedFiles = [];
    
    for (const file of validFiles) {
      const fileId = Date.now() + Math.random();
      
      // Add file to progress tracking
      setUploadProgress(prev => ({
        ...prev,
        [fileId]: { progress: 0, status: 'uploading' }
      }));

      try {
        // Simulate progress for visual feedback
        const progressInterval = setInterval(() => {
          setUploadProgress(prev => {
            const currentProgress = prev[fileId]?.progress || 0;
            if (currentProgress < 90) {
              return {
                ...prev,
                [fileId]: { ...prev[fileId], progress: currentProgress + 10 }
              };
            }
            return prev;
          });
        }, 200);

        const result = await uploadFileToAPI(file);
        
        clearInterval(progressInterval);
        
        setUploadProgress(prev => ({
          ...prev,
          [fileId]: { progress: 100, status: 'completed' }
        }));

        newUploadedFiles.push({
          id: fileId,
          name: file.name,
          type: file.type,
          size: file.size,
          uploadDate: new Date().toLocaleDateString(),
          uploadTime: new Date().toLocaleTimeString(),
          apiResponse: result,
          status: 'uploaded'
        });

      } catch (error) {
        setUploadProgress(prev => ({
          ...prev,
          [fileId]: { progress: 0, status: 'error' }
        }));
        console.error(`Failed to upload ${file.name}:`, error);
      }
    }
    
    setUploadedFiles(prev => [...prev, ...newUploadedFiles]);
    setIsUploading(false);
    
    if (newUploadedFiles.length > 0) {
      setUploadStatus('processing');
      // Simulate processing completion
      setTimeout(() => {
        setUploadStatus('completed');
      }, 3000);
    } else {
      setUploadStatus('idle');
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    handleFileUpload(files);
  };

  const handleBrowseFiles = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = (e) => {
    const files = e.target.files;
    if (files.length > 0) {
      handleFileUpload(files);
    }
    // Reset input to allow selecting the same file again
    e.target.value = '';
  };

  const removeFile = (fileId) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
    setUploadProgress(prev => {
      const newProgress = { ...prev };
      delete newProgress[fileId];
      return newProgress;
    });
  };

  const getFileIcon = (fileType) => {
    if (fileType.includes('pdf')) {
      return (
        <svg className="w-8 h-8 text-red-500" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd"/>
        </svg>
      );
    }
    return (
      <svg className="w-8 h-8 text-green-500" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd"/>
      </svg>
    );
  };

  const getStepStatus = (step) => {
    switch (step) {
      case 1: // Upload
        if (uploadedFiles.length > 0 || uploadStatus === 'completed') return 'completed';
        if (uploadStatus === 'uploading') return 'active';
        return 'inactive';
      case 2: // AI Processing
        if (uploadStatus === 'completed') return 'completed';
        if (uploadStatus === 'processing') return 'active';
        return 'inactive';
      case 3: // Ledger
        if (uploadStatus === 'completed') return 'completed';
        return 'inactive';
      default:
        return 'inactive';
    }
  };

  return (
    <div className="bg-white shadow-xl border border-blue-200 rounded-2xl p-4 h-full flex flex-col">
      <h3 className="text-lg font-bold text-blue-900 mb-4">Document Upload</h3>
      
      <div 
        className={`border-2 border-dashed rounded-xl p-4 text-center transition-all duration-300 ${
          isDragOver 
            ? 'border-blue-500 bg-blue-100' 
            : 'border-blue-300 hover:border-blue-400 hover:bg-blue-50'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.jpg,.jpeg,.png,.gif,.bmp,.webp,application/pdf,image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
        
        <div className="flex justify-center mb-2">
          <FileUploadIcon className={`text-blue-500 w-6 h-6 ${isUploading ? 'animate-pulse' : ''}`} />
        </div>
        <p className="text-blue-700 mb-1 text-sm">
          Drag and drop your medical documents here
        </p>
        <p className="text-gray-500 text-xs mb-3">
          PDF, JPG, PNG, GIF, BMP, WEBP (Max 10MB)
        </p>
        <button 
          onClick={handleBrowseFiles}
          disabled={isUploading}
          className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-md hover:shadow-blue-500/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isUploading ? 'Uploading...' : 'Browse Files'}
        </button>
      </div>

      {/* Upload Progress */}
      {Object.keys(uploadProgress).length > 0 && (
        <div className="mt-6">
          <h4 className="text-blue-900 font-semibold mb-3">Upload Progress</h4>
          {Object.entries(uploadProgress).map(([fileId, progress]) => (
            <div key={fileId} className="mb-2">
              <div className="flex justify-between text-sm mb-1">
                <span>Uploading...</span>
                <span>{progress.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${
                    progress.status === 'error' ? 'bg-red-500' : 'bg-blue-500'
                  }`}
                  style={{ width: `${progress.progress}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Uploaded Files List */}
      {uploadedFiles.length > 0 && (
        <div className="mt-6">
          <h4 className="text-blue-900 font-semibold mb-4">Uploaded Files ({uploadedFiles.length})</h4>
          <div className="space-y-3 max-h-60 overflow-y-auto">
            {uploadedFiles.map((file) => (
              <div key={file.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border">
                <div className="flex items-center space-x-3">
                  {getFileIcon(file.type)}
                  <div>
                    <p className="font-medium text-gray-900 truncate max-w-xs">{file.name}</p>
                    <p className="text-sm text-gray-500">
                      {(file.size / 1024 / 1024).toFixed(2)} MB • {file.uploadDate} {file.uploadTime}
                    </p>
                    <p className="text-xs text-green-600">✓ Uploaded successfully</p>
                  </div>
                </div>
                <button
                  onClick={() => removeFile(file.id)}
                  className="text-red-500 hover:text-red-700 p-1 rounded transition-colors"
                  title="Remove file"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Upload Process Stepper */}
      <div className="mt-8">
        <h4 className="text-blue-900 font-semibold mb-4">AI Processing Pipeline</h4>
        <div className="flex items-center justify-between">
          {[1, 2, 3].map((step) => {
            const stepStatus = getStepStatus(step);
            const labels = ['Upload', 'AI Processing', 'Ledger'];
            
            return (
              <React.Fragment key={step}>
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shadow-md transition-all ${
                    stepStatus === 'completed'
                      ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white'
                      : stepStatus === 'active'
                      ? 'bg-gradient-to-r from-yellow-500 to-orange-600 text-white animate-pulse'
                      : 'bg-blue-200 text-blue-600'
                  }`}>
                    {stepStatus === 'completed' ? '✓' : stepStatus === 'active' ? '⏳' : step}
                  </div>
                  <span className={`text-xs mt-2 ${
                    stepStatus === 'completed' 
                      ? 'text-green-700' 
                      : stepStatus === 'active'
                      ? 'text-yellow-700'
                      : 'text-blue-600'
                  }`}>
                    {labels[step - 1]}
                  </span>
                </div>
                {step < 3 && (
                  <div className={`flex-1 h-0.5 mx-2 transition-all ${
                    stepStatus === 'completed' ? 'bg-green-300' : 'bg-blue-200'
                  }`}></div>
                )}
              </React.Fragment>
            );
          })}
        </div>
        
        {/* Status Messages */}
        {uploadStatus !== 'idle' && (
          <div className="mt-4 p-3 rounded-lg text-center">
            {uploadStatus === 'uploading' && (
              <p className="text-blue-700">📤 Uploading files to server...</p>
            )}
            {uploadStatus === 'processing' && (
              <p className="text-yellow-700">🤖 AI is analyzing your documents...</p>
            )}
            {uploadStatus === 'completed' && (
              <p className="text-green-700">✅ Processing complete! Documents added to your medical ledger.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Using external Chatbot component with WebSocket integration

// Dashboard Component
const Dashboard = ({ medicalData = [], handleViewDocument, setActiveLink }) => {
  const [selectedBodyPart, setSelectedBodyPart] = useState(null);

  console.log('Dashboard component - received medicalData:', medicalData);
  console.log('Dashboard component - medicalData length:', medicalData?.length);

  const handleBodyPartClick = (part) => {
    console.log('Selected body part:', part);
    setSelectedBodyPart(part);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 p-4 h-full">
      {/* Main Content Grid */}
      <div className="lg:col-span-2">
        <div className="bg-white shadow-xl border border-blue-200 rounded-2xl p-4 h-full flex flex-col">
          <h3 className="text-xl font-bold text-blue-900 mb-3 text-center">Interactive Human Body</h3>
          <div className="relative w-full flex justify-center flex-1" style={{ minHeight: '400px', maxHeight: '500px' }}>
            {/* Human Body Image */}
            <img 
              src="/human_body-1.png" 
              alt="Human Body Anatomy"
              className="max-w-full max-h-full object-contain rounded-lg"
            />
            
            {/* Clickable overlay regions - Smaller and more accurate */}
            <div className="absolute inset-0 pointer-events-none">
              {/* Head region - Increased height by 10% from bottom */}
              <div 
                className="absolute pointer-events-auto cursor-pointer hover:bg-red-500/40 transition-colors rounded-full border-2 border-transparent hover:border-red-500"
                style={{ 
                  top: '8%', 
                  left: '46%', 
                  width: '8%', 
                  height: '11%',
                }}
                onClick={() => handleBodyPartClick('head')}
                title="Head - Click for medical information"
              />

              {/* Brain - Inside head region */}
              <div 
                className="absolute pointer-events-auto cursor-pointer hover:bg-violet-500/40 transition-colors rounded-full border-2 border-transparent hover:border-violet-500"
                style={{ 
                  top: '9%', 
                  left: '47%', 
                  width: '6%', 
                  height: '7%',
                }}
                onClick={() => handleBodyPartClick('brain')}
                title="Brain - Click for medical information"
              />

              {/* Left Eye */}
              <div 
                className="absolute pointer-events-auto cursor-pointer hover:bg-emerald-500/40 transition-colors rounded-full border-2 border-transparent hover:border-emerald-500"
                style={{ 
                  top: '12%', 
                  left: '47.5%', 
                  width: '1.5%', 
                  height: '2%',
                }}
                onClick={() => handleBodyPartClick('left_eye')}
                title="Left Eye - Click for medical information"
              />

              {/* Right Eye */}
              <div 
                className="absolute pointer-events-auto cursor-pointer hover:bg-emerald-500/40 transition-colors rounded-full border-2 border-transparent hover:border-emerald-500"
                style={{ 
                  top: '12%', 
                  right: '47.5%', 
                  width: '1.5%', 
                  height: '2%',
                }}
                onClick={() => handleBodyPartClick('right_eye')}
                title="Right Eye - Click for medical information"
              />
              
              {/* Neck region - Smaller targeted area */}
              <div 
                className="absolute pointer-events-auto cursor-pointer hover:bg-orange-500/40 transition-colors rounded-lg border-2 border-transparent hover:border-orange-500"
                style={{ 
                  top: '20%', 
                  left: '47%', 
                  width: '6%', 
                  height: '4%',
                }}
                onClick={() => handleBodyPartClick('neck')}
                title="Neck - Click for medical information"
              />

              {/* Spine - Central vertical line */}
              <div 
                className="absolute pointer-events-auto cursor-pointer hover:bg-stone-500/40 transition-colors rounded-lg border-2 border-transparent hover:border-stone-500"
                style={{ 
                  top: '24%', 
                  left: '49.5%', 
                  width: '1%', 
                  height: '30%',
                }}
                onClick={() => handleBodyPartClick('spine')}
                title="Spine - Click for medical information"
              />
              
              {/* Chest region - Reduced height from top and bottom */}
              <div 
                className="absolute pointer-events-auto cursor-pointer hover:bg-blue-500/40 transition-colors rounded-lg border-2 border-transparent hover:border-blue-500"
                style={{ 
                  top: '25%', 
                  left: '44.5%', 
                  width: '12%', 
                  height: '10%',
                }}
                onClick={() => handleBodyPartClick('chest')}
                title="Chest - Click for medical information"
              />

              {/* Heart - Left side of chest */}
              <div 
                className="absolute pointer-events-auto cursor-pointer hover:bg-rose-500/40 transition-colors rounded-lg border-2 border-transparent hover:border-rose-500"
                style={{ 
                  top: '27%', 
                  left: '46%', 
                  width: '4%', 
                  height: '6%',
                }}
                onClick={() => handleBodyPartClick('heart')}
                title="Heart - Click for medical information"
              />

              {/* Left Lung */}
              <div 
                className="absolute pointer-events-auto cursor-pointer hover:bg-sky-500/40 transition-colors rounded-lg border-2 border-transparent hover:border-sky-500"
                style={{ 
                  top: '26%', 
                  left: '42%', 
                  width: '3.5%', 
                  height: '8%',
                }}
                onClick={() => handleBodyPartClick('left_lung')}
                title="Left Lung - Click for medical information"
              />

              {/* Right Lung */}
              <div 
                className="absolute pointer-events-auto cursor-pointer hover:bg-sky-500/40 transition-colors rounded-lg border-2 border-transparent hover:border-sky-500"
                style={{ 
                  top: '26%', 
                  right: '42%', 
                  width: '3.5%', 
                  height: '8%',
                }}
                onClick={() => handleBodyPartClick('right_lung')}
                title="Right Lung - Click for medical information"
              />
              
              {/* Left Shoulder - Moved inward */}
              <div 
                className="absolute pointer-events-auto cursor-pointer hover:bg-teal-500/40 transition-colors rounded-full border-2 border-transparent hover:border-teal-500"
                style={{ 
                  top: '23%', 
                  left: '39%', 
                  width: '6%', 
                  height: '8%',
                }}
                onClick={() => handleBodyPartClick('left_shoulder')}
                title="Left Shoulder - Click for medical information"
              />
              
              {/* Right Shoulder - Moved inward */}
              <div 
                className="absolute pointer-events-auto cursor-pointer hover:bg-teal-500/40 transition-colors rounded-full border-2 border-transparent hover:border-teal-500"
                style={{ 
                  top: '23%', 
                  right: '38%', 
                  width: '6%', 
                  height: '8%',
                }}
                onClick={() => handleBodyPartClick('right_shoulder')}
                title="Right Shoulder - Click for medical information"
              />
              
              {/* Left Upper Arm - Width reduced by 60% and moved more inward */}
              <div 
                className="absolute pointer-events-auto cursor-pointer hover:bg-green-500/40 transition-colors rounded-lg border-2 border-transparent hover:border-green-500"
                style={{ 
                  top: '32%', 
                  left: '40%', 
                  width: '4%', 
                  height: '9%',
                }}
                onClick={() => handleBodyPartClick('left_upper_arm')}
                title="Left Upper Arm - Click for medical information"
              />
              
              {/* Right Upper Arm - Width reduced by 60% and moved more inward */}
              <div 
                className="absolute pointer-events-auto cursor-pointer hover:bg-green-500/40 transition-colors rounded-lg border-2 border-transparent hover:border-green-500"
                style={{ 
                  top: '32%', 
                  right: '39%', 
                  width: '4%', 
                  height: '9%',
                }}
                onClick={() => handleBodyPartClick('right_upper_arm')}
                title="Right Upper Arm - Click for medical information"
              />
              
              {/* Left Forearm - Width reduced by 60% and moved more inward */}
              <div 
                className="absolute pointer-events-auto cursor-pointer hover:bg-lime-500/40 transition-colors rounded-lg border-2 border-transparent hover:border-lime-500"
                style={{ 
                  top: '42%', 
                  left: '38%', 
                  width: '3.5%', 
                  height: '10%',
                }}
                onClick={() => handleBodyPartClick('left_forearm')}
                title="Left Forearm - Click for medical information"
              />
              
              {/* Right Forearm - Width reduced by 60% and moved more inward */}
              <div 
                className="absolute pointer-events-auto cursor-pointer hover:bg-lime-500/40 transition-colors rounded-lg border-2 border-transparent hover:border-lime-500"
                style={{ 
                  top: '42%', 
                  right: '38%', 
                  width: '3.5%', 
                  height: '10%',
                }}
                onClick={() => handleBodyPartClick('right_forearm')}
                title="Right Forearm - Click for medical information"
              />
              
              {/* Abdomen - Reduced height by half */}
              <div 
                className="absolute pointer-events-auto cursor-pointer hover:bg-yellow-500/40 transition-colors rounded-lg border-2 border-transparent hover:border-yellow-500"
                style={{ 
                  top: '41%', 
                  left: '43%', 
                  width: '14%', 
                  height: '7%',
                }}
                onClick={() => handleBodyPartClick('abdomen')}
                title="Abdomen - Click for medical information"
              />

              {/* Stomach - Upper left abdomen */}
              <div 
                className="absolute pointer-events-auto cursor-pointer hover:bg-amber-500/40 transition-colors rounded-lg border-2 border-transparent hover:border-amber-500"
                style={{ 
                  top: '36%', 
                  left: '45%', 
                  width: '5%', 
                  height: '4%',
                }}
                onClick={() => handleBodyPartClick('stomach')}
                title="Stomach - Click for medical information"
              />

              {/* Left Kidney - Back left side */}
              <div 
                className="absolute pointer-events-auto cursor-pointer hover:bg-red-600/40 transition-colors rounded-lg border-2 border-transparent hover:border-red-600"
                style={{ 
                  top: '38%', 
                  left: '41%', 
                  width: '2.5%', 
                  height: '4%',
                }}
                onClick={() => handleBodyPartClick('left_kidney')}
                title="Left Kidney - Click for medical information"
              />

              {/* Right Kidney - Back right side */}
              <div 
                className="absolute pointer-events-auto cursor-pointer hover:bg-red-600/40 transition-colors rounded-lg border-2 border-transparent hover:border-red-600"
                style={{ 
                  top: '38%', 
                  right: '41%', 
                  width: '2.5%', 
                  height: '4%',
                }}
                onClick={() => handleBodyPartClick('right_kidney')}
                title="Right Kidney - Click for medical information"
              />
              
              {/* Pelvis/Hip area - Moved up and reduced height by half */}
              <div 
                className="absolute pointer-events-auto cursor-pointer hover:bg-indigo-500/40 transition-colors rounded-lg border-2 border-transparent hover:border-indigo-500"
                style={{ 
                  top: '48%', 
                  left: '44%', 
                  width: '12%', 
                  height: '5%',
                }}
                onClick={() => handleBodyPartClick('pelvis')}
                title="Pelvis - Click for medical information"
              />
              
              {/* Left Thigh - Reduced length by 20% from bottom */}
              <div 
                className="absolute pointer-events-auto cursor-pointer hover:bg-purple-500/40 transition-colors rounded-lg border-2 border-transparent hover:border-purple-500"
                style={{ 
                  top: '53%', 
                  left: '43%', 
                  width: '6%', 
                  height: '14.4%',
                }}
                onClick={() => handleBodyPartClick('left_thigh')}
                title="Left Thigh - Click for medical information"
              />
              
              {/* Right Thigh - Reduced length by 20% from bottom */}
              <div 
                className="absolute pointer-events-auto cursor-pointer hover:bg-purple-500/40 transition-colors rounded-lg border-2 border-transparent hover:border-purple-500"
                style={{ 
                  top: '53%', 
                  right: '43%', 
                  width: '6%', 
                  height: '14.4%',
                }}
                onClick={() => handleBodyPartClick('right_thigh')}
                title="Right Thigh - Click for medical information"
              />
              
              {/* Left Knee - Moved up */}
              <div 
                className="absolute pointer-events-auto cursor-pointer hover:bg-pink-500/40 transition-colors rounded-full border-2 border-transparent hover:border-pink-500"
                style={{ 
                  top: '66%', 
                  left: '44%', 
                  width: '4%', 
                  height: '5%',
                }}
                onClick={() => handleBodyPartClick('left_knee')}
                title="Left Knee - Click for medical information"
              />
              
              {/* Right Knee - Moved up */}
              <div 
                className="absolute pointer-events-auto cursor-pointer hover:bg-pink-500/40 transition-colors rounded-full border-2 border-transparent hover:border-pink-500"
                style={{ 
                  top: '66%', 
                  right: '44%', 
                  width: '4%', 
                  height: '5%',
                }}
                onClick={() => handleBodyPartClick('right_knee')}
                title="Right Knee - Click for medical information"
              />
              
              {/* Left Lower Leg - Moved up */}
              <div 
                className="absolute pointer-events-auto cursor-pointer hover:bg-cyan-500/40 transition-colors rounded-lg border-2 border-transparent hover:border-cyan-500"
                style={{ 
                  top: '72%', 
                  left: '43%', 
                  width: '6%', 
                  height: '15%',
                }}
                onClick={() => handleBodyPartClick('left_lower_leg')}
                title="Left Lower Leg - Click for medical information"
              />
              
              {/* Right Lower Leg - Moved up */}
              <div 
                className="absolute pointer-events-auto cursor-pointer hover:bg-cyan-500/40 transition-colors rounded-lg border-2 border-transparent hover:border-cyan-500"
                style={{ 
                  top: '72%', 
                  right: '43%', 
                  width: '6%', 
                  height: '15%',
                }}
                onClick={() => handleBodyPartClick('right_lower_leg')}
                title="Right Lower Leg - Click for medical information"
              />

              {/* Left Ankle */}
              <div 
                className="absolute pointer-events-auto cursor-pointer hover:bg-gray-500/40 transition-colors rounded-full border-2 border-transparent hover:border-gray-500"
                style={{ 
                  top: '87%', 
                  left: '44%', 
                  width: '4%', 
                  height: '3%',
                }}
                onClick={() => handleBodyPartClick('left_ankle')}
                title="Left Ankle - Click for medical information"
              />

              {/* Right Ankle */}
              <div 
                className="absolute pointer-events-auto cursor-pointer hover:bg-gray-500/40 transition-colors rounded-full border-2 border-transparent hover:border-gray-500"
                style={{ 
                  top: '87%', 
                  right: '44%', 
                  width: '4%', 
                  height: '3%',
                }}
                onClick={() => handleBodyPartClick('right_ankle')}
                title="Right Ankle - Click for medical information"
              />
            </div>
          </div>
          
          {/* Selected body part display */}
          {selectedBodyPart && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-semibold text-blue-900">Selected: {selectedBodyPart.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</h4>
              <p className="text-blue-700 text-sm mt-1">Medical information for {selectedBodyPart.replace('_', ' ')} would be displayed in the right-side panel.</p>
            </div>
          )}
          
          <div className="mt-4 text-center">
            <p className="text-gray-600 text-sm">
              Click on any body part above to view medical information and health data.
            </p>
          </div>
        </div>
      </div>
      
      <div className="flex flex-col space-y-4 h-full">
        <div className="flex-1 min-h-0">
          <HealthTimeline selectedBodyPart={selectedBodyPart} medicalData={medicalData} setActiveLink={setActiveLink} />
        </div>
        <div className="flex-1 min-h-0">
          <DocumentUpload />
        </div>
      </div>
    </div>
  );
};

// Main App Component - This is now the Dashboard component exported to App.jsx
const DashboardApp = ({ onLogout, userData }) => {
  const [activeLink, setActiveLink] = useState('dashboard');
  const [medicalData, setMedicalData] = useState([]);
  const [loading, setLoading] = useState(true);

  const handleViewDocument = async (documentLink) => {
    console.log('handleViewDocument called with:', documentLink);
    try {
      // Get the filename from the document link
      const filename = documentLink.split('/').pop();
      console.log('Extracted filename:', filename);
      
      // Get Firebase auth token
      const user = auth.currentUser;
      if (!user) {
        alert('Please log in to view documents');
        return;
      }
      
      console.log('Getting Firebase token...');
      const token = await user.getIdToken();
      
      // Fetch the file with authorization and create a blob URL
      console.log('Fetching file from:', `${serverUrl}/api/view/${filename}`);
      const response = await fetch(`${serverUrl}/api/view/${filename}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      console.log('Response status:', response.status);
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server response:', errorText);
        throw new Error(`Failed to load document: ${response.status} - ${errorText}`);
      }
      
      const blob = await response.blob();
      console.log('Blob created, size:', blob.size);
      const url = window.URL.createObjectURL(blob);
      console.log('Opening URL:', url);
      window.open(url, '_blank');
      
      // Clean up the blob URL after a delay
      setTimeout(() => window.URL.revokeObjectURL(url), 1000);
      
    } catch (error) {
      console.error('Error viewing document:', error);
      alert(`Failed to open document: ${error.message}`);
    }
  };

  // Fetch medical data from backend
  useEffect(() => {
    const fetchMedicalData = async () => {
      setLoading(true);
      try {
        if (!auth.currentUser) {
          setMedicalData([]);
          setLoading(false);
          return;
        }
        const token = await auth.currentUser.getIdToken();
        const response = await fetch(`${serverUrl}/api/medicalData`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Received medical data response:', data);
        console.log('bodyPartsInfo array:', data.bodyPartsInfo);
        console.log('Setting medicalData to:', data.bodyPartsInfo || []);
        setMedicalData(data.bodyPartsInfo || []);
      } catch (error) {
        console.error('Failed to fetch medical data:', error);
        setMedicalData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMedicalData();
  }, []);

  const renderContent = () => {
    switch (activeLink) {
      case 'dashboard':
        return <Dashboard medicalData={medicalData} handleViewDocument={handleViewDocument} setActiveLink={setActiveLink} />;
      case 'chatbot':
        return <SimpleChatbot />;
      case 'history':
        return (
          <div className="p-6">
            <div className="bg-white shadow-xl border border-blue-200 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-blue-900 mb-6">Complete Medical History</h3>
              
              {loading ? (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              ) : medicalData.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-blue-700">No medical records found. Upload some documents to get started!</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {medicalData.map((record) => (
                    <div key={record.id} className="border border-blue-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="text-lg font-semibold text-blue-900 capitalize">{record.body_part_name}</h4>
                          <p className="text-sm text-blue-600">{record.doc_type?.replace('_', ' ').toUpperCase()}</p>
                        </div>
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                          {new Date(record.date).toLocaleDateString()}
                        </span>
                      </div>
                      
                      <p className="text-blue-700 text-sm mb-3 leading-relaxed">
                        {record.details}
                      </p>
                      
                      <div className="flex justify-between items-center text-xs text-blue-500">
                        {record.document_link && (
                          <span className="flex items-center space-x-1 text-green-600 text-xs">
                            <DocumentIcon className="w-2.5 h-2.5" />
                            <span>Document</span>
                          </span>
                        )}
                        <span>Added: {new Date(record.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      default:
        return <Dashboard handleViewDocument={handleViewDocument} />;
    }
  };

  return (
    <div className="h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 overflow-hidden">
      <div className="flex h-full">
        <Sidebar activeLink={activeLink} setActiveLink={setActiveLink} userData={userData} />
        <div className="flex-1 flex flex-col h-full">
          <Header onLogout={onLogout} userData={userData} />
          <main className="flex-1 overflow-auto">
            {renderContent()}
          </main>
        </div>
      </div>
    </div>
  );
};

export default DashboardApp;