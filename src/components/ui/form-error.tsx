import { InfoIcon } from "lucide-react";

import { Alert, AlertTitle } from "./alert";

type FormErrorProps = {
  message?: string;
};

export const FormError = ({ message }: FormErrorProps) => {
  if (!message) {
    return null;
  }

  return (
    <Alert>
      <InfoIcon />
      <AlertTitle>{message}</AlertTitle>
    </Alert>
  );
};
