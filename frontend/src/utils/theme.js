/* =========================================================
   GLOBAL THEME MANAGER
   Default Theme: LIGHT
========================================================= */

export const ThemeManager = {

  /* =======================================================
     GET THEME
     Default = LIGHT
  ======================================================= */

  getTheme() {
    return localStorage.getItem("darkmail_theme") || "light";
  },


  /* =======================================================
     SET THEME
  ======================================================= */

  setTheme(theme) {

    localStorage.setItem("darkmail_theme", theme);

    ThemeManager.applyTheme(theme);
  },


  /* =======================================================
     APPLY THEME
  ======================================================= */

  applyTheme(theme) {

    const root = document.documentElement;
    const body = document.body;


    /* =====================================================
       DARK MODE
    ===================================================== */

    if (theme === "dark") {

      root.classList.add("dark");

      body.classList.remove("light-mode");

    }


    /* =====================================================
       LIGHT MODE
    ===================================================== */

    else if (theme === "light") {

      root.classList.remove("dark");

      body.classList.add("light-mode");

    }


    /* =====================================================
       AUTO MODE
       Follow system preference
    ===================================================== */

    else if (theme === "auto") {

      const systemDark =
        window.matchMedia(
          "(prefers-color-scheme: dark)"
        ).matches;


      if (systemDark) {

        root.classList.add("dark");

        body.classList.remove("light-mode");

      }

      else {

        root.classList.remove("dark");

        body.classList.add("light-mode");

      }
    }


    /* =====================================================
       INVALID / UNKNOWN VALUE
       Fall back to LIGHT
    ===================================================== */

    else {

      root.classList.remove("dark");

      body.classList.add("light-mode");

      localStorage.setItem(
        "darkmail_theme",
        "light"
      );
    }
  },


  /* =======================================================
     INITIALIZE THEME
     Call this when application starts
  ======================================================= */

  initialize() {

    const theme = ThemeManager.getTheme();

    ThemeManager.applyTheme(theme);
  }
};
