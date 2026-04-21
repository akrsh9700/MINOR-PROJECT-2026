import { SignInForm } from '@/components/forms/SignInForm'

export default function SignInPage() {
  return (
    // Background ko pure white rakha hai aur flex layout use kiya hai
    <div className="min-h-screen bg-white flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        {/* Hospital Emoji aur Heading */}
        <div className="flex justify-center items-center gap-2">
           <span className="text-4xl text-red-600">🏥</span> 
           <h1 className="text-2xl font-bold text-gray-900 tracking-tight">LIFE-CARE PORTAL</h1>
        </div>
        
        <p className="mt-2 text-sm text-gray-600">
          Advanced Healthcare Management System ❤️
        </p>
      </div>

      {/* Form Card: Border ko light red (red-100) kiya hai taaki wo hospital vibe de */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl border-t-4 border-red-600 rounded-lg sm:px-10">
          <div className="mb-6 text-center">
             <p className="text-gray-500 text-xs uppercase font-semibold">Please Sign In to Continue</p>
          </div>
          
          <SignInForm />
          
          <div className="mt-6 text-center">
            <span className="text-xs text-gray-400">24/7 Medical Support 🩺</span>
          </div>
        </div>
      </div>

    </div>
  )
}
