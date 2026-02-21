"use client";

import { Provider } from "react-redux";
import { store } from "@/redux/store"; // adjust path

export function Providers({ children }: { children: React.ReactNode }) {
    return <Provider store={store}>{children}</Provider>;
}
