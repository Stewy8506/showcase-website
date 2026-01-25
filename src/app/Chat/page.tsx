'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, MapPin, MessageCircle, User, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  doctorType?: string;
}

const MedicalChatbot: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! I\'m your medical assistant. Please describe your symptoms, and I\'ll suggest the type of doctor you should visit and help you find nearby specialists.'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  }, []);

  const analyzeSymptoms = async (symptoms: string): Promise<string> => {
    try {
        const res = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symptoms }),
        });

        const data = await res.json();
        return data.result;
    } catch {
        return "Unable to analyze symptoms right now.";
    }
  };

  const extractDoctorType = (response: string): string => {
    const lines = response.split('\n');
    const firstLine = lines[0].trim();
    
    // Extract doctor type from various formats
    const match = firstLine.match(/(?:recommend|suggest|visit|see)\s+(?:a\s+)?([A-Z][a-zA-Z\s]+?)(?:\.|,|$)/i);
    if (match) {
      return match[1].trim();
    }
    
    // Fallback: look for common doctor types
    const doctorTypes = ['General Practitioner', 'Cardiologist', 'Dermatologist', 'Neurologist', 
                         'Orthopedist', 'Pediatrician', 'Psychiatrist', 'Ophthalmologist',
                         'ENT Specialist', 'Gastroenterologist', 'Pulmonologist', 'Urologist'];
    
    for (const type of doctorTypes) {
      if (response.toLowerCase().includes(type.toLowerCase())) {
        return type;
      }
    }
    
    return 'Doctor';
  };

  const getGoogleMapsLink = (doctorType: string) => {
    if (userLocation) {
      const query = encodeURIComponent(`${doctorType} near me`);
      return `https://www.google.com/maps/search/${query}/@${userLocation.lat},${userLocation.lng},14z`;
    } else {
      const query = encodeURIComponent(doctorType);
      return `https://www.google.com/maps/search/${query}`;
    }
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    const response = await analyzeSymptoms(input);
    const doctorType = extractDoctorType(response);

    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: response,
      doctorType: doctorType
    };

    setMessages(prev => [...prev, assistantMessage]);
    setLoading(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-teal-50 via-white to-amber-50">
      {/* Back to Dashboard Button */}
      <Link
        href="/Dashboard"
        className="absolute top-8 left-8 flex items-center gap-2 text-[#0f172a] hover:text-primary/90  transition-colors group z-50"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Back to Dashboard
      </Link>
      {/* Sidebar */}
      <div className="hidden lg:flex lg:flex-col w-80 bg-white border-r border-gray-200 shadow-sm pt-16">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center">
              <MessageCircle className="w-6 h-6 text-teal-600" />
            </div>
            <div>
              <h2 className="font-bold text-gray-900">Symptoms AI</h2>
              <p className="text-xs text-gray-500">Medical Assistant</p>
            </div>
          </div>
          <button className="w-full py-3 px-4 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition-colors font-medium text-sm flex items-center justify-center gap-2">
            <MessageCircle className="w-4 h-4" />
            New Consultation
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">How It Works</h3>
          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-teal-600 font-bold text-sm">1</span>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 text-sm mb-1">Describe Symptoms</h4>
                <p className="text-xs text-gray-600">Tell us about what you're experiencing</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-amber-600 font-bold text-sm">2</span>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 text-sm mb-1">Get Recommendations</h4>
                <p className="text-xs text-gray-600">AI suggests the right specialist</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-green-600 font-bold text-sm">3</span>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 text-sm mb-1">Find Nearby Doctors</h4>
                <p className="text-xs text-gray-600">Locate specialists in your area</p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-100">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <p className="text-xs text-amber-800 leading-relaxed">
              <strong>Disclaimer:</strong> This AI assistant provides suggestions only. Always consult with a qualified healthcare professional for medical advice.
            </p>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white shadow-sm px-6 py-4 border-b border-gray-100">
          <div className="flex items-center justify-between max-w-5xl mx-auto">
            <div className="flex items-center gap-3">
              <button className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <ArrowLeft className="w-5 h-5 text-gray-700" />
              </button>
              <div className="lg:hidden flex items-center gap-2">
                <MessageCircle className="w-7 h-7 text-teal-600" />
                <div>
                  <h1 className="text-lg font-semibold text-gray-900">Symptoms AI</h1>
                  <p className="text-xs text-gray-500">Get personalized doctor recommendations</p>
                </div>
              </div>
              <div className="hidden lg:block">
                <h1 className="text-xl font-semibold text-gray-900">Medical Consultation</h1>
                <p className="text-sm text-gray-500">Powered by AI • Confidential & Secure</p>
              </div>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex gap-4 max-w-2xl ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                    message.role === 'user' ? 'bg-teal-600' : 'bg-white shadow-md border border-gray-200'
                  }`}>
                    {message.role === 'user' ? (
                      <User className="w-5 h-5 text-white" />
                    ) : (
                      <MessageCircle className="w-5 h-5 text-teal-600" />
                    )}
                  </div>
                  <div className={`rounded-2xl px-5 py-4 ${
                    message.role === 'user' 
                      ? 'bg-teal-600 text-white' 
                      : 'bg-white shadow-sm border border-gray-200 text-gray-800'
                  }`}>
                    {message.role === 'assistant' ? (
                      (() => {
                        const lines = message.content.split('\n');
                        const firstLine = lines[0];
                        const lastLine = lines.length > 1 ? lines[lines.length - 1] : '';
                        const middleLines = lines.slice(1, lines.length > 1 ? -1 : undefined);
                        // Do not bold the first line for the initial welcome message
                        const isWelcome = message.id === '1' && message.role === 'assistant';
                        return (
                          <div className="whitespace-pre-wrap text-sm leading-relaxed">
                            {isWelcome ? (
                              <>{firstLine}</>
                            ) : (
                              <span className="font-bold">{firstLine}</span>
                            )}
                            {middleLines.length > 0 && (
                              <><br />{middleLines.join('\n')}<br /></>
                            )}
                            {lastLine && lastLine !== firstLine && (
                              <span className="block italic text-xs mt-2">{lastLine}</span>
                            )}
                          </div>
                        );
                      })()
                    ) : (
                      <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</p>
                    )}
                    {message.doctorType && message.role === 'assistant' && (
                      <a
                        href={getGoogleMapsLink(message.doctorType)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 bg-amber-500 text-white rounded-xl hover:bg-amber-600 transition-colors text-sm font-medium shadow-sm"
                      >
                        <MapPin className="w-4 h-4" />
                        Find Nearby {message.doctorType}s
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="flex gap-4 max-w-2xl">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-white shadow-md border border-gray-200 flex items-center justify-center">
                    <MessageCircle className="w-5 h-5 text-teal-600" />
                  </div>
                  <div className="bg-white shadow-sm border border-gray-200 rounded-2xl px-5 py-4">
                    <div className="flex gap-1.5">
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input */}
        <div className="bg-white border-t border-gray-200 p-6 shadow-lg">
          <div className="max-w-4xl mx-auto flex gap-4">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Describe your symptoms in detail..."
              disabled={loading}
              className="flex-1 px-5 py-4 border text-black border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none disabled:bg-gray-100 text-sm"
            />
            <button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className="px-8 py-4 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm font-medium"
            >
              <Send className="w-5 h-5" />
              <span className="hidden sm:inline">Send</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MedicalChatbot;