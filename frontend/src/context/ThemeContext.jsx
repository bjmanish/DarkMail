import {
    createContext,
    useContext,
    useEffect,
    useState
} from "react";

// ==========================================
// THEME CONTEXT
// ==========================================

const ThemeContext = createContext(null);

// ==========================================
// STORAGE KEY
// ==========================================

const STORAGE_KEY = "darkmail_theme";

// ==========================================
// DEFAULT THEME
// ==========================================

const DEFAULT_THEME = "light";

// ==========================================
// THEME PROVIDER
// ==========================================

export const ThemeProvider = ({ children }) => {

    // ==========================================
    // INITIAL THEME
    // ==========================================

    const [theme, setThemeState] = useState(() => {

        try {

            const savedTheme =
                localStorage.getItem(STORAGE_KEY);

            if (
                savedTheme === "dark" ||
                savedTheme === "light"
            ) {
                return savedTheme;
            }

        } catch (error) {

            console.error(
                "Unable to read saved theme:",
                error
            );
        }

        return DEFAULT_THEME;
    });

    // ==========================================
    // APPLY THEME TO HTML
    // ==========================================

    useEffect(() => {

        const root =
            document.documentElement;

        // Remove previous theme
        root.classList.remove("light");
        root.classList.remove("dark");

        // Apply current theme
        root.classList.add(theme);

        // Tailwind / browser color scheme
        root.style.colorScheme = theme;

        // Save theme
        try {

            localStorage.setItem(
                STORAGE_KEY,
                theme
            );

        } catch (error) {

            console.error(
                "Unable to save theme:",
                error
            );
        }

    }, [theme]);

    // ==========================================
    // SET THEME
    // ==========================================

    const setTheme = (newTheme) => {

        if (
            newTheme !== "light" &&
            newTheme !== "dark"
        ) {

            console.warn(
                `Invalid theme: ${newTheme}`
            );

            return;
        }

        setThemeState(newTheme);
    };

    // ==========================================
    // TOGGLE THEME
    // ==========================================

    const toggleTheme = () => {

        setThemeState((currentTheme) => {

            if (currentTheme === "dark") {
                return "light";
            }

            return "dark";
        });
    };

    // ==========================================
    // LIGHT MODE
    // ==========================================

    const enableLightMode = () => {

        setTheme("light");
    };

    // ==========================================
    // DARK MODE
    // ==========================================

    const enableDarkMode = () => {

        setTheme("dark");
    };

    // ==========================================
    // CONTEXT VALUE
    // ==========================================

    const contextValue = {

        // Current theme
        theme,

        // Boolean helpers
        isDark: theme === "dark",
        isLight: theme === "light",

        // Theme methods
        setTheme,
        toggleTheme,

        // Explicit methods
        enableLightMode,
        enableDarkMode
    };

    // ==========================================
    // PROVIDER
    // ==========================================

    return (
        <ThemeContext.Provider
            value={contextValue}
        >
            {children}
        </ThemeContext.Provider>
    );
};

// ==========================================
// USE THEME HOOK
// ==========================================

export const useTheme = () => {

    const context =
        useContext(ThemeContext);

    if (!context) {

        throw new Error(
            "useTheme must be used inside ThemeProvider"
        );
    }

    return context;
};

// ==========================================
// DEFAULT EXPORT
// ==========================================

export default ThemeContext;