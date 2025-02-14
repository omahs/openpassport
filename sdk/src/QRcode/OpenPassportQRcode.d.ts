import React from 'react';

export interface OpenPassportQRcodeProps {
  appName: string;
  scope: string;
  userId: string;
  requirements: any[];
  onSuccess: (result: any) => void;
  devMode?: boolean;
}

declare const OpenPassportQRcode: React.FC<OpenPassportQRcodeProps>;

export default OpenPassportQRcode;
