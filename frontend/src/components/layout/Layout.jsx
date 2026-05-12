import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

const Layout = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow pt-24">
        {/* The pt-24 accounts for the fixed Navbar height */}
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
