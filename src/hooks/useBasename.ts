import { useContext } from "react";
import { UNSAFE_NavigationContext } from "react-router";

export default function useBasename(): string {
    const navigationContext = useContext(UNSAFE_NavigationContext);
    return navigationContext.basename.endsWith('/') ? navigationContext.basename.slice(0, -1) : navigationContext.basename;
}