import { motion } from 'framer-motion'

export default function Series() {
  return (
    <div className="container mx-auto p-4">
      <motion.h1
        className="text-4xl font-bold mb-8 text-center text-purple-800"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        Series
      </motion.h1>
      <p className="text-center text-gray-600">Series information coming soon...</p>
    </div>
  )
}