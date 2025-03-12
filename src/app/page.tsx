"use client"

import { SignedIn, SignedOut, SignUpButton, UserButton , SignOutButton } from "@clerk/nextjs";

export default function Home() {
  return (
    <div>
      {/* if user is signed out show sign up button */}
      <SignedOut>
        <SignUpButton>
          <button className="bg-blue-400 hover:bg-blue-500 text-white font-bold px-4 py-3 rounded">
            Sign In 
          </button>
        </SignUpButton>
      </SignedOut>

      <UserButton/>

{/* if user is signed in show sign out button */}
      <SignedIn>
        <SignOutButton>
          <button className="bg-red-400 hover:bg-red-500 px-4 py-3 font-bold text-white rounded">
            Sign Out 
          </button>
        </SignOutButton>
      </SignedIn>
    </div>
  );
}
