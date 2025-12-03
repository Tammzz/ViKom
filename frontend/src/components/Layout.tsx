import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import NavBar from './NavBar';
import Sidebar from './Sidebar';
import * as AuthService from '../services/AuthService';

const Layout: React.FC = () => {
  const isAuthenticated = AuthService.isAuthenticated();
  const location = useLocation();
  
  // routes where sidebar should not be displayed
  const noSidebarRoutes = ['/login', '/register', '/'];
  const showSidebar = isAuthenticated && !noSidebarRoutes.includes(location.pathname);

  return (
    <>
      <NavBar />
      {showSidebar ? (
        <div className="d-flex">
          <Sidebar />
          <div className="content-with-sidebar flex-grow-1">
            <Outlet />
          </div>
        </div>
      ) : (
        <Outlet />
      )}
    </>
  );
};

export default Layout;
