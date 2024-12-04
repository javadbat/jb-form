import { createContext } from "react";
import {type JBFormWebComponent } from "jb-form";

export const JBFormContext = createContext<JBFormWebComponent|null>(null);
export const JBFormProvider = JBFormContext.Provider;
export const useJBForm = JBFormContext.Consumer;