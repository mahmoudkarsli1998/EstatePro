import React from 'react';
import { ENABLE_3D } from '../../config/performance';

const HouseDesigner = () => {
  if (!ENABLE_3D) return null;
  return <div>3D Designer</div>;
};

export default HouseDesigner;
