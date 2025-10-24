import { Document } from "mongoose";

export interface UserProps extends Document {
  email: string;
  password: string;
  name?: string;
  avatar?: string;
  created?: Date;
}
