import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type Grid = (string | null)[][];
const G = 16;

function tplBird(): Grid {
  const B="#4A90D9",Y="#FFD700",E="#111111",n=null;
  return [
    [n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n],
    [n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n],
    [n,n,n,B,B,B,n,n,n,n,n,n,n,n,n,n],
    [n,Y,n,B,E,B,B,n,n,n,n,n,n,n,n,n],
    [Y,Y,B,B,B,B,B,B,B,B,B,n,n,n,n,n],
    [n,n,B,B,B,B,B,B,B,B,B,B,B,n,n,n],
    [n,n,n,B,B,B,B,B,B,B,B,B,B,B,n,n],
    [n,n,n,n,B,B,B,B,B,B,B,B,n,n,n,n],
    [n,n,n,n,n,B,B,B,B,B,n,n,n,n,n,n],
    [n,n,n,n,n,n,Y,n,n,Y,n,n,n,n,n,n],
    [n,n,n,n,n,n,Y,n,n,Y,n,n,n,n,n,n],
    [n,n,n,n,n,Y,Y,n,Y,Y,n,n,n,n,n,n],
    [n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n],
    [n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n],
    [n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n],
    [n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n],
  ];
}

export const GRID_SIZE = G;

interface PetState {
  grid: Grid;
  catName: string;
  enabled: boolean;
  petCount: number;
  setGrid: (g: Grid) => void;
  setCatName: (n: string) => void;
  setEnabled: (v: boolean) => void;
  incrementPet: () => void;
}

const PetContext = createContext<PetState | null>(null);

export function PetProvider({ children }: { children: ReactNode }) {
  const [grid,     setGridState]    = useState<Grid>(() => tplBird());
  const [catName,  setCatNameState] = useState("petslop");
  const [enabled,  setEnabledState] = useState(false);
  const [petCount, setPetCount]     = useState(0);

  useEffect(() => {
    try {
      const g = localStorage.getItem("pet_grid");
      const n = localStorage.getItem("pet_name");
      const e = localStorage.getItem("pet_enabled");
      const c = localStorage.getItem("pet_count");
      if (g) setGridState(JSON.parse(g));
      if (n) setCatNameState(n);
      if (e) setEnabledState(e === "true");
      if (c) setPetCount(parseInt(c, 10));
    } catch {}
  }, []);

  function setGrid(g: Grid) {
    setGridState(g);
    localStorage.setItem("pet_grid", JSON.stringify(g));
  }
  function setCatName(n: string) {
    setCatNameState(n);
    localStorage.setItem("pet_name", n);
  }
  function setEnabled(v: boolean) {
    setEnabledState(v);
    localStorage.setItem("pet_enabled", String(v));
  }
  function incrementPet() {
    setPetCount(c => {
      const n = c + 1;
      localStorage.setItem("pet_count", String(n));
      return n;
    });
  }

  return (
    <PetContext.Provider value={{ grid, catName, enabled, petCount, setGrid, setCatName, setEnabled, incrementPet }}>
      {children}
    </PetContext.Provider>
  );
}

export function usePet() {
  const ctx = useContext(PetContext);
  if (!ctx) throw new Error("usePet must be used within PetProvider");
  return ctx;
}
