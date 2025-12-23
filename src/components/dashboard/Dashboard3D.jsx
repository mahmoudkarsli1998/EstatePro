import React from 'react';
import { ENABLE_3D } from '../../config/performance';

const Dashboard3D = () => {
  if (!ENABLE_3D) return null;
  return <div>3D Dashboard</div>;
};

export default Dashboard3D;
