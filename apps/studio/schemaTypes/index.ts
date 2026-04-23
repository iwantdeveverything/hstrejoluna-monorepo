import profile from "./profile";
import experience from "./experience";
import project from "./project";
import { localizedString, localizedBlock } from "./i18n";
import skill from "./skill";
import certificate from "./certificate";

export const schemaTypes = [
  localizedString, 
  localizedBlock, 
  profile, 
  experience, 
  project, 
  skill, 
  certificate
];
