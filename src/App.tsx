import React, { useState } from 'react';
import { Upload, FileText, AlertCircle, Mail, Loader2, CheckCircle2, ArrowRight, Zap, Lock, Clock, Brain, Cpu } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import toast, { Toaster } from 'react-hot-toast';

const ALLOWED_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp'
];

const ALLOWED_DOCUMENTS = [
  { type: 'drivers license', description: 'Government-issued driver\'s license' },
  { type: 'passport', description: 'Valid passport document' },
  { type: 'health card Canada', description: 'Canadian health insurance card' },
  { type: 'transcripts', description: 'Academic transcripts and records' },
  { type: 'degrees', description: 'Educational degree certificates' },
  { type: 'resume', description: 'Professional resume/CV' }
];

const WHY_DOCAI = [
  {
    icon: Brain,
    title: 'Smart Processing',
    description: 'Advanced AI models that understand your documents like a human would'
  },
  {
    icon: Lock,
    title: 'Unmatched Security',
    description: 'Your data is protected with military-grade encryption'
  },
  {
    icon: Zap,
    title: 'Lightning Fast',
    description: 'Get results in seconds, not hours or days'
  },
  {
    icon: Clock,
    title: 'Always Available',
    description: 'Process your documents 24/7, whenever you need'
  }
];

const PROCESS_STEPS = [
  {
    title: 'Upload Documents',
    description: 'Drag & drop or select your documents'
  },
  {
    title: 'Select Document Types',
    description: 'Choose the type for each uploaded document'
  },
  {
    icon: Mail,
    title: 'Add Email (Optional)',
    description: 'Receive results in your inbox'
  },
  {
    title: 'Process & Review',
    description: 'View extracted information instantly'
  }
];

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const MAX_FILES = 5;
const MAKE_WEBHOOK_URL = 'https://hook.us2.make.com/on235aqcm56pzowiirpnanvjme36rvg6';

function App() {
  const [files, setFiles] = useState<File[]>([]);
  const [documentTypes, setDocumentTypes] = useState<string[]>([]);
  const [emailAddress, setEmailAddress] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const onDrop = (acceptedFiles: File[]) => {
    if (files.length + acceptedFiles.length > MAX_FILES) {
      toast.error(`Maximum ${MAX_FILES} files allowed`);
      return;
    }

    const validFiles = acceptedFiles.filter(file => {
      if (!ALLOWED_TYPES.includes(file.type)) {
        toast.error(`${file.name} is not a valid file type`);
        return false;
      }
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`${file.name} exceeds 2MB size limit`);
        return false;
      }
      return true;
    });

    if (validFiles.length > 0) {
      toast.success(`Successfully uploaded ${validFiles.length} file(s)`);
    }

    setFiles(prev => [...prev, ...validFiles]);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.jpg', '.jpeg', '.png', '.webp']
    },
    maxSize: MAX_FILE_SIZE
  });

  const handleDocumentTypeChange = (index: number, value: string) => {
    const newTypes = [...documentTypes];
    newTypes[index] = value;
    setDocumentTypes(newTypes);
    toast.success('Document type updated');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (files.length === 0) {
      toast.error('Please upload at least one document');
      return;
    }

    if (files.length !== documentTypes.length || documentTypes.some(type => !type)) {
      toast.error('Please select document type for all files');
      return;
    }

    setIsProcessing(true);
    setPreviewData(null);
    
    try {
      // Create an array of promises for reading files
      const fileReadPromises = files.map(file => {
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            // Get base64 string without the prefix
            const base64String = (reader.result as string)
              .replace('data:application/pdf;base64,', '')
              .replace('data:image/jpeg;base64,', '')
              .replace('data:image/png;base64,', '')
              .replace('data:image/webp;base64,', '');
            resolve({
              name: file.name,
              type: file.type,
              content: base64String
            });
          };
          reader.readAsDataURL(file);
        });
      });

      // Wait for all files to be read
      const fileContents = await Promise.all(fileReadPromises);

      // Prepare the payload
      const payload = {
        files: fileContents.map((file: any, index) => ({
          name: file.name,
          type: file.type,
          content: file.content,
          documentType: documentTypes[index]
        })),
        email: emailAddress || undefined
      };

      // Send the request to Make.com
      const response = await fetch(MAKE_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error('Failed to process documents');
      }

      const data = await response.json();
      setPreviewData(data);
      toast.success('Documents processed successfully!');
    } catch (error) {
      toast.error('Error processing documents');
      console.error('Processing error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
    setDocumentTypes(documentTypes.filter((_, i) => i !== index));
    toast.success('File removed');
  };

  const currentStep = files.length === 0 ? 0 : 
    documentTypes.length !== files.length ? 1 :
    isProcessing ? 3 : 2;

  return (
    <div className="min-h-screen bg-brand-dark text-brand-text">
      <Toaster position="top-right" />
      
      {/* Navigation Bar */}
      <nav className="bg-brand-navy/95 backdrop-blur-sm fixed w-full z-50 border-b border-gray-700">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Cpu className="w-8 h-8 text-brand-logo" />
              <span className="text-2xl font-bold text-brand-logo">DocAI</span>
            </div>
            <div className="flex space-x-4">
              <button 
                onClick={() => scrollToSection('why-docai')}
                className="px-4 py-2 text-sm font-medium hover:text-brand-logo transition-colors"
              >
                Why DocAI?
              </button>
              <button 
                onClick={() => scrollToSection('how-it-works')}
                className="px-4 py-2 text-sm font-medium hover:text-brand-logo transition-colors"
              >
                How It Works
              </button>
            </div>
          </div>
        </div>
      </nav>
      
      {/* Header */}
      <header className="bg-brand-navy py-20 mt-16">
        <div className="container mx-auto px-4">
          <h1 className="text-5xl font-bold mb-6">Document Field Extractor</h1>
          <p className="text-2xl text-brand-text-secondary max-w-3xl">
            Extract important information from your documents quickly and securely using advanced AI technology
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Why DocAI */}
        <section id="why-docai" className="mb-16 scroll-mt-24">
          <h2 className="text-3xl font-bold mb-8">Why Choose DocAI?</h2>
          <div className="grid md:grid-cols-4 gap-6">
            {WHY_DOCAI.map((feature, index) => (
              <div key={index} className="bg-brand-gray rounded-lg p-6 border border-gray-600">
                <feature.icon className="w-10 h-10 text-brand-red mb-4" />
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-brand-text-secondary">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="mb-12 scroll-mt-24">
          <h2 className="text-3xl font-bold mb-8">How It Works</h2>
          <div className="grid md:grid-cols-4 gap-4">
            {PROCESS_STEPS.map((step, index) => (
              <div key={index} className={`relative flex items-start gap-4 p-6 rounded-lg ${currentStep >= index ? 'bg-brand-gray' : 'bg-brand-navy opacity-50'}`}>
                <div className="flex-shrink-0">
                  {currentStep > index ? (
                    <CheckCircle2 className="w-8 h-8 text-green-500" />
                  ) : currentStep === index ? (
                    <div className="w-8 h-8 rounded-full bg-brand-red text-white flex items-center justify-center font-bold">
                      {index + 1}
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gray-600 text-white flex items-center justify-center font-bold">
                      {index + 1}
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="font-semibold mb-1">{step.title}</h3>
                  <p className="text-sm text-brand-text-secondary">{step.description}</p>
                </div>
                {index < PROCESS_STEPS.length - 1 && (
                  <ArrowRight className="absolute right-0 top-1/2 -translate-y-1/2 text-brand-text-secondary" />
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Accepted Documents */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Accepted Documents</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {ALLOWED_DOCUMENTS.map((doc, index) => (
              <div key={index} className="bg-brand-gray rounded-lg p-4 text-center">
                <FileText className="w-6 h-6 text-brand-red mx-auto mb-2" />
                <h3 className="text-sm font-medium capitalize">{doc.type}</h3>
              </div>
            ))}
          </div>
        </section>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Upload Form */}
          <form onSubmit={handleSubmit} className="bg-brand-gray rounded-lg p-6">
            <div {...getRootProps()} className={`border-2 border-dashed rounded-lg p-8 mb-6 text-center cursor-pointer transition ${isDragActive ? 'border-brand-red bg-brand-navy' : 'border-gray-600'}`}>
              <input {...getInputProps()} />
              <Upload className="w-12 h-12 mx-auto mb-4 text-brand-red" />
              <p className="text-lg mb-2">Drag & drop files here, or click to select files</p>
              <p className="text-sm text-brand-text-secondary">PDF or images up to 2MB each (max 5 files)</p>
            </div>

            {files.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-4">Uploaded Files:</h3>
                {files.map((file, index) => (
                  <div key={index} className="flex items-center gap-4 mb-4 p-4 bg-brand-navy rounded">
                    <FileText className="text-brand-red" />
                    <div className="flex-1">
                      <p className="font-medium">{file.name}</p>
                      <p className="text-sm text-brand-text-secondary">{(file.size / 1024 / 1024).toFixed(2)}MB</p>
                    </div>
                    <select
                      className="bg-brand-gray border border-gray-600 rounded px-3 py-2 text-brand-text"
                      value={documentTypes[index] || ''}
                      onChange={(e) => handleDocumentTypeChange(index, e.target.value)}
                    >
                      <option value="">Select document type</option>
                      {ALLOWED_DOCUMENTS.map(doc => (
                        <option key={doc.type} value={doc.type}>{doc.type}</option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="text-brand-red hover:text-red-400"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="mb-6">
              <label className="block mb-2">Email Address (optional)</label>
              <input
                type="email"
                className="w-full bg-brand-navy border border-gray-600 rounded px-3 py-2 text-brand-text"
                value={emailAddress}
                onChange={(e) => setEmailAddress(e.target.value)}
                placeholder="Enter your email to receive results"
              />
            </div>

            <button
              type="submit"
              disabled={isProcessing}
              className={`w-full bg-brand-red text-white py-3 px-6 rounded-lg font-semibold flex items-center justify-center
                ${isProcessing ? 'opacity-50 cursor-not-allowed' : 'hover:bg-red-600'}`}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="animate-spin mr-2" />
                  Processing...
                </>
              ) : 'Process Documents'}
            </button>
          </form>

          {/* Preview Results */}
          <div className="bg-brand-gray rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-6 pb-4 border-b border-gray-600">
              {previewData ? 'Extracted Information' : 'Preview Area'}
            </h3>
            
            {!previewData && (
              <div className="flex items-center justify-center h-64 text-brand-text-secondary">
                Processed document information will appear here
              </div>
            )}
            
            {previewData && (
              <div className="space-y-6 max-h-[600px] overflow-y-auto">
                {previewData.processedDocuments?.map((doc: any, index: number) => (
                  <div key={index} className="bg-brand-navy rounded-lg border border-gray-600 p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="text-lg font-semibold mb-1">{doc.fileName}</h4>
                        <p className="text-sm text-brand-text-secondary">{doc.documentType}</p>
                      </div>
                      <span className="text-sm bg-brand-red px-3 py-1 rounded-full">
                        {Math.round(doc.confidence * 100)}% Confidence
                      </span>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      {Object.entries(doc.extractedFields || {}).map(([field, value]) => (
                        <div key={field} className="bg-brand-gray p-4 rounded-lg">
                          <p className="text-sm text-brand-text-secondary mb-1">
                            {field.replace(/([A-Z])/g, ' $1').trim()}
                          </p>
                          <p className="font-medium">{value as string}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Privacy Notice */}
        <div className="mt-8 bg-brand-gray rounded-lg p-6">
          <div className="flex items-start gap-4">
            <AlertCircle className="text-brand-red flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold mb-2">Data Privacy Notice</h3>
              <p className="text-brand-text-secondary">Your documents are processed securely and will not be used for any analysis or training purposes. All uploaded files are automatically deleted after processing.</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-brand-navy py-6 mt-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <p className="mb-2">© {new Date().getFullYear()} gqci.ca. All rights reserved.</p>
            <p className="text-sm text-brand-text-secondary">Your data privacy and security are our top priorities.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;