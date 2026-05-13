import React from 'react';
import { Alert } from '@mui/material';

interface AlertMessageProps {
  message: string | null;
  severity?: 'error' | 'success' | 'warning' | 'info';
}

export default function AlertMessage({ message, severity = 'error' }: AlertMessageProps) {
  if (!message) return null;
  return (
    <Alert severity={severity} sx={{ mb: 2 }}>
      {message}
    </Alert>
  );
}