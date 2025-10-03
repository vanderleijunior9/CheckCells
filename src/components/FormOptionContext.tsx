import React, { createContext, useContext, useState } from "react";

type FormOptionsContextType = {
  selectedOptions: string[];
  setSelectedOptions: React.Dispatch<React.SetStateAction<string[]>>;
};

const FormOptionsContext = createContext<FormOptionsContextType | null>(null);

export const FormOptionsProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);

  return (
    <FormOptionsContext.Provider
      value={{ selectedOptions, setSelectedOptions }}
    >
      {children}
    </FormOptionsContext.Provider>
  );
};

export const useFormOptions = () => {
  const context = useContext(FormOptionsContext);
  if (!context) {
    throw new Error("useFormOptions must be used within a FormOptionsProvider");
  }
  return context;
};
