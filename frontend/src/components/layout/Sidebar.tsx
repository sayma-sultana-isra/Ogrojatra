import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  User,
  Briefcase,
  FileText,
  Brain,
  BookOpen,
  Mic,
  Users,
  Wrench,
  Bell,
  HelpCircle,
  PlusCircle,
  List,
  Search,
  BarChart3,
  Calendar,
  MessageSquare,
  Share2,
  Settings,
  Shield,
  UserCheck,
  Target,
  MapPin,
  Rocket,
  Lightbulb,
  CalendarDays,
  Heart,
  Upload,
  UserPlus,
  Home,
  Radio,
  Building,
  GraduationCap
} from 'lucide-react';

const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();

  const getMenuItems = () => {
    switch (user?.role) {
      case 'student':
        return [
          { icon: MessageSquare, label: 'Feed', path: '/dashboard' },
          { icon: User, label: 'My Profile', path: '/profile' },
          { icon: UserPlus, label: 'Network', path: '/network' },
          { icon: Briefcase, label: 'Job Search', path: '/jobs/search' },
<<<<<<< HEAD
          { icon: FileText, label: 'My Applications', path: '/applications' },
          { icon: Building, label: 'Company Applications', path: '/company-applications' },
          { icon: CalendarDays, label: 'Events', path: '/events' },
          { icon: Building, label: 'Companies', path: '/companies' },
          { icon: GraduationCap, label: 'Mentorship', path: '/mentorship/student' },
          
          { icon: MapPin, label: 'Career Roadmap', path: '/roadmap' },
            
          
          
          
          { icon: Bell, label: 'Notifications', path: '/notifications' },
          
        ];

      case 'employer':
        return [
          { icon: MessageSquare, label: 'Feed', path: '/dashboard' },
          
          
          { icon: PlusCircle, label: 'Post a Job', path: '/jobs/create' },
          { icon: List, label: 'My Job Listings', path: '/jobs/manage' },
          { icon: Users, label: 'Applicants', path: '/applications/manage' },
          { icon: CalendarDays, label: 'Events', path: '/events' },
          { icon: Building, label: 'My Companies', path: '/companies/manage' },
          { icon: Users, label: 'Company Applications', path: '/companies/applications' },
          { icon: Search, label: 'Browse Companies', path: '/companies' },
          
          
          
          { icon: Bell, label: 'Notifications', path: '/notifications' }
         
        ];

=======
          { icon: Building, label: 'Companies', path: '/companies' },
          { icon: FileText, label: 'Applications', path: '/applications' },
          { icon: CalendarDays, label: 'Events', path: '/events' },
          { icon: GraduationCap, label: 'Mentorship', path: '/mentorship/student' },
          { icon: Target, label: 'Career Roadmaps', path: '/roadmaps' }
        ];
>>>>>>> e292f5c00bf45c011f5b610d8f82558887377977
      case 'alumni':
        return [
          { icon: MessageSquare, label: 'Feed', path: '/dashboard' },
          { icon: User, label: 'My Profile', path: '/profile' },
<<<<<<< HEAD
          
          { icon: CalendarDays, label: 'Events & Meetups', path: '/events' },
          { icon: Building, label: 'Companies', path: '/companies' },
<<<<<<< HEAD
          { icon: GraduationCap, label: 'Mentorship', path: '/mentorship/alumni' },
=======
            { icon: GraduationCap, label: 'Mentorship', path: '/mentorship/alumni' },
         
>>>>>>> my-extra-files
          
          
          
          { icon: Bell, label: 'Notifications', path: '/notifications' }
          
        ];

      case 'admin':
        return [
          { icon: Home, label: 'Dashboard', path: '/dashboard' },
          { icon: Users, label: 'Manage Users', path: '/admin/users' },
          { icon: Briefcase, label: 'Manage Jobs', path: '/admin/jobs' },
<<<<<<< HEAD
          { icon: GraduationCap, label: 'Manage Mentorship', path: '/mentorship/admin' },
          { icon: CalendarDays,  label: 'Manage Events' , path: '/admin/events' },
          { icon: Target, label: 'Career Roadmaps', path: '/admin/roadmaps' }
=======
          { icon: Target, label: 'Career Roadmaps', path: '/admin/roadmaps' },
           { icon: GraduationCap, label: 'Manage Mentorship', path: '/mentorship/admin' },
             { icon: CalendarDays,  label: 'Manage Events' , path: '/admin/events' },
>>>>>>> my-extra-files
          
          
          
=======
          { icon: UserPlus, label: 'Network', path: '/network' },
          { icon: Briefcase, label: 'Job Search', path: '/jobs/search' },
          { icon: GraduationCap, label: 'Mentorship Panel', path: '/mentorship/alumni' }
        ];
      case 'employer':
        return [
            { icon: Home, label: 'Dashboard', path: '/dashboard' },
            { icon: PlusCircle, label: 'Post a Job', path: '/jobs/create' },
            { icon: List, label: 'Manage Jobs', path: '/jobs/manage' },
            { icon: Users, label: 'Applications', path: '/applications/manage' },
            { icon: Building, label: 'My Companies', path: '/companies/manage' },
            { icon: Calendar, label: 'Manage Events', path: '/events/manage' },
            { icon: User, label: 'My Profile', path: '/profile' }
        ];
      case 'admin':
        return [
          { icon: BarChart3, label: 'Dashboard', path: '/dashboard' },
          { icon: Users, label: 'Manage Users', path: '/admin/users' },
          { icon: Briefcase, label: 'Manage Jobs', path: '/admin/jobs' },
          { icon: Building, label: 'Manage Companies', path: '/admin/companies' },
          { icon: CalendarDays, label: 'Manage Events', path: '/admin/events' },
          { icon: GraduationCap, label: 'Mentorships', path: '/admin/mentorships' },
          { icon: Target, label: 'Manage Roadmaps', path: '/admin/roadmaps' }
>>>>>>> e292f5c00bf45c011f5b610d8f82558887377977
        ];

      default:
        return [];
    }
  };

  const menuItems = getMenuItems();

  return (
    <div className="w-64 bg-white shadow-sm border-r border-gray-200 h-full">
      <div className="p-6">
<<<<<<< HEAD
        <div className="flex items-center space-x-3 mb-8">
          <div className="bg-blue-600 p-2 rounded-lg">
            <Briefcase className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">JobPortal</h2>
            <p className="text-xs text-gray-500 capitalize">{user?.role} Panel</p>
          </div>
        </div>

=======
>>>>>>> e292f5c00bf45c011f5b610d8f82558887377977
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;