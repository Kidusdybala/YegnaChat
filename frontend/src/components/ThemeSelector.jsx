import { useState } from 'react';
import { SunIcon, MoonIcon, PaletteIcon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { THEMES } from '../constants';

const ThemeSelector = () => {
  const { theme, changeTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => setIsOpen(!isOpen);

  const handleThemeChange = (newTheme) => {
    changeTheme(newTheme);
    setIsOpen(false);
  };

  return (
    <div className="dropdown dropdown-end">
      <button 
        className="btn btn-ghost btn-circle" 
        onClick={toggleDropdown}
        aria-label="Change theme"
      >
        {theme === 'dark' ? (
          <MoonIcon className="h-6 w-6 text-base-content opacity-70" />
        ) : theme === 'light' ? (
          <SunIcon className="h-6 w-6 text-base-content opacity-70" />
        ) : (
          <PaletteIcon className="h-6 w-6 text-base-content opacity-70" />
        )}
      </button>
      
      {isOpen && (
        <ul className="dropdown-content z-[1] menu p-2 shadow bg-base-200 rounded-box w-52 mt-4">
          {THEMES.map((themeOption) => (
            <li key={themeOption.name}>
              <button 
                onClick={() => handleThemeChange(themeOption.name)}
                className={`flex items-center gap-2 ${theme === themeOption.name ? 'active' : ''}`}
              >
                <div className="flex gap-1">
                  {themeOption.colors.slice(0, 3).map((color, index) => (
                    <div 
                      key={index}
                      className="w-4 h-4 rounded-full border border-base-content/20"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                <span>{themeOption.label}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ThemeSelector;