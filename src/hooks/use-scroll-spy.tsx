import React, { useEffect, useState } from 'react';

/**
 * Hook untuk mendeteksi bagian (section) mana yang sedang aktif di viewport.
 * @param sectionIds Array of IDs (e.g., ['home', 'about', 'skills'])
 * @param offset Offset tambahan untuk penyesuaian (misalnya tinggi header)
 * @returns ID dari bagian yang sedang aktif
 */
export function useScrollSpy(sectionIds: string[], offset: number = 100) {
  const [activeSection, setActiveSection] = useState<string>(sectionIds[0]);

  useEffect(() => {
    const handleScroll = () => {
      let currentActive = sectionIds[0];
      
      for (const id of sectionIds) {
        const element = document.getElementById(id);
        if (element) {
          const rect = element.getBoundingClientRect();
          // Check if the top of the section is within the viewport, considering the offset
          if (rect.top <= offset) {
            currentActive = id;
          }
        }
      }
      setActiveSection(currentActive);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [sectionIds, offset]);

  return activeSection;
}