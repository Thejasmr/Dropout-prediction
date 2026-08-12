"use client";

import React from "react";
import { motion } from "framer-motion";

export function ScrollReveal({
  children,
  duration = 0.7,
  delay = 0,
  yOffset = 30,
  staggerChildren = 0.08,
  className,
  ...props
}) {
  const containerVariants = {
    hidden: { 
      opacity: 0, 
      y: yOffset, 
      filter: "blur(4px)" 
    },
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: {
        duration,
        delay,
        ease: [0.16, 1, 0.3, 1], // smooth custom easing
        staggerChildren: staggerChildren || undefined,
      },
    },
  };

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      variants={containerVariants}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function ScrollRevealItem({ children, className, duration = 0.7, yOffset = 30, ...props }) {
  const itemVariants = {
    hidden: { 
      opacity: 0, 
      y: yOffset, 
      filter: "blur(4px)" 
    },
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: {
        duration,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  };

  return (
    <motion.div variants={itemVariants} className={className} {...props}>
      {children}
    </motion.div>
  );
}
