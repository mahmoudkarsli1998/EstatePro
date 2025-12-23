import React from 'react';
import { ENABLE_3D } from '../../config/performance';

const Unit3DViewer = () => {
  if (!ENABLE_3D) return null;
  return <div>3D View Disabled</div>;
};

export default Unit3DViewer;
