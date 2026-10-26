"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { Camera, PlusCircle, ShieldCheck, LogOut, LogIn, UserPlus } from "lucide-react";

export function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <header className="navbar">
      <div className="container nav-inner">
        <Link href="/" className="nav-brand">
          <div className="nav-brand-icon">
            <Camera size={22} color="#fff" />
          </div>
          <span>Travel Journal</span>
        </Link>

        <nav className="nav-links">
          {user ? (
            <>
              <Link
                href="/photos"
                className={`nav-link ${isActive("/photos") ? "active" : ""}`}
              >
                <Camera size={18} />
                <span>My Photos</span>
              </Link>

              <Link
                href="/photos/new"
                className={`nav-link ${isActive("/photos/new") ? "active" : ""}`}
              >
                <PlusCircle size={18} />
                <span>Add Photo</span>
              </Link>

              <Link
                href="/security"
                className={`nav-link ${isActive("/security") ? "active" : ""}`}
              >
                <ShieldCheck size={18} />
                <span>2FA Security</span>
              </Link>

              <div className="nav-user">
                <div className="user-badge" title={user.email}>
                  <div className="avatar-circle">
                    {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                  </div>
                  <span>{user.name}</span>
                </div>

                <button
                  onClick={logout}
                  className="btn btn-secondary btn-sm"
                  title="Logout"
                >
                  <LogOut size={16} />
                  <span>Logout</span>
                </button>
              </div>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className={`nav-link ${isActive("/login") ? "active" : ""}`}
              >
                <LogIn size={18} />
                <span>Sign In</span>
              </Link>

              <Link href="/register" className="btn btn-primary btn-sm">
                <UserPlus size={16} />
                <span>Get Started</span>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
