import React from 'react';
import { motion } from 'framer-motion';

interface SectionHeaderProps {
  title: string;
  description?: string;
  className?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  description,
  className = '',
}) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className={`mb-5 ${className}`}
  >
    <h2 className="section-heading">{title}</h2>
    {description && <p className="section-description mt-1">{description}</p>}
  </motion.div>
);
