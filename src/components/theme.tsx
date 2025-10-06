import { useTheme } from "next-themes";
import styles from "../styles/components.module.css";
import React, { useEffect, useState } from "react";
import Dark from "../components/svgs/dark";
import Light from "../components/svgs/light";

function Theme() {
  
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  const toggleTheme = () => {
    setTheme(resolvedTheme === "light" ? "dark" : "light");
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <button
      onClick={toggleTheme}
      aria-label={resolvedTheme === "light" ? "Ativar tema escuro" : "Ativar tema claro"}
      style={{ cursor: "pointer" }}
      className={styles.theme_button}
    >
      {resolvedTheme === "light" ? (
        <Dark/>
      ) : (
        <Light/>
      )}
    </button>
  );
}

export default Theme;
