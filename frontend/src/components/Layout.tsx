import React from 'react';
import { Outlet } from 'react-router-dom';
import NavBar from './NavBar';
import Sidebar from './Sidebar';
import * as AuthService from '../services/AuthService';

const Layout: React.FC = () => {
  const isAuthenticated = AuthService.isAuthenticated();

  return (
    <>
      <NavBar />
      {isAuthenticated ? (
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
