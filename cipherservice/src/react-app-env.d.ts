// src/react-app-env.d.ts
/// <reference types="react-scripts" />

declare module "*.css" {
  const content: never; 
  export = content;
}