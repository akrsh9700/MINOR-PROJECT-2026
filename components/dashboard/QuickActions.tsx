'use client';

import Link from 'next/link';

interface QuickActionsProps {
  userRole?: string;
}

export function QuickActions({ userRole }: QuickActionsProps) {
  const getQuickActions = () => {
    switch (userRole) {
      case 'PATIENT':
        return [
          {
            title: 'Book Appointment',
            description: 'Schedule a new appointment with a doctor',
            href: '/appointments',
            icon: '📅',
            primary: true
          },
          {
            title: 'View Medical Records',
            description: 'Access your medical history',
            href: '/medical-records',
            icon: '📋'
          },
          {
            title: 'Prescriptions',
            description: 'View your current prescriptions',
            href: '/prescriptions',
            icon: '💊'
          },
          {
            title: 'Billing',
            description: 'Check your bills and payments',
            href: '/billing',
            icon: '💰'
          }
        ];

      case 'DOCTOR':
        return [
          {
            title: 'Today\'s Appointments',
            description: 'View and manage your appointments',
            href: '/appointments',
            icon: '📅',
            primary: true
          },
          {
            title: 'Patient Records',
            description: 'Access patient medical records',
            href: '/medical-records',
            icon: '📋'
          },
          {
            title: 'Write Prescription',
            description: 'Create new prescriptions',
            href: '/prescriptions',
            icon: '💊'
          },
          {
            title: 'Patients',
            description: 'View your patient list',
            href: '/patients',
            icon: '👥'
          }
        ];

      case 'ADMIN':
        return [
          {
            title: 'Manage Appointments',
            description: 'Oversee all appointments',
            href: '/appointments',
            icon: '📅',
            primary: true
          },
          {
            title: 'Doctor Management',
            description: 'Add and manage doctors',
            href: '/doctors',
            icon: '👨‍⚕️'
          },
          {
            title: 'Patient Records',
            description: 'Access all patient records',
            href: '/patients',
            icon: '👥'
          },
          {
            title: 'Departments',
            description: 'Manage hospital departments',
            href: '/departments',
            icon: '🏥'
          },
          {
            title: 'Billing Overview',
            description: 'Monitor billing and payments',
            href: '/billing',
            icon: '💰'
          }
        ];

      default:
        return [];
    }
  };

  const actions = getQuickActions();

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
      <div className="space-y-3">
        {actions.map((action, index) => (
          <Link key={index} href={action.href}>
            <div className={`
              p-4 rounded-lg border transition-colors cursor-pointer
              ${action.primary 
                ? 'border-blue-200 bg-blue-50 hover:bg-blue-100' 
                : 'border-gray-200 hover:bg-gray-50'
              }
            `}>
              <div className="flex items-start space-x-3">
                <span className="text-2xl">{action.icon}</span>
                <div className="flex-1 min-w-0">
                  <h4 className={`
                    text-sm font-medium
                    ${action.primary ? 'text-blue-900' : 'text-gray-900'}
                  `}>
                    {action.title}
                  </h4>
                  <p className={`
                    text-sm mt-1
                    ${action.primary ? 'text-blue-700' : 'text-gray-600'}
                  `}>
                    {action.description}
                  </p>
                </div>
                <svg 
                  className={`
                    w-4 h-4 flex-shrink-0
                    ${action.primary ? 'text-blue-500' : 'text-gray-400'}
                  `} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M9 5l7 7-7 7" 
                  />
                </svg>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}