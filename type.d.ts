/// <reference types="@heyputer/puter.js" />

export interface AuthState {
    isSignedIn: boolean;
    userName: string|null ,
    userId: string | null,
}

type AuthContext = {
    isSignedIn: boolean;
    userName: string|null ,
    userId: string | null,
    refreshAuth: () => Promise<boolean>,
    signIn: () => Promise<boolean>,
    signOut: () => Promise<boolean>,
}

declare global {
    var puter: Puter;
}