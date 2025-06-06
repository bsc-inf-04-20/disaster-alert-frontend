"use client"

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { LogOut, Menu, Map, Settings, FileClock, Book, UserCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useState } from 'react';
import AppDrawer from './mobileLayout';

export default function AppLayout({ children }: { children: React.ReactNode }) {

  const user = window.localStorage.getItem('user');
  const userData = user ? JSON.parse(user) : null;

  const pathname = usePathname();
  const role = userData?.userRole.id || 2; // Default to 0 if userData is null or role is not present
  const isLoginPage = pathname.startsWith('/login');
  const isRegistrationPage = pathname.startsWith('/registration');
  const shouldHideNav = isLoginPage || isRegistrationPage;
  const [open, setOpen] = useState(false);
  const [isMobileNavVisible, setIsMobileNavVisible] = useState(false);

  const navItems = [
    { role: 1, items: [
      { title: "Profile", href: "/profile", icon: UserCircle },
      { title: "Home", href: "/home", icon: Map },
      { title: "Admin's panel", href: "/admin-page", icon: Settings },
      { title: "History", href: "/history", icon: FileClock },
      { title: "Educational Modules", href: "/educational-modules", icon: Book },
      { title: "Logout", href: "/login", icon: LogOut }
    ]},
    { role: 2, items: [
      { title: "Profile", href: "/profile", icon: UserCircle },
      { title: "Home", href: "/home", icon: Map },
      { title: "History", href: "/history", icon: FileClock },
      { title: "Educational Modules", href: "/educational-modules", icon: Book },
      { title: "Logout", href: "/login", icon: LogOut }
    ]}
  ];

  const filteredNavItems = navItems.find(nav => nav.role === role)?.items || [];

  // Toggle mobile nav visibility
  const toggleMobileNav = () => {
    setIsMobileNavVisible(!isMobileNavVisible);
  };

  const NavigationItems = () => (
    <div className="space-y-1">
      {filteredNavItems.map((item: any) => {
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={(e) => {
              if (item.onClick) {
                e.preventDefault();
                item.onClick();
              }
              setOpen(false);
              setIsMobileNavVisible(false);
            }}
            className={`flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors ${
              pathname === item.href
                ? 'bg-gray-100 text-gray-900 font-medium mr-0'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <div className="flex items-center">
              <Icon className="h-5 w-5 mr-3" />
              {item.title}
            </div>
            {item.badge && (
              <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                {item.badge}
              </span>
            )}
          </Link>
        );
      })}
    </div>
  );

  return (
    <div className="flex h-screen">
      {!shouldHideNav && (
        <>
          {/* Desktop Sidebar */}
          <aside className="hidden md:block w-64 border-r bg-white print:hidden">
            <div className="h-full px-3 py-4 flex flex-col">
              <h1 className="text-center font-extrabold text-2xl m-0 p-2 text-gray-800">Disaster Alert</h1>
              <nav className="mt-6 flex-1">
                <NavigationItems />
              </nav>
            </div>
          </aside>

          {/* Mobile Header */}
          <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b px-4 flex items-center z-10 print:hidden">
            <Button 
              variant="ghost" 
              size="icon" 
              className="lg:hidden"
              onClick={toggleMobileNav}
            >
              <Menu className="h-6 w-6" />
            </Button>
            <h1 className="ml-4 font-extrabold text-xl text-gray-800">Disaster Alert</h1>
          </div>

          {/* Mobile Navigation Drawer using createPortal */}
          <AppDrawer isOpen={isMobileNavVisible}>
            <div className="h-full px-3 py-4 flex flex-col">
              <div className="flex justify-between items-center">
                <h1 className="font-extrabold text-2xl m-0 p-2 text-gray-800">Disaster Alert</h1>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={toggleMobileNav}
                >
                  <LogOut className="h-6 w-6" />
                </Button>
              </div>
              <nav className="mt-6 flex-1">
                <NavigationItems />
              </nav>
            </div>
          </AppDrawer>
        </>
      )}

      {/* Main content */}
      <main className={`${shouldHideNav ? 'w-full' : 'flex-1'} ${!shouldHideNav ? 'md:pt-0 pt-16' : ''} overflow-auto bg-gray-50 print:w-full print:m-0 print:p-0 print:bg-white`}>
        {children}
      </main>
    </div>
  );
}