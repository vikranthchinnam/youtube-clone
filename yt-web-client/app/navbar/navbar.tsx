'use client'
import Image from "next/image";
import styles from "./navbar.module.css"
import Link from "next/link";
import SignIn from "./sign-in";
import { onAuthStateChangedHelper } from "../firebase/firebase";
import { useState, useEffect } from "react";
import { User } from "firebase/auth";

export default function Navbar(){
    // Init user state
    const [user, setUser] = useState<User | null>(null);
    
    useEffect(() => {
        const unsubscribe = onAuthStateChangedHelper((user) => {
            setUser(user);
        });

        // Cleanup subscription on unmount
        return () => unsubscribe();
    });
    return(
        <nav className={styles.nav}>
            <Link href="/">
                <Image width={90} height={20} src="/youtube-logo.svg" alt="YouTube Logo"/>

            </Link>
            <SignIn user={user}/>
        </nav>
    );
}